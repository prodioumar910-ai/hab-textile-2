import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

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

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

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

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let lastError: any = null;
      let responseText = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting measure API with model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                imagePart,
                { text: `Analyse cette personne de sexe ${gender || "non spécifié"}.` }
              ]
            },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
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
            }
          });

          if (response.text) {
            responseText = response.text;
            console.log(`Successfully generated content using model ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed or unavailable:`, err.message || err);
          lastError = err;
        }
      }

      if (!responseText) {
        throw lastError || new Error("Aucun modèle d'IA n'a pu répondre à la demande.");
      }

      const results = JSON.parse(responseText.trim());
      res.json(results);
    } catch (error: any) {
      console.error("Error in /api/measure:", error);
      res.status(500).json({ error: error?.message || "Erreur d'analyse par l'IA. Veuillez vous assurer que la photo est claire." });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
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
