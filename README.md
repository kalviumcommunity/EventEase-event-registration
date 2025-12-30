=======

# EventEase – Project Initialization

EventEase is a full-stack web application designed to simplify event creation, discovery, and registration.  
This repository contains the initial project setup using **Next.js with TypeScript**, forming the foundation for all future development.

---

## Folder Structure

### Folder Purpose

- **app/**  
  Handles routing, layouts, and page-level components using the App Router for scalability and performance.

- **components/**  
  Stores reusable UI elements (buttons, forms, modals) to avoid duplication and improve maintainability.

- **lib/**  
  Contains helper functions, constants, API utilities, and configuration logic to keep business logic cleanly separated.

---

## Naming Conventions

- Components use **PascalCase** (e.g., `EventCard.tsx`)
- Utility files use **camelCase** (e.g., `formatDate.ts`)
- Folder names are lowercase and descriptive

---

## Setup Instructions

### Installation

```bash
npm install
>>>>>>> sprint-1-init
```
For Next.js App Router compatibility, React is declared as a global in ESLint configuration to support the automatic JSX runtime introduced in modern React versions.