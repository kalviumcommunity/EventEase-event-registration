# 🎟️ EventEase – Event Registration System

EventEase is a simple, secure, and user-friendly web application that allows users to create events and register for them. The project is built as part of a **4-week Simulated Work sprint**, following real-world engineering practices such as sprint planning, GitHub workflows, CI/CD, and deployment.

---

## 🚀 Project Overview

Many students and small organizations struggle to manage event registrations efficiently. Existing platforms are often complex or paid, making them unsuitable for small-scale use.

**EventEase** solves this problem by providing:
- A clean event creation workflow
- Easy event discovery
- Simple event registration
- A personal dashboard for users

---

## 🎯 Objectives
- Build a production-style full-stack application
- Follow industry-level GitHub workflows (issues, branches, PRs)
- Deliver a functional **MVP** within 4 weeks
- Practice real-world sprint planning and execution

---

## 🧩 Features (MVP)

### 🔐 Authentication
- User Signup
- User Login
- Secure password hashing
- Protected routes for authenticated users

### 📅 Event Management
- Create new events
- View all available events
- Event details page

### 📝 Registration
- Register for an event
- View events registered by the user

### 📊 Dashboard
- Personalized dashboard for logged-in users
- Summary of created and registered events

---

## 🏗️ Tech Stack

### Frontend
- **Next.js (TypeScript)**
- React
- Tailwind CSS

### Backend
- Next.js API Routes
- **Prisma ORM**
- PostgreSQL

### DevOps & Tools
- Docker
- GitHub Actions (CI/CD)
- AWS / Azure (Deployment)

---

## 🗂️ Project Structure

eventease/
│
├── app/ # Next.js App Router
├── components/ # Reusable UI components
├── lib/ # Utility functions & configs
├── prisma/ # Prisma schema & migrations
├── public/ # Static assets
├── styles/ # Global styles
├── .github/workflows/ # CI/CD pipelines
├── Dockerfile
├── README.md
└── package.json



---

## 🧪 Testing Strategy

- Unit testing for backend API routes
- Manual end-to-end testing for:
  - User signup & login
  - Event creation
  - Event registration flows

---

## 🚀 Deployment Plan

1. Containerize the application using **Docker**
2. Configure **GitHub Actions** for CI/CD
3. Deploy the application to **AWS or Azure**
4. Verify production build and API connectivity

---

## 📆 Sprint Timeline (4 Weeks)

### Week 1 – Setup & Design
- Repository setup
- Project scaffolding
- Database schema design
- Authentication flow design

### Week 2 – Core Backend Development
- Authentication APIs
- Event CRUD APIs
- Database integration with Prisma

### Week 3 – Frontend & Integration
- UI pages (Dashboard, Events, Registration)
- Frontend–backend integration
- Error handling and validations

### Week 4 – Finalization & Deployment
- Testing and bug fixing
- Deployment setup
- Documentation
- Demo preparation

---

## ⚙️ Functional Requirements
- Users can register and log in securely
- Users can create and view events
- Users can register for events
- Users can view registered events in their dashboard

---

## 🛡️ Non-Functional Requirements
- API response time under 300ms
- Secure password storage
- Scalable for 100 concurrent users
- Reliable data persistence

---

## 📈 Success Metrics
- All MVP features implemented
- Application deployed successfully
- End-to-end user flows working
- Clean commit history and meaningful PRs

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|----|-------|-----------|
| Time constraints | Feature delays | Strict MVP scope |
| API bugs | Integration issues | Early backend testing |
| Deployment issues | Demo failure | Local Docker testing |

---

## 👤 Author
**Solo Developer**  
Built as part of the **Simulated Work Framework**

---

## 📌 Note
This project focuses on **real-world engineering workflows**, not feature overload. The goal is to build, ship, and document a functional product within a fixed sprint timeline.

---

> *Acquire a query. Build something real. Ship with confidence.*
