---
# Per-run DAG artifact generator for dispatch traceability.
#
# Usage:
#   imports:
#     - shared/run-dag-artifact.md
#
# This import creates and uploads a small artifact containing:
# - run-dag.json: machine-readable node/edge data for the current run
# - run-dag.md: Mermaid diagram for quick inspection

steps:
  - name: Generate run DAG artifact
    if: always()
    env:
      AW_CONTEXT_JSON: ${{ github.event.inputs.aw_context }}
      CURRENT_REPO: ${{ github.repository }}
      CURRENT_RUN_ID: ${{ github.run_id }}
      CURRENT_RUN_ATTEMPT: ${{ github.run_attempt }}
      CURRENT_WORKFLOW_REF: ${{ github.workflow_ref }}
      CURRENT_WORKFLOW_NAME: ${{ github.workflow }}
      CURRENT_ACTOR: ${{ github.actor }}
      CURRENT_EVENT_TYPE: ${{ github.event_name }}
    run: |
      set -eu
      mkdir -p /tmp/gh-aw/run-dag

      python3 <<'PY'
      import json
      import os
      from datetime import datetime, timezone

      def sanitize_node_id(value: str) -> str:
          cleaned = []
          for ch in value:
              if ch.isalnum():
                  cleaned.append(ch)
              else:
                  cleaned.append("_")
          return "node_" + "".join(cleaned)

      def make_label(node: dict) -> str:
          workflow = node.get("workflow_name") or node.get("workflow_id") or "unknown"
          run_id = node.get("run_id") or "unknown"
          actor = node.get("actor") or "unknown"
          event_type = node.get("event_type") or "unknown"
          return f"{workflow}\\nrun {run_id}\\n{actor} • {event_type}"

      raw_parent = os.environ.get("AW_CONTEXT_JSON", "").strip()
      parent = None
      if raw_parent:
          try:
              parent = json.loads(raw_parent)
          except json.JSONDecodeError:
              parent = {
                  "parse_error": True,
                  "raw": raw_parent,
              }

      current = {
          "repo": os.environ.get("CURRENT_REPO", ""),
          "run_id": os.environ.get("CURRENT_RUN_ID", ""),
          "workflow_id": os.environ.get("CURRENT_WORKFLOW_REF", ""),
          "workflow_call_id": f"{os.environ.get('CURRENT_RUN_ID', '')}-{os.environ.get('CURRENT_RUN_ATTEMPT', '')}",
          "time": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
          "actor": os.environ.get("CURRENT_ACTOR", ""),
          "event_type": os.environ.get("CURRENT_EVENT_TYPE", ""),
          "workflow_name": os.environ.get("CURRENT_WORKFLOW_NAME", ""),
      }

      payload = {
          "schema": "gh-aw/run-dag-edge/v1",
          "generated_at": current["time"],
          "current": current,
          "parent": parent,
          "edges": [],
      }

      if parent and isinstance(parent, dict) and parent.get("run_id"):
          payload["edges"].append({
              "from": {
                  "repo": parent.get("repo", ""),
                  "run_id": parent.get("run_id", ""),
                  "workflow_id": parent.get("workflow_id", ""),
                  "workflow_call_id": parent.get("workflow_call_id", ""),
              },
              "to": {
                  "repo": current.get("repo", ""),
                  "run_id": current.get("run_id", ""),
                  "workflow_id": current.get("workflow_id", ""),
                  "workflow_call_id": current.get("workflow_call_id", ""),
              },
          })

      out_dir = "/tmp/gh-aw/run-dag"
      with open(os.path.join(out_dir, "run-dag.json"), "w", encoding="utf-8") as handle:
          json.dump(payload, handle, indent=2, sort_keys=True)
          handle.write("\n")

      lines = [
          "# Run DAG",
          "",
          "```mermaid",
          "graph TD",
      ]

      current_id = sanitize_node_id(current.get("run_id", "current"))
      lines.append(f'    {current_id}["{make_label(current)}"]')

      if parent and isinstance(parent, dict) and parent.get("run_id"):
          parent_id = sanitize_node_id(parent.get("run_id", "parent"))
          lines.append(f'    {parent_id}["{make_label(parent)}"]')
          lines.append(f"    {parent_id} --> {current_id}")

      lines.extend([
          "```",
          "",
          "## Payload",
          "",
          "```json",
          json.dumps(payload, indent=2, sort_keys=True),
          "```",
          "",
      ])

      with open(os.path.join(out_dir, "run-dag.md"), "w", encoding="utf-8") as handle:
          handle.write("\n".join(lines))
      PY

  - name: Upload run DAG artifact
    if: always()
    uses: actions/upload-artifact@v7
    with:
      name: run-dag
      path: |
        /tmp/gh-aw/run-dag/run-dag.json
        /tmp/gh-aw/run-dag/run-dag.md
      if-no-files-found: error
      retention-days: 30
---

# Run DAG Artifact

Import this file to emit a per-run dispatch trace artifact.

It writes two files to `/tmp/gh-aw/run-dag/` and uploads them as the `run-dag` artifact:

- `run-dag.json`: structured edge data for later DAG assembly
- `run-dag.md`: Mermaid diagram for quick inspection in downloaded artifacts

The artifact is intentionally small. It only captures the current run and its direct parent edge from `aw_context`, which is the minimal data needed to assemble a larger DAG later.