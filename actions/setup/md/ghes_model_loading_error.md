
**⚠️ Copilot Model Loading Failed (GHES)**: The Copilot CLI received a 400 error when attempting to load available models. On GHES, this often indicates an API proxy routing issue.

**Common causes:**
- GHES API proxy is routing requests to the wrong endpoint
- Copilot API endpoints not properly configured on GHES
- Upstream Copilot service connectivity issues from GHES

**Resolution steps:**
1. Verify that the GHES API proxy is correctly configured for Copilot endpoints
2. Check GHES admin logs for API routing errors
3. Ensure GitHub Connect is properly configured and active
4. Test Copilot API connectivity from the GHES instance

**Known issues:**
- See [github/gh-aw-firewall#1300](https://github.com/github/gh-aw-firewall/issues/1300) for API proxy routing issues

**Note:** A 400 error during model loading may mask a deeper 403 authorization error. Check the token exchange status first.
