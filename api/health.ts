export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status: "ok",
    platform: "Vercel Serverless",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
}
