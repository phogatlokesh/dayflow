const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
const { promisify } = require('util');

const app = express();
app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'dayflow',
  password: process.env.PGPASSWORD || 'Abhishek',
  port: Number(process.env.PGPORT) || 5433,
});

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  const derivedKey = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

app.post('/api/auth/signup', async (req, res) => {
  const { employeeId, email, password, role = 'Employee' } = req.body;

  if (!employeeId || !email || !password) {
    return res.status(400).json({ message: 'Employee ID, email, and password are required.' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (employee_id, email, password_hash, role)
       VALUES ($1, LOWER($2), $3, $4)
       RETURNING employee_id, email, role`,
      [employeeId.trim(), email.trim(), passwordHash, role]
    );
    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An account with that employee ID or email already exists.' });
    }
    console.error('Signup failed:', error);
    return res.status(500).json({ message: 'Unable to create the account.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT employee_id, email, role, password_hash FROM users WHERE email = LOWER($1)',
      [email.trim()]
    );
    const user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'Incorrect email or password. Please try again.' });
    }

    return res.json({ user: { employee_id: user.employee_id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Signin failed:', error);
    return res.status(500).json({ message: 'Unable to sign in.' });
  }
});

async function startServer() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Employee',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  app.listen(process.env.PORT || 5000, () => {
    console.log('Backend server running on http://localhost:5000');
  });
}

startServer().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exitCode = 1;
});