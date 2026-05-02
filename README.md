# ANYWEAR | Luxury E-Commerce Platform

A high-end, editorial-style e-commerce platform built with a robust Spring Boot backend, a highly polished React front-end, and an intelligent AI Prediction Microservice. Designed with a focus on immersive user experience, dynamic data loading, and clean component architecture.

---

## 🏗 Project Architecture

A hybrid architecture separating the Java core, React storefront, and Python AI engine.

```text
project-root/
│
├── Backend/                # Spring Boot REST API (Java Core)
│   ├── controller/         # API Endpoints (Products, Users, Auth, Cart)
│   ├── service/            # Business Logic & JWT validation
│   └── ...
│
├── Frontend/SECMS/         # React Storefront (Vite + SWC)
│   ├── src/
│   │   ├── components/     # Reusable UI (Dashboards, Overlays)
│   │   └── ui/             # Cinematic UI (DarkVeil, ScrollVelocity)
│   └── ...
│
└── AI-Service/             # External Microservice (FastAPI + ML)
    └── [Hosted at: https://github.com/IneshS0154/Anywear-Prediction-API]
```

## ✨ Key Features & UX

### 🎨 Editorial Front-End
- **DarkVeil Animation:** A high-performance, GLSL-powered animated background that provides a premium "Vault" aesthetic across all management portals.
- **ScrollVelocity:** Dynamic parallax scrolling text that responds to user scroll speed, creating an interactive and modern editorial feel.
- **Management Portals:** Unified Admin, Supplier, and Customer dashboards with synchronized sidebar animations and smooth page transitions.

### ⚙️ Robust Back-End
- **Role-Based Access Control:** Secure JWT authentication isolating three distinct roles: `CUSTOMER`, `SUPPLIER`, and `ADMIN`.
- **Intelligent Data Seeding:** Built-in `Dataseeder.java` populates the H2 in-memory DB instantly with robust mock data.

### 🤖 AI Prediction Engine
- **Predictive Sales Analytics:** Leverage Machine Learning to forecast product demand and potential profit margins.
- **Stock Intelligence:** Smart inventory recommendations for suppliers based on historical performance and predictive modeling.
- **Microservice Design:** Decoupled FastAPI architecture for high-performance data processing.

---

## 🛠 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Framer Motion, Recharts, Lucide React |
| **Backend** | Java 17+, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA |
| **AI / ML** | Python 3.x, FastAPI, Scikit-Learn, Docker |
| **Database** | H2 (In-Memory Core), Pickle (Model Artifacts) |

---

## 🚀 Getting Started

### 1. Run the Backend (Core API)
Navigate to the `Backend` directory and start the Spring Boot application.
```bash
./mvnw spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. Run the AI Service (Prediction API)
Clone the [Anywear-Prediction-API](https://github.com/IneshS0154/Anywear-Prediction-API) and choose a method below:

**Method A: Manual Setup (Python)**
```bash
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

**Method B: Containerized Setup (Docker)**
```bash
docker build -t anywear-prediction-api .
docker run -p 8000:8000 anywear-prediction-api
```
*AI Service runs on `http://localhost:8000`*

### 3. Run the Frontend (Storefront)
Navigate to the `Frontend/SECMS` directory and start the dev server.
```bash
cd Frontend/SECMS
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Database Administration

The H2 console is enabled by default for viewing the seeded data and debugging.
* **URL:** `http://localhost:8080/h2-console`
* **JDBC URL:** `jdbc:h2:mem:testdb`
* **User:** `sa` / **Password:** *(blank)*

## 🤝 Acknowledgements
Special thanks to [@username](https://github.com/kavinduranthisaru/) for helping with evaluating the UI.
