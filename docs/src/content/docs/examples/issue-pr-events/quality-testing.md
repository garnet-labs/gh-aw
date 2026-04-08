---
title: Quality & Testing
description: Test coverage improvements and performance optimization - automated quality enhancements
sidebar:
  badge: { text: 'Event-triggered', variant: 'success' }
---

Quality and testing workflows automate test coverage analysis, performance optimization, and systematic quality improvements.

## When to Use Quality & Testing Workflows

- **Test coverage** - Daily incremental test improvements
- **Performance checks** - Automated performance regression detection
- **Quality gates** - Enforce standards on PRs
- **Systematic improvements** - Gradual quality enhancements

### Daily Test Coverage Improver

Analyzes test coverage, identifies gaps, and creates PRs with comprehensive tests to systematically improve code quality and reduce bugs. [Learn more](https://github.com/githubnext/agentics/blob/main/docs/daily-test-improver.md)

### Daily Performance Improver

Identifies performance bottlenecks, runs benchmarks, and implements optimizations to proactively improve application performance. [Learn more](https://github.com/githubnext/agentics/blob/main/docs/daily-perf-improver.md)

### Test Failure Investigation

Automatically investigates failed workflow runs by analyzing logs, identifying root causes, and creating detailed investigation reports with actionable recommendations to prevent similar failures. [Learn more](https://github.com/github/gh-aw/blob/main/.github/workflows/smoke-detector.md)

### Test Quality Sentinel

Analyzes test quality beyond code coverage percentages on every PR. Detects implementation-detail tests, happy-path-only tests, test inflation, and duplication, then posts a structured quality report as a PR review comment. Triggered when a pull request is marked ready for review. Workflow file: `.github/workflows/test-quality-sentinel.md`

### Approach Validator

Evaluates proposed technical approaches before implementation begins using a sequential four-agent panel: Devil's Advocate (failure modes), Alternatives Scout (alternative approaches), Implementation Estimator (complexity), and Dead End Detector (rewrite risk). Triggered by adding an `approach-proposal` label to a PR or `needs-design` label to an issue. Requires human approval (react with ✅ or ❌) before implementation proceeds. Workflow file: `.github/workflows/approach-validator.md`

### Design Decision Gate

Enforces Architecture Decision Records (ADRs) before implementation work can merge. Detects whether a PR introduces new architectural decisions without a corresponding ADR, then generates a draft ADR and pushes it directly to the PR branch for human review. Triggered when a PR is labeled `implementation` or marked ready for review. Workflow file: `.github/workflows/design-decision-gate.md`
