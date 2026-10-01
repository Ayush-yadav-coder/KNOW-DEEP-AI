import app from "../server";

export default function handler(req: any, res: any) {
  // Global CORS headers for Vercel Serverless
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-gemini-api-key, x-pexels-api-key, x-weather-api-key, x-sports-api-key"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Restore the real requested path on Vercel Serverless
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-invoke-path"] || req.headers["x-forwarded-uri"];
  if (typeof matchedPath === "string" && matchedPath.startsWith("/api")) {
    req.url = matchedPath;
  } else if (req.headers["x-now-route-matches"]) {
    try {
      const matchParams = new URLSearchParams(req.headers["x-now-route-matches"]);
      const sub = matchParams.get("1") || matchParams.get("match") || matchParams.get("0");
      if (sub) {
        req.url = `/api/${sub.startsWith("/") ? sub.slice(1) : sub}`;
      }
    } catch {}
  }

  return app(req, res);
}

