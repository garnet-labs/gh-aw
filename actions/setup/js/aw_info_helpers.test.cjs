import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

// Use a unique temp directory per test run to isolate from the real /tmp/gh-aw
const TEST_TMP_DIR = path.join(os.tmpdir(), `aw_info_helpers_test_${Date.now()}`);
const AW_INFO_PATH = path.join(TEST_TMP_DIR, "aw_info.json");

describe("aw_info_helpers", () => {
  let helpers;

  beforeEach(async () => {
    vi.resetModules();
    fs.mkdirSync(TEST_TMP_DIR, { recursive: true });
    helpers = await import("./aw_info_helpers.cjs");
  });

  afterEach(() => {
    if (fs.existsSync(AW_INFO_PATH)) {
      fs.unlinkSync(AW_INFO_PATH);
    }
  });

  describe("loadAwContext", () => {
    it("should return the context field from aw_info.json when valid", () => {
      const awContext = {
        repo: "owner/repo",
        run_id: "12345",
        workflow_id: "owner/repo/.github/workflows/test.yml@refs/heads/main",
        item_type: "issue",
        item_number: "42",
        comment_id: "",
      };
      fs.writeFileSync(AW_INFO_PATH, JSON.stringify({ context: awContext, engine_id: "copilot" }));

      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toEqual(awContext);
    });

    it("should return null when aw_info.json does not exist", () => {
      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toBeNull();
    });

    it("should return null when aw_info.json has no context field", () => {
      fs.writeFileSync(AW_INFO_PATH, JSON.stringify({ engine_id: "copilot" }));

      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toBeNull();
    });

    it("should return null when context field is null", () => {
      fs.writeFileSync(AW_INFO_PATH, JSON.stringify({ context: null }));

      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toBeNull();
    });

    it("should return null when context field is an array", () => {
      fs.writeFileSync(AW_INFO_PATH, JSON.stringify({ context: [1, 2, 3] }));

      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toBeNull();
    });

    it("should return null when context field is a string", () => {
      fs.writeFileSync(AW_INFO_PATH, JSON.stringify({ context: "not-an-object" }));

      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toBeNull();
    });

    it("should return null when aw_info.json contains invalid JSON", () => {
      fs.writeFileSync(AW_INFO_PATH, "not valid json {{{");

      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toBeNull();
    });

    it("should return pull_request context correctly", () => {
      const awContext = {
        repo: "owner/repo",
        run_id: "99",
        workflow_id: "owner/repo/.github/workflows/ci.yml@refs/heads/main",
        item_type: "pull_request",
        item_number: "7",
        comment_id: "55",
      };
      fs.writeFileSync(AW_INFO_PATH, JSON.stringify({ context: awContext }));

      const result = helpers.loadAwContext(AW_INFO_PATH);

      expect(result).toEqual(awContext);
      expect(result.item_type).toBe("pull_request");
      expect(result.item_number).toBe("7");
    });
  });
});
