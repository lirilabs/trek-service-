import GitHubStore from "../lib/githubStore.js";
import { enableCORS, ping } from "../lib/utils.js";
import crypto from "crypto";

const store = new GitHubStore();

export default async function handler(req, res) {
  enableCORS(res);
  ping(res, "db");

  if (req.method === "OPTIONS") return res.status(200).end();

  const file = req.query.file || "data/default.json";

  try {
    if (req.method === "GET") {
      const result = await store.readFile(file);
      return res.json({
        ok: true,
        ping: "db",
        data: result?.data || [],
      });
    }

    const body = await readBody(req);

    if (req.method === "POST") {
      const result = await store.readFile(file);
      const data = result?.data || [];

      data.push({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...body,
      });

      await store.writeFile(file, data, result?.sha, "add record");
      return res.json({ ok: true, ping: "db" });
    }

    if (req.method === "PUT") {
      const result = await store.readFile(file);
      const updated = result.data.map(x =>
        x.id === body.id ? { ...x, ...body } : x
      );

      await store.writeFile(file, updated, result.sha, "update record");
      return res.json({ ok: true, ping: "db" });
    }

    if (req.method === "DELETE") {
      const result = await store.readFile(file);
      const filtered = result.data.filter(x => x.id !== body.id);

      await store.writeFile(file, filtered, result.sha, "delete record");
      return res.json({ ok: true, ping: "db" });
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
