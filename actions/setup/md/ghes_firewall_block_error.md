
**🔥 GHES API Domain Blocked by Firewall**: The workflow firewall is blocking access to your GHES API domain, preventing the Copilot CLI from communicating with the server.

**Common causes:**
- GHES API domain `api.<your-ghes-host>` is not in the firewall allowed domains list
- Network restrictions prevent access to the GHES instance
- Incorrect firewall configuration in the workflow

**Resolution steps:**
1. Add your GHES API domain to the workflow's network.allowed list:
   ```yaml
   network:
     allowed:
       - api.your-ghes-host.com
   ```

2. Alternatively, configure the engine API target:
   ```yaml
   engine:
     api-target: https://api.your-ghes-host.com
   ```

3. Ensure your GHES instance is reachable from GitHub Actions runners

**Note:** The GHES API domain follows the pattern `api.<ghes-hostname>`. For example, if your GHES instance is at `github.company.com`, the API domain is `api.github.company.com`.
