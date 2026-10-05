const express = require("express");

const cors = require("cors");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const Database = require("better-sqlite3");

const path = require("path");

const app = express(); 

const PORT = process.env.PORT || 3000;
const JWT_SECRET = "BRIGHT_CAREER_CHANGE_THIS_SECRET";

const db = new Database("school.db");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

/* =========================
   DATABASE
========================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

/* =========================
   DEFAULT NOTICES
========================= */

const noticeCount = db
    .prepare("SELECT COUNT(*) AS count FROM notices")
    .get().count;

if (noticeCount === 0) {
    const addNotice = db.prepare(`
        INSERT INTO notices (title, description)
        VALUES (?, ?)
    `);

    addNotice.run(
        "Welcome to Bright Career Convent",
        "Welcome to the official school portal of Bright Career Convent Higher Secondary School."
    );

    addNotice.run(
        "Admissions Open",
        "Admissions are open for selected classes. Please contact the school office for details."
    );

    addNotice.run(
        "Annual Function",
        "Students and parents are invited to participate in the upcoming annual function."
    );
}

/* =========================
   AUTH MIDDLEWARE
========================= */

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

/* =========================
   REGISTER
========================= */

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const existingUser = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `).run(
            name,
            email,
            hashedPassword
        );

        res.status(201).json({
            message: "Registration successful",
            userId: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = db
            .prepare("SELECT * FROM users WHERE email = ?")
            .get(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

/* =========================
   CURRENT USER
========================= */

app.get("/api/me", authenticate, (req, res) => {
    const user = db
        .prepare(`
            SELECT id, name, email, role, created_at
            FROM users
            WHERE id = ?
        `)
        .get(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json(user);
});

/* =========================
   NOTICES
========================= */

app.get("/api/notices", (req, res) => {
    const notices = db.prepare(`
        SELECT *
        FROM notices
        ORDER BY created_at DESC
    `).all();

    res.json(notices);
});

/* =========================
   PROTECTED DASHBOARD DATA
========================= */

app.get("/api/dashboard", authenticate, (req, res) => {
    const notices = db.prepare(`
        SELECT *
        FROM notices
        ORDER BY created_at DESC
        LIMIT 5
    `).all();

    res.json({
        student: {
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        },
        notices
    });
});

/* =========================
   CONTACT
========================= */

app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            message: "Please fill all fields"
        });
    }

    console.log("CONTACT MESSAGE");
    console.log({
        name,
        email,
        message
    });

    res.json({
        message: "Your message has been received."
    });
});

/* =========================
   SPA FALLBACK
========================= */

app.get("/{*splat}", (req, res) => {

   res.sendFile(
    path.join(__dirname, "index.html")
);

});
/* =========================
   START SERVER
========================= */



app.listen(PORT, "0.0.0.0", () => {
   console.log(`Server running on port ${PORT}`);
});
