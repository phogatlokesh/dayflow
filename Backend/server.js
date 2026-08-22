const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dayflow', 
  password: 'Abhishek',
  port: 5433, 
});

app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Connected to PostgreSQL successfully at:', res.rows[0].now);
  }
});