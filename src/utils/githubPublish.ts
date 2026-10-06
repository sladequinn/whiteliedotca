const STORAGE_KEY = 'wl_github_publish_config';

export interface GitHubPublishConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export const DEFAULT_GITHUB_CONFIG: Omit<GitHubPublishConfig, 'token'> = {
  owner: 'sladequinn',
  repo: 'whiteliedotca',
  branch: 'main',
  path: 'src/data.ts',
};

export function loadGitHubConfig(): GitHubPublishConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GitHubPublishConfig>;
      return {
        token: parsed.token || '',
        owner: parsed.owner || DEFAULT_GITHUB_CONFIG.owner,
        repo: parsed.repo || DEFAULT_GITHUB_CONFIG.repo,
        branch: parsed.branch || DEFAULT_GITHUB_CONFIG.branch,
        path: parsed.path || DEFAULT_GITHUB_CONFIG.path,
      };
    }
  } catch {}
  return { token: '', ...DEFAULT_GITHUB_CONFIG };
}

export function saveGitHubConfig(config: GitHubPublishConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    token: config.token.trim(),
    owner: config.owner.trim() || DEFAULT_GITHUB_CONFIG.owner,
    repo: config.repo.trim() || DEFAULT_GITHUB_CONFIG.repo,
    branch: config.branch.trim() || DEFAULT_GITHUB_CONFIG.branch,
    path: config.path.trim() || DEFAULT_GITHUB_CONFIG.path,
  }));
}

export function hasGitHubToken(): boolean {
  return Boolean(loadGitHubConfig().token);
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function contentsUrl(config: GitHubPublishConfig): string {
  return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${config.path}`;
}

export async function testGitHubConnection(config = loadGitHubConfig()): Promise<{ ok: boolean; login?: string; error?: string }> {
  if (!config.token) {
    return { ok: false, error: 'Paste a GitHub Personal Access Token first.' };
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: githubHeaders(config.token),
  });
  if (userRes.status === 401 || userRes.status === 403) {
    return { ok: false, error: 'GitHub rejected this token. Create a new Fine-grained token with Contents: Read and write on this repo.' };
  }
  if (!userRes.ok) {
    return { ok: false, error: `GitHub auth check failed (${userRes.status})` };
  }
  const user = await userRes.json();

  const fileRes = await fetch(`${contentsUrl(config)}?ref=${encodeURIComponent(config.branch)}`, {
    headers: githubHeaders(config.token),
  });
  if (fileRes.status === 404) {
    return { ok: false, error: `Could not find ${config.path} on ${config.owner}/${config.repo}@${config.branch}` };
  }
  if (!fileRes.ok) {
    const err = await fileRes.json().catch(() => ({}));
    return { ok: false, error: err.message || `Could not read ${config.path} (${fileRes.status})` };
  }

  return { ok: true, login: user.login };
}

export async function publishDataTsToGitHub(
  content: string,
  message = 'chore: publish site content from Backstage Admin',
): Promise<{ commitUrl?: string; htmlUrl?: string }> {
  const config = loadGitHubConfig();
  if (!config.token) {
    throw new Error('Add a GitHub token in Security, then click Publish. One-time setup — after that it commits for you.');
  }

  const apiUrl = contentsUrl(config);
  const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(config.branch)}`, {
    headers: githubHeaders(config.token),
  });

  if (getRes.status === 401 || getRes.status === 403) {
    throw new Error('GitHub token was rejected. Create a Fine-grained Personal Access Token with Contents: Read and write.');
  }

  let sha: string | undefined;
  if (getRes.ok) {
    const file = await getRes.json();
    sha = file.sha;
  } else if (getRes.status !== 404) {
    const err = await getRes.json().catch(() => ({}));
    throw new Error(err.message || `Could not read ${config.path} from GitHub (${getRes.status})`);
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      ...githubHeaders(config.token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(err.message || `GitHub commit failed (${putRes.status})`);
  }

  const data = await putRes.json();
  return {
    commitUrl: data.commit?.html_url,
    htmlUrl: data.content?.html_url,
  };
}
