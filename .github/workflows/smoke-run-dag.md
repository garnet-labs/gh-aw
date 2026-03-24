---
name: Smoke Run DAG
description: Smoke test that imports the run DAG artifact helper and creates an issue with the Mermaid DAG
on:
  workflow_dispatch:
  pull_request:
    types: [labeled]
    names: ["smoke-dag"]
permissions:
  contents: read
engine: copilot
strict: true
imports:
  - shared/run-dag-artifact.md
network:
  allowed:
    - defaults
tools:
  bash:
    - "cat *"
    - "echo *"
    - "ls *"
    - "python3 *"
    - "test *"
safe-outputs:
  allowed-domains: [default-safe-outputs]
  create-issue:
    expires: 2h
    group: true
    close-older-issues: true
    close-older-key: "smoke-run-dag"
    labels: [automation, testing]
    max: 1
timeout-minutes: 5
---

# Smoke Test: Run DAG Import

This workflow imports `shared/run-dag-artifact.md` directly and validates that the helper emits the expected DAG files for the current run.

## Task

1. Verify that both `/tmp/gh-aw/run-dag/run-dag.json` and `/tmp/gh-aw/run-dag/run-dag.md` exist.
2. Read `run-dag.json` and verify all of the following:
   - `schema` equals `gh-aw/run-dag-edge/v1`
   - `current.run_id` is present
   - `current.workflow_name` is present
3. Read `run-dag.md` and verify it contains `graph TD` and the current run ID.
4. Create one issue that includes:
   - A short validation summary
   - The current run ID
   - Whether a parent edge was present or absent
   - The Mermaid DAG copied from `run-dag.md`
5. Keep the output brief.

## Output

You must create one issue with the Mermaid DAG embedded in the body.

Use a title like `Smoke Run DAG - ${{ github.run_id }}`.

The issue body should include:

- `Status: PASS`
- `Current run: ...`
- `Parent edge: present` or `Parent edge: absent`
- The Mermaid block from `/tmp/gh-aw/run-dag/run-dag.md`

```json
{
  "type": "create_issue",
  "title": "Smoke Run DAG - ${{ github.run_id }}",
  "body": "## Run DAG Smoke Test\n\nStatus: PASS\n\nCurrent run: [fill from run-dag.json]\nParent edge: [present or absent based on run-dag.json]\n\n[Paste the Mermaid block from run-dag.md here]"
}
```