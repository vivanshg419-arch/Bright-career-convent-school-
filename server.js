/* =========================================================
   BRIGHT CAREER CONVENT HIGHER SECONDARY SCHOOL
   BACKEND SERVER
========================================================= */

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const path = require("path");


/* =========================================================
   APP
========================================================= */

const app = express();


/* =========================================================
   SERVER SETTINGS
========================================================= */

const PORT =
    process.env.PORT || 3000;


/*
 * On Railway we will set:
 *
 * JWT_SECRET = your private secret
 *
 * For local testing, the fallback value is used.
 */

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "BRIGHT_CAREER_LOCAL_SECRET";


/*
 * Railway Volume:
 *
 * DB_PATH=/app/data/school.db
 *
 * If DB_PATH is not provided,
 * school.db will be created in the project folder.
 */

const DB_PATH =
    process.env.DB_PATH ||
    path.join(
        __dirname,
        "school.db"
    );


/* =========================================================
   DATABASE
========================================================= */

const db =
    new Database(DB_PATH);


/*
 * Improve SQLite reliability.
 */

db.pragma("journal_mode = WAL");


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors()
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


/*
 * Serve all website files from
 * the project root.
 */

app.use(
    express.static(__dirname)
);


/* =========================================================
   DATABASE TABLES
========================================================= */


/* USERS */

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER
            PRIMARY KEY AUTOINCREMENT,

        name TEXT
            NOT NULL,

        email TEXT
            UNIQUE NOT NULL,

        password TEXT
            NOT NULL,

        role TEXT
            DEFAULT 'student',

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP

    )
`).run();


/* NOTICES */

db.prepare(`
    CREATE TABLE IF NOT EXISTS notices (

        id INTEGER
            PRIMARY KEY AUTOINCREMENT,

        title TEXT
            NOT NULL,

        description TEXT
            NOT NULL,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP

    )
`).run();


/* =========================================================
   DEFAULT NOTICES
========================================================= */

const noticeCount =
    db
        .prepare(
            "SELECT COUNT(*) AS count FROM notices"
        )
        .get()
        .count;


if (noticeCount === 0) {

    const addNotice =
        db.prepare(`
            INSERT INTO notices
            (
                title,
                description
            )
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


/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

function authenticate(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    if (!authHeader) {

        return res.status(401).json({
            message:
                "Authentication required"
        });

    }


    const parts =
        authHeader.split(" ");


    const token =
        parts.length === 2
            ? parts[1]
            : null;


    if (!token) {

        return res.status(401).json({
            message:
                "Invalid token"
        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        req.user =
            decoded;


        next();

    } catch (error) {

        return res.status(401).json({
            message:
                "Invalid or expired token"
        });

    }

}


/* =========================================================
   REGISTER
========================================================= */

app.post(
    "/api/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Please fill all fields"
                });

            }


            if (
                password.length < 6
            ) {

                return res.status(400).json({
                    message:
                        "Password must contain at least 6 characters"
                });

            }


            const cleanName =
                String(name).trim();


            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            const existingUser =
                db
                    .prepare(
                        "SELECT id FROM users WHERE email = ?"
                    )
                    .get(cleanEmail);


            if (existingUser) {

                return res.status(409).json({
                    message:
                        "Email already registered"
                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            const result =
                db.prepare(`
                    INSERT INTO users
                    (
                        name,
                        email,
                        password
                    )
                    VALUES (?, ?, ?)
                `).run(
                    cleanName,
                    cleanEmail,
                    hashedPassword
                );


            return res.status(201).json({

                message:
                    "Registration successful",

                userId:
                    result.lastInsertRowid

            });

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            return res.status(500).json({
                message:
                    "Server error"
            });

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Email and password are required"
                });

            }


            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            const user =
                db
                    .prepare(
                        "SELECT * FROM users WHERE email = ?"
                    )
                    .get(cleanEmail);


            if (!user) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }


            const validPassword =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!validPassword) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }


            const token =
                jwt.sign(
                    {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    JWT_SECRET,
                    {
                        expiresIn:
                            "2h"
                    }
                );


            return res.json({

                message:
                    "Login successful",

                token,

                user: {

                    id: user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            return res.status(500).json({
                message:
                    "Server error"
            });

        }

    }
);


/* =========================================================
   CURRENT USER
========================================================= */

app.get(
    "/api/me",
    authenticate,
    (req, res) => {

        try {

            const user =
                db
                    .prepare(`
                        SELECT
                            id,
                            name,
                            email,
                            role,
                            created_at

                        FROM users

                        WHERE id = ?
                    `)
                    .get(
                        req.user.id
                    );


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });

            }


            return res.json(
                user
            );

        } catch (error) {

            console.error(
                "User lookup error:",
                error
            );


            return res.status(500).json({
                message:
                    "Server error"
            });

        }

    }
);


/* =========================================================
   PUBLIC NOTICES
========================================================= */

app.get(
    "/api/notices",
    (req, res) => {

        try {

            const notices =
                db
                    .prepare(`
                        SELECT
                            id,
                            title,
                            description,
                            created_at

                        FROM notices

                        ORDER BY
                            created_at DESC
                    `)
                    .all();


            return res.json(
                notices
            );

        } catch (error) {

            console.error(
                "Notice error:",
                error
            );


            return res.status(500).json({
                message:
                    "Unable to load notices"
            });

        }

    }
);


/* =========================================================
   STUDENT DASHBOARD
========================================================= */

app.get(
    "/api/dashboard",
    authenticate,
    (req, res) => {

        try {

            const notices =
                db
                    .prepare(`
                        SELECT
                            id,
                            title,
                            description,
                            created_at

                        FROM notices

                        ORDER BY
                            created_at DESC

                        LIMIT 5
                    `)
                    .all();


            return res.json({

                student: {

                    name:
                        req.user.name,

                    email:
                        req.user.email,

                    role:
                        req.user.role

                },

                notices

            });

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );


            return res.status(500).json({
                message:
                    "Unable to load dashboard"
            });

        }

    }
);


/* =========================================================
   CONTACT FORM
========================================================= */

app.post(
    "/api/contact",
    (req, res) => {

        try {

            const {
                name,
                email,
                message
            } = req.body;


            if (
                !name ||
                !email ||
                !message
            ) {

                return res.status(400).json({
                    message:
                        "Please fill all fields"
                });

            }


            console.log(
                "CONTACT MESSAGE"
            );


            console.log({

                name,
                email,
                message

            });


            return res.json({

                message:
                    "Your message has been received."

            });

        } catch (error) {

            console.error(
                "Contact error:",
                error
            );


            return res.status(500).json({
                message:
                    "Server error"
            });

        }

    }
);


/* =========================================================
   HTML ROUTES
========================================================= */


/*
 * Homepage
 */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/*
 * Login page
 */

app.get(
    "/login.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "login.html"
            )
        );

    }
);


/*
 * Dashboard page
 */

app.get(
    "/dashboard.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "dashboard.html"
            )
        );

    }
);


/* =========================================================
   404 API HANDLER
========================================================= */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            message:
                "API endpoint not found"
        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Database: ${DB_PATH}`
        );

    }
);
