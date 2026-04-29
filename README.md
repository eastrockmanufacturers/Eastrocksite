# Site
# Site
# Eastrocksite
## Receive contact form submissions (local backend)

This project includes a minimal Node/Express backend that stores form submissions in a local SQLite database and sends an email notification to the address you configure (works well with Gmail App Passwords).

Quick setup:

1. Install Node.js (16+) and npm on your machine.
2. In the project folder, install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your SMTP credentials and notification email.

4. Start the server:

```bash
npm start
# or for development with automatic restarts:
npm run dev
```

5. Open your site at http://localhost:3000 and submit the contact form — the server will save the submission to `submissions.db` and attempt to email you.

Notes:
- For Gmail, create an App Password (if you have 2FA) and use it as `SMTP_PASS` in `.env`.
- The backend listens on port 3000 by default; change `PORT` in `.env` to modify.

Admin UI and testing email

- Set `ADMIN_USER` and `ADMIN_PASS` in your `.env`. Then open http://localhost:3000/admin — your browser will prompt for credentials and show recent submissions.
- To verify email delivery quickly: after starting the server, open another terminal and run:

```bash
curl -X POST http://localhost:3000/api/contact \
	-H "Content-Type: application/json" \
	-d '{"name":"Test","company":"X","phone":"+1","product-type":"Standard","quantity":"1","size":"N/A","message":"Test email"}'
```

You should receive an email at the `NOTIFY_EMAIL` address. If mail fails, check server logs for SMTP errors.


