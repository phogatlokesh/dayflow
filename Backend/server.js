require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
const { promisify } = require('util');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ user: process.env.PGUSER || 'postgres', host: process.env.PGHOST || 'localhost', database: process.env.PGDATABASE || 'dayflow', password: process.env.PGPASSWORD || 'Abhishek', port: Number(process.env.PGPORT) || 5433 });
const scrypt = promisify(crypto.scrypt);
const otpLifetimeMinutes = 10;

async function hashValue(value) { const salt = crypto.randomBytes(16).toString('hex'); const key = await scrypt(value, salt, 64); return `${salt}:${key.toString('hex')}`; }
async function verifyValue(value, hash) { const [salt, key] = hash.split(':'); const derived = await scrypt(value, salt, 64); return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derived); }
function requireConfig(...keys) { return keys.every((key) => process.env[key]); }
function createToken(user) { const secret = process.env.AUTH_TOKEN_SECRET; if (!secret) throw new Error('AUTH_TOKEN_SECRET is not configured.'); const payload = Buffer.from(JSON.stringify({ sub: user.employee_id, email: user.email, role: user.role, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url'); const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url'); return `${payload}.${signature}`; }
function authenticate(requiredRoles = []) { return (req, res, next) => { try { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ message: 'Sign in is required.' }); const [payload, signature] = token.split('.'); const expected = crypto.createHmac('sha256', process.env.AUTH_TOKEN_SECRET || '').update(payload).digest('base64url'); if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ message: 'Invalid session.' }); const user = JSON.parse(Buffer.from(payload, 'base64url').toString()); if (user.exp < Date.now()) return res.status(401).json({ message: 'Your session has expired. Please sign in again.' }); if (requiredRoles.length && !requiredRoles.includes(user.role)) return res.status(403).json({ message: 'You do not have permission for this action.' }); req.user = user; next(); } catch { return res.status(401).json({ message: 'Invalid session.' }); } }; }
async function sendOtp(email, code) { if (!requireConfig('SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM')) throw new Error('Email verification is not configured. Add SMTP settings to Backend/.env.'); const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } }); await transport.sendMail({ from: process.env.SMTP_FROM, to: email, subject: 'Your Dayflow verification code', text: `Your Dayflow verification code is ${code}. It expires in ${otpLifetimeMinutes} minutes. Do not share this code.` }); }

app.post('/api/auth/signup/request', async (req, res) => {
  const { employeeId, email, password, designation = '' } = req.body;
  if (!employeeId || !email || !password) return res.status(400).json({ message: 'Employee ID, personal email, and password are required.' });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT 1 FROM users WHERE employee_id = $1 OR email = $2 UNION ALL SELECT 1 FROM pending_signups WHERE employee_id = $1 OR email = $2', [employeeId.trim(), normalizedEmail]);
    if (existing.rowCount) return res.status(409).json({ message: 'An account or verification request already exists for this employee ID or email.' });
    const code = crypto.randomInt(100000, 1000000).toString();
    await sendOtp(normalizedEmail, code);
    await pool.query('INSERT INTO pending_signups (employee_id, email, password_hash, designation, otp_hash, otp_expires_at) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL \'10 minutes\')', [employeeId.trim(), normalizedEmail, await hashValue(password), designation, await hashValue(code)]);
    return res.status(201).json({ message: 'A verification code has been sent to your email.' });
  } catch (error) { console.error('Signup request failed:', error); return res.status(500).json({ message: error.message === 'Email verification is not configured. Add SMTP settings to Backend/.env.' ? error.message : 'Unable to send a verification code.' }); }
});

app.post('/api/auth/signup/verify', async (req, res) => {
  const { email, code } = req.body;
  try {
    const pending = await pool.query('SELECT * FROM pending_signups WHERE email = $1', [email?.trim().toLowerCase()]);
    const request = pending.rows[0];
    if (!request || request.otp_expires_at < new Date()) return res.status(400).json({ message: 'This verification code has expired. Start sign-up again.' });
    if (!(await verifyValue(code || '', request.otp_hash))) return res.status(400).json({ message: 'That verification code is incorrect.' });
    await pool.query('INSERT INTO users (employee_id, email, password_hash, role, approval_status) VALUES ($1, $2, $3, $4, $5)', [request.employee_id, request.email, request.password_hash, 'Employee', 'pending']);
    await pool.query('DELETE FROM pending_signups WHERE id = $1', [request.id]);
    return res.json({ message: 'Email verified. Your details have been sent to HR for approval.' });
  } catch (error) { console.error('OTP verification failed:', error); return res.status(500).json({ message: 'Unable to verify your code.' }); }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  try {
    const result = await pool.query('SELECT employee_id, email, role, password_hash, approval_status FROM users WHERE email = LOWER($1)', [email.trim()]);
    const user = result.rows[0];
    if (!user || !(await verifyValue(password, user.password_hash))) return res.status(401).json({ message: 'Incorrect email or password. Please try again.' });
    if (user.approval_status === 'pending') return res.status(403).json({ message: 'Your email is verified and your account is awaiting HR approval.' });
    if (user.approval_status === 'rejected') return res.status(403).json({ message: 'Your account request was not approved. Contact HR for help.' });
    return res.json({ user: { employee_id: user.employee_id, email: user.email, role: user.role }, token: createToken(user) });
  } catch (error) { console.error('Signin failed:', error); return res.status(500).json({ message: error.message || 'Unable to sign in.' }); }
});

app.get('/api/admin/pending-users', authenticate(['HR', 'Admin']), async (_req, res) => { const result = await pool.query("SELECT employee_id, email, created_at FROM users WHERE approval_status = 'pending' ORDER BY created_at ASC"); res.json({ users: result.rows }); });
app.patch('/api/admin/pending-users/:employeeId', authenticate(['HR', 'Admin']), async (req, res) => { const status = req.body.status === 'approved' ? 'approved' : req.body.status === 'rejected' ? 'rejected' : null; if (!status) return res.status(400).json({ message: 'Use approved or rejected.' }); const result = await pool.query('UPDATE users SET approval_status = $1 WHERE employee_id = $2 AND approval_status = $3 RETURNING employee_id, email, approval_status', [status, req.params.employeeId, 'pending']); if (!result.rowCount) return res.status(404).json({ message: 'Pending employee not found.' }); res.json({ user: result.rows[0] }); });

async function startServer() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, employee_id VARCHAR(100) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password_hash TEXT NOT NULL, role VARCHAR(50) NOT NULL DEFAULT 'Employee', approval_status VARCHAR(20) NOT NULL DEFAULT 'approved', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'");
  await pool.query(`CREATE TABLE IF NOT EXISTS pending_signups (id SERIAL PRIMARY KEY, employee_id VARCHAR(100) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password_hash TEXT NOT NULL, designation VARCHAR(100), otp_hash TEXT NOT NULL, otp_expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  const PORT = process.env.PORT || 5000; app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on http://localhost:${PORT}`));
}
startServer().catch((error) => { console.error('Database initialization failed:', error.message); process.exitCode = 1; });
