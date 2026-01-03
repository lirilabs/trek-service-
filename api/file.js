import GitHubStore from "../lib/githubStore.js";

const store = new GitHubStore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.end();

  const path = req.query.path;
  if (!path) return res.status(400).json({ error: "path required" });

  try {
    // READ RAW
    if (req.method === "GET") {
      const file = await store.readFile(path);
      return res.json(file?.data || null);
    }

    // WRITE RAW
    if (req.method === "POST") {
      const body = await readBody(req);
      const old = await store.readFile(path);

      await store.writeFile(path, body, old?.sha, "write file");
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function readBody(req) {
  return new Promise(resolve => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => resolve(JSON.parse(data || "{}")));
  });
}
