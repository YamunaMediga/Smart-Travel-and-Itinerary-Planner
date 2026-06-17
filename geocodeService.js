
const axios = require("axios");

exports.getCoordinates = async (city) => {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${process.env.OPENCAGE_KEY}`;

    const res = await axios.get(url);
    const data = res.data.results[0];

    return {
        lat: data.geometry.lat,
        lon: data.geometry.lng,
        city: data.components.city || city,
        state: data.components.state,
        country: data.components.country
    };
};