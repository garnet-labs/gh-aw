// @ts-check

const { extractRepoSlugFromUrl, normalizeRepoSlug, sanitizeRepoSlugForPatch } = require("./find_repo_checkout.cjs");
const { getPatchPathForRepo, sanitizeBranchNameForPatch } = require("./generate_git_patch.cjs");

describe("find_repo_checkout", () => {
  describe("extractRepoSlugFromUrl", () => {
    it("should extract slug from HTTPS URL", () => {
      expect(extractRepoSlugFromUrl("https://github.com/owner/repo.git")).toBe("owner/repo");
      expect(extractRepoSlugFromUrl("https://github.com/owner/repo")).toBe("owner/repo");
    });

    it("should extract slug from SSH URL", () => {
      expect(extractRepoSlugFromUrl("git@github.com:owner/repo.git")).toBe("owner/repo");
      expect(extractRepoSlugFromUrl("git@github.com:owner/repo")).toBe("owner/repo");
    });

    it("should handle GitHub Enterprise URLs", () => {
      expect(extractRepoSlugFromUrl("https://github.example.com/org/project.git")).toBe("org/project");
      expect(extractRepoSlugFromUrl("git@github.example.com:org/project.git")).toBe("org/project");
    });

    it("should normalize to lowercase", () => {
      expect(extractRepoSlugFromUrl("https://github.com/Owner/Repo.git")).toBe("owner/repo");
      expect(extractRepoSlugFromUrl("git@github.com:OWNER/REPO")).toBe("owner/repo");
    });

    it("should return null for invalid URLs", () => {
      expect(extractRepoSlugFromUrl("")).toBeNull();
      expect(extractRepoSlugFromUrl("invalid")).toBeNull();
      expect(extractRepoSlugFromUrl(null)).toBeNull();
      expect(extractRepoSlugFromUrl(undefined)).toBeNull();
    });
  });

  describe("normalizeRepoSlug", () => {
    it("should normalize to lowercase", () => {
      expect(normalizeRepoSlug("Owner/Repo")).toBe("owner/repo");
      expect(normalizeRepoSlug("ORG/PROJECT")).toBe("org/project");
    });

    it("should trim whitespace", () => {
      expect(normalizeRepoSlug("  owner/repo  ")).toBe("owner/repo");
    });

    it("should return empty string for invalid input", () => {
      expect(normalizeRepoSlug("")).toBe("");
      expect(normalizeRepoSlug(null)).toBe("");
      expect(normalizeRepoSlug(undefined)).toBe("");
    });
  });
});

describe("generate_git_patch multi-repo support", () => {
  describe("getPatchPathForRepo", () => {
    it("should include repo slug in path", () => {
      const path = getPatchPathForRepo("feature-branch", "owner/repo");
      expect(path).toBe("/tmp/gh-aw/aw-owner-repo-feature-branch.patch");
    });

    it("should sanitize repo slug", () => {
      const path = getPatchPathForRepo("main", "org/my-project");
      expect(path).toBe("/tmp/gh-aw/aw-org-my-project-main.patch");
    });

    it("should sanitize branch name", () => {
      const path = getPatchPathForRepo("feature/add-login", "owner/repo");
      expect(path).toBe("/tmp/gh-aw/aw-owner-repo-feature-add-login.patch");
    });
  });

  describe("sanitizeBranchNameForPatch", () => {
    it("should replace path separators with dashes", () => {
      expect(sanitizeBranchNameForPatch("feature/login")).toBe("feature-login");
      expect(sanitizeBranchNameForPatch("fix\\bug")).toBe("fix-bug");
    });

    it("should replace special characters", () => {
      expect(sanitizeBranchNameForPatch("feature:test")).toBe("feature-test");
      expect(sanitizeBranchNameForPatch("fix*bug")).toBe("fix-bug");
    });

    it("should collapse multiple dashes", () => {
      expect(sanitizeBranchNameForPatch("feature//login")).toBe("feature-login");
    });

    it("should remove leading/trailing dashes", () => {
      expect(sanitizeBranchNameForPatch("-feature-")).toBe("feature");
    });

    it("should convert to lowercase", () => {
      expect(sanitizeBranchNameForPatch("Feature-Branch")).toBe("feature-branch");
    });

    it("should handle empty/null input", () => {
      expect(sanitizeBranchNameForPatch("")).toBe("unknown");
      expect(sanitizeBranchNameForPatch(null)).toBe("unknown");
      expect(sanitizeBranchNameForPatch(undefined)).toBe("unknown");
    });
  });
});
