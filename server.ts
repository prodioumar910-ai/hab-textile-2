import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add CORS headers to support mobile apps/Capacitor/external origin requests
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Allow larger payload sizes to process camera snaps
  app.use(express.json({ limit: "15mb" }));

  // API endpoints FIRST
  app.post("/api/measure", async (req, res) => {
    try {
      const { image, gender } = req.body;
      if (!image) {
        return res.status(400).json({ error: "L'image est requise." });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY");
        return res.status(500).json({ error: "Le service d'IA n'est pas encore configuré. Veuillez définir GEMINI_API_KEY dans vos secrets de construction." });
      }

      // Support any kind of image formats and extract base64 cleanly
      let base64Data = "";
      let mimeType = "image/jpeg";

      if (typeof image === "string") {
        const matches = image.match(/^data:([^;]+);base64,(.*)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        }

        // Support base64url format by translating it to standard base64 format
        base64Data = base64Data
          .replace(/-/g, "+")
          .replace(/_/g, "/");

        // Strip any whitespace, carriage returns, or invalid characters not in the base64 alphabet
        base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");

        // Pad base64 data to ensure it's a multiple of 4 (required by native atob/btoa implementations)
        const remainder = base64Data.length % 4;
        if (remainder === 2) {
          base64Data += "==";
        } else if (remainder === 3) {
          base64Data += "=";
        }
      } else {
        return res.status(400).json({ error: "Format d'image non valide." });
      }

      // Ensure mimeType is supported by Gemini (jpeg, png, webp, heic, heif)
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
      if (!allowedMimes.includes(mimeType)) {
        if (mimeType.includes("png")) {
          mimeType = "image/png";
        } else if (mimeType.includes("webp")) {
          mimeType = "image/webp";
        } else {
          mimeType = "image/jpeg";
        }
      }

      const systemInstruction = `Tu es un tailleur couturier professionnel virtuel d'exception pour Maison Habé.
Analyse la photo de l'utilisateur (un être humain debout) pour estimer précisément sa hauteur (taille totale) ainsi que ses mensurations corporelles en centimètres (cm).
L'utilisateur s'identifie comme de sexe ${gender || "non spécifié"}.

Estime et retourne de façon réaliste et logique les mensurations clés de couture :
1. Hauteur totale (Height) - "hauteur" en cm (généralement entre 150 et 200 cm pour un adulte)
2. Taille (Waist) - "taille" en cm
3. Hanche (Hips) - "hanche" en cm
4. Poitrine (Chest/Bust) - "poitrine" en cm
5. Manche (Sleeve) - "manche" en cm
6. Coude (Elbow) - "coude" en cm
7. Pantalon (Leg/Inseam) - "pantalon" en cm

Veille à ce que toutes ces valeurs soient logiques et cohérentes entre elles d'après la silhouette et le sexe de l'utilisateur, sans absurdités.
Rédige également un commentaire de couturier bienveillant de 2 ou 3 phrases en français avec des conseils adaptés à sa morphologie d'après la photo.
Format requis : JSON strict selon le schéma fourni.`;

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-flash-latest"];
      let lastError: any = null;
      let responseText = "";
      let usedModel = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting measure API with model: ${modelName}`);
          const interaction = await ai.interactions.create({
            model: modelName,
            system_instruction: systemInstruction,
            input: [
              {
                type: "image",
                data: base64Data,
                mime_type: mimeType
              },
              {
                type: "text",
                text: `Analyse cette personne de sexe ${gender || "non spécifié"} et donne ses mensurations.`
              }
            ],
            response_format: {
              type: Type.OBJECT,
              properties: {
                hauteur: { type: Type.INTEGER, description: "Hauteur totale estimée en cm" },
                taille: { type: Type.INTEGER, description: "Mensuration taille estimée en cm" },
                hanche: { type: Type.INTEGER, description: "Mensuration hanche estimée en cm" },
                poitrine: { type: Type.INTEGER, description: "Mensuration poitrine estimée en cm" },
                manche: { type: Type.INTEGER, description: "Mensuration manche estimée en cm" },
                coude: { type: Type.INTEGER, description: "Mensuration coude estimée en cm" },
                pantalon: { type: Type.INTEGER, description: "Mensuration pantalon estimée en cm" },
                comment: { type: Type.STRING, description: "Commentaire stylistique et de couture chaleureux en français (max 3 phrases)" }
              },
              required: ["hauteur", "taille", "hanche", "poitrine", "manche", "coude", "pantalon", "comment"]
            }
          });

          // Extract text from the last step which should contain the JSON
          const lastStep = interaction.steps.at(-1);
          if (lastStep && lastStep.type === 'model_output') {
            const textContent = lastStep.content?.find(c => c.type === 'text');
            if (textContent) {
              responseText = textContent.text.trim();
              usedModel = modelName;
              console.log(`Successfully generated content using model ${modelName}`);
              break;
            }
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed or unavailable:`, err.message || err);
          lastError = err;
        }
      }

      if (!responseText) {
        console.warn("All AI models failed. Using server-side fallback measurements.");
        // Server-side fallback logic (similar to frontend)
        const isHomme = gender === "homme";
        const h = isHomme ? 175 : 125;
        
        const fallbackResults = {
          hauteur: h,
          taille: Math.round(h * 0.48),
          hanche: Math.round(h * 0.54),
          poitrine: Math.round(h * 0.52),
          manche: Math.round(h * 0.35),
          coude: Math.round(h * 0.15),
          pantalon: Math.round(h * 0.45),
          comment: "Note: Nos services d'IA sont temporairement surchargés. Ces mesures sont des estimations standards basées sur votre profil. Pour une précision optimale, nous vous invitons à les ajuster manuellement ou à réessayer dans quelques instants.",
          isLocal: true
        };
        return res.json(fallbackResults);
      }

      // Safe JSON extraction in case of surrounding text
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/([\{\[][\s\S]*[\}\]])/);
      const results = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
      res.json({ ...results, model: usedModel });
    } catch (error: any) {
      console.error("Error in /api/measure:", error);
      res.status(500).json({ error: error?.message || "Erreur d'analyse par l'IA. Veuillez vous assurer que la photo est claire." });
    }
  });

  // Detect production: either NODE_ENV is set to production OR the "dist" directory exists.
  // In production, we always serve built assets and avoid spawning the Vite dev middleware.
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist"));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
