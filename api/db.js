import { cors, ping } from "../lib/utils.js";
import crypto from "crypto";
import GitHubStore from "../lib/githubStore.js";

export default async function handler(req, res) {
  cors(res);
  ping(res, "db");
  if (req.method === "OPTIONS") return res.end();

  let store;
  try {
    store = new GitHubStore(); // ← moved here
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: "ENV_ERROR",
      detail: e.message
    });
  }

  const file = req.query.file || "data/default.json";

  try {
    if (req.method === "GET") {
      const result = await store.readFile(file);
      return res.json({ ok: true, data: result?.data || [] });
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
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

function readBody(req) {
  return new Promise(resolve => {
    let d = "";
    req.on("data", c => (d += c));
    req.on("end", () => resolve(JSON.parse(d || "{}")));
  });
}
