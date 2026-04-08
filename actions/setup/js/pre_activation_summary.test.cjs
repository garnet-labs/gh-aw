// @ts-check
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";

describe("pre_activation_summary.cjs", () => {
  let mockCore;
  const promptsDir = "/tmp/gh-aw/prompts";

  beforeEach(() => {
    mockCore = {
      info: vi.fn(),
      warning: vi.fn(),
      summary: {
        addRaw: vi.fn().mockReturnThis(),
        write: vi.fn().mockResolvedValue(undefined),
      },
    };
    global.core = mockCore;
    vi.resetModules();
    fs.mkdirSync(promptsDir, { recursive: true });
  });

  afterEach(() => {
    delete global.core;
    vi.clearAllMocks();
  });

  describe("writeDenialSummary", () => {
    it("uses the markdown template when template file exists", async () => {
      const templateFile = path.join(promptsDir, "pre_activation_skip.md");
      fs.writeFileSync(templateFile, "## Skipped\n\n> {reason}\n\n**Fix:** {remediation}\n", "utf8");

      try {
        const { writeDenialSummary } = await import("./pre_activation_summary.cjs");
        await writeDenialSummary("Denied: insufficient perms", "Update frontmatter roles");

        expect(mockCore.summary.addRaw).toHaveBeenCalledWith("## Skipped\n\n> Denied: insufficient perms\n\n**Fix:** Update frontmatter roles\n");
        expect(mockCore.summary.write).toHaveBeenCalled();
      } finally {
        if (fs.existsSync(templateFile)) fs.unlinkSync(templateFile);
      }
    });

    it("falls back to hardcoded format when template file does not exist", async () => {
      // Ensure template does not exist
      const templateFile = path.join(promptsDir, "pre_activation_skip.md");
      if (fs.existsSync(templateFile)) fs.unlinkSync(templateFile);

      const { writeDenialSummary } = await import("./pre_activation_summary.cjs");
      await writeDenialSummary("Bot not authorized", "Add bot to on.bots:");

      const rawCall = mockCore.summary.addRaw.mock.calls[0][0];
      expect(rawCall).toContain("Bot not authorized");
      expect(rawCall).toContain("Add bot to on.bots:");
      expect(mockCore.summary.write).toHaveBeenCalled();
    });
  });
});
