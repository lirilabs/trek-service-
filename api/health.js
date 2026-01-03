import GitHubStore from "../lib/githubStore.js";

const store = new GitHubStore();

export default async function handler(req, res) {
  try {
    await store.readFile("README.md");
    res.json({
      ok: true,
      storage: "github",
      time: Date.now(),
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
    });
  }
}
