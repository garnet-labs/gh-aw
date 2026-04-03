---
description: Fetches issue details and searches Notion for related pages to provide context for project management
timeout-minutes: 5
on:
  workflow_dispatch:
    inputs:
      issue-number:
        description: "Issue number to analyze"
        required: true
        type: string
permissions:
  contents: read
  issues: read
  pull-requests: read
tools:
  github:
imports:
  - shared/mcp/notion.md
strict: true
---

# Issue Analysis with Notion Context

Analyze issue #${{ github.event.inputs.issue-number }} and search Notion for related pages to provide project context.

## Instructions

1. Read and analyze the issue content using the GitHub tools
2. Use `notion-search` to find related Notion pages that may provide relevant project context
3. If relevant pages are found, use `notion-get-block-children` to read their content
4. Summarize the issue and any related Notion context in your response
