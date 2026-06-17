const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { lat, lon, type } = req.query;

        let filter = "";

        // ⭐ CATEGORY MAPPING (IMPORTANT)
        if (type === "restaurant") {
            filter = `node["amenity"="restaurant"](around:3000,${lat},${lon});`;
        }

        else if (type === "hotel") {
            filter = `
        node["tourism"="hotel"](around:3000,${lat},${lon});
        node["tourism"="guest_house"](around:3000,${lat},${lon});
        node["tourism"="hostel"](around:3000,${lat},${lon});
      `;
        }

        else if (type === "tourism") {
            filter = `
    node["tourism"~"attraction|museum|zoo|theme_park"](around:5000,${lat},${lon});
    way["tourism"~"attraction|museum|zoo|theme_park"](around:5000,${lat},${lon});
    relation["tourism"~"attraction|museum|zoo|theme_park"](around:5000,${lat},${lon});

    node["leisure"="park"](around:5000,${lat},${lon});
    way["leisure"="park"](around:5000,${lat},${lon});
    relation["leisure"="park"](around:5000,${lat},${lon});
  `;
        }

        else if (type === "cafe") {
            filter = `node["amenity"="cafe"](around:3000,${lat},${lon});`;
        }

        const overpassQuery = `
      [out:json];
      (
        ${filter}
      );
      out;
    `;

        const response = await axios.post(
            "https://overpass-api.de/api/interpreter",
            overpassQuery,
            { headers: { "Content-Type": "text/plain" } }
        );

        const places = response.data.elements
            .filter(place => place.tags && place.tags.name)
            .map(place => ({
                name: place.tags.name,
                lat: place.lat || place.center?.lat,
                lon: place.lon || place.center?.lon,
                category: type
            }));

        res.json(places);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "OSM Places failed" });
    }
});

module.exports = router;