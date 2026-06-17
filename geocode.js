const express = require("express");
const router = express.Router();
const { getCoordinates } = require("../services/geocodeService");

// GET /geocode/Hyderabad
router.get("/:city", async (req, res) => {
    try {
        const data = await getCoordinates(req.params.city);
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Geocode API failed" });
    }
});

module.exports = router;