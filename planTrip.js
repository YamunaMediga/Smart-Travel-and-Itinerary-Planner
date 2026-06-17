
const express = require("express");
const axios = require("axios");
const estimateCost = require("../services/budgetEngine");

const router = express.Router();

// POST /api/plan-trip
router.post("/", async (req, res) => {
    try {
        const { lat, lon, days, budget } = req.body;

        const categories = ["tourism", "restaurant", "cafe"];

        let itinerary = [];
        let totalCost = 0;

        for (let day = 1; day <= days; day++) {
            let dayPlan = { day, places: [] };

            for (let type of categories) {
                const placesRes = await axios.get(
                    `http://localhost:3000/api/places?lat=${lat}&lon=${lon}&type=${type}`
                );

                const randomPlace = placesRes.data[Math.floor(Math.random() * placesRes.data.length)];

                const cost = estimateCost(type, budget);
                totalCost += cost;

                dayPlan.places.push({
                    type,
                    name: randomPlace.name,
                    estimatedCost: cost
                });
            }

            itinerary.push(dayPlan);
        }

        res.json({
            budgetType: budget,
            totalEstimatedCost: totalCost,
            itinerary
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Trip planning failed" });
    }
});

module.exports = router;