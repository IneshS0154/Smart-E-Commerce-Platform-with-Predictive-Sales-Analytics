🚀 Spring Boot + React (Axios) Starter Project

A simple full-stack starter application built with:

Backend: Spring Boot 3 (Java 17, Maven)

Frontend: React (Vite + SWC)

HTTP Client: Axios

Database: H2 (In-Memory)

This project demonstrates a clean, layered architecture and a working frontend ↔ backend connection.

🏗 Project Structure
project-root/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── config/
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── App.jsx
    │   └── main.jsx
    └── .env


⚙️ Tech Stack
Backend

Java 17

Spring Boot 3.x

Spring Data JPA

H2 Database

Maven

Frontend

React (Vite + SWC)

Axios

Node 18 LTS

🔌 Features Implemented

REST API (GET, POST)

Layered architecture (Controller → Service → Repository)

H2 in-memory database

Axios-based API layer in frontend

Environment-based backend URL configuration

Basic Create + Read operations

🗄 Backend API Endpoints
Base URL
http://localhost:8080
Get All Users
GET /api/users
Create User
POST /api/users
Request Body Example
{
  "name": "John",
  "email": "john@example.com"
}
▶️ How To Run The Project
1️⃣ Run Backend
Navigate to backend directory:

Mac / Linux

./mvnw spring-boot:run

Windows

mvnw.cmd spring-boot:run

Backend runs at:

http://localhost:8080

2️⃣ Run Frontend

Navigate to frontend directory:

npm install
npm run dev

Frontend runs at:

http://localhost:5173

🧪 H2 Database Console

Enabled for development.

Access:

http://localhost:8080/h2-console
Configuration

JDBC URL:

jdbc:h2:mem:testdb

Username:

sa

Password:

(empty)
📂 Backend Architecture
Entity

Represents database table.

Repository

Extends JpaRepository for database operations.

Service

Contains business logic layer.

Controller

Exposes REST endpoints.

This separation ensures:

Scalability

Maintainability

Clean architecture

📂 Frontend Architecture
api/axiosConfig.js

Central Axios configuration with:

Base URL

JSON headers

Timeout

api/userService.js

Service layer for API calls.

App.jsx

UI layer consuming service methods.

This prevents direct HTTP calls inside components and improves maintainability.

🌍 Environment Configuration

Frontend .env file:

VITE_API_URL=http://localhost:8080

Axios configuration:

baseURL: import.meta.env.VITE_API_URL

This allows easy switching between:

Development

Staging

Production

🔮 Future Improvements

Add DTO layer (separate Entity from API model)

Add validation (@Valid, @NotBlank)

Add global exception handling

Implement full CRUD (Update, Delete)

Add PostgreSQL

Add JWT Authentication

Dockerize application

Serve React build from Spring Boot

🎯 Purpose

This project serves as a clean foundation for building scalable full-stack applications using Spring Boot and React.

It demonstrates:

Proper project layering

Clean frontend API abstraction

Real backend ↔ frontend communication

Production-ready structure