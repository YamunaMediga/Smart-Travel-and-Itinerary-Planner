/*
import axios from "axios";

const HF_TOKEN = process.env.HF_TOKEN;
const FSQ_API_KEY = process.env.FSQ_API_KEY;

// get real places
async function getPlaces(city) {
    const url = `https://api.foursquare.com/v3/places/search?near=${city}&limit=10`;

    const res = await axios.get(url, {
        headers: {
            Accept: "application/json",
            Authorization: FSQ_API_KEY,
        },
    });

    return res.data.results.map(place => place.name);
}

// call AI
async function generateAIItinerary(prompt) {
    const res = await axios.post(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
            inputs: prompt,
            parameters: { max_new_tokens: 500 }
        },
        {
            headers: { Authorization: `Bearer ${HF_TOKEN}` },
        }
    );

    return res.data[0].generated_text;
}

// MAIN FUNCTION
export async function generateItinerary(data) {
    const { destination, days, budget, interests } = data;

    const places = await getPlaces(destination);

    const prompt = `
Create a ${days}-day travel itinerary for ${destination}.
Budget: ${budget}
Interests: ${interests}

Must include these real places:
${places.join(", ")}

Return day-wise plan with food, travel tips and activities.
`;

    return await generateAIItinerary(prompt);
}
    */