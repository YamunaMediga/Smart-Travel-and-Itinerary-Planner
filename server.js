import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

import { GoogleGenAI } from "@google/genai";
// ⭐ COHERE

import { CohereClient } from "cohere-ai";
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

// ⭐ OpenAI SDK (used for Mistral + OpenRouter)
import OpenAI from "openai";

const mistral = new OpenAI({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: "https://api.mistral.ai/v1"
});

const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});
dotenv.config({ path: "./.env" });
import pg from "pg";
const { Pool } = pg;
const pool = new Pool({
    user: String(process.env.DB_USER),
    password: String(process.env.DB_PASSWORD),
    host: String(process.env.DB_HOST),
    port: Number(process.env.DB_PORT),
    database: String(process.env.DB_NAME),
});
console.log("ENV CHECK:");
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD);
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_NAME =", process.env.DB_NAME);
const app = express();
app.use(express.static("public")); // ⭐ ADD THIS
// test route
app.get("/", (req, res) => {
    res.send("TravelMate API running with HuggingFace 🚀");
});




// middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// =====================================================
// 🔐 AUTH ROUTES
// =====================================================

// ⭐ SIGNUP ROUTE
app.post("/signup", async (req, res) => {
    try {
        console.log("Signup request:", req.body);

        const { name, email, password } = req.body;

        // check if email already exists
        const userCheck = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert new user
        const result = await pool.query(
            "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *",
            [name, email, hashedPassword]
        );

        const newUser = result.rows[0];

        // create JWT
        const token = jwt.sign(
            { id: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Signup successful 🎉",
            token,
            user: {
                id: newUser.id,
                username: newUser.name,
                email: newUser.email
            }
        });

    } catch (err) {
        console.log("Signup ERROR 👉", err.message);
        res.status(500).json({ error: "Database error during signup" });
    }
});

// ⭐ LOGIN ROUTE
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in database
        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Login ERROR 👉", err.message);
        res.status(500).json({ error: "Server error" });
    }
});



// 📩 CONTACT US ROUTE
// =====================================================
app.post("/api/contact", async (req, res) => {
    try {
        console.log("Incoming Contact:", req.body);

        const { name, email, subject, message } = req.body;

        const result = await pool.query(
            "INSERT INTO contacts(name,email,subject,message) VALUES($1,$2,$3,$4) RETURNING *",
            [name, email, subject, message]
        );

        res.json({ success: true, contact: result.rows[0] });
    } catch (err) {
        console.log("Contact ERROR 👉", err.message);
        res.status(500).json({ error: "Failed to send message" });
    }
});

// =====================================================
// ⭐ REVIEWS ROUTES
// =====================================================
app.post("/api/reviews", async (req, res) => {
    try {
        console.log("Incoming Review:", req.body);

        const { name, comment, rating } = req.body;

        const result = await pool.query(
            "INSERT INTO reviews(name,review,rating) VALUES($1,$2,$3) RETURNING *",
            [name, comment, rating]
        );

        res.json({ success: true, review: result.rows[0] });
    } catch (err) {
        console.log("DB ERROR 👉", err.message);
        res.status(500).json({ error: "Database error while adding review" });
    }
});





// 🌄 Get destination images
app.get("/api/photos/:city", async (req, res) => {
    try {
        const city = req.params.city;

        const response = await axios.get(
            "https://api.unsplash.com/search/photos",
            {
                params: {
                    query: city,
                    per_page: 6,
                },
                headers: {
                    Authorization: `Client-ID ${process.env.UNSPLASH_KEY}`,
                },
            }
        );

        const images = response.data.results.map(img => ({
            url: img.urls.regular + "&auto=format&fit=crop&w=800&q=80",
            alt: img.alt_description
        }));

        res.json({
            success: true,
            images
        });

    } catch (err) {
        console.log("UNSPLASH ERROR:", err.response?.data || err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Initialize the API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function callGeminiWithRetry(prompt) {
    let delay = 2000;

    for (let i = 1; i <= 5; i++) {
        try {
            console.log("Gemini attempt:", i);
            return await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "text/plain" }
            });
        } catch (err) {
            if (err.status === 503 || err.status === 429) {
                console.log("Gemini busy… retrying");
                await sleep(delay);
                delay *= 2;
            } else {
                throw err;
            }
        }
    }

    throw new Error("Gemini unavailable");
}


// ================================
// 🤖 COHERE API CALL (FREE)
// ================================
async function callCohere(prompt) {
    try {
        console.log("Calling Cohere...");

        const response = await cohere.chat({
            model: "command-r",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        });

        return response.message.content[0].text;

    } catch (err) {
        console.log("Cohere Error 👉", err.message);
        throw new Error("Cohere failed");
    }
}

async function callMistral(prompt) {
    console.log("Calling Mistral fallback...");

    const chat = await mistral.chat.completions.create({
        model: "mistral-small",
        messages: [{ role: "user", content: prompt }],
    });

    return chat.choices[0].message.content;
}
async function callOpenRouter(prompt) {
    console.log("Calling OpenRouter FINAL fallback...");

    const chat = await openrouter.chat.completions.create({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }],
    });

    return chat.choices[0].message.content;
}

// Extract JSON even if Gemini adds extra text/markdown
function extractJSON(text) {
    if (!text) return null;

    text = text.replace(/```json/g, "").replace(/```/g, "");

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    return text.substring(start, end + 1);
}

app.post("/generate-itinerary", async (req, res) => {
    try {
        const { start_location, destination, days, budget, transport, people } = req.body;

        const prompt = `
You are a smart travel planner AI.

Create a detailed day-wise travel itinerary.

TRIP DETAILS:
Starting City: ${start_location}
Destination: ${destination}
Trip Duration: ${days} days
Total Budget: ₹${budget}
Number of Travellers: ${people}
Transport Mode Selected By User: ${transport}

🚨 VERY IMPORTANT RULES:
1. The journey from ${start_location} to ${destination} MUST be by ${transport}.
2. DO NOT suggest flight if transport is train/bus/car.
3. Day 1 MUST start with the travel journey using ${transport}.
4. Include realistic travel cost for ${transport} and deduct from total budget.
5. Plan hotels and activities within remaining budget.
6. Return ONLY valid JSON in this format:

{
  "totalBudget": number,
  "dailyBudget": number,
  "days": [
    {
      "day": 1,
      "hotel": {
        "name": "",
        "pricePerNight": number,
        "reason": ""
      },
      "estimatedDailyCost": number,
      "remainingBudget": number,
      "morning": [{ "name": "", "description": "" }],
      "afternoon": [{ "name": "", "description": "" }],
      "evening": [{ "name": "", "description": "" }]
    }
  ]
}
`;

        let rawText = null;

        // 1️⃣ TRY GEMINI
        try {
            console.log("Trying Gemini...");
            const response = await callGeminiWithRetry(prompt);
            rawText = response.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log("Gemini success ✅");
        } catch (err) {
            console.log("Gemini failed ❌");
        }

        // 2️⃣ TRY COHERE
        if (!rawText) {
            try {
                rawText = await callCohere(prompt);
                console.log("Cohere success ✅");
            } catch (err) {
                console.log("Cohere failed ❌");
            }
        }

        // 3️⃣ TRY MISTRAL
        if (!rawText) {
            try {
                rawText = await callMistral(prompt);
                console.log("Mistral success ✅");
            } catch (err) {
                console.log("Mistral failed ❌");
            }
        }

        // 4️⃣ FINAL FALLBACK OPENROUTER
        if (!rawText) {
            try {
                rawText = await callOpenRouter(prompt);
                console.log("OpenRouter success ✅");
            } catch (err) {
                console.log("OpenRouter failed ❌");
            }
        }

        if (!rawText) {
            return res.status(500).json({
                error: "All AI providers failed"
            });
        }

        console.log("AI RAW:", rawText);

        console.log("RAW GEMINI:", rawText);
        const cleanJSON = extractJSON(rawText);

        if (!cleanJSON) {
            return res.status(500).json({
                error: "AI did not return JSON",
                raw: rawText
            });
        }

        let itinerary;

        try {
            itinerary = JSON.parse(cleanJSON);
        } catch (err) {
            console.log("JSON parse failed");
            return res.status(500).json({
                error: "AI returned non JSON",
                raw: rawText
            });
        }

        // Safety validation
        if (!itinerary.days || !Array.isArray(itinerary.days)) {
            // Validate hotel existence
            for (const day of itinerary.days) {
                if (!day.hotel || !day.hotel.name) {
                    return res.status(500).json({
                        error: "AI did not include hotel suggestions",
                        raw: itinerary
                    });
                }
            }
            if (!itinerary.totalBudget || !itinerary.dailyBudget) {
                return res.status(500).json({
                    error: "Budget planning missing",
                    raw: itinerary
                });
            }
            return res.status(500).json({
                error: "AI did not return itinerary properly",
                raw: itinerary
            });
        }

        res.json(itinerary);

    } catch (err) {
        console.error("Gemini Error 👉", err);
        res.status(500).json({
            error: "Gemini failed",
            details: err.message
        });
    }
});
// ===============================
// 💾 SAVE TRIP + ITINERARY
// ===============================
app.post("/save-trip", async (req, res) => {
    try {
        const {
            userId,
            tripName,
            start_location,
            destination,
            days,
            budget,
            transport,
            itinerary
        } = req.body;

        // 1️⃣ Insert into TRIPS table
        const tripResult = await pool.query(
            `INSERT INTO trips 
      (user_id, trip_name, start_location, destination, days, budget, transport)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id`,
            [userId, tripName, start_location, destination, days, budget, transport]
        );

        const tripId = tripResult.rows[0].id;

        // 2️⃣ Insert into ITINERARY table
        await pool.query(
            `INSERT INTO itineraries (trip_id, itinerary_data)
       VALUES ($1,$2)`,
            [tripId, itinerary]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("SAVE ERROR:", err);
        res.status(500).json({ success: false });
    }
});
// ===============================
// 📂 GET USER TRIPS
// ===============================
app.get("/get-trips/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const trips = await pool.query(
            "SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        res.json({
            success: true,
            trips: trips.rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
});
// =====================================================
// 🚀 START SERVER
// =====================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));