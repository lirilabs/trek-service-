import { cors } from "../lib/utils.js";

export default function handler(req, res) {
  cors(res);
  res.json({
    ok: true,
    service: "trek-service-github-db",
    time: Date.now(),
  });
}
