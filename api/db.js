import GitHubStore from "../lib/githubStore.js";
import crypto from "crypto";

const store = new GitHubStore();

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const file = req.query.file || "data/default.json";

  try {
    // READ
    if (req.method === "GET") {
      const result = await store.readFile(file);
      return res.json(result?.data || []);
    }

    const body = await readBody(req);

    // CREATE
    if (req.method === "POST") {
      const result = await store.readFile(file);
      const data = result?.data || [];

      data.push({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...body,
      });

      await store.writeFile(file, data, result?.sha, "add record");
      return res.json({ ok: true });
    }

    // UPDATE
    if (req.method === "PUT") {
      const result = await store.readFile(file);
      if (!result) return res.status(404).json({ error: "file not found" });

      const updated = result.data.map(item =>
        item.id === body.id ? { ...item, ...body } : item
      );

      await store.writeFile(file, updated, result.sha, "update record");
      return res.json({ ok: true });
    }

    // DELETE
    if (req.method === "DELETE") {
      const result = await store.readFile(file);
      if (!result) return res.status(404).json({ error: "file not found" });

      const filtered = result.data.filter(item => item.id !== body.id);
      await store.writeFile(file, filtered, result.sha, "delete record");

      return res.json({ ok: true });
    }

    return res.status(405).end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function readBody(req) {
  return new Promise(resolve => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => resolve(JSON.parse(data || "{}")));
  });
}
