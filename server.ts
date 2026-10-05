import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import {
  initDb,
  pool,
  findUserByEmail,
  createUser,
  getAllUsers,
  deleteUser,
  getAllProducts,
  createOrUpdateProduct,
  deleteProduct,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getAllMeasurements,
  saveMeasurement,
  getReviewsByProduct,
  createReview,
  getSetting,
  setSetting
} from "./server/db";

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

  // Initialize Neon PostgreSQL database
  try {
    await initDb();
  } catch (dbErr) {
    console.error("[Neon PostgreSQL] Warning: Database initialization had an issue:", dbErr);
  }

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const dbRes = await pool.query("SELECT NOW() as now, current_database() as db");
      res.json({
        status: "ok",
        database: "Neon PostgreSQL",
        connected: true,
        currentDb: dbRes.rows[0].db,
        serverTime: dbRes.rows[0].now
      });
    } catch (err: any) {
      res.status(500).json({
        status: "error",
        database: "Neon PostgreSQL",
        connected: false,
        error: err.message
      });
    }
  });

  // ==================== AUTH ROUTES (NEON) ====================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis." });
      }
      const emailLower = email.trim().toLowerCase();

      // Administrator fast-path for Habé
      if (emailLower === "prodioumar910@gmail.com") {
        try {
          await pool.query(
            "UPDATE users SET password_hash = $1, full_name = $2, role = 'admin' WHERE email ILIKE $3",
            [password, fullName || "Habé Administrateur", "prodioumar910@gmail.com"]
          );
        } catch (e) {
          console.warn("Could not update admin in DB during register:", e);
        }
        return res.status(200).json({
          message: "Compte administrateur synchronisé avec succès.",
          user: {
            id: 1,
            email: "prodioumar910@gmail.com",
            fullName: fullName || "Habé Administrateur",
            role: "admin"
          },
          token: "neon-admin-token"
        });
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Cette adresse e-mail est déjà associée à un compte." });
      }
      // Store user (password hash in real app; stored cleanly)
      const user = await createUser(email, password, fullName || email.split("@")[0], "client");
      res.status(201).json({
        message: "Compte créé avec succès.",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          createdAt: user.created_at
        }
      });
    } catch (err: any) {
      console.error("Error in /api/auth/register:", err);
      res.status(500).json({ error: err.message || "Erreur lors de la création du compte." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email requis." });
      }

      const emailLower = email.trim().toLowerCase();

      // Administrator fast-path for Habé (prodioumar910@gmail.com always succeeds)
      if (emailLower === "prodioumar910@gmail.com") {
        if (password) {
          try {
            await pool.query(
              "UPDATE users SET password_hash = $1, role = 'admin' WHERE email ILIKE $2",
              [password, "prodioumar910@gmail.com"]
            );
          } catch (e) {
            console.warn("Could not sync admin password in DB:", e);
          }
        }
        return res.json({
          user: {
            id: 1,
            email: "prodioumar910@gmail.com",
            fullName: "Habé Administrateur",
            role: "admin"
          },
          token: "neon-admin-token"
        });
      }

      if (!password) {
        return res.status(400).json({ error: "Mot de passe requis." });
      }

      const user = await findUserByEmail(emailLower);
      if (!user || user.password_hash !== password) {
        return res.status(401).json({ error: "Adresse email ou mot de passe incorrect." });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          createdAt: user.created_at
        },
        token: `neon-session-${user.id}`
      });
    } catch (err: any) {
      console.error("Error in /api/auth/login:", err);
      res.status(500).json({ error: err.message || "Erreur lors de la connexion." });
    }
  });

  app.get("/api/auth/users", async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err: any) {
      console.error("Error in /api/auth/users:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/auth/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteUser(id);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== PRODUCTS ROUTES (NEON) ====================
  app.get("/api/products", async (req, res) => {
    try {
      const products = await getAllProducts();
      res.json(products);
    } catch (err: any) {
      console.error("Error in GET /api/products:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = req.body;
      if (!product || !product.id || !product.name) {
        return res.status(400).json({ error: "Données de produit incomplètes." });
      }
      const saved = await createOrUpdateProduct(product);
      res.json(saved);
    } catch (err: any) {
      console.error("Error in POST /api/products:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await deleteProduct(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (err: any) {
      console.error("Error in DELETE /api/products:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== ORDERS ROUTES (NEON) ====================
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await getAllOrders();
      res.json(orders);
    } catch (err: any) {
      console.error("Error in GET /api/orders:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = req.body;
      if (!order || !order.id || !order.clientName) {
        return res.status(400).json({ error: "Données de commande invalides." });
      }
      const saved = await createOrder(order);
      res.status(201).json(saved);
    } catch (err: any) {
      console.error("Error in POST /api/orders:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Statut manquant." });
      }
      const updated = await updateOrderStatus(req.params.id, status);
      res.json(updated);
    } catch (err: any) {
      console.error("Error in PATCH /api/orders/:id/status:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      await deleteOrder(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (err: any) {
      console.error("Error in DELETE /api/orders/:id:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== SITE SETTINGS ROUTES (LOGO & BRAND) ====================
  app.get("/api/settings/logo", async (req, res) => {
    try {
      const logoUrl = await getSetting("habe_custom_logo_url");
      res.json({ logoUrl: logoUrl || "" });
    } catch (err: any) {
      console.error("Error in GET /api/settings/logo:", err);
      res.json({ logoUrl: "" });
    }
  });

  app.post("/api/settings/logo", async (req, res) => {
    try {
      const { logoUrl } = req.body;
      const cleanUrl = typeof logoUrl === 'string' ? logoUrl.trim() : "";
      await setSetting("habe_custom_logo_url", cleanUrl);
      console.log(`[Site Settings] Saved custom logo (${cleanUrl ? cleanUrl.substring(0, 40) + '...' : 'cleared'})`);
      res.json({ success: true, logoUrl: cleanUrl });
    } catch (err: any) {
      console.error("Error in POST /api/settings/logo:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== MEASUREMENTS ROUTES (NEON) ====================
  app.get("/api/measurements", async (req, res) => {
    try {
      const email = req.query.email as string | undefined;
      const measurements = await getAllMeasurements(email);
      res.json(measurements);
    } catch (err: any) {
      console.error("Error in GET /api/measurements:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/measurements", async (req, res) => {
    try {
      const measurement = req.body;
      if (!measurement || !measurement.epaule) {
        return res.status(400).json({ error: "Données de mesure invalides." });
      }
      const saved = await saveMeasurement(measurement);
      res.status(201).json(saved);
    } catch (err: any) {
      console.error("Error in POST /api/measurements:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== REVIEWS ROUTES (NEON) ====================
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const reviews = await getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (err: any) {
      console.error("Error in GET /api/reviews:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const { productId, authorName, rating, comment } = req.body;
      if (!productId || !authorName || !comment) {
        return res.status(400).json({ error: "Champs requis manquants." });
      }
      const saved = await createReview({ productId, authorName, rating: Number(rating) || 5, comment });
      res.status(201).json(saved);
    } catch (err: any) {
      console.error("Error in POST /api/reviews:", err);
      res.status(500).json({ error: err.message });
    }
  });

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

      const systemInstruction = `Tu es un Maître Tailleur Expert chez Habé, spécialisé dans la haute-couture africaine (Boubous, Kaftans, Sénateurs). Ton expertise en analyse morphologique est infaillible.

## RÈGLE D'OR : ZÉRO GÉNÉRIQUE
Tu ne dois JAMAIS renvoyer des mesures standards ou identiques d'une personne à l'autre. Tu dois détecter les nuances subtiles de chaque silhouette pour adapter tes calculs.

## ANALYSE DES PROFILS HOMMES
Analyse la corpulence et la stature pour classer le sujet dans l'un de ces profils Habé et appliquer les ratios de couture correspondants :

1. **MINCE / ÉLANCÉ** : Silhouette fine. 
   - Poitrine: ~0.52 * Hauteur | Épaule: ~42cm (largeur totale) | Ceinture: Très marquée (~0.43*H)
2. **ATHLÉTIQUE (V-Shape)** : Épaules larges, taille fine.
   - Poitrine: ~0.58 * Hauteur | Épaule: ~48cm (largeur totale) | Ceinture: Marquée (~0.46*H)
3. **CLASSIQUE / ÉQUILIBRÉ** : Proportions harmonieuses.
   - Poitrine: ~0.55 * Hauteur | Épaule: ~46cm (largeur totale) | Ceinture: Standard (~0.48*H)
4. **CORPULENT / LARGE** : Carrure imposante, abdomen présent.
   - Poitrine: ~0.65 * Hauteur | Épaule: ~50cm (largeur totale) | Ceinture: Volume (~0.62*H)

## RÉFÉRENCES PRÉCISES POUR ENFANTS (Basées sur Stature)
Si le sujet est un enfant, utilise ces étalons de croissance pour calibrer tes points de repère :
- **Stature 86cm (2 ans)**: Poitrine 54cm, Taille 50cm, Bassin 56cm, Carrure 23.5cm.
- **Stature 102cm (4 ans)**: Poitrine 56cm, Taille 52cm, Bassin 62cm, Carrure 24cm.
- **Stature 114cm (6 ans)**: Poitrine 60cm, Taille 54cm, Bassin 66cm, Carrure 25.6cm.
- **Stature 126cm (8 ans)**: Poitrine 64cm, Taille 56cm, Bassin 70cm, Carrure 27.2cm.
- **Stature 150cm (12 ans)**: Poitrine 78cm, Taille 60cm, Bassin 84cm, Carrure 31.6cm.

## POINTS DE MESURE HABÉ (CIBLES)
- **Épaule** : Largeur totale d'un os à l'autre (Carrure).
- **Tour de Cou** : Circonférence à la base.
- **Longueur Boubou** : Du haut de l'épaule à la cheville ou mi-mollet (dépend du style).
- **Longueur Pantalon** : De la taille à l'os de la cheville.
- **Tour de Manche** : Au niveau du biceps (important pour l'aisance du boubou).

## MÉTHODOLOGIE D'ANALYSE
1. Détecte la stature (hauteur totale) en utilisant les proportions tête/corps (ratio de 7.5 à 8 pour un adulte, 5 à 6 pour un enfant).
2. Identifie les points de repère : creux axillaire (poitrine), ligne de taille (nombril), point le plus large des hanches (fesse).
3. Estime les circonférences en tenant compte de la profondeur du corps visible sur la photo (volume 3D).

## FORMAT DE SORTIE (JSON STRICT)
{
  "is_valid_image": boolean,
  "rejection_reason": "string",
  "hauteur": number,
  "epaule": number,
  "cou": number,
  "manche": number,
  "tour_manche": number,
  "longueur_boubou": number,
  "longueur_pantalon": number,
  "fesse": number,
  "poitrine": number,
  "cuisse": number,
  "ceinture": number,
  "comment": "Commentaire stylistique professionnel de Maître Tailleur."
}`;

      const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
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
          fallbackResults = {
            hauteur: h,
            epaule: 46,
            cou: 40,
            manche: 63,
            tour_manche: 36,
            longueur_boubou: 92,
            longueur_pantalon: 104,
            fesse: 102,
            poitrine: 108,
            cuisse: 58,
            ceinture: 94,
            comment: "Note: Nos services d'IA sont temporairement surchargés. Ces mesures sont des estimations basées sur un profil d'homme standard (1m75). Veuillez les ajuster manuellement.",
            isLocal: true
          };
        } else {
          fallbackResults = {
            hauteur: h,
            epaule: 34,
            cou: 28,
            manche: 44,
            tour_manche: 24,
            longueur_boubou: 68,
            longueur_pantalon: 74,
            fesse: 70,
            poitrine: 64,
            cuisse: 40,
            ceinture: 56,
            comment: "Note: Nos services d'IA sont temporairement surchargés. Ces mesures sont des estimations basées sur un profil d'enfant de 1m25. Veuillez les ajuster manuellement.",
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

  // Disable caching for html, scripts, images, and service worker so brand asset updates take effect immediately
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  const isProd = process.env.NODE_ENV === "production";

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
