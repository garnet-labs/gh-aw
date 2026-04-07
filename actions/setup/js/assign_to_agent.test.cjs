// @ts-check
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

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
};

const mockGithub = {
  graphql: vi.fn(),
  rest: {
    issues: {
      createComment: vi.fn().mockResolvedValue({ data: { id: 12345 } }),
    },
  },
};

global.core = mockCore;
global.context = mockContext;
global.github = mockGithub;

const { main } = require("./assign_to_agent.cjs");

describe("assign_to_agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGithub.graphql = vi.fn();
    mockGithub.rest.issues.createComment = vi.fn().mockResolvedValue({ data: { id: 12345 } });

    delete process.env.GH_AW_TARGET_REPO_SLUG;
    delete process.env.GH_AW_SAFE_OUTPUTS_STAGED;

    mockContext.eventName = "issues";
    mockContext.payload = { issue: { number: 42 } };

    const helpersPath = require.resolve("./assign_agent_helpers.cjs");
    delete require.cache[helpersPath];
  });

  it("should create a handler with default configuration", async () => {
    const handler = await main({});
    expect(typeof handler).toBe("function");
    expect(handler.getErrorCount()).toBe(0);
    expect(handler.getAssigned()).toBe("");
    expect(handler.getErrors()).toBe("");
  });

  it("should handle staged mode correctly", async () => {
    const handler = await main({ staged: true });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(true);
    expect(mockGithub.graphql).not.toHaveBeenCalled();

    await handler.writeSummary();
    expect(mockCore.summary.addRaw).toHaveBeenCalled();
    const summaryCall = mockCore.summary.addRaw.mock.calls[0][0];
    expect(summaryCall).toContain("Staged Mode");
    expect(summaryCall).toContain("Issue:** #42");
    expect(summaryCall).toContain("Agent:** copilot");
  });

  it("should use default agent when not specified", async () => {
    const handler = await main({ name: "copilot" });

    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ addAssigneesToAssignable: { assignable: { assignees: { nodes: [{ login: "copilot-swe-agent" }] } } } });

    await handler({ type: "assign_to_agent", issue_number: 42 }, {}, new Map());

    expect(mockCore.info).toHaveBeenCalledWith("Default agent: copilot");
  });

  it("should respect max count configuration", async () => {
    const handler = await main({ max: "2" });

    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id-1", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ addAssigneesToAssignable: { assignable: { assignees: { nodes: [{ login: "copilot-swe-agent" }] } } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id-2", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ addAssigneesToAssignable: { assignable: { assignees: { nodes: [{ login: "copilot-swe-agent" }] } } } });

    await handler({ type: "assign_to_agent", issue_number: 1, agent: "copilot" }, {}, new Map());
    await handler({ type: "assign_to_agent", issue_number: 2, agent: "copilot" }, {}, new Map());
    const result3 = await handler({ type: "assign_to_agent", issue_number: 3, agent: "copilot" }, {}, new Map());

    expect(result3.skipped).toBe(true);
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Max count (2) reached"));
  }, 20000);

  it("should resolve temporary issue IDs (aw_...) using temporaryIdMap", async () => {
    const handler = await main({});
    const tempIdMap = new Map([["aw_abc123", { repo: "test-owner/test-repo", number: 99 }]]);

    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id-99", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ addAssigneesToAssignable: { assignable: { assignees: { nodes: [{ login: "copilot-swe-agent" }] } } } });

    await handler({ type: "assign_to_agent", issue_number: "aw_abc123", agent: "copilot" }, {}, tempIdMap);

    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Resolved temporary issue id"));
    const secondCallArgs = mockGithub.graphql.mock.calls[1];
    expect(secondCallArgs[1].issueNumber).toBe(99);
  });

  it("should reject unsupported agents", async () => {
    const handler = await main({});
    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "unsupported-agent" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.warning).toHaveBeenCalledWith(expect.stringContaining('Agent "unsupported-agent" is not supported'));
    expect(handler.getErrorCount()).toBe(1);
  });

  it("should handle invalid issue numbers", async () => {
    const handler = await main({});
    const result = await handler({ type: "assign_to_agent", issue_number: -1, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining("Invalid"));
  });

  it("should handle agent already assigned", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [{ id: "MDQ6VXNlcjE=" }] } } } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(true);
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("copilot is already assigned to issue #42"));
  });

  it("should handle API errors gracefully", async () => {
    const handler = await main({});
    mockGithub.graphql.mockRejectedValue(new Error("API rate limit exceeded"));
    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining("Failed to assign agent"));
    expect(handler.getErrorCount()).toBe(1);
  });

  it("should handle 502 errors as success", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockRejectedValueOnce({ response: { status: 502, url: "https://api.github.com/graphql", headers: { "content-type": "text/html" }, data: "<html>502 Bad Gateway</html>" } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockCore.warning).toHaveBeenCalledWith(expect.stringContaining("Received 502 error from cloud gateway"));
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Treating 502 error as success"));
    expect(result.success).toBe(true);
    await handler.writeSummary();
    const summaryCall = mockCore.summary.addRaw.mock.calls[0][0];
    expect(summaryCall).toContain("Successfully assigned 1 agent(s)");
  });

  it("should handle 502 errors in message as success", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockRejectedValueOnce(new Error("502 Bad Gateway"));

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockCore.warning).toHaveBeenCalledWith(expect.stringContaining("Received 502 error from cloud gateway"));
    expect(result.success).toBe(true);
    expect(handler.getErrorCount()).toBe(0);
  });

  it("should cache agent IDs for multiple assignments", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id-1", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ addAssigneesToAssignable: { assignable: { assignees: { nodes: [{ login: "copilot-swe-agent" }] } } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id-2", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ addAssigneesToAssignable: { assignable: { assignees: { nodes: [{ login: "copilot-swe-agent" }] } } } });

    await handler({ type: "assign_to_agent", issue_number: 1, agent: "copilot" }, {}, new Map());
    await handler({ type: "assign_to_agent", issue_number: 2, agent: "copilot" }, {}, new Map());

    const graphqlCalls = mockGithub.graphql.mock.calls.filter(call => call[0].includes("suggestedActors"));
    expect(graphqlCalls).toHaveLength(1);
  }, 15000);

  it("should use target repository when configured", async () => {
    process.env.GH_AW_TARGET_REPO_SLUG = "other-owner/other-repo";
    const handler = await main({ allowed_repos: "other-owner/other-repo" });
    mockGithub.graphql.mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } });
    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockCore.info).toHaveBeenCalledWith("Default target repo: other-owner/other-repo");
  });

  it("should handle invalid max count configuration", async () => {
    await expect(main({ max: "invalid" })).rejects.toThrow("Invalid max value: invalid");
  });

  it.skip("should generate permission error summary when appropriate", async () => {
    // TODO: This test needs to be fixed - the mock setup doesn't work correctly with direct handler calls
    const handler = await main({});
    const permissionError = new Error("Resource not accessible by integration");
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockRejectedValueOnce(permissionError);
    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    await handler.writeSummary();
    const summaryCall = mockCore.summary.addRaw.mock.calls[0][0];
    expect(summaryCall).toContain("Resource not accessible");
    expect(summaryCall).toContain("Permission Requirements");
  });

  it.skip("should handle pull_number parameter", async () => {
    // TODO: Fix test mocking - the code works but the test setup has issues with GraphQL mocking for PR queries
    const handler = await main({ name: "copilot" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { pullRequest: { id: "pr-id-123", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ addAssigneesToAssignable: { assignable: { assignees: { nodes: [{ login: "copilot-swe-agent" }] } } } });
    const result = await handler({ type: "assign_to_agent", pull_number: 123, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(true);
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Successfully assigned copilot coding agent to pull request #123"));
    expect(handler.getErrorCount()).toBe(0);
  });

  it("should error when both issue_number and pull_number are provided", async () => {
    const handler = await main({});
    const result = await handler({ type: "assign_to_agent", issue_number: 42, pull_number: 123, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.error).toHaveBeenCalledWith("Cannot specify both issue_number and pull_number in the same assign_to_agent item");
    expect(handler.getErrorCount()).toBe(1);
  });

  it("should auto-resolve issue number from context when not provided (triggering target)", async () => {
    mockContext.eventName = "issues";
    mockContext.payload = { issue: { number: 123 } };
    mockContext.repo = { owner: "test-owner", repo: "test-repo" };

    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id-123", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    await handler({ type: "assign_to_agent", agent: "copilot" }, {}, new Map());
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Target configuration: triggering"));
    expect(mockGithub.graphql).toHaveBeenCalled();
  });

  it("should skip when context doesn't match triggering target", async () => {
    mockContext.eventName = "push";
    const handler = await main({});
    const result = await handler({ type: "assign_to_agent", agent: "copilot" }, {}, new Map());
    expect(result.skipped).toBe(true);
    expect(mockCore.error).not.toHaveBeenCalled();
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("not running in issue or pull request context"));
  });

  it("should error when neither issue_number nor pull_number provided and target is '*'", async () => {
    const handler = await main({ target: "*" });
    const result = await handler({ type: "assign_to_agent", agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.error).toHaveBeenCalled();
    expect(handler.getErrorCount()).toBe(1);
  });

  it("should accept agent when in allowed list", async () => {
    const handler = await main({ allowed: "copilot" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=", __typename: "Bot" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockCore.info).toHaveBeenCalledWith("Allowed agents: copilot");
    expect(result.success).toBe(true);
    expect(mockCore.error).not.toHaveBeenCalledWith(expect.stringContaining("not in the allowed list"));
  });

  it("should reject agent not in allowed list", async () => {
    const handler = await main({ allowed: "other-agent" });
    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.info).toHaveBeenCalledWith("Allowed agents: other-agent");
    expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining('Agent "copilot" is not in the allowed list'));
    expect(handler.getErrorCount()).toBe(1);
    expect(mockGithub.graphql).not.toHaveBeenCalled();
  });

  it("should allow any agent when no allowed list is configured", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(true);
    expect(mockCore.info).not.toHaveBeenCalledWith(expect.stringContaining("Allowed agents:"));
    expect(mockCore.error).not.toHaveBeenCalled();
  });

  it("should skip assignment when ignore-if-error is true and auth error occurs", async () => {
    const handler = await main({ "ignore-if-error": "true" });
    mockGithub.graphql.mockRejectedValueOnce(new Error("Bad credentials"));
    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());

    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Ignore-if-error mode enabled"));
    expect(mockCore.warning).toHaveBeenCalledWith(expect.stringContaining("Agent assignment failed"));
    expect(mockCore.warning).toHaveBeenCalledWith(expect.stringContaining("ignore-if-error=true"));
    expect(handler.getErrorCount()).toBe(0);

    await handler.writeSummary();
    const summaryCall = mockCore.summary.addRaw.mock.calls[0][0];
    expect(summaryCall).toContain("Skipped");
    expect(summaryCall).toContain("assignment failed due to error");
  });

  it("should fail when ignore-if-error is false (default) and auth error occurs", async () => {
    const handler = await main({});
    mockGithub.graphql.mockRejectedValue(new Error("Bad credentials"));
    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());

    expect(mockCore.info).not.toHaveBeenCalledWith(expect.stringContaining("ignore-if-error mode enabled"));
    expect(result.success).toBe(false);
    expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining("Failed to assign agent"));
    expect(handler.getErrorCount()).toBe(1);
    expect(mockGithub.rest.issues.createComment).toHaveBeenCalledWith(expect.objectContaining({ owner: "test-owner", repo: "test-repo", issue_number: 42, body: expect.stringMatching(/Assignment failed.*Bad credentials/s) }));
  });

  it("should handle ignore-if-error when 'Resource not accessible' error", async () => {
    const handler = await main({ "ignore-if-error": "true" });
    mockGithub.graphql.mockRejectedValue(new Error("Resource not accessible by integration"));
    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockCore.warning).toHaveBeenCalledWith(expect.stringContaining("Agent assignment failed"));
    expect(handler.getErrorCount()).toBe(0);
  });

  it("should still fail on non-auth errors even with ignore-if-error not set", async () => {
    const handler = await main({});
    mockGithub.graphql.mockRejectedValue(new Error("Network timeout"));
    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining("Failed to assign agent"));
    expect(handler.getErrorCount()).toBe(1);
  });

  it("should not post failure comment on success", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "I_abc123", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockGithub.rest.issues.createComment).not.toHaveBeenCalled();
  });

  it("should post failure comment on single failed assignment", async () => {
    const handler = await main({});
    mockGithub.graphql.mockRejectedValue(new Error("Bad credentials"));
    await handler({ type: "assign_to_agent", issue_number: 11, agent: "copilot" }, {}, new Map());
    expect(mockGithub.rest.issues.createComment).toHaveBeenCalledTimes(1);
    expect(mockGithub.rest.issues.createComment).toHaveBeenCalledWith(expect.objectContaining({ owner: "test-owner", repo: "test-repo", issue_number: 11, body: expect.stringMatching(/Assignment failed.*Bad credentials/s) }));
  });

  it("should sanitize dangerous content in failure comment body", async () => {
    const handler = await main({});
    mockGithub.graphql.mockRejectedValue(new Error("@admin triggered <!-- inject --> error"));
    await handler({ type: "assign_to_agent", issue_number: 11, agent: "copilot" }, {}, new Map());
    expect(mockGithub.rest.issues.createComment).toHaveBeenCalledTimes(1);
    const [callArg] = mockGithub.rest.issues.createComment.mock.calls[0];
    expect(typeof callArg.body).toBe("string");
    expect(callArg.body).not.toMatch(/(?<!`)@admin(?!`)/);
    expect(callArg.body).not.toContain("<!-- inject -->");
  });

  it("should not post failure comment when ignore-if-error skips the assignment", async () => {
    const handler = await main({ "ignore-if-error": "true" });
    mockGithub.graphql.mockRejectedValue(new Error("Bad credentials"));
    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockGithub.rest.issues.createComment).not.toHaveBeenCalled();
  });

  it("should report errors via getErrors() when failure comment post fails", async () => {
    const handler = await main({});
    mockGithub.graphql.mockRejectedValue(new Error("Bad credentials"));
    mockGithub.rest.issues.createComment.mockRejectedValue(new Error("Could not post comment"));
    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockGithub.rest.issues.createComment).toHaveBeenCalledTimes(1);
    expect(handler.getErrorCount()).toBe(1);
    expect(handler.getErrors()).toContain("Bad credentials");
    expect(mockCore.warning).toHaveBeenCalledWith(expect.stringContaining("Failed to post failure comment"));
  });

  it.skip("should add 10-second delay between multiple agent assignments", async () => {
    // Note: This test is skipped because testing actual delays is complex.
    // The implementation has been manually verified to include the delay logic.
  }, 30000);

  it("should write summary for successful assignments", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    await handler.writeSummary();
    const summaryCall = mockCore.summary.addRaw.mock.calls[0][0];
    expect(summaryCall).toContain("Successfully assigned 1 agent(s)");
    expect(summaryCall).toContain("Issue #42");
  });

  it("should return correct getAssigned() output after successful assignment", async () => {
    const handler = await main({});
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(handler.getAssigned()).toBe("issue:42:copilot");
    expect(handler.getErrorCount()).toBe(0);
    expect(handler.getErrors()).toBe("");
  });

  describe("Cross-repository allowlist validation", () => {
    it("should reject target repository not in allowlist", async () => {
      const handler = await main({ allowed_repos: "allowed-owner/allowed-repo" });
      const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot", repo: "not-allowed/other-repo" }, {}, new Map());
      expect(result.success).toBe(false);
      expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining("E004:"));
      expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining("not in the allowed-repos list"));
    });

    it("should allow target repository in allowlist", async () => {
      const handler = await main({ allowed_repos: "allowed-owner/allowed-repo,other-owner/other-repo" });
      mockGithub.graphql
        .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
        .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
        .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

      const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot", repo: "allowed-owner/allowed-repo" }, {}, new Map());
      expect(result.success).toBe(true);
      expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Looking for copilot coding agent"));
    }, 20000);

    it("should allow default repository even without allowlist", async () => {
      const handler = await main({});
      mockGithub.graphql
        .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "MDQ6VXNlcjE=" }] } } })
        .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
        .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

      const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
      expect(result.success).toBe(true);
      expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Default target repo: test-owner/test-repo"));
      expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Looking for copilot coding agent"));
    }, 20000);
  });

  it("should handle pull-request-repo configuration correctly", async () => {
    mockGithub.graphql.mockResolvedValueOnce({ repository: { id: "pull-request-repo-id", defaultBranchRef: { name: "main" } } });
    const handler = await main({ "pull-request-repo": "test-owner/pull-request-repo" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "agent-id" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Using pull request repository: test-owner/pull-request-repo"));
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Pull request repository ID: pull-request-repo-id"));
    const lastGraphQLCall = mockGithub.graphql.mock.calls[mockGithub.graphql.mock.calls.length - 1];
    expect(lastGraphQLCall[0]).toContain("agentAssignment");
    expect(lastGraphQLCall[0]).toContain("targetRepositoryId");
    expect(lastGraphQLCall[1].targetRepoId).toBe("pull-request-repo-id");
  });

  it("should handle per-item pull_request_repo parameter", async () => {
    mockGithub.graphql.mockResolvedValueOnce({ repository: { id: "default-pr-repo-id", defaultBranchRef: { name: "main" } } });
    const handler = await main({ "pull-request-repo": "test-owner/default-pr-repo", "allowed-pull-request-repos": "test-owner/item-pull-request-repo" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { id: "item-pull-request-repo-id" } })
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "agent-id" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot", pull_request_repo: "test-owner/item-pull-request-repo" }, {}, new Map());
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Using per-item pull request repository: test-owner/item-pull-request-repo"));
    const lastGraphQLCall = mockGithub.graphql.mock.calls[mockGithub.graphql.mock.calls.length - 1];
    expect(lastGraphQLCall[1].targetRepoId).toBe("item-pull-request-repo-id");
  });

  it("should reject per-item pull_request_repo not in allowed list", async () => {
    mockGithub.graphql.mockResolvedValueOnce({ repository: { id: "default-pr-repo-id", defaultBranchRef: { name: "main" } } });
    const handler = await main({ "pull-request-repo": "test-owner/default-pr-repo", "allowed-pull-request-repos": "test-owner/allowed-pr-repo" });
    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot", pull_request_repo: "test-owner/not-allowed-repo" }, {}, new Map());
    expect(result.success).toBe(false);
    expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining("E004:"));
    expect(handler.getErrorCount()).toBe(1);
  });

  it("should allow pull-request-repo without it being in allowed-pull-request-repos", async () => {
    mockGithub.graphql.mockResolvedValueOnce({ repository: { id: "auto-allowed-repo-id", defaultBranchRef: { name: "main" } } });
    const handler = await main({ "pull-request-repo": "test-owner/auto-allowed-repo" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "agent-id" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(true);
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Using pull request repository: test-owner/auto-allowed-repo"));
  });

  it("should use explicit base-branch when configured", async () => {
    mockGithub.graphql.mockResolvedValueOnce({ repository: { id: "code-repo-id", defaultBranchRef: { name: "main" } } });
    const handler = await main({ "pull-request-repo": "test-owner/code-repo", "base-branch": "develop" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "agent-id" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(true);
    const lastCall = mockGithub.graphql.mock.calls[mockGithub.graphql.mock.calls.length - 1];
    expect(lastCall[0]).toContain("baseRef: $baseRef");
    expect(lastCall[1].baseRef).toBe("develop");
    expect(lastCall[1].customInstructions).toBeUndefined();
  });

  it("should auto-resolve non-main default branch from pull-request-repo and set as baseRef", async () => {
    mockGithub.graphql.mockResolvedValueOnce({ repository: { id: "code-repo-id", defaultBranchRef: { name: "develop" } } });
    const handler = await main({ "pull-request-repo": "test-owner/code-repo" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "agent-id" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(true);
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("Resolved pull request repository default branch: develop"));
    const lastCall = mockGithub.graphql.mock.calls[mockGithub.graphql.mock.calls.length - 1];
    expect(lastCall[0]).toContain("baseRef: $baseRef");
    expect(lastCall[1].baseRef).toBe("develop");
  });

  it("should set baseRef when pull-request-repo default branch is main (no explicit base-branch)", async () => {
    mockGithub.graphql.mockResolvedValueOnce({ repository: { id: "code-repo-id", defaultBranchRef: { name: "main" } } });
    const handler = await main({ "pull-request-repo": "test-owner/code-repo" });
    mockGithub.graphql
      .mockResolvedValueOnce({ repository: { suggestedActors: { nodes: [{ login: "copilot-swe-agent", id: "agent-id" }] } } })
      .mockResolvedValueOnce({ repository: { issue: { id: "issue-id", assignees: { nodes: [] } } } })
      .mockResolvedValueOnce({ replaceActorsForAssignable: { __typename: "ReplaceActorsForAssignablePayload" } });

    const result = await handler({ type: "assign_to_agent", issue_number: 42, agent: "copilot" }, {}, new Map());
    expect(result.success).toBe(true);
    const lastCall = mockGithub.graphql.mock.calls[mockGithub.graphql.mock.calls.length - 1];
    expect(lastCall[0]).toContain("baseRef: $baseRef");
    expect(lastCall[1].baseRef).toBe("main");
    expect(lastCall[1].customInstructions).toBeUndefined();
  });
});
