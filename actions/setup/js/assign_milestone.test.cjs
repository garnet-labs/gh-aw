import { describe, it, expect, beforeEach, vi } from "vitest";

const mockCore = {
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  setFailed: vi.fn(),
  setOutput: vi.fn(),
  summary: {
    addRaw: vi.fn().mockReturnThis(),
    write: vi.fn().mockResolvedValue(),
  },
};

const mockContext = {
  repo: {
    owner: "test-owner",
    repo: "test-repo",
  },
  eventName: "issues",
  payload: {
    issue: {
      number: 123,
    },
  },
};

const mockGithub = {
  rest: {
    issues: {
      update: vi.fn(),
      listMilestones: vi.fn(),
    },
  },
};

global.core = mockCore;
global.context = mockContext;
global.github = mockGithub;

describe("assign_milestone (Handler Factory Architecture)", () => {
  let handler;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { main } = require("./assign_milestone.cjs");
    handler = await main({
      max: 10,
      allowed: [],
    });
  });

  it("should return a function from main()", async () => {
    const { main } = require("./assign_milestone.cjs");
    const result = await main({});
    expect(typeof result).toBe("function");
  });

  it("should assign milestone successfully", async () => {
    mockGithub.rest.issues.update.mockResolvedValue({});

    const message = {
      type: "assign_milestone",
      issue_number: 42,
      milestone_number: 5,
    };

    const result = await handler(message, {});

    expect(result.success).toBe(true);
    expect(result.issue_number).toBe(42);
    expect(result.milestone_number).toBe(5);
    expect(mockGithub.rest.issues.update).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      issue_number: 42,
      milestone: 5,
    });
  });

  it("should validate against allowed milestones list", async () => {
    const { main } = require("./assign_milestone.cjs");
    const handlerWithAllowed = await main({
      max: 10,
      allowed: ["v1.0", "v2.0"],
    });

    mockGithub.rest.issues.listMilestones.mockResolvedValue({
      data: [
        { number: 5, title: "v1.0" },
        { number: 6, title: "v3.0" },
      ],
    });
    mockGithub.rest.issues.update.mockResolvedValue({});

    const message = {
      type: "assign_milestone",
      issue_number: 42,
      milestone_number: 5,
    };

    const result = await handlerWithAllowed(message, {});

    expect(result.success).toBe(true);
    expect(mockGithub.rest.issues.listMilestones).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      state: "all",
      per_page: 100,
    });
    expect(mockGithub.rest.issues.update).toHaveBeenCalled();
  });

  it("should reject milestone not in allowed list", async () => {
    const { main } = require("./assign_milestone.cjs");
    const handlerWithAllowed = await main({
      max: 10,
      allowed: ["v1.0", "v2.0"],
    });

    mockGithub.rest.issues.listMilestones.mockResolvedValue({
      data: [
        { number: 5, title: "v1.0" },
        { number: 6, title: "v3.0" },
      ],
    });

    const message = {
      type: "assign_milestone",
      issue_number: 42,
      milestone_number: 6,
    };

    const result = await handlerWithAllowed(message, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("is not in the allowed list");
    expect(mockGithub.rest.issues.update).not.toHaveBeenCalled();
  });

  it("should respect max count configuration", async () => {
    const { main } = require("./assign_milestone.cjs");
    const limitedHandler = await main({ max: 1 });

    mockGithub.rest.issues.update.mockResolvedValue({});

    const message1 = {
      type: "assign_milestone",
      issue_number: 1,
      milestone_number: 5,
    };

    const message2 = {
      type: "assign_milestone",
      issue_number: 2,
      milestone_number: 5,
    };

    // First call should succeed
    const result1 = await limitedHandler(message1, {});
    expect(result1.success).toBe(true);

    // Second call should fail
    const result2 = await limitedHandler(message2, {});
    expect(result2.success).toBe(false);
    expect(result2.error).toContain("Max count");
  });

  it("should handle API errors gracefully", async () => {
    const apiError = new Error("API rate limit exceeded");
    mockGithub.rest.issues.update.mockRejectedValue(apiError);

    const message = {
      type: "assign_milestone",
      issue_number: 42,
      milestone_number: 5,
    };

    const result = await handler(message, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("API rate limit exceeded");
  });

  it("should handle invalid issue numbers", async () => {
    const message = {
      type: "assign_milestone",
      issue_number: -1,
      milestone_number: 5,
    };

    const result = await handler(message, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid issue_number");
  });

  it("should handle invalid milestone numbers", async () => {
    const message = {
      type: "assign_milestone",
      issue_number: 42,
      milestone_number: "not-a-number",
    };

    const result = await handler(message, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid milestone_number");
  });

  it("should return staged preview without calling API when staged mode is enabled", async () => {
    const origStaged = process.env.GH_AW_SAFE_OUTPUTS_STAGED;
    process.env.GH_AW_SAFE_OUTPUTS_STAGED = "true";

    const { main } = require("./assign_milestone.cjs");
    const stagedHandler = await main({ max: 10 });

    const message = {
      type: "assign_milestone",
      issue_number: 42,
      milestone_number: 5,
    };

    const result = await stagedHandler(message, {});

    expect(result.success).toBe(true);
    expect(result.staged).toBe(true);
    expect(result.previewInfo.issue_number).toBe(42);
    expect(result.previewInfo.milestone_number).toBe(5);
    expect(mockGithub.rest.issues.update).not.toHaveBeenCalled();

    process.env.GH_AW_SAFE_OUTPUTS_STAGED = origStaged ?? "";
  });

  it("should handle failure when fetching milestones for allowed list validation", async () => {
    const { main } = require("./assign_milestone.cjs");
    const handlerWithAllowed = await main({
      max: 10,
      allowed: ["v1.0"],
    });

    mockGithub.rest.issues.listMilestones.mockRejectedValue(new Error("Network error"));

    const result = await handlerWithAllowed({ issue_number: 42, milestone_number: 5 }, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to fetch milestones for validation");
    expect(result.error).toContain("Network error");
  });

  it("should return error when milestone not found in repository", async () => {
    const { main } = require("./assign_milestone.cjs");
    const handlerWithAllowed = await main({
      max: 10,
      allowed: ["v1.0"],
    });

    mockGithub.rest.issues.listMilestones.mockResolvedValue({
      data: [{ number: 7, title: "v2.0" }],
    });

    const result = await handlerWithAllowed({ issue_number: 42, milestone_number: 99 }, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found in repository");
  });

  it("should allow milestone matched by number string in allowed list", async () => {
    const { main } = require("./assign_milestone.cjs");
    const handlerWithAllowed = await main({
      max: 10,
      allowed: ["5"], // Allowed by number as string
    });

    mockGithub.rest.issues.listMilestones.mockResolvedValue({
      data: [{ number: 5, title: "v1.0" }],
    });
    mockGithub.rest.issues.update.mockResolvedValue({});

    const result = await handlerWithAllowed({ issue_number: 42, milestone_number: 5 }, {});

    expect(result.success).toBe(true);
  });

  it("should use cached milestones on second call", async () => {
    const { main } = require("./assign_milestone.cjs");
    const handlerWithAllowed = await main({
      max: 10,
      allowed: ["v1.0"],
    });

    mockGithub.rest.issues.listMilestones.mockResolvedValue({
      data: [{ number: 5, title: "v1.0" }],
    });
    mockGithub.rest.issues.update.mockResolvedValue({});

    await handlerWithAllowed({ issue_number: 42, milestone_number: 5 }, {});
    await handlerWithAllowed({ issue_number: 43, milestone_number: 5 }, {});

    // Should only fetch milestones once (cached after first call)
    expect(mockGithub.rest.issues.listMilestones).toHaveBeenCalledTimes(1);
  });

  it("should handle zero issue_number as invalid", async () => {
    const result = await handler({ issue_number: 0, milestone_number: 5 }, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid issue_number");
  });

  it("should handle zero milestone_number as invalid", async () => {
    const result = await handler({ issue_number: 42, milestone_number: 0 }, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid milestone_number");
  });

  describe("temporary ID resolution", () => {
    it("should resolve temporary ID in issue_number to real issue number", async () => {
      mockGithub.rest.issues.update.mockResolvedValue({});

      const result = await handler(
        {
          type: "assign_milestone",
          issue_number: "aw_issue1",
          milestone_number: 5,
        },
        { aw_issue1: { repo: "test-owner/test-repo", number: 42 } }
      );

      expect(result.success).toBe(true);
      expect(result.issue_number).toBe(42);
      expect(mockGithub.rest.issues.update).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        issue_number: 42,
        milestone: 5,
      });
    });

    it("should defer when issue_number is an unresolved temporary ID", async () => {
      const result = await handler(
        {
          type: "assign_milestone",
          issue_number: "aw_issue1",
          milestone_number: 5,
        },
        {}
      );

      expect(result.success).toBe(false);
      expect(result.deferred).toBe(true);
      expect(result.error).toContain("aw_issue1");
    });

    it("should resolve temporary ID with hash prefix in issue_number", async () => {
      mockGithub.rest.issues.update.mockResolvedValue({});

      const result = await handler(
        {
          type: "assign_milestone",
          issue_number: "#aw_issue1",
          milestone_number: 5,
        },
        { aw_issue1: { repo: "test-owner/test-repo", number: 99 } }
      );

      expect(result.success).toBe(true);
      expect(result.issue_number).toBe(99);
      expect(mockGithub.rest.issues.update).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        issue_number: 99,
        milestone: 5,
      });
    });
  });
});
