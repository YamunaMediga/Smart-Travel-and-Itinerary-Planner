# Smart Travel and Itinerary Planner

## Overview
Smart Travel and Itinerary Planner is a web-based application that helps users plan trips efficiently by generating personalized travel itineraries, managing travel details, and providing destination recommendations.

The application simplifies travel planning by organizing trip information in one place and helping users create structured travel schedules.

---

## Features

- User-friendly travel planning interface
- Personalized itinerary generation
- Destination recommendations
- Trip management and organization
- Responsive web design
- Secure backend implementation
- Easy navigation and trip customization

---

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Additional Components
- Middleware
- Routing
- Service Layer Architecture
- Environment Configuration

---

## Project Structure

```text
Smart-Travel-and-Itinerary-Planner/
│
├── frontend/
│   │
│   ├── outfit-images/
│   ├── videos/
│   │
│   ├── about.html
│   ├── contact.html
│   ├── create-plan.html
│   ├── gallery.html
│   ├── index.html
│   ├── itinerary.html
│   ├── login.html
│   ├── reviews.html
│   ├── signup.html
│   ├── travel-details.html
│   │
│   ├── script.js
│   ├── style.css
│   └── passwords.txt
│
├── travelmate-backend/
│   │
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   │
│   ├── db.js
│   ├── server.js
│   ├── itinerary.html
│   ├── mytrips.html
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── package.json
├── package-lock.json
```

## Architecture

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database Connectivity: PostgreSQL
- API Routing: Express Routes
- Middleware: Authentication and Request Handling
- Services: Business Logic Layer

## Installation

### Clone the Repository

```bash
git clone https://github.com/YamunaMediga/Smart-Travel-and-Itinerary-Planner.git
```

### Navigate to Project Directory

```bash
cd Smart-Travel-and-Itinerary-Planner
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory and add the required configuration values.

Example:

```env
PORT=3000
```

---

## Running the Application

Start the server:

```bash
npm start
```

or

```bash
node server.js
```

The application will be available at:

```text
http://localhost:3000
```

---

## Future Enhancements

- AI-based itinerary recommendations
- Weather integration
- Hotel booking integration
- Flight information integration
- Budget planning module
- Interactive maps and route optimization

---

## Author

Yamuna Mediga
