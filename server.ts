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
Analyse la photo transmise avec attention maximale.

RÈGLE ABSOLUE DE VALIDATION DE L'IMAGE (REJET REQUIS SI NON CONFORME) :
1. Nombre de personnes : La photo doit contenir STRICTEMENT UNE SEULE PERSONNE. S'il y a 2 personnes ou plus sur la photo, tu DOIS REJETER l'image en définissant "is_valid_image": false.
2. Intégrité du corps : La personne doit être visible EN ENTIER de la TÊTE aux PIEDS (corps complet debout). Si le corps est incomplet (selfie, mi-corps, visage uniquement, tête coupée, pieds coupés, buste uniquement), tu DOIS REJETER l'image en définissant "is_valid_image": false.

Si la photo N'EST PAS VALIDE :
- Définis "is_valid_image": false
- Rédige un message explicatif dans "rejection_reason" (ex: "Photo rejetée : plusieurs personnes détectées sur la photo. Veuillez importer une photo contenant une seule personne." ou "Photo rejetée : corps incomplet. Veuillez importer une photo montrant la personne entière de la tête aux pieds.")
- Tu peux mettre des valeurs par défaut pour les mensurations.

Si la photo EST VALIDE ("is_valid_image": true) :
- "rejection_reason": ""
- Estime et retourne de façon très précise et réaliste les mensurations clés de couture d'après la silhouette (sexe: ${gender || "non spécifié"}) sous format JSON en respectant STRICTEMENT les règles suivantes :

Pour un profil "homme" adulte (homme normal) :
- epaule (Largeur d'épaule) : doit être de 43 cm ou plus (généralement entre 43 et 55 cm)
- cou (Tour de cou) : doit être STRICTEMENT compris entre 36 cm et 44 cm
- manche (Longueur de manche) : longueur de la manche de l'épaule au poignet (généralement entre 55 et 75 cm)
- tour_manche (Tour de manche) : doit être STRICTEMENT compris entre 30 cm et 44 cm
- longueur_boubou (Longueur du boubou) : doit être STRICTEMENT compris entre 84 cm et 100 cm
- longueur_pantalon (Longueur du pantalon) : doit être STRICTEMENT compris entre 95 cm et 115 cm
- fesse (Tour de fesse / Bassin) : doit être STRICTEMENT compris entre 85 cm et 120 cm
- poitrine (Tour de poitrine) : doit être STRICTEMENT égal à fesse + 5 cm (poitrine = fesse + 5)
- cuisse (Tour de cuisse) : doit être STRICTEMENT compris entre 48 cm et 75 cm
- ceinture (Tour de ceinture) : doit être STRICTEMENT égal au tour de fesse (ceinture = fesse)

Pour un profil "enfant", adapte proportionnellement les mensurations selon sa hauteur (hauteur entre 80 et 160 cm) mais conserve les mêmes clés JSON.

Rédige également un commentaire de couturier bienveillant de 2 ou 3 phrases en français avec des conseils adaptés d'après la photo.`;

      const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-pro-preview"];
      let lastError: any = null;
      let responseText = "";
      let usedModel = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting measure API with model: ${modelName}`);
          
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  },
                  {
                    text: `Analyse cette image. Vérifie d'abord qu'il s'agit d'une seule personne entière (tête aux pieds). Si oui, estime les mensurations pour le profil ${gender || "non spécifié"}.`
                  }
                ]
              }
            ],
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  is_valid_image: { type: Type.BOOLEAN, description: "True si une seule personne entière de la tête aux pieds est visible. False si 2+ personnes ou si le corps est coupé." },
                  rejection_reason: { type: Type.STRING, description: "Raison explicite du rejet si is_valid_image est false, sinon chaîne vide." },
                  hauteur: { type: Type.INTEGER, description: "Hauteur totale estimée en cm" },
                  epaule: { type: Type.INTEGER, description: "Largeur d'épaule estimée en cm (min 43 pour un homme)" },
                  cou: { type: Type.INTEGER, description: "Tour de cou estimé en cm (36 à 44 pour un homme)" },
                  manche: { type: Type.INTEGER, description: "Longueur de manche en cm" },
                  tour_manche: { type: Type.INTEGER, description: "Tour de manche estimé en cm (30 à 44 pour un homme)" },
                  longueur_boubou: { type: Type.INTEGER, description: "Longueur du boubou estimée en cm (84 à 100 pour un homme)" },
                  longueur_pantalon: { type: Type.INTEGER, description: "Longueur de pantalon estimée en cm (95 à 115 pour un homme)" },
                  fesse: { type: Type.INTEGER, description: "Tour de fesse estimé en cm (85 à 120 pour un homme)" },
                  poitrine: { type: Type.INTEGER, description: "Tour de poitrine estimé en cm (fesse + 5 pour un homme)" },
                  cuisse: { type: Type.INTEGER, description: "Tour de cuisse estimé en cm (48 à 75 pour un homme)" },
                  ceinture: { type: Type.INTEGER, description: "Tour de ceinture estimé en cm (égal à fesse pour un homme)" },
                  comment: { type: Type.STRING, description: "Commentaire stylistique et de couture chaleureux en français (max 3 phrases)" }
                },
                required: ["is_valid_image", "rejection_reason", "hauteur", "epaule", "cou", "manche", "tour_manche", "longueur_boubou", "longueur_pantalon", "fesse", "poitrine", "cuisse", "ceinture", "comment"]
              },
              temperature: 0.1
            }
          });

          if (response && response.text) {
            responseText = response.text.trim();
            usedModel = modelName;
            console.log(`Successfully generated content using model ${modelName}`);
            break;
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
        
        let fallbackResults;
        if (isHomme) {
          const fesse = 95;
          fallbackResults = {
            hauteur: h,
            epaule: 45,
            cou: 39,
            manche: 62,
            tour_manche: 34,
            longueur_boubou: 90,
            longueur_pantalon: 102,
            fesse: fesse,
            poitrine: fesse + 5,
            cuisse: 56,
            ceinture: fesse,
            comment: "Note: Nos services d'IA sont temporairement surchargés. Ces mesures sont des estimations standards basées sur votre profil d'homme normal. Pour une précision optimale, nous vous invitons à les ajuster manuellement ou à réessayer dans quelques instants.",
            isLocal: true
          };
        } else {
          const fesse = 65;
          fallbackResults = {
            hauteur: h,
            epaule: 32,
            cou: 28,
            manche: 42,
            tour_manche: 22,
            longueur_boubou: 68,
            longueur_pantalon: 72,
            fesse: fesse,
            poitrine: fesse + 3,
            cuisse: 36,
            ceinture: fesse,
            comment: "Note: Nos services d'IA sont temporairement surchargés. Ces mesures sont des estimations standards basées sur le profil de l'enfant. Pour une précision optimale, nous vous invitons à les ajuster manuellement ou à réessayer dans quelques instants.",
            isLocal: true
          };
        }
        return res.json(fallbackResults);
      }

      // Safe JSON extraction in case of surrounding text
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/([\{\[][\s\S]*[\}\]])/);
      const results = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);

      if (results.is_valid_image === false) {
        console.warn("Image rejected by AI validation:", results.rejection_reason);
        return res.status(400).json({
          error: results.rejection_reason || "Photo non conforme : veuillez importer une photo d'une seule personne, vue en entier de la tête aux pieds (sans autres personnes et sans corps coupé)."
        });
      }

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
