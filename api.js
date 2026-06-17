const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CONTACT FORM API
router.post("/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        await pool.query(
            "INSERT INTO contacts(name,email,subject,message) VALUES($1,$2,$3,$4)",
            [name, email, subject, message]
        );

        res.json({ message: "Message saved successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ADD REVIEW API
router.post("/review", async (req, res) => {
    try {
        const { name, review, rating } = req.body;

        await pool.query(
            "INSERT INTO reviews(name,review,rating) VALUES($1,$2,$3)",
            [name, review, rating]
        );

        res.json({ message: "Review added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET ALL REVIEWS
router.get("/reviews", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM reviews ORDER BY id DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;