/*
const express = require("express");
const router = express.Router();
const { generateItinerary } = require("../services/itineraryService");

router.post("/generate-itinerary", async (req, res) => {
    try {
        const itinerary = await generateItinerary(req.body);
        res.json({ itinerary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate itinerary" });
    }
});

module.exports = router;
*/