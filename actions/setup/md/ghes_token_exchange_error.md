
**🔑 Copilot Token Exchange Failed (GHES)**: The Copilot CLI received a 403 error when attempting to exchange your GitHub token for a Copilot access token. This typically means Copilot is not licensed for your GitHub Enterprise Server instance.

**Common causes:**
- Copilot is not enabled at the enterprise level on GHES
- Copilot seat not assigned to the token owner
- GitHub Connect not configured between GHES and GitHub.com

**Resolution steps:**
1. Ask your GHES site administrator to verify that GitHub Connect is enabled
2. Ensure Copilot is enabled at the enterprise level in GHES admin settings
3. Verify that the token owner has been assigned a Copilot seat
4. Check the GHES admin logs for token exchange errors

**Documentation:**
- [GHES Copilot setup guide](https://docs.github.com/en/enterprise-server/admin/copilot/managing-github-copilot-in-your-enterprise)
- [GitHub Connect configuration](https://docs.github.com/en/enterprise-server/admin/configuration/configuring-github-connect)
