// @ts-check

/**
 * Helpers for reading aw_info.json at runtime.
 * Provides lightweight accessors used by safe-output handlers to fall back to
 * the aw_context when the workflow was dispatched from another agentic workflow.
 */

const fs = require("fs");
const { TMP_GH_AW_PATH } = require("./constants.cjs");

const AW_INFO_PATH = `${TMP_GH_AW_PATH}/aw_info.json`;

/**
 * Load the validated aw_context from aw_info.json (if available).
 *
 * The context field is written by generate_aw_info.cjs when a workflow is
 * triggered via workflow_dispatch with a valid aw_context input injected by a
 * calling agentic workflow's dispatch_workflow handler.  It contains item_type,
 * item_number, and comment_id from the original triggering event, allowing
 * called workflows to resolve the triggering item even though they run in a
 * workflow_dispatch context rather than an issues/pull_request context.
 *
 * Returns null when aw_info.json does not exist, the context field is absent,
 * or any read/parse error occurs.
 *
 * @param {string} [awInfoPath] - Path to aw_info.json; defaults to the standard location.
 *   Exposed as a parameter to simplify unit testing.
 * @returns {{ item_type: string, item_number: string, [key: string]: unknown } | null}
 */
function loadAwContext(awInfoPath = AW_INFO_PATH) {
  try {
    const raw = fs.readFileSync(awInfoPath, "utf8");
    const awInfo = JSON.parse(raw);
    const ctx = awInfo?.context;
    if (ctx !== null && typeof ctx === "object" && !Array.isArray(ctx)) {
      return /** @type {{ item_type: string, item_number: string, [key: string]: unknown }} */ ctx;
    }
    return null;
  } catch {
    return null;
  }
}

module.exports = { loadAwContext };
