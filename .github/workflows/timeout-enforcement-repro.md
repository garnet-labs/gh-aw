---
name: Timeout Enforcement Repro
description: "Reproduces and confirms whether timeout-minutes is enforced on AWF agent steps (issue #23965)"
on:
  workflow_dispatch:
permissions:
  contents: read
  issues: read
engine: copilot
tools:
  bash:
    - "sleep *"
    - "ps *"
    - "date"
  github:
    toolsets:
      - issues
safe-outputs:
  add-comment:
    max: 1
    discussions: false
timeout-minutes: 5
features:
  copilot-requests: true
jobs:
  report_findings:
    runs-on: ubuntu-latest
    needs: [agent]
    if: always()
    permissions:
      issues: write
    steps:
      - name: Post timeout test findings to issue #23965
        uses: actions/github-script@v8
        with:
          script: |
            const agentResult = '${{ needs.agent.result }}';
            const runUrl = 'https://github.com/' + context.repo.owner + '/' + context.repo.repo + '/actions/runs/' + context.runId;

            let statusIcon, statusText, conclusion;
            if (agentResult === 'cancelled') {
              statusIcon = '\u2705';
              statusText = 'Agent step was CANCELLED';
              conclusion = 'The step was cancelled at the 5-minute timeout. This suggests `timeout-minutes` **IS** being enforced at the step level.';
            } else if (agentResult === 'failure') {
              statusIcon = '\u26a0\ufe0f';
              statusText = 'Agent step FAILED';
              conclusion = 'The step failed. Check the [run logs](' + runUrl + ') to determine if this was due to timeout cancellation or another error.';
            } else if (agentResult === 'success') {
              statusIcon = '\ud83d\udc1b';
              statusText = 'Agent step SUCCEEDED \u2014 timeout NOT enforced';
              conclusion = 'The step completed despite the 5-minute `timeout-minutes` limit. The `sleep 1800` command ran to completion. This **confirms the bug**: `timeout-minutes` is NOT enforced on AWF agent steps.';
            } else {
              statusIcon = '\u2753';
              statusText = 'Agent step result: ' + agentResult;
              conclusion = 'Unexpected result. Check the [run logs](' + runUrl + ') for details.';
            }

            const lines = [
              '## Timeout Enforcement Test Results',
              '',
              statusIcon + ' **' + statusText + '**',
              '',
              '**Conclusion**: ' + conclusion,
              '',
              '### Test Setup',
              '- Step `timeout-minutes: 5` (5-minute limit)',
              '- Agent instructed to run `sleep 1800` (30-minute sleep)',
              '- Expected (timeout enforced): step cancelled after ~5 min with message `The operation was cancelled because the step exceeded the configured timeout.`',
              '- Bug behavior (timeout NOT enforced): sleep completes after 30 min, step exits 0',
              '',
              '### Workflow Run',
              '[View full run logs including captured process tree](' + runUrl + ')',
              '',
              '### Process Tree',
              'The agent captured `ps auxf` output at the start of the step to show the process hierarchy (`runner shell \u2192 sudo awf \u2192 docker container \u2192 agent`). See the run logs for details.',
            ];

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: 23965,
              body: lines.join('\n'),
            });
---

# Timeout Enforcement Test

You are testing whether `timeout-minutes` is enforced on agent steps running inside the AWF Docker container. This is a reproduction test for issue #23965.

**This step has `timeout-minutes: 5`. The GitHub Actions runner will attempt to cancel this step after 5 minutes.**

## Phase 1: Capture Initial State

Run the following commands and print their complete output:

```bash
date
echo "=== PROCESS TREE AT START ==="
ps auxf
echo "=== END PROCESS TREE ==="
```

This documents:
- The start timestamp
- The full process hierarchy showing: runner shell → sudo awf → Docker container → Copilot agent

## Phase 2: Simulate Long-Running Task

Run this command to simulate a workload that exceeds the timeout:

```bash
sleep 1800
```

This sleeps for 30 minutes. **If `timeout-minutes: 5` is enforced**, the step will be cancelled after approximately 5 minutes and this sleep will be interrupted. If the bug from issue #23965 is present, the sleep will complete.

## Phase 3: Post Findings (only if sleep completed)

If the sleep command completes without interruption, that means the 5-minute `timeout-minutes` was **NOT** enforced. In that case:

1. Run the following to capture the end state:
   ```bash
   date
   echo "=== PROCESS TREE AFTER SLEEP ==="
   ps auxf
   echo "=== END PROCESS TREE ==="
   ```

2. Post a comment on issue #23965 with your findings using the `add_comment` safe-output tool:
   - Set `item_number` to `23965`
   - Include the start and end timestamps
   - Include the process tree captured in Phase 1
   - State clearly: "`timeout-minutes: 5` was NOT enforced — `sleep 1800` completed after 30 minutes, confirming the bug reported in #23965"

## Expected Outcomes

| Scenario | What happens |
|----------|-------------|
| Timeout enforced (correct behavior) | Step is cancelled at ~5 min; runner logs show timeout cancellation message; `sleep 1800` is interrupted |
| Timeout NOT enforced (bug #23965) | `sleep 1800` completes after 30 min; step exits with code 0; no cancellation |
