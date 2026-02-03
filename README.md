**AllInOne: Your Unified Service Platform**

AllInOne is a comprehensive, all-encompassing platform designed to connect users with a wide array of services seamlessly. Built with modern web technologies, it offers secure authentication, service browsing, payment integration, and administrative tools. Whether you're a user seeking nearby services, a provider managing offerings, or an admin overseeing operations, AllInOne streamlines the experience with intuitive interfaces and robust backend support.
This project demonstrates a full-stack application featuring user authentication (including social login), geospatial service discovery, wallet management with VNPay payments, and role-based access control.
Key Features

User Authentication: Secure registration, login, and social sign-in via Firebase and Passport.js.
Service Management: Create, browse, update, and delete services with geospatial search (using Leaflet for maps).
Wallet & Payments: Top-up wallets and pay for services integrated with VNPay for seamless transactions.
Admin Dashboard: Manage users, providers, stats, and roles with protected routes.
Responsive Frontend: Built with React, TypeScript, and Vite for fast development and hot module replacement (HMR).
Secure Backend: Express.js server with MongoDB, JWT authentication, and Firebase Admin for enhanced security.
Real-time Capabilities: Powered by Firebase for authentication and potential real-time features.
Animations & UI Enhancements: GSAP for smooth animations and React Slick for carousels.

**Frontend**

-Framework: React 19 + TypeScript

-Build Tool: Vite 5 for lightning-fast bundling and development

-Routing: React Router DOM

-State Management: Context API (e.g., AuthContext)

-HTTP Client: Axios

-Maps: Leaflet + React Leaflet

-Animations: GSAP

-Icons & Sliders: FontAwesome + React Slick

-Styling: Custom CSS with Google Fonts (Inter)

-Linting & Formatting: ESLint + TypeScript ESLint

**Backend**

-Server: Node.js + Express.js

-Database: MongoDB with Mongoose ODM

-Authentication: Passport.js (Local + JWT) + Firebase Admin

-Payments: VNPay integration for top-ups and service payments

-Environment Management: dotenv for secure config

-Other: Axios for API calls, Custom middleware for role-based access

**Prerequisites**

-Node.js >= 18

-MongoDB (local or cloud instance)

-Firebase project (for auth and admin SDK)

-VNPay merchant account (for payment testing)

-Git

**Installation & Setup**

**1. Clone the Repository**
   
   git clone https://github.com/ductai22dh114720/AllInOne.git
**2. Install Dependecies**
   
   -Frontend
   
     cd frontend
   
     npm install
   
   -Backend
   
    cd backend
   
    npm install
   
**3. Run the Application**
   
   -Backend
   
    cd backend
   
    npm start
   
   -Frontend
   
    cd ../frontend
   
    npm start

