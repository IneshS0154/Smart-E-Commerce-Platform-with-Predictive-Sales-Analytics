# 🚀 Spring Boot + React (Axios) Starter Project

A streamlined full-stack starter application designed for scalability and clean separation of concerns.

## 🏗 Project Structure


```text
project-root/
│
├── backend/                # Spring Boot Application
│   ├── controller/         # REST Endpoints
│   ├── service/            # Business Logic
│   ├── repository/         # Data Access Layer (JPA)
│   ├── entity/             # Database Models
│   └── config/             # CORS & Security Configs
│
└── frontend/               # React (Vite + SWC)
    ├── src/
    │   ├── api/            # Axios Configuration & Services
    │   ├── App.jsx         # Main UI Component
    │   └── main.jsx        # Entry Point
    └── .env                # Environment Variables
```
### ⚙️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.x, Spring Data JPA, Maven |
| **Frontend** | React (Vite + SWC), Axios, Node 18 LTS |
| **Database** | H2 (In-Memory) |

---

### 🔌 Features Implemented

* **RESTful API:** Clean `GET` and `POST` implementations.
* **Layered Architecture:** Strict separation of `Controller → Service → Repository`.

* **Persistent Storage:** H2 in-memory database for rapid development.
* **API Abstraction:** Centralized Axios instance with environment-based configuration.
* **Dev-Ready:** Pre-configured CORS and `.env` support.

---

### 🗄 Backend API Endpoints

**Base URL:** `http://localhost:8080`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | Fetch all users |
| `POST` | `/api/users` | Create a new user |

**Request Body Example (POST):**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### ▶️ Getting Started

#### 1. Run Backend
Navigate to the `backend` directory:

**Mac / Linux:**
```bash
./mvnw spring-boot:run
```

**Windows:**

**PowerShell**
```powershell
.\mvnw.cmd spring-boot:run
```
#### 2. Run Frontend
Navigate to the frontend directory:

**Bash**
```bash
npm install
npm run dev
```

Frontend URL: http://localhost:5173

Backend URL: http://localhost:8080

### 🧪 Database Administration (H2 Console)
The H2 console is enabled by default for development debugging.

* **URL:** http://localhost:8080/h2-console
* **JDBC URL:** `jdbc:h2:mem:testdb`
* **User:** `sa`
* **Password:** (leave blank)

---

### 🌍 Environment Configuration
The frontend uses Vite's environment handling to prevent hardcoded URLs.

**.env file:**
```env
VITE_API_URL=http://localhost:8080
```

**api/axiosConfig.js:**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

export default api;
```
### 🔮 Future Roadmap

- [ ] **DTO Layer:** Decouple Entities from API Models.
- [ ] **Validation:** Add `@Valid` and `@NotBlank` constraints.
- [ ] **Global Handling:** Implement `@ControllerAdvice` for consistent error responses.
- [ ] **Full CRUD:** Complete Update and Delete operations.
- [ ] **Security:** Implement JWT Authentication.
- [ ] **Docker:** Containerize both services for easy deployment.
