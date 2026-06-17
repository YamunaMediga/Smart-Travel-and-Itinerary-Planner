// show profile if user already logged in
function showProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  document.getElementById("authButtons").style.display = "none";
  document.getElementById("profileSection").style.display = "block";

  document.getElementById("profileName").innerText =
    localStorage.getItem("username");
  document.getElementById("profileEmail").innerText =
    localStorage.getItem("email");
}

window.onload = showProfile;


// dropdown toggle
document.addEventListener("click", function (e) {
  const profileSection = document.getElementById("profileSection");
  const dropdown = document.getElementById("profileDropdown");

  if (!profileSection) return;

  if (profileSection.contains(e.target)) {
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  } else {
    dropdown.style.display = "none";
  }
});


// logout
function logoutUser() {
  localStorage.clear();
  window.location.href = "index.html";
}

async function generatePlan() {
  const destination = document.getElementById("destination").value;
  const days = document.getElementById("days").value;
  const resultDiv = document.getElementById("result");

  if (!destination || !days) {
    alert("Please enter destination and days");
    return;
  }

  resultDiv.style.display = "block";
  resultDiv.innerHTML = "⏳ Generating your smart itinerary...";

  try {
    const response = await fetch("http://localhost:5000/api/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destination: destination,
        days: Number(days)
      })
    });

    // 🔴 THIS SHOWS REAL ERROR FROM SERVER
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();

    showItinerary(data);

  } catch (error) {
    console.error("FRONTEND ERROR:", error);
    resultDiv.innerHTML = "❌ Failed to generate itinerary. Check backend terminal.";
  }
}
console.log("SERVER RESPONSE:", data);
function showItinerary(data) {
  const resultDiv = document.getElementById("result");

  // If backend sends text itinerary (OpenAI)
  if (typeof data.itinerary === "string") {
    resultDiv.innerHTML = `
      <h2>📍 Trip to ${data.destination}</h2>
      <pre style="white-space:pre-wrap">${data.itinerary}</pre>
    `;
    return;
  }

  // If backend sends structured itinerary (future)
  let html = `<h2>📍 Trip to ${data.destination}</h2>`;

  data.itinerary.forEach(day => {
    html += `
      <div class="day-card">
        <h4>Day ${day.day}</h4>
        🌅 Morning: ${day.morning} <br>
        🏞 Afternoon: ${day.afternoon} <br>
        🍽 Evening: ${day.evening}
      </div>
    `;
  });

  resultDiv.innerHTML = html;
}