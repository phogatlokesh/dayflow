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
  const { employeeId, email, password, role = 'Employee', designation = 'Software Engineer' } = req.body;

  if (!employeeId || !email || !password) {
    return res.status(400).json({ message: 'Employee ID, email, and password are required.' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (employee_id, email, password_hash, role, designation)
       VALUES ($1, LOWER($2), $3, $4, $5)
       RETURNING employee_id, email, role, designation`,
      [employeeId.trim(), email.trim(), passwordHash, role, designation]
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
  const { employeeId, email, password } = req.body;

  if (!employeeId || !email || !password) {
    return res.status(400).json({ message: 'Employee ID, email, and password are required.' });
  }

  try {
    const result = await pool.query(
      `SELECT employee_id, email, password_hash, role, designation, first_name,
          last_name, phone, address, department, manager, start_date,
          employment, salary, pay_schedule
       FROM users WHERE employee_id = $1 AND email = LOWER($2)`,
      [employeeId.trim(), email.trim()]
    );
    const user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'No employee record matches that ID and email, or the password is incorrect.' });
    }

    return res.json({
      user: { employee_id: user.employee_id, email: user.email, role: user.role },
      profile: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        employeeId: user.employee_id,
        role: user.designation,
        department: user.department,
        manager: user.manager,
        startDate: user.start_date,
        employment: user.employment,
        salary: user.salary,
        paySchedule: user.pay_schedule,
      },
    });
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
      designation VARCHAR(100) NOT NULL DEFAULT 'Software Engineer',
      first_name VARCHAR(100) NOT NULL DEFAULT 'New',
      last_name VARCHAR(100) NOT NULL DEFAULT 'Employee',
      phone VARCHAR(50) NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      department VARCHAR(100) NOT NULL DEFAULT 'Engineering',
      manager VARCHAR(100) NOT NULL DEFAULT 'HR',
      start_date VARCHAR(100) NOT NULL DEFAULT '',
      employment VARCHAR(50) NOT NULL DEFAULT 'Full-time',
      salary VARCHAR(50) NOT NULL DEFAULT '',
      pay_schedule VARCHAR(50) NOT NULL DEFAULT 'Monthly',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE users
    ADD COLUMN IF NOT EXISTS designation VARCHAR(100) NOT NULL DEFAULT 'Software Engineer',
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NOT NULL DEFAULT 'New',
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NOT NULL DEFAULT 'Employee',
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS department VARCHAR(100) NOT NULL DEFAULT 'Engineering',
    ADD COLUMN IF NOT EXISTS manager VARCHAR(100) NOT NULL DEFAULT 'HR',
    ADD COLUMN IF NOT EXISTS start_date VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS employment VARCHAR(50) NOT NULL DEFAULT 'Full-time',
    ADD COLUMN IF NOT EXISTS salary VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS pay_schedule VARCHAR(50) NOT NULL DEFAULT 'Monthly'`);
  const seedUsers = [
    ['HR-1001', 'hr@dayflow.com', 'HR12345!', 'HR', 'Priya', 'Sharma', 'HR Manager', '+1 (415) 555-0101', '84 Willow Street, San Francisco, CA 94107', 'People Operations', 'Executive Team', 'January 8, 2020', '$135,000'],
    ['DF-1048', 'alex@dayflow.com', 'Dayflow123!', 'Employee', 'Alex', 'Morgan', 'Product Designer', '+1 (415) 555-0182', '84 Willow Street, San Francisco, CA 94107', 'Design', 'Maya Patel', 'September 12, 2022', '$118,000'],
    ['DF-1049', 'sam@dayflow.com', 'Dayflow123!', 'Employee', 'Sam', 'Rivera', 'Software Engineer', '+1 (415) 555-0183', '12 Market Street, San Francisco, CA 94105', 'Engineering', 'Jordan Lee', 'March 4, 2023', '$125,000'],
    ['DF-1050', 'jamie@dayflow.com', 'Dayflow123!', 'Employee', 'Jamie', 'Chen', 'Product Manager', '+1 (415) 555-0184', '220 Pine Street, San Francisco, CA 94104', 'Product', 'Priya Sharma', 'July 17, 2021', '$130,000'],
  ];
  for (const [employeeId, email, password, role, firstName, lastName, designation, phone, address, department, manager, startDate, salary] of seedUsers) {
    const passwordHash = await hashPassword(password);
    await pool.query(
      `INSERT INTO users (employee_id, email, password_hash, role, designation, first_name, last_name, phone, address, department, manager, start_date, salary)
       VALUES ($1, LOWER($2), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT DO NOTHING`,
      [employeeId, email, passwordHash, role, designation, firstName, lastName, phone, address, department, manager, startDate, salary]
    );
  }
  const PORT = process.env.PORT || 5000;
  const HOST = '0.0.0.0'; // Listen on all network interfaces
  app.listen(PORT, HOST, () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
    console.log(`Access from this machine: http://localhost:${PORT}`);
    console.log(`Access from other machines on WiFi: http://<your-ip>:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exitCode = 1;
});