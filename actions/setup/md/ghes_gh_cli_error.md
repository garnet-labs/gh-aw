
**🔧 gh CLI Misconfigured for GHES**: The gh CLI is targeting github.com instead of your GHES instance, causing repository resolution errors.

**Common causes:**
- `GH_HOST` environment variable not set to your GHES hostname
- gh CLI not properly authenticated for GHES
- Workflow using github.com credentials instead of GHES credentials

**Resolution steps:**
1. Ensure the `GH_HOST` environment variable is set in your workflow:
   ```yaml
   env:
     GH_HOST: github.company.com
   ```

2. Verify that the GitHub token is valid for your GHES instance (not a github.com token)

3. Check that repository references use the correct hostname format

**Example error:**
```
Could not resolve to a Repository with the name 'owner/repo'
```

This error occurs when gh CLI commands try to resolve repositories on github.com when they should be querying your GHES instance.
