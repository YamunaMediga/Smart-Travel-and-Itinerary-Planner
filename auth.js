const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");

const JWT_SECRET = "mysecretkey"; // later we move to .env

// REGISTER USER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check user exists
        const userCheck = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (userCheck.rows.length > 0)
            return res.status(400).json({ message: "User already exists" });

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // save user
        const newUser = await pool.query(
            "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING id,email",
            [name, email, hashedPassword]
        );

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// LOGIN USER
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0)
            return res.status(400).json({ message: "Invalid email or password" });

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword)
            return res.status(400).json({ message: "Invalid email or password" });

        // create token
        const token = jwt.sign(
            { userId: user.rows[0].id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, message: "Login successful" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
router.get("/profile", protect, (req, res) => {
    res.json({
        message: "Protected route working 🎉",
        user: req.user
    });
});