/* Minimal Express server to accept contact form submissions,
   store them in a SQLite database, and email them via SMTP (Gmail).

   Setup:
   - Create a .env file based on .env.example with your SMTP and recipient settings.
   - Run: npm install
   - Start: npm start
*/

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (optional)
app.use(express.static(path.join(__dirname, '/')));

// Setup SQLite DB
const db = new sqlite3.Database(path.join(__dirname, 'submissions.db'));
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      company TEXT,
      phone TEXT,
      product_type TEXT,
      quantity TEXT,
      size TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

// Setup mail transporter
let transporter;
async function createTransporter() {
  if (transporter) return transporter;
  // Use SMTP credentials from env. For Gmail, create an App Password and use smtp.gmail.com
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  // verify
  try {
    await transporter.verify();
    console.log('SMTP connection OK');
  } catch (err) {
    console.warn('Warning: SMTP verification failed', err && err.message);
  }
  return transporter;
}

app.post('/api/contact', async (req, res) => {
  const payload = {
    name: req.body.name || '',
    company: req.body.company || '',
    phone: req.body.phone || '',
    product_type: req.body['product-type'] || req.body.product_type || '',
    quantity: req.body.quantity || '',
    size: req.body.size || '',
    message: req.body.message || '',
  };

  // insert into DB
  const stmt = db.prepare(
    `INSERT INTO submissions (name, company, phone, product_type, quantity, size, message) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  stmt.run(
    payload.name,
    payload.company,
    payload.phone,
    payload.product_type,
    payload.quantity,
    payload.size,
    payload.message,
    function (err) {
      if (err) {
        console.error('DB insert error', err);
        return res.status(500).json({ ok: false, error: 'db_error' });
      }

      // send email notification
      (async () => {
        try {
          const mailer = await createTransporter();
          const html = `
            <p>New inquiry submitted:</p>
            <ul>
              <li><strong>Name:</strong> ${escapeHtml(payload.name)}</li>
              <li><strong>Company:</strong> ${escapeHtml(payload.company)}</li>
              <li><strong>Phone:</strong> ${escapeHtml(payload.phone)}</li>
              <li><strong>Product Type:</strong> ${escapeHtml(payload.product_type)}</li>
              <li><strong>Quantity:</strong> ${escapeHtml(payload.quantity)}</li>
              <li><strong>Size:</strong> ${escapeHtml(payload.size)}</li>
              <li><strong>Message:</strong> ${escapeHtml(payload.message)}</li>
            </ul>
          `;
          await mailer.sendMail({
            from: process.env.FROM_ADDRESS || process.env.SMTP_USER,
            to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
            subject: `Website Inquiry: ${payload.name || 'New Lead'}`,
            html,
          });
        } catch (err) {
          console.warn('Email send failed:', err && err.message);
        }
      })();

      res.json({ ok: true, id: this.lastID });
    }
  );
  stmt.finalize();
});

// Basic health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Simple Basic Auth middleware for admin endpoints
function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  const adminUser = process.env.ADMIN_USER || '';
  const adminPass = process.env.ADMIN_PASS || '';
  if (!adminUser || !adminPass) return res.status(403).json({ error: 'admin_not_configured' });
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required');
  }
  const buf = Buffer.from(auth.split(' ')[1], 'base64');
  const [user, pass] = buf.toString().split(':');
  if (user === adminUser && pass === adminPass) return next();
  res.set('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).send('Invalid credentials');
}

// Admin API: list submissions (protected)
app.get('/api/submissions', basicAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 200;
  db.all(`SELECT id, name, company, phone, product_type, quantity, size, message, created_at FROM submissions ORDER BY created_at DESC LIMIT ?`, [limit], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: 'db_error' });
    res.json({ ok: true, rows });
  });
});

// Serve admin UI (simple static page)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Utility
function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
