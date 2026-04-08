# ANYWEAR | Luxury E-Commerce Platform

A high-end, editorial-style e-commerce platform built with a robust Spring Boot backend and a highly polished React front-end. Designed with a focus on immersive user experience, dynamic data loading, and clean component architecture.

---

## 🏗 Project Architecture

A monorepo structure separating the RESTful backend from the Vite-powered frontend.

```text
project-root/
│
├── Backend/                # Spring Boot REST API
│   ├── controller/         # API Endpoints (Products, Users, Auth, Cart)
│   ├── service/            # Business Logic & JWT validation
│   ├── repository/         # JPA Repositories
│   ├── entity/             # Database Models
│   └── config/             # Spring Security & CORS Config
│
└── Frontend/SECMS/         # React (Vite + SWC)
    ├── src/
    │   ├── components/     # Reusable UI (Navbar, Hero, Cards, Dashboard)
    │   ├── pages/          # Unified Catalogue, Shop, Home, Auth
    │   ├── hooks/          # Custom Hooks (useScrollAnimation)
    │   └── assets/         # Cinematic Videos, Lottie Animations, Fonts
```

## ✨ Key Features & UX

### 🎨 Editorial Front-End
- **Cinematic Hero:** Full-bleed, edge-to-edge looping `.mp4` background videos with seamless integration.
- **Fluid Navigation:** Smart auto-hiding navbar that detects scroll direction and hysteresis to maximize screen real estate.
- **Micro-interactions:** Custom cubic-bezier CSS animations, hover zooms, and elegant overlay reveals across product grids.
- **Lottie Transitions:** Smooth, brand-tailored splash screen animations during major route changes.
- **Dynamic Catalogue Grid:** Real-time array shuffling for everyday wear, preventing stagnant front-page content with skeleton loading states during fetch.

### ⚙️ Robust Back-End
- **Role-Based Access Control:** Secure JWT authentication isolating three distinct roles: `CUSTOMER`, `SUPPLIER`, and `ADMIN`.
- **Intelligent Data Seeding:** Built-in `Dataseeder.java` populates the H2 in-memory DB instantly with robust mock data, products, images, and user accounts.
- **Supplier Dashboard:** Fully functional layout with contained-scrolling to prevent sidebar drift when managing long product lists.

---

## 🛠 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM, Vanilla CSS (BEM inspired), Lottie |
| **Backend** | Java 17+, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA |
| **Database** | H2 (In-Memory for rapid dev/demo) |
| **Build Tools**| Maven (Backend), npm (Frontend) |

---

## 🚀 Getting Started

### 1. Run the Backend

Navigate to the `Backend` directory and start the Spring Boot application. The dataseeder will automatically populate the database on startup.

**Mac / Linux:**
```bash
./mvnw spring-boot:run
```

**Windows:**
```powershell
.\mvnw.cmd spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. Run the Frontend

Open a new terminal, navigate to the `Frontend/SECMS` directory, install dependencies, and start the Vite dev server.

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
* **User:** `sa`
* **Password:** *(leave blank)*
