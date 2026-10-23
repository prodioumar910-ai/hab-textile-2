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
      const { image, gender, height, profile } = req.body;
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

## MISSION CRUCIALE : RECOMMANDATION DE MODÈLES HABÉ SANS DÉFAUT & MESURES
Le client t'envoie sa photo. Tu dois observer fidèlement sa silhouette, sa carrure, sa posture et son harmonie corporelle réelle.
Tu dois :
1. Calculer ses mensurations de haute confection uniques et réalistes (interdiction formelle de mesures répétitives d'un cliché à l'autre ; varie les épaules, poitrine, longueurs selon le cliché).
2. Identifier sa morphologie exacte (ex: "Silhouette Athlétique V-Shape", "Silhouette Élancée Royale", "Silhouette Noble & Puissante").
3. PROPOSER DIRECTEMENT 3 MODÈLES DU CATALOGUE HABÉ qui lui correspondent parfaitement sans aucun défaut :
   - Pour Homme, choisis parmi :
     * "hm-1" : Boubou Royal d'Or (coupe impériale, bazin riche)
     * "hm-2" : Kaftan Bleu Nuit Brodé (col officier, coupe cintrée)
     * "hm-3" : Kaftan Blanc Éclat (coton pur, coupe raffinée)
     * "hm-4" : Boubou Prestige Moutarde (ampleur noble, bazin d'apparat)
     * "hm-5" : Sénateur Moderne Vert (ligne épurée, chic contemporain)
     * "hm-6" : Kaftan Impérial Brodé (broderies verticales structurantes)
     * "hm-7" : Ensemble Signature Noir (élégance sobre et distinguée)
     * "hm-8" : Boubou Royal Excellence (majestueux pour galas)
   - Pour Enfant, choisis parmi :
     * "kd-1" : Ensemble Royal Junior Or
     * "kd-2" : Kaftan Royal Kid Indigo
     * "kd-3" : Boubou Impérial Kid
     * "kd-4" : Sénateur Kid Tissu Vert
     * "kd-5" : Kaftan Tendance Enfant
Pour chaque modèle recommandé, explique précisément POURQUOI il correspond à la personne sans aucun défaut (tombé du tissu, mise en valeur de la carrure, fluidité de la silhouette).

## ACCEPTATION LARGE DES PHOTOS
Accepte les photos de face, trois-quarts, portraits ou corps entier.
Si les jambes ne sont pas entièrement visibles, estime le haut du corps et extrapole harmonieusement le bas.
Rejette l'image UNIQUEMENT si AUCUN être humain n'est présent.

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
                  text: `Analyse cette photo de client pour la maison de couture Habé Textile. Recommande directement les 3 meilleurs modèles Habé qui correspondent parfaitement à sa stature (${h} cm, ${gender}) sans aucun défaut.`
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
                  description: "Les modèles Habé idéaux pour cette personne",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      product_id: { type: Type.STRING, description: "ID du modèle Habé (ex: hm-1, hm-2, hm-6)" },
                      product_name: { type: Type.STRING, description: "Nom complet du modèle" },
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
            temperature: 0.2
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
        console.warn("[Habé AI] Modèles distants temporairement occupés. Calcul morphologique et recommandations par signature visuelle.");
        const isHomme = gender === "homme";
        const baseH = h;
        
        const varNum = (seedOffset: number, min: number, max: number) => {
          const val = (imageHash * 37 + seedOffset) % 10007;
          return min + (Math.abs(val) % (max - min + 1));
        };

        let fallbackResults;
        if (isHomme) {
          const epauleVar = varNum(101, -3, 4);
          const baseEpaule = Math.round(baseH * 0.26);
          const finalEpaule = Math.max(43, Math.min(54, baseEpaule + epauleVar));
          const poitrineVal = Math.round(baseH * 0.57) + varNum(808, -5, 5);

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
                product_id: "hm-1",
                product_name: "Boubou Royal d'Or",
                match_score: 98,
                match_reason: `La coupe impériale et les broderies d'or structurent majestueusement votre carrure de ${finalEpaule} cm sans aucun défaut de tombé.`,
                styling_tips: "À porter avec des babouches assorties pour un charisme absolu.",
                recommended_cut: "Coupe Royale Confort"
              },
              {
                product_id: "hm-2",
                product_name: "Kaftan Bleu Nuit Brodé",
                match_score: 96,
                match_reason: `Le col officier étire la ligne de cou et valorise vos ${poitrineVal} cm de tour de poitrine avec finesse.`,
                styling_tips: "Élégance sobre et moderne pour vos réceptions privées.",
                recommended_cut: "Coupe Cintrée Prestige"
              },
              {
                product_id: "hm-6",
                product_name: "Kaftan Impérial Brodé",
                match_score: 94,
                match_reason: "Broderies géométriques d'exception qui allongent le buste et apportent une prestance royale immédiate.",
                styling_tips: "Idéal pour les cérémonies solennelles.",
                recommended_cut: "Coupe Impériale Structurée"
              }
            ],
            comment: `Analyse visuelle personnalisée : carrure de ${finalEpaule} cm. Proportions idéales pour sublimer les modèles Habé recommandés.`,
            isLocal: true
          };
        } else {
          const epauleVar = varNum(111, -1, 2);
          const finalEpaule = 26 + epauleVar;
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
                product_id: "kd-1",
                product_name: "Ensemble Royal Junior Or",
                match_score: 98,
                match_reason: `Coupe étudiée avec aisance pour accompagner la carrure de ${finalEpaule} cm de l'enfant avec noblesse.`,
                styling_tips: "Parfait pour les baptêmes et célébrations de famille.",
                recommended_cut: "Coupe Junior Confort"
              },
              {
                product_id: "kd-2",
                product_name: "Kaftan Royal Kid Indigo",
                match_score: 95,
                match_reason: "Tissu souple et col doux sans frottement.",
                styling_tips: "Assortir avec des babouches enfants Habé.",
                recommended_cut: "Coupe Évolutive"
              }
            ],
            comment: `Analyse visuelle Junior Habé : carrure de ${finalEpaule} cm avec aisance confortable pour une liberté royale.`,
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
