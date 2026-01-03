import fetch from "node-fetch";

const API = "https://api.github.com";

export default class GitHubStore {
  constructor() {
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.branch = process.env.GITHUB_BRANCH || "main";
    this.token = process.env.GITHUB_TOKEN;

    if (!this.owner || !this.repo || !this.token) {
      throw new Error("Missing GitHub environment variables");
    }
  }

  headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };
  }

  async readFile(path) {
    const url = `${API}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;
    const res = await fetch(url, { headers: this.headers() });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("GitHub read failed");

    const json = await res.json();
    const content = Buffer.from(json.content, "base64").toString("utf8");

    return {
      data: JSON.parse(content),
      sha: json.sha,
    };
  }

  async writeFile(path, data, sha, message) {
    const url = `${API}/repos/${this.owner}/${this.repo}/contents/${path}`;

    const body = {
      message,
      branch: this.branch,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      ...(sha && { sha }),
    };

    const res = await fetch(url, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("GitHub write failed");
  }
}
