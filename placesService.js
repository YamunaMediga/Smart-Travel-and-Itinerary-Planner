const axios = require("axios");

exports.getTouristPlaces = async (lat, lon) => {
    const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&categories=16000&limit=20`;

    const res = await axios.get(url, {
        headers: {
            Authorization: process.env.FOURSQUARE_KEY,
            Accept: "application/json"
        }
    });

    return res.data.results.map(place => ({
        name: place.name,
        address: place.location.formatted_address,
        lat: place.geocodes.main.latitude,
        lon: place.geocodes.main.longitude,
        category: place.categories?.[0]?.name || "Attraction"
    }));
};