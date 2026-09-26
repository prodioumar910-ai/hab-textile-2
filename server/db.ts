import pg from 'pg';
const { Pool } = pg;
import { INITIAL_PRODUCTS } from '../src/data/initialProducts.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Yv0SQG4sktJM@ep-morning-firefly-b5ly8qkz-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function initDb() {
  console.log('[Neon PostgreSQL] Initializing database schema...');
  const client = await pool.connect();
  try {
    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'client',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        image TEXT NOT NULL,
        image2 TEXT,
        image3 TEXT,
        category VARCHAR(100) NOT NULL,
        target VARCHAR(50) NOT NULL,
        garment_type VARCHAR(50),
        fabric_type VARCHAR(50),
        description TEXT,
        is_edited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(100),
        client_quarter VARCHAR(255),
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        payment_method VARCHAR(100),
        delivery_method VARCHAR(100),
        total INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'en cours',
        date VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. Measurements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(100),
        gender VARCHAR(50),
        hauteur NUMERIC,
        epaule NUMERIC,
        cou NUMERIC,
        manche NUMERIC,
        tour_manche NUMERIC,
        longueur_boubou NUMERIC,
        longueur_pantalon NUMERIC,
        fesse NUMERIC,
        poitrine NUMERIC,
        cuisse NUMERIC,
        ceinture NUMERIC,
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(100) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Seed default admin if not exists
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', ['prodioumar910@gmail.com']);
    if (adminCheck.rows.length === 0) {
      await client.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
        ['prodioumar910@gmail.com', '12345678', 'Habé Administrateur', 'admin']
      );
      console.log('[Neon PostgreSQL] Seeded default administrator account.');
    }

    // Seed initial products if products table is empty
    const countRes = await client.query('SELECT COUNT(*) as count FROM products');
    const count = parseInt(countRes.rows[0].count, 10);
    if (count === 0 && INITIAL_PRODUCTS && INITIAL_PRODUCTS.length > 0) {
      console.log(`[Neon PostgreSQL] Seeding ${INITIAL_PRODUCTS.length} initial products in batch...`);
      // Batch insert in chunks of 20
      const chunkSize = 20;
      for (let i = 0; i < INITIAL_PRODUCTS.length; i += chunkSize) {
        const chunk = INITIAL_PRODUCTS.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map((p) =>
            client.query(
              `INSERT INTO products (id, name, price, image, image2, image3, category, target, garment_type, fabric_type, description, is_edited)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
               ON CONFLICT (id) DO NOTHING`,
              [
                p.id,
                p.name,
                p.price,
                p.image || '',
                p.image2 || null,
                p.image3 || null,
                p.category,
                p.target,
                p.garmentType || null,
                p.fabricType || null,
                p.description || null,
                p.isEdited || false
              ]
            )
          )
        );
      }
      console.log('[Neon PostgreSQL] Products successfully seeded into Neon database.');
    }

    console.log('[Neon PostgreSQL] Database schema ready and synchronized!');
  } catch (err) {
    console.error('[Neon PostgreSQL] Error during database initialization:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ==================== HELPER DB METHODS ====================

// Auth / Users
export async function findUserByEmail(email: string) {
  const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
  return res.rows[0] || null;
}

export async function createUser(email: string, passwordHash: string, fullName: string, role = 'client') {
  const res = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
    [email.trim().toLowerCase(), passwordHash, fullName.trim(), role]
  );
  return res.rows[0];
}

export async function getAllUsers() {
  const res = await pool.query('SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC');
  return res.rows;
}

export async function deleteUser(id: number) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

// Products
export async function getAllProducts() {
  const res = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  return res.rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: r.price,
    image: r.image,
    image2: r.image2,
    image3: r.image3,
    category: r.category,
    target: r.target,
    garmentType: r.garment_type,
    fabricType: r.fabric_type,
    description: r.description,
    isEdited: r.is_edited
  }));
}

export async function createOrUpdateProduct(product: any) {
  const res = await pool.query(
    `INSERT INTO products (id, name, price, image, image2, image3, category, target, garment_type, fabric_type, description, is_edited)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       price = EXCLUDED.price,
       image = EXCLUDED.image,
       image2 = EXCLUDED.image2,
       image3 = EXCLUDED.image3,
       category = EXCLUDED.category,
       target = EXCLUDED.target,
       garment_type = EXCLUDED.garment_type,
       fabric_type = EXCLUDED.fabric_type,
       description = EXCLUDED.description,
       is_edited = EXCLUDED.is_edited
     RETURNING *`,
    [
      product.id,
      product.name,
      product.price,
      product.image || '',
      product.image2 || null,
      product.image3 || null,
      product.category,
      product.target,
      product.garmentType || null,
      product.fabricType || null,
      product.description || null,
      product.isEdited || true
    ]
  );
  return res.rows[0];
}

export async function deleteProduct(id: string) {
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
}

// Orders
export async function getAllOrders() {
  const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return res.rows.map((r) => ({
    id: r.id,
    clientName: r.client_name,
    clientPhone: r.client_phone,
    clientQuarter: r.client_quarter,
    items: r.items,
    paymentMethod: r.payment_method,
    deliveryMethod: r.delivery_method,
    total: r.total,
    status: r.status,
    date: r.date,
    createdAt: r.created_at
  }));
}

export async function createOrder(order: any) {
  const res = await pool.query(
    `INSERT INTO orders (id, client_name, client_phone, client_quarter, items, payment_method, delivery_method, total, status, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      order.id,
      order.clientName,
      order.clientPhone || null,
      order.clientQuarter || null,
      JSON.stringify(order.items || []),
      order.paymentMethod || null,
      order.deliveryMethod || null,
      order.total,
      order.status || 'en cours',
      order.date || new Date().toLocaleDateString('fr-FR')
    ]
  );
  return res.rows[0];
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
  return res.rows[0];
}

export async function deleteOrder(id: string) {
  await pool.query('DELETE FROM orders WHERE id = $1', [id]);
}

// Measurements
export async function getAllMeasurements(userEmail?: string) {
  let query = 'SELECT * FROM measurements';
  const params: any[] = [];
  if (userEmail) {
    query += ' WHERE LOWER(user_email) = LOWER($1)';
    params.push(userEmail);
  }
  query += ' ORDER BY created_at DESC';
  const res = await pool.query(query, params);
  return res.rows;
}

export async function saveMeasurement(m: any) {
  const res = await pool.query(
    `INSERT INTO measurements (
      user_email, customer_name, customer_phone, gender,
      hauteur, epaule, cou, manche, tour_manche,
      longueur_boubou, longueur_pantalon, fesse, poitrine, cuisse, ceinture, comment
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      m.userEmail || null,
      m.customerName || null,
      m.customerPhone || null,
      m.gender || 'homme',
      m.hauteur || null,
      m.epaule,
      m.cou,
      m.manche,
      m.tour_manche,
      m.longueur_boubou,
      m.longueur_pantalon,
      m.fesse,
      m.poitrine,
      m.cuisse,
      m.ceinture,
      m.comment || ''
    ]
  );
  return res.rows[0];
}

// Reviews
export async function getReviewsByProduct(productId: string) {
  const res = await pool.query('SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC', [productId]);
  return res.rows;
}

export async function createReview(review: any) {
  const res = await pool.query(
    'INSERT INTO reviews (product_id, author_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
    [review.productId, review.authorName, review.rating, review.comment]
  );
  return res.rows[0];
}

