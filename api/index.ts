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

  return app(req, res);
}
