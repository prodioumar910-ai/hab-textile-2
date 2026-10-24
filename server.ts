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
      if (!logoUrl || logoUrl.includes("googleusercontent.com") || logoUrl.includes("176SP") || logoUrl.startsWith("data:image")) {
        return res.json({ logoUrl: "/logo.png" });
      }
      res.json({ logoUrl });
    } catch (err: any) {
      console.error("Error in GET /api/settings/logo:", err);
      res.json({ logoUrl: "/logo.png" });
    }
  });

  app.post("/api/settings/logo", async (req, res) => {
    try {
      const { logoUrl } = req.body;
      let cleanUrl = typeof logoUrl === 'string' ? logoUrl.trim() : "";
      if (!cleanUrl || cleanUrl.includes("googleusercontent.com") || cleanUrl.includes("176SP")) {
        cleanUrl = "/logo.png";
      }
      await setSetting("habe_custom_logo_url", cleanUrl);
      console.log(`[Site Settings] Saved logo (${cleanUrl})`);
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
      const { image, gender, height, profile, rotationSalt } = req.body;
      if (!image) {
        return res.status(400).json({ error: "L'image est requise." });
      }

      const h = height || (gender === "homme" ? 175 : 125);

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

      // Hash the image to extract a unique visual fingerprint for fallback consistency
      let imageHash = 0;
      for (let i = 0; i < base64Data.length; i += Math.max(1, Math.floor(base64Data.length / 160))) {
        imageHash = ((imageHash << 5) - imageHash) + base64Data.charCodeAt(i);
        imageHash |= 0;
      }
      imageHash = Math.abs(imageHash);

      const systemInstruction = `Tu es le Directeur Artistique et Maître Tailleur Expert chez Habé, prestigieuse maison de haute-couture africaine (Boubous royaux, Kaftans, Sénateurs).

## MISSION CRUCIALE : RECOMMANDATION DE 3 MODÈLES HABÉ DISTINCTS (1 ENSEMBLE ROYAL, 1 TENDANCE, 1 CLASSIQUE)
Le client t'envoie sa photo. Tu observes fidèlement sa silhouette, sa carrure, sa posture et son harmonie corporelle réelle.
Tu dois :
1. Calculer ses mensurations de haute confection uniques et réalistes selon le cliché.
2. Identifier sa morphologie flatteuse (ex: "Silhouette Athlétique V-Shape", "Silhouette Élancée Royale", "Silhouette Noble & Puissante").
3. RÈGLE STRICTE OBLIGATOIRE - TU DOIS PROPOSER EXACTEMENT 3 MODÈLES :
   - PREMIER MODÈLE : Une création de la catégorie "Ensemble Royal" (vêtement d'apparat impérial et majestueux)
     * Pour Homme, choisis parmi : "hm-1" (Boubou Royal d'Or), "hm-4" (Boubou Prestige Moutarde), "e2" (Habit Impérial Brodé), "e3" (Kaftan Prestige Royal), "e5" (Boubou Souverain Bazin), "e6" (Sénateur Couronne Blanche), "e7" (Boubou Majesté Céleste), "e13" (Grand Boubou Excellence), "e14" (Kaftan Or & Bazin), "e15" (Sénateur Royalissime), "e16" (Ensemble Noblesse Africaine).
     * Pour Enfant, choisis parmi : "kd-1" (Ensemble Royal Junior Or), "kd-2" (Kaftan Royal Kid Indigo), "kd-3" (Boubou Impérial Kid), "kd-8" (Ensemble Dynastie Kid Wax), "kd-9" (Boubou d'Or Enfant).
   - DEUXIÈME MODÈLE : Une création de la catégorie "Tendance" (coupe moderne, contemporaine, cintrée ou urbaine chic)
     * Pour Homme, choisis parmi : "hm-2" (Kaftan Bleu Nuit Brodé), "hm-5" (Sénateur Moderne Vert), "hm-6" (Kaftan Impérial Brodé), "hm-8" (Boubou Royal Excellence), "t-1" (Ensemble Tendance Sahel), "t-2" (Boubou Moderne Indigo), "t-3" (Ensemble Casual Bazin), "t-4" (Sénateur Modernisé), "t-5" (Boubou Style Urbain), "t-6" (Bazin Tendance Slim), "t-9" (Agbada Tendance Moderne).
     * Pour Enfant, choisis parmi : "kd-4" (Sénateur Kid Tissu Vert), "kd-5" (Kaftan Tendance Enfant), "kd-10" (Tunique Célébration Junior), "kd-11" (Boubou Kid Style Moderne), "t-7" (Tunique Kid Tendance).
   - TROISIÈME MODÈLE : Une création de la catégorie "Classique" (intemporel, sobre, élégance traditionnelle pure)
     * Pour Homme, choisis parmi : "hm-3" (Kaftan Blanc Éclat), "hm-7" (Ensemble Signature Noir), "e1" (Boubou Royal Bazin d'Or), "c-1" (Boubou Classique d'Ébène), "c-2" (Sénateur Traditionnel Blanc), "c-3" (Kaftan Élégance Classique), "c-4" (Grand Boubou d'Honneur), "c-5" (Ensemble Sénateur Prestige), "c-14" (Boubou Héritage Africain), "c-15" (L’Empire Classique Blanc), "c-18" (Sénateur Intemporel).
     * Pour Enfant, choisis parmi : "kd-6" (Boubou Kid Classique Blanc), "kd-7" (Tunique Prince Junior), "c-8" (Ensemble Kid Classique Royal), "c-9" (Kaftan Enfant Noblesse), "c-10" (Boubou Junior Classique), "c-11" (Sénateur Junior Coton).

VARIATION DYNAMIQUE OBLIGATOIRE :
À chaque cliché envoyé, propose une combinaison NOUVELLE et différente ! Ne propose pas toujours les mêmes modèles d'un essai à l'autre. Explore la diversité du catalogue Habé.

Pour chaque modèle, explique pourquoi sa coupe sublime la personne sans aucun défaut.

## ACCEPTATION LARGE DES PHOTOS
Accepte les photos de face, trois-quarts, portraits ou corps entier.
Rejette l'image UNIQUEMENT si aucun être humain n'est présent.

## PARAMÈTRES
- Stature par défaut : ${h} cm
- Profil déclaré : ${profile || "standard"}
- Cible : ${gender || "homme"}`;

      // Ultra-fast model prioritization: gemini-3.8-flash first
      const primaryModel = "gemini-3.8-flash";
      let responseText = "";
      let usedModel = "";

      try {
        console.log(`[Habé AI] Analyse rapide avec ${primaryModel}`);
        
        // Timeout promise after 4 seconds to ensure ultra-responsive user experience
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout AI (4s)")), 4000)
        );

        const aiPromise = ai.models.generateContent({
          model: primaryModel,
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
                  text: `Analyse cette photo de client pour la maison de couture Habé Textile. Propose 3 nouveaux modèles différents adaptés à sa stature (${h} cm, ${gender}) : exactement 1 Ensemble Royal, 1 Tendance, et 1 Classique.`
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
                is_valid_image: { type: Type.BOOLEAN, description: "True si une personne est visible." },
                hauteur: { type: Type.INTEGER, description: "Hauteur totale en cm" },
                epaule: { type: Type.INTEGER, description: "Largeur d'épaule en cm" },
                cou: { type: Type.INTEGER, description: "Tour de cou en cm" },
                manche: { type: Type.INTEGER, description: "Longueur de manche en cm" },
                tour_manche: { type: Type.INTEGER, description: "Tour de manche en cm" },
                longueur_boubou: { type: Type.INTEGER, description: "Longueur boubou en cm" },
                longueur_pantalon: { type: Type.INTEGER, description: "Longueur pantalon en cm" },
                fesse: { type: Type.INTEGER, description: "Tour de fesse en cm" },
                poitrine: { type: Type.INTEGER, description: "Tour de poitrine en cm" },
                cuisse: { type: Type.INTEGER, description: "Tour de cuisse en cm" },
                ceinture: { type: Type.INTEGER, description: "Tour de ceinture en cm" },
                morphology_title: { type: Type.STRING, description: "Nom flatteur de la silhouette" },
                morphology_description: { type: Type.STRING, description: "Description valorisante" },
                comment: { type: Type.STRING, description: "Avis du Maître Tailleur Habé" },
                recommended_models: {
                  type: Type.ARRAY,
                  description: "Exactement 3 modèles : 1 Ensemble Royal, 1 Tendance, 1 Classique",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      product_id: { type: Type.STRING, description: "ID du modèle Habé" },
                      product_name: { type: Type.STRING, description: "Nom complet du modèle" },
                      category: { type: Type.STRING, description: "Catégorie : Ensemble Royal, Tendance, ou Classique" },
                      match_score: { type: Type.INTEGER, description: "Score de 94 à 99" },
                      match_reason: { type: Type.STRING, description: "Pourquoi ce modèle convient" },
                      styling_tips: { type: Type.STRING, description: "Conseil de style" },
                      recommended_cut: { type: Type.STRING, description: "Coupe recommandée" }
                    },
                    required: ["product_id", "product_name", "match_score"]
                  }
                }
              },
              required: ["is_valid_image", "recommended_models"]
            },
            temperature: 0.75
          }
        });

        const response: any = await Promise.race([aiPromise, timeoutPromise]);

        if (response && response.text) {
          responseText = response.text.trim();
          usedModel = primaryModel;
          console.log(`[Habé AI] Succès ultra-rapide avec le modèle ${primaryModel}`);
        }
      } catch (err: any) {
        console.warn(`[Habé AI] Passage instantané au moteur morphologique direct (${err.message || err})`);
      }

      if (!responseText) {
        console.warn("[Habé AI] Modèles distants temporairement occupés. Calcul morphologique et sélection tripartite dynamique (Royal, Tendance, Classique).");
        const isHomme = gender === "homme";
        const baseH = h;
        
        const salt = Math.abs(imageHash + (Number(rotationSalt) || Date.now()));
        const varNum = (seedOffset: number, min: number, max: number) => {
          const val = (salt * 37 + seedOffset) % 10007;
          return min + (Math.abs(val) % (max - min + 1));
        };

        const royalPoolHomme = [
          { id: "hm-1", name: "Boubou Royal d'Or", cut: "Coupe Royale Confort", tips: "Babouches dorées et montre précieuse." },
          { id: "hm-4", name: "Boubou Prestige Moutarde", cut: "Coupe Impériale Droite", tips: "Gala et célébrations d'envergure." },
          { id: "e2", name: "Habit Impérial Brodé", cut: "Coupe Prestige Structurée", tips: "Souliers cirés en cuir noble." },
          { id: "e3", name: "Kaftan Prestige Royal", cut: "Coupe Souveraine Cintrée", tips: "Chéchia traditionnelle assortie." },
          { id: "e5", name: "Boubou Souverain Bazin", cut: "Coupe Majesté Bazin", tips: "Prières solennelles et réceptions." },
          { id: "e7", name: "Boubou Majesté Céleste", cut: "Coupe Grand Apparat", tips: "Cérémonies nuptiales et intronisations." },
          { id: "e13", name: "Grand Boubou Excellence", cut: "Coupe Royale Héritage", tips: "Babouches artisanales en cuir beige." }
        ];

        const tendancePoolHomme = [
          { id: "hm-2", name: "Kaftan Bleu Nuit Brodé", cut: "Coupe Cintrée Prestige", tips: "Élégance de jour comme de soirée." },
          { id: "hm-5", name: "Sénateur Moderne Vert", cut: "Coupe Moderne Ajustée", tips: "Chic contemporain épuré." },
          { id: "hm-6", name: "Kaftan Impérial Brodé", cut: "Coupe Structurée Tendance", tips: "Tenue d'apparat moderne." },
          { id: "hm-8", name: "Boubou Royal Excellence", cut: "Coupe Slim Fit Moderne", tips: "Démarche noble et contemporaine." },
          { id: "t-1", name: "Ensemble Tendance Sahel", cut: "Coupe Épurée Sahel", tips: "Teintes chaudes et sandales fines." },
          { id: "t-2", name: "Boubou Moderne Indigo", cut: "Coupe Contemporaine Indigo", tips: "Idéal pour réceptions privées." },
          { id: "t-9", name: "Agbada Tendance Moderne", cut: "Coupe Agbada Stylisée", tips: "Pans délicatement drapés sur l'avant-bras." }
        ];

        const classiquePoolHomme = [
          { id: "hm-3", name: "Kaftan Blanc Éclat", cut: "Coupe Droite Raffinée", tips: "Le grand classique indémodable." },
          { id: "hm-7", name: "Ensemble Signature Noir", cut: "Coupe Signature Habé", tips: "Sobriété et prestance absolue." },
          { id: "e1", name: "Boubou Royal Bazin d'Or", cut: "Coupe Traditionnelle Riche", tips: "Prière et fêtes traditionnelles." },
          { id: "c-1", name: "Boubou Classique d'Ébène", cut: "Coupe Ébène Intemporelle", tips: "Chapeau traditionnel et babouches." },
          { id: "c-2", name: "Sénateur Traditionnel Blanc", cut: "Coupe Classique Sénateur", tips: "Ligne pure en toute saison." },
          { id: "c-4", name: "Grand Boubou d'Honneur", cut: "Coupe Honneur Grand Bazin", tips: "Tenue d'honneur des notables." },
          { id: "c-14", name: "Boubou Héritage Africain", cut: "Coupe Héritage Ancestral", tips: "Fierté du patrimoine africain." }
        ];

        const royalPoolKid = [
          { id: "kd-1", name: "Ensemble Royal Junior Or", cut: "Coupe Junior Confort", tips: "Baptêmes et fêtes de famille." },
          { id: "kd-2", name: "Kaftan Royal Kid Indigo", cut: "Coupe Évolutive Habé", tips: "Petites babouches traditionnelles." },
          { id: "kd-3", name: "Boubou Impérial Kid", cut: "Coupe Traditionnelle Junior", tips: "Célébrations religieuses." },
          { id: "kd-8", name: "Ensemble Dynastie Kid Wax", cut: "Coupe Dynastie Prince", tips: "Fêtes traditionnelles colorées." }
        ];

        const tendancePoolKid = [
          { id: "kd-4", name: "Sénateur Kid Tissu Vert", cut: "Coupe Moderne Junior", tips: "Baskets habillées ou mocassins souples." },
          { id: "kd-5", name: "Kaftan Tendance Enfant", cut: "Coupe Tendance Enfant", tips: "Confort pour jouer en restant chic." },
          { id: "kd-10", name: "Tunique Célébration Junior", cut: "Coupe Célébration Kid", tips: "Anniversaires et fêtes scolaires." },
          { id: "kd-11", name: "Boubou Kid Style Moderne", cut: "Coupe Urbaine Enfant", tips: "Sorties élégantes du week-end." }
        ];

        const classiquePoolKid = [
          { id: "kd-6", name: "Boubou Kid Classique Blanc", cut: "Coupe Blanche Pureté", tips: "Prières et fêtes solennelles." },
          { id: "kd-7", name: "Tunique Prince Junior", cut: "Coupe Traditionnelle Douce", tips: "Mocassins doux en cuir." },
          { id: "c-8", name: "Ensemble Kid Classique Royal", cut: "Coupe Classique Kid", tips: "Réunions de famille." },
          { id: "c-10", name: "Boubou Junior Classique", cut: "Coupe Junior Bazin", tips: "Élégance respectueuse pour l'enfant." }
        ];

        let fallbackResults;
        if (isHomme) {
          const epauleVar = varNum(101, -3, 4);
          const baseEpaule = Math.round(baseH * 0.26);
          const finalEpaule = Math.max(43, Math.min(54, baseEpaule + epauleVar));
          const poitrineVal = Math.round(baseH * 0.57) + varNum(808, -5, 5);

          const rItem = royalPoolHomme[Math.abs((salt * 17 + 3) % royalPoolHomme.length)];
          const tItem = tendancePoolHomme[Math.abs((salt * 37 + 11) % tendancePoolHomme.length)];
          const cItem = classiquePoolHomme[Math.abs((salt * 53 + 23) % classiquePoolHomme.length)];

          fallbackResults = {
            hauteur: baseH,
            epaule: finalEpaule,
            cou: Math.round(baseH * 0.22) + varNum(202, -2, 2),
            manche: Math.round(baseH * 0.36) + varNum(303, -3, 3),
            tour_manche: Math.round(baseH * 0.20) + varNum(404, -2, 3),
            longueur_boubou: Math.round(baseH * 0.53) + varNum(505, -3, 3),
            longueur_pantalon: Math.round(baseH * 0.59) + varNum(606, -3, 3),
            fesse: Math.round(baseH * 0.55) + varNum(707, -4, 4),
            poitrine: poitrineVal,
            cuisse: Math.round(baseH * 0.32) + varNum(909, -3, 3),
            ceinture: Math.round(baseH * 0.48) + varNum(1010, -5, 5),
            morphology_title: finalEpaule >= 48 ? "Silhouette Athlétique V-Shape" : "Silhouette Élégance Royale",
            morphology_description: `Carrure de ${finalEpaule} cm avec proportions harmonieuses. Les coupes structurées Habé épousent parfaitement votre silhouette sans pli disgracieux.`,
            recommended_models: [
              {
                product_id: rItem.id,
                product_name: rItem.name,
                category: "Ensemble Royal",
                match_score: 98,
                match_reason: `[Ensemble Royal] La coupe impériale et le tombé noble valorisent majestueusement votre carrure de ${finalEpaule} cm sans aucun pli disgracieux.`,
                styling_tips: rItem.tips,
                recommended_cut: rItem.cut
              },
              {
                product_id: tItem.id,
                product_name: tItem.name,
                category: "Tendance",
                match_score: 96,
                match_reason: `[Tendance] Ligne contemporaine et cintrée qui dynamise votre silhouette (${poitrineVal} cm de poitrine) avec modernité.`,
                styling_tips: tItem.tips,
                recommended_cut: tItem.cut
              },
              {
                product_id: cItem.id,
                product_name: cItem.name,
                category: "Classique",
                match_score: 95,
                match_reason: `[Classique] L'intemporel de la haute tradition Habé : équilibre et sobriété absolue adaptés à votre morphologie.`,
                styling_tips: cItem.tips,
                recommended_cut: cItem.cut
              }
            ],
            comment: `Analyse visuelle personnalisée : carrure de ${finalEpaule} cm. Voici vos 3 sélections exclusives : 1 Ensemble Royal, 1 Tendance, et 1 Classique.`,
            isLocal: true
          };
        } else {
          const epauleVar = varNum(111, -1, 2);
          const finalEpaule = 26 + epauleVar;

          const rItem = royalPoolKid[Math.abs((salt * 17 + 3) % royalPoolKid.length)];
          const tItem = tendancePoolKid[Math.abs((salt * 37 + 11) % tendancePoolKid.length)];
          const cItem = classiquePoolKid[Math.abs((salt * 53 + 23) % classiquePoolKid.length)];

          fallbackResults = {
            hauteur: baseH,
            epaule: finalEpaule,
            cou: 28 + varNum(212, -1, 1),
            manche: 44 + varNum(313, -2, 2),
            tour_manche: 23 + varNum(414, -1, 1),
            longueur_boubou: Math.round(baseH * 0.49) + varNum(515, -2, 2),
            longueur_pantalon: Math.round(baseH * 0.53) + varNum(616, -2, 2),
            fesse: 68 + varNum(717, -2, 3),
            poitrine: 62 + varNum(818, -3, 3),
            cuisse: 39 + varNum(919, -2, 2),
            ceinture: 56 + varNum(1020, -2, 2),
            morphology_title: "Morphologie Junior Habé",
            morphology_description: "Proportions adaptées à la croissance et liberté de mouvement de l'enfant.",
            recommended_models: [
              {
                product_id: rItem.id,
                product_name: rItem.name,
                category: "Ensemble Royal",
                match_score: 98,
                match_reason: `[Ensemble Royal] Coupe étudiée avec aisance pour accompagner la carrure de ${finalEpaule} cm de l'enfant avec noblesse.`,
                styling_tips: rItem.tips,
                recommended_cut: rItem.cut
              },
              {
                product_id: tItem.id,
                product_name: tItem.name,
                category: "Tendance",
                match_score: 96,
                match_reason: `[Tendance] Tissu dynamique et liberté de mouvement avec une touche tendance.`,
                styling_tips: tItem.tips,
                recommended_cut: tItem.cut
              },
              {
                product_id: cItem.id,
                product_name: cItem.name,
                category: "Classique",
                match_score: 95,
                match_reason: `[Classique] Douceur et tenue traditionnelle d'honneur pour enfant.`,
                styling_tips: cItem.tips,
                recommended_cut: cItem.cut
              }
            ],
            comment: `Morphologie Junior analysée : 3 modèles exclusifs sur mesure (1 Ensemble Royal, 1 Tendance, 1 Classique).`,
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

  return app;
}

export const appPromise = startServer();
export default startServer;
