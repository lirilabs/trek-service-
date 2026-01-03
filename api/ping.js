import { enableCORS } from "../lib/utils.js";

export default function handler(req, res) {
  enableCORS(res);
  res.json({
    ok: true,
    service: "github-storage-db",
    time: Date.now(),
  });
}
