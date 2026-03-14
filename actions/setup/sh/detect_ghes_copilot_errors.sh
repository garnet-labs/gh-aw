#!/usr/bin/env bash
#
# detect_ghes_copilot_errors.sh - Detect GHES-specific Copilot errors
#
# Checks the agent stdio log for known error patterns specific to GitHub Enterprise Server (GHES)
# that indicate licensing, firewall, or configuration issues with Copilot on GHES.
#
# Sets GitHub Actions output variables:
#   ghes_token_exchange_403=true    if 403 on /copilot_internal/v2/token detected
#   ghes_model_loading_400=true     if 400 on model loading detected
#   ghes_firewall_block=true        if GHES API domain is blocked by firewall
#   ghes_gh_cli_misconfigured=true  if gh CLI resolution errors detected
#
# Exit codes:
#   0 - Always succeeds (uses continue-on-error in the workflow step)

set -euo pipefail

LOG_FILE="/tmp/gh-aw/agent-stdio.log"

# Initialize all outputs to false
echo "ghes_token_exchange_403=false" >> "$GITHUB_OUTPUT"
echo "ghes_model_loading_400=false" >> "$GITHUB_OUTPUT"
echo "ghes_firewall_block=false" >> "$GITHUB_OUTPUT"
echo "ghes_gh_cli_misconfigured=false" >> "$GITHUB_OUTPUT"

if [ ! -f "$LOG_FILE" ]; then
  echo "Log file not found: $LOG_FILE"
  exit 0
fi

# Check for 403 on Copilot token exchange endpoint
# Pattern: "403" + "copilot_internal/v2/token" or "Copilot token exchange failed"
if grep -qE "(403.*copilot_internal/v2/token|Copilot token exchange failed.*403)" "$LOG_FILE"; then
  echo "Detected GHES Copilot token exchange 403 error"
  echo "ghes_token_exchange_403=true" >> "$GITHUB_OUTPUT"
fi

# Check for 400 on model loading
# Pattern: "400" + "model" or "Error loading models" + "400 Bad Request"
if grep -qE "(Error loading models.*400|400 Bad Request.*model|Failed to list models.*400)" "$LOG_FILE"; then
  echo "Detected GHES Copilot model loading 400 error"
  echo "ghes_model_loading_400=true" >> "$GITHUB_OUTPUT"
fi

# Check for firewall blocking GHES API domain
# Pattern: "blocked" + "api." or "firewall" + "api." + hostname
if grep -qE "(blocked.*api\.|firewall.*api\.[^/]+|api\.[^/]+.*not.*allowed|api\.[^/]+.*firewall)" "$LOG_FILE"; then
  echo "Detected GHES API domain blocked by firewall"
  echo "ghes_firewall_block=true" >> "$GITHUB_OUTPUT"
fi

# Check for gh CLI misconfiguration (targeting github.com instead of GHES)
# Pattern: "Could not resolve to a Repository" or "gh.*github.com" when GHES is expected
if grep -qE "(Could not resolve to a Repository|gh.*targeting.*github\.com|GH_HOST.*not set)" "$LOG_FILE"; then
  echo "Detected gh CLI misconfiguration (targeting github.com instead of GHES)"
  echo "ghes_gh_cli_misconfigured=true" >> "$GITHUB_OUTPUT"
fi

echo "GHES error detection complete"
