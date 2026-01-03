import GitHubStore from "../lib/githubStore.js";
import { cors, ping } from "../lib/utils.js";

const store = new GitHubStore();

export default async function handler(req, res) {
  cors(res);
  ping(res, "file");
  if (req.method === "OPTIONS") return res.end();

  const path = req.query.path;
  if (!path) return res.status(400).json({ error: "path required" });

  try {
    if (req.method === "GET") {
      const file = await store.readFile(path);
      return res.json({ ok: true, data: file?.data || null });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const old = await store.readFile(path);

      await store.writeFile(path, body, old?.sha, "write file");
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

function readBody(req) {
  return new Promise(resolve => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => resolve(JSON.parse(data || "{}")));
  });
}
