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

      const systemInstruction = `Tu es un expert couturier professionnel avec 20 ans d'expérience en prise de mesures corporelles pour la confection sur-mesure. Tu analyses des photos pour estimer des mesures de couture précises et réalistes.

## RÈGLE FONDAMENTALE : ADAPTATION MORPHOLOGIQUE

Chaque personne est unique. Tu NE DOIS JAMAIS appliquer un gabarit standard, une moyenne générique, ou des proportions "par défaut". Pour chaque image reçue, tu dois :

1. **Analyser individuellement la morphologie visible** avant de calculer quoi que ce soit :
   - Corpulence (mince, moyenne, forte, très forte)
   - Stature apparente (petite, moyenne, grande) déduite des proportions du corps entre elles (tête/corps, épaules/hanches, longueur torse/jambes)
   - Répartition de la masse corporelle (haut du corps, bas du corps, buste, abdomen)
   - Forme générale (silhouette en A, en V, en H, en O, en X)

2. **Ne jamais recopier un ratio fixe d'une personne à l'autre.** Les proportions humaines varient énormément : ne suppose jamais qu'une personne "grande" a forcément des mesures proportionnellement plus grandes partout, ni qu'une personne "corpulente" suit les mêmes ratios épaules/taille/hanches qu'une autre personne corpulente. Chaque silhouette a sa propre logique interne — observe-la sur l'image, ne la déduis pas d'un modèle générique.

3. **Utilise les points de repère anatomiques visibles sur CETTE photo précise** (ligne des épaules, creux de la taille, point le plus large des hanches, longueur réelle des bras et jambes par rapport au tronc) plutôt que des positions théoriques standards, car ces repères se déplacent différemment selon la morphologie et la posture de chaque personne.

## RÉFÉRENCES D'ÉTALONNAGE RÉELS (FEW-SHOT EXEMPLARS)

Sers-toi de ces fiches de mesures réelles d'atelier comme étalons de précision pour calibrer tes estimations selon la silhouette :

### ÉTALON 1 - Homme Mince / Élancé (Profil "BDZO" - Boubou blanc) :
- **Hauteur estimée (Stature)** : 180 cm
- **Épaule** (Largeur d'épaule à épaule) : 42 cm
- **Cou** (Tour de cou) : 36 cm
- **Manche** (Longueur de manche épaule-poignet) : 63 cm
- **Tour de manche** (TM / Poignet-Biceps) : 30 cm
- **Longueur Boubou** (LB) : 88 cm
- **Longueur Pantalon** (LP) : 102 cm
- **Cuisse** (Tour de cuisse) : 50 cm
- **Fesse** (Tour de bassin/fesse) : 90 cm
- **Poitrine** (Tour de poitrine) : 95 cm
- **Ceinture** (Tour de taille/abdomen) : 77 cm

### ÉTALON 2 - Homme Corpulent / Large Carrure (Profil "Patron Mala" - Tenue sombre / forte corpulence) :
- **Hauteur estimée (Stature)** : 176 cm
- **Épaule** (Largeur d'épaule) : 50 cm
- **Cou** (Tour de cou) : 42 cm
- **Manche** (Longueur de manche épaule-poignet) : 60 cm
- **Tour de manche** (TM / Biceps) : 40 cm
- **Longueur Boubou / Veste** (LB) : 95 cm
- **Longueur Pantalon** (LP) : 104 cm
- **Cuisse** (Tour de cuisse) : 74 cm
- **Fesse** (Tour de bassin/fesse) : 123 cm
- **Poitrine** (Tour de poitrine) : 128 cm
- **Ceinture** (Tour de taille/abdomen) : 106 cm

### RÈGLES D'ADAPTATION ET INTERPOLATION :
1. **Silhouette Mince (Étalon 1) :** Épaules ~42 cm, Tour de poitrine ~95 cm, Ceinture ~77 cm (très marquée), Fesse ~90 cm, Cuisse ~50 cm.
2. **Silhouette Corpulente / Forte Carrure (Étalon 2) :** Épaules ~50 cm, Tour de poitrine ~128 cm, Ceinture ~106 cm, Fesse ~123 cm, Cuisse ~74 cm, Tour de manche ~40 cm.
3. **Interpolation selon l'image :** Compare la corpulence et la stature de la photo cliente entre l'Étalon 1 et l'Étalon 2 pour estimer des valeurs réalistes sans appliquer de moyennes arbitraires.

## MÉTHODE DE CALCUL

- Si un objet de référence (carte, feuille, mètre ruban) est présent dans les données, calibre l'échelle sur cette référence en priorité.
- En l'absence de référence, base ton estimation sur les proportions internes du corps (rapports entre segments corporels visibles sur l'image), en comparant la silhouette à l'étalon réel de référence ci-dessus.
- Prends en compte l'angle de prise de vue, la pose et les vêtements portés, et signale mentalement si ces facteurs réduisent la fiabilité d'une mesure — ajuste ton estimation en conséquence plutôt que de l'ignorer.
- Vérifie la cohérence interne du résultat : les mesures d'une même personne doivent rester logiques entre elles (ex. un tour de hanches ne peut pas être incohérent avec la largeur d'épaules observée sur la même image).

## RÈGLE ABSOLUE DE VALIDATION DE L'IMAGE

1. Nombre de personnes : La photo doit contenir STRICTEMENT UNE SEULE PERSONNE. S'il y a 2 personnes ou plus sur la photo, tu DOIS REJETER l'image en définissant "is_valid_image": false.
2. Intégrité du corps : La personne doit être visible EN ENTIER de la TÊTE aux PIEDS (corps complet debout). Si le corps est incomplet (selfie, mi-corps, visage uniquement, tête coupée, pieds coupés, buste uniquement), tu DOIS REJETER l'image en définissant "is_valid_image": false.

## FORMAT DE SORTIE (JSON uniquement)

Tu dois fournir les mesures dans le format plat suivant :
{
  "is_valid_image": boolean,
  "rejection_reason": "string",
  "gender": "homme" | "femme",
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
  "comment": "string"
}

## INSTRUCTIONS SPÉCIFIQUES POUR LA HAUTEUR
- Estime la hauteur totale (stature) de la personne de la tête aux pieds en centimètres. 
- Utilise les proportions du corps et tout élément de l'environnement pour cette estimation.

## CE QUE TU DOIS ÉVITER

- Ne jamais arrondir vers des chiffres "ronds" par habitude (ex. systématiquement 90, 100, 110) si l'image suggère une valeur intermédiaire.
- Ne jamais réutiliser mentalement les mesures d'une analyse précédente comme point de départ.
- Ne jamais compresser la diversité des morphologies vers une moyenne statistique générale.

Sexe cible pour l'analyse : ${gender || "non spécifié"}.
Rédige un commentaire de couturier bienveillant de 2 ou 3 phrases en français avec des conseils adaptés d'après la morphologie spécifique détectée sur la photo.`;

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
