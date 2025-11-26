const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // HTML/CSS/JS/Images

// --- DATABASE ---
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) return console.error(err.message);
    console.log("Connected to SQLite database users.db");
});

// --- CREATE TABLES ---
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        emotions TEXT,
        text TEXT,
        date TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )
`);

// --- AUTH ROUTES ---

// Register
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing data" });
    }

    const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    stmt.run(name, email, password, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true, userId: this.lastID });
    });
    stmt.finalize();
});

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing data" });
    }

    db.get("SELECT * FROM users WHERE email=? AND password=?", [email, password], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid email or password" });

        res.json({ success: true, user: row });
    });
});

// --- JOURNAL ENTRIES ROUTES ---

// Add entry
app.post("/add-entry", (req, res) => {
    const { userId, emotions, text, date } = req.body;

    if (!userId || !emotions || !text) {
        return res.status(400).json({ error: "Missing data" });
    }

    const stmt = db.prepare(`
        INSERT INTO entries (userId, emotions, text, date)
        VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, JSON.stringify(emotions), text, date || new Date().toISOString(), function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true, entryId: this.lastID });
    });

    stmt.finalize();
});

// Get all entries for a user
app.get("/entries", (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    db.all("SELECT * FROM entries WHERE userId=?", [userId], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });

        const parsed = rows.map(r => ({
            id: r.id,
            userId: r.userId,
            emotions: JSON.parse(r.emotions),
            text: r.text,
            date: r.date
        }));

        res.json(parsed);
    });
});

// --- START SERVER ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
