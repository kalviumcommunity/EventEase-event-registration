🎟️ EventEase – Event Registration System

EventEase is a full-stack Event Registration System that allows users to create events, discover upcoming events, and register seamlessly.
The application is designed to be simple, secure, and scalable, suitable for students, communities, and small organizations.

🚀 Overview

Managing event registrations manually is inefficient and error-prone. EventEase provides a centralized platform where users can manage events and registrations with ease.

✨ Features
🔐 Authentication

User signup and login

Secure password hashing

Protected routes for authenticated users

📅 Event Management

Create new events

View all available events

View detailed event information

📝 Event Registration

Register for events

Prevent duplicate registrations

View registered events

📊 Dashboard

Personalized dashboard for logged-in users

Overview of created and registered events

🏗️ Tech Stack
Frontend

Next.js (TypeScript)
React
Tailwind CSS

Backend

Next.js API Routes

DevOps & Tools

Docker
GitHub Actions (CI/CD)
AWS / Azure

🗂️ Project Structure

eventease/
│
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                 # Utilities & configurations
├── prisma/              # Database schema & migrations
├── public/              # Static assets
├── styles/              # Global styles
├── .github/workflows/   # CI/CD pipelines
├── Dockerfile
├── README.md
└── package.json


Testing

Unit testing for backend API routes
Manual testing for:

Authentication flows
Event creation
Event registration
Dashboard functionality

Deployment

Dockerize the application
Configure CI/CD using GitHub Actions
Deploy to AWS or Azure
Verify production build and API connectivity

Functional Requirements

Users can securely register and log in
Users can create and browse events
Users can register for events
Users can view registered events

Non-Functional Requirements

Secure password storage
API response time under 300ms
Supports at least 100 concurrent users
Reliable data persistence

📌 Notes

Designed following modern full-stack development practices
Focused on clean architecture and maintainability
MVP-oriented and production-ready

GitHub Actions (CI/CD)

AWS / 
