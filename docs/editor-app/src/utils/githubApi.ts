const API_BASE = 'https://api.github.com';

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  };
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubRepo {
  default_branch: string;
  permissions: { push: boolean };
}

export interface GitHubPR {
  html_url: string;
  number: number;
}

async function ghFetch(url: string, token: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(token), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as { message?: string }).message || res.statusText;
    const err = new Error(msg);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  return res;
}

export async function validateToken(token: string): Promise<GitHubUser> {
  const res = await ghFetch(`${API_BASE}/user`, token);
  return res.json();
}

export async function getRepo(token: string, owner: string, repo: string): Promise<GitHubRepo> {
  const res = await ghFetch(
    `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    token,
  );
  return res.json();
}

export async function getDefaultBranchSha(
  token: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<string> {
  // Branch paths with / must NOT be encoded — GitHub API expects literal slashes
  const res = await ghFetch(
    `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${branch}`,
    token,
  );
  const data = await res.json();
  return (data as { object: { sha: string } }).object.sha;
}

export async function createBranch(
  token: string,
  owner: string,
  repo: string,
  branchName: string,
  sha: string,
): Promise<void> {
  await ghFetch(
    `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
    },
  );
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
): Promise<void> {
  // Use TextEncoder for proper UTF-8 base64 encoding (no deprecated unescape)
  const bytes = new TextEncoder().encode(content);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);

  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  await ghFetch(
    `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`,
    token,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, content: b64, branch }),
    },
  );
}

export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  title: string,
  head: string,
  base: string,
  body: string,
): Promise<GitHubPR> {
  const res = await ghFetch(
    `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, head, base, body }),
    },
  );
  return res.json();
}
