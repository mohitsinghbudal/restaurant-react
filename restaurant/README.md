<div align="center">

# 🍽️ Restaurant Management System

### Scalable full-stack restaurant management platform with RESTful APIs, real-time order tracking, kitchen coordination, billing, and a Dockerized React frontend.

[![.NET](https://img.shields.io/badge/.NET-ASP.NET%20Core-512BD4?logo=dotnet\&logoColor=white)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-Backend-239120?logo=csharp\&logoColor=white)](https://learn.microsoft.com/dotnet/csharp/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql\&logoColor=white)](https://www.mysql.com/)
[![Dapper](https://img.shields.io/badge/Dapper-Micro%20ORM-1F2937)](https://github.com/DapperLib/Dapper)
[![SignalR](https://img.shields.io/badge/SignalR-Real--Time-512BD4?logo=dotnet\&logoColor=white)](https://learn.microsoft.com/aspnet/core/signalr/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens\&logoColor=white)](https://jwt.io/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react\&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker\&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Web%20Server-009639?logo=nginx\&logoColor=white)](https://nginx.org/)

<br/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1000&color=512BD4&center=true&vCenter=true&width=900&lines=RESTful+APIs+%7C+JWT+%7C+RBAC+%7C+SignalR;Dapper+%7C+MySQL+Stored+Procedures+%7C+Transactions;React.js+%7C+Docker+%7C+Nginx;Restaurant+Operations+%7C+Order+Tracking+%7C+Billing" alt="Typing SVG" />
</a>

<br/>

**ASP.NET Core • React.js • MySQL • Dapper • SignalR • JWT • Docker**

</div>

---

## 📌 Overview

The **Restaurant Management System** is a full-stack restaurant operations platform designed to manage the complete restaurant workflow — from customer table identification and dining sessions to ordering, kitchen/bar coordination, waiter service, billing, payment, and table availability.

The backend is built with **ASP.NET Core Web API**, while the frontend is developed using **React.js** and containerized using **Docker**.

The system uses **JWT authentication, Role-Based Access Control (RBAC), API versioning, rate limiting, Dapper, MySQL stored procedures, database transactions, and SignalR** to provide a secure and maintainable application architecture.

---

## 🎯 Core Engineering Goals

* Build clean and maintainable RESTful APIs.
* Secure APIs using JWT authentication and RBAC.
* Implement role-specific authorization.
* Support API versioning.
* Protect APIs using rate limiting.
* Provide real-time communication using SignalR.
* Optimize database access using Dapper.
* Use MySQL stored procedures for database operations.
* Maintain consistency using atomic database transactions.
* Follow SOLID principles.
* Apply dependency injection.
* Separate API, business, and data-access responsibilities.
* Build a responsive React.js frontend.
* Containerize the frontend using Docker and serve it through Nginx.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │        React.js          │
                         │        Frontend          │
                         │                          │
                         │    Docker Container      │
                         │         + Nginx          │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTP / REST
                                      ▼
┌─────────────────────────────────────────────────────────┐
│                  ASP.NET Core Web API                   │
│                                                         │
│  Middleware                                             │
│  JWT Authentication                                     │
│  RBAC Authorization                                     │
│  API Versioning                                         │
│  Rate Limiting                                          │
│  Validation                                             │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │      Service Layer      │
                │                         │
                │ Business Logic          │
                │ Workflows               │
                │ Orchestration           │
                └────────────┬────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │ Repository / Data Layer │
                │                         │
                │ Dapper                  │
                │ Stored Procedures       │
                │ Transactions            │
                └────────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     MySQL       │
                    │                 │
                    │ Tables          │
                    │ Relationships   │
                    │ Procedures      │
                    └─────────────────┘


                     ↕
                SignalR Hub
                     ↕
          Real-Time Communication
```

---

## 🧱 Backend Layered Architecture

The backend follows a **layered architecture** to maintain separation of concerns.

```text
┌──────────────────────────────────────────────┐
│                  API Layer                   │
│ Controllers • Middleware • Auth • Validation │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               Service Layer                  │
│ Business Rules • Workflows • Orchestration   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Repository / Data Layer          │
│ Dapper • Stored Procedures • Transactions    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                  MySQL                       │
│ Tables • Relationships • Stored Procedures   │
└──────────────────────────────────────────────┘
```

### Architectural Principles

* **Separation of Concerns**
* **SOLID Principles**
* **Dependency Injection**
* **Thin Controllers**
* **Service-Based Business Logic**
* **Repository/Data Access Separation**
* **Atomic Database Operations**
* **Maintainable and testable components**

---

# 🔄 Restaurant Workflow

The backend models the restaurant's operational lifecycle as controlled business states.

```text
Customer Arrives
      │
      ▼
Scan Table QR
      │
      ▼
Login / Continue as Guest
      │
      ▼
Start Dining Session
      │
      ▼
Notify Waiter
      │
      ▼
Waiter Assigned
      │
      ▼
Browse Menu
      │
      ▼
Place Order
      │
      ▼
Kitchen / Bar Notification
      │
      ▼
Preparing
      │
      ▼
Ready
      │
      ▼
Waiter Picks Up
      │
      ▼
Order Served
      │
      ▼
Request Bill
      │
      ▼
Payment
      │
      ▼
Table Cleaning
      │
      ▼
Table Available
```

This workflow coordinates:

* Customers
* Guests
* Waiters
* Chefs
* Bar attendants
* Tables
* Dining sessions
* Menus
* Orders
* Bills
* Payments

---

# 👥 Roles & Access Control

The system uses **JWT authentication** with **Role-Based Access Control (RBAC)**.

| Role                    | Responsibility                                                            |
| ----------------------- | ------------------------------------------------------------------------- |
| 👨‍💼 **Admin**         | Manage restaurant-level operations and administrative resources           |
| 🧑‍🍳 **Chef**          | Receive kitchen orders and update preparation status                      |
| 🍹 **Bar Attendant**    | Process beverage/bar-related orders                                       |
| 🧑‍💼 **Waiter**        | Handle table service, assignments, orders, serving, and customer requests |
| 👤 **Customer / Guest** | Browse menu, start dining sessions, place orders, and request billing     |

Authorization is enforced at the API level so users can only perform operations permitted by their role.

---

# ⚡ Real-Time Communication

**SignalR** is used for real-time communication between connected clients and restaurant services.

Instead of continuously polling the API, important operational events can be pushed to clients in real time.

### Example Events

```text
New Order
   │
   ├──► Kitchen
   │
   └──► Bar


Order Status Changed
   │
   └──► Waiter / Customer


Order Ready
   │
   └──► Waiter


Customer Request
   │
   └──► Waiter
```

### Benefits

* Real-time order tracking
* Kitchen notifications
* Bar notifications
* Waiter notifications
* Customer order status updates
* Reduced client-side polling

---

# 🔐 Security

## JWT Authentication

The API uses **JSON Web Tokens (JWT)** for stateless authentication.

```text
Client
  │
  │ Login
  ▼
Authentication API
  │
  │ JWT
  ▼
Client
  │
  │ Authorization: Bearer <token>
  ▼
ASP.NET Core API
  │
  ├── Validate JWT
  ├── Identify User
  ├── Check Role / Policy
  └── Execute Request
```

### Security Mechanisms

* JWT-based authentication
* Role-Based Access Control
* Authorization policies
* Protected API endpoints
* API rate limiting
* Input/model validation
* Secure authenticated requests

---

# 🧩 Middleware

The ASP.NET Core request pipeline uses middleware to handle cross-cutting concerns.

```text
Incoming HTTP Request
        │
        ▼
┌──────────────────────┐
│ Exception Handling   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ HTTPS / Security     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Authentication       │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Authorization        │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Rate Limiting        │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Controller Endpoint  │
└──────────────────────┘
```

Middleware helps keep cross-cutting concerns outside individual controllers.

---

# 🚦 API Versioning & Rate Limiting

## API Versioning

API versioning allows the backend to evolve without unnecessarily breaking existing clients.

Example:

```http
GET /api/v1/orders
GET /api/v2/orders
```

This provides a controlled approach for introducing future API changes.

## Rate Limiting

Rate limiting protects API resources from excessive requests and helps reduce abuse.

```text
Client Request
      │
      ▼
Rate Limiter
      │
 ┌────┴────┐
 │         │
 ▼         ▼
Allowed   Rejected
 │         │
 ▼         ▼
API       429
```

---

# 🗄️ Data Access

The backend uses **Dapper** as the micro-ORM for database access.

### Why Dapper?

* Lightweight data-access layer
* Explicit SQL control
* High performance
* Simple object mapping
* Works well with stored procedures
* Minimal abstraction over SQL

### Database Technologies

* **MySQL**
* **Dapper**
* **Stored Procedures**
* **Parameterized Queries**
* **Database Transactions**
* **Relational Data Modeling**

---

# 🔒 Atomic Transactions

Critical multi-step operations are executed inside database transactions to preserve consistency.

### Example: Order Creation

```text
BEGIN TRANSACTION
       │
       ├── Validate dining session
       │
       ├── Validate menu items
       │
       ├── Create / update order
       │
       ├── Create order items
       │
       ├── Update required state
       │
       └── COMMIT
              │
              ▼
           Success
```

If a critical operation fails:

```text
ROLLBACK
   │
   ▼
No Partial Order State
```

This ensures related database operations succeed or fail together.

---

# 📦 Core Domain Areas

## 🪑 Table Management

* Table availability
* QR-based table identification
* Table state transitions
* Table lifecycle management

## 🍽️ Dining Sessions

* Start dining sessions
* Track active sessions
* Associate customers with tables
* Maintain session timestamps

## 📋 Menu & Orders

* Menu browsing
* Order creation
* Order item management
* Quantity updates
* Order status tracking

## 👨‍🍳 Kitchen & Bar

* New order notifications
* Order processing
* Preparation status updates
* Ready notifications

## 🧑‍💼 Waiter Operations

* Waiter assignment
* Customer requests
* Order pickup
* Serving workflow

## 💳 Billing & Payment

* Bill generation
* Billing state tracking
* Payment processing
* Table cleanup workflow

---

# 🖥️ Frontend

The frontend is built using **React.js** and communicates with the ASP.NET Core backend through RESTful APIs.

### Frontend Responsibilities

* Authentication interface
* Menu browsing
* Table/dining interface
* Order management
* Order tracking
* Waiter/service interface
* Kitchen interface
* Billing interface
* Administrative dashboard

---

# 🐳 Dockerized Frontend

The React.js frontend is containerized using **Docker**.

The production frontend is built and served through **Nginx** inside the Docker container.

### Frontend Container Architecture

```text
React.js Source
      │
      ▼
Docker Build
      │
      ▼
Production Build
      │
      ▼
Nginx
      │
      ▼
Docker Container
      │
      ▼
Browser
```

### Build Frontend Image

```bash
cd Frontend

docker build -t restaurant-management-frontend .
```

### Run Frontend Container

```bash
docker run -d \
  -p 3000:80 \
  --name restaurant-frontend \
  restaurant-management-frontend
```

The frontend will be available at:

```text
http://localhost:3000
```

### Check Container

```bash
docker ps
```

### Stop Container

```bash
docker stop restaurant-frontend
```

### Remove Container

```bash
docker rm restaurant-frontend
```

---

# 📂 Project Structure

```text
RestaurantManagementSystem/
│
├── README.md
├── .gitignore
│
├── Backend/
│   │
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Models/
│   ├── DTOs/
│   ├── Middleware/
│   ├── Hubs/
│   └── Program.cs
│
├── Frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── Database/
    │
    ├── Tables/
    ├── StoredProcedures/
    └── Scripts/
```

> Adjust the folder structure to match the actual repository.

---

# 🧪 API Design

The backend follows RESTful API conventions.

### Tables

```http
GET    /api/v1/tables
GET    /api/v1/tables/{id}
POST   /api/v1/tables
PUT    /api/v1/tables/{id}
DELETE /api/v1/tables/{id}
```

### Menu

```http
GET    /api/v1/menu
GET    /api/v1/menu/{id}
POST   /api/v1/menu
PUT    /api/v1/menu/{id}
DELETE /api/v1/menu/{id}
```

### Orders

```http
GET    /api/v1/orders
GET    /api/v1/orders/{id}
POST   /api/v1/orders
PUT    /api/v1/orders/{id}
PUT    /api/v1/orders/{id}/status
```

### Dining Sessions

```http
POST   /api/v1/dining-sessions
GET    /api/v1/dining-sessions/{id}
PUT    /api/v1/dining-sessions/{id}
```

### Bills

```http
POST   /api/v1/bills
GET    /api/v1/bills/{id}
PUT    /api/v1/bills/{id}
```

> Update endpoint names according to the actual implementation.

---

# 🧠 Engineering Highlights

### 1. RESTful API Development

Designed RESTful APIs around restaurant resources and business operations using ASP.NET Core Web API.

### 2. JWT Authentication

Implemented stateless JWT authentication to secure API requests.

### 3. Role-Based Authorization

Implemented RBAC to restrict operations according to user roles.

### 4. Middleware

Used middleware for cross-cutting concerns such as authentication, authorization, exception handling, validation, and rate limiting.

### 5. Real-Time Communication

Integrated SignalR for real-time order tracking and restaurant service communication.

### 6. Efficient Data Access

Used Dapper and MySQL stored procedures for explicit and efficient database operations.

### 7. Transactional Consistency

Implemented atomic database transactions for multi-step operations.

### 8. API Versioning

Implemented API versioning to support future API evolution.

### 9. Rate Limiting

Applied rate limiting to protect backend resources from excessive requests.

### 10. Dockerized Frontend

Containerized the React.js frontend using Docker and served the production build through Nginx.

### 11. Maintainable Architecture

Applied layered architecture, dependency injection, separation of concerns, and SOLID principles.

---

# 🛠️ Technology Stack

| Category                | Technology               |
| ----------------------- | ------------------------ |
| Language                | **C#**                   |
| Backend                 | **ASP.NET Core Web API** |
| Frontend                | **React.js**             |
| Database                | **MySQL**                |
| Data Access             | **Dapper**               |
| Authentication          | **JWT**                  |
| Authorization           | **RBAC**                 |
| Real-Time Communication | **SignalR**              |
| Database Logic          | **Stored Procedures**    |
| Data Consistency        | **Transactions**         |
| API Management          | **API Versioning**       |
| API Protection          | **Rate Limiting**        |
| Architecture            | **Layered Architecture** |
| Design Principles       | **SOLID**                |
| Dependency Management   | **Dependency Injection** |
| Containerization        | **Docker**               |
| Frontend Server         | **Nginx**                |

---

# 🚀 Getting Started

## Prerequisites

Install:

* .NET SDK
* MySQL Server
* Git
* Node.js
* npm
* Docker

Verify:

```bash
dotnet --version
node --version
npm --version
docker --version
mysql --version
```

---

## 1️⃣ Clone Repository

```bash
git clone <repository-url>

cd RestaurantManagementSystem
```

---

## 2️⃣ Configure Database

Create the required MySQL database and execute the database scripts.

Update the backend connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=restaurant_management;User=root;Password=YOUR_PASSWORD;"
  }
}
```

⚠️ **Never commit real database credentials to GitHub.**

Use environment variables or secure local configuration for secrets.

---

## 3️⃣ Configure JWT

Configure JWT settings:

```json
{
  "Jwt": {
    "Key": "YOUR_DEVELOPMENT_SECRET",
    "Issuer": "YOUR_ISSUER",
    "Audience": "YOUR_AUDIENCE"
  }
}
```

For production, use a secure secrets-management solution.

---

## 4️⃣ Run Backend

```bash
cd Backend

dotnet restore
dotnet build
dotnet run
```

The API will start using the configured HTTP/HTTPS ports.

---

## 5️⃣ Run Frontend with Docker

Navigate to the frontend:

```bash
cd Frontend
```

Build the Docker image:

```bash
docker build -t restaurant-management-frontend .
```

Run the container:

```bash
docker run -d \
  -p 3000:80 \
  --name restaurant-frontend \
  restaurant-management-frontend
```

Open:

```text
http://localhost:3000
```

---

# 📚 API Documentation

If Swagger/OpenAPI is enabled, run the backend and open the configured Swagger endpoint.

Swagger provides:

* Endpoint discovery
* Request/response schemas
* API testing
* Authentication testing
* API exploration

---

# 🧪 Development Practices

This project demonstrates practical experience with:

```text
ASP.NET Core
      │
      ├── RESTful API Design
      ├── JWT Authentication
      ├── RBAC
      ├── Middleware
      ├── API Versioning
      ├── Rate Limiting
      ├── SignalR
      ├── Dependency Injection
      ├── SOLID Principles
      │
      ├── Dapper
      ├── MySQL
      ├── Stored Procedures
      └── Transactions

React.js
      │
      ├── Frontend UI
      ├── API Integration
      ├── Real-Time Updates
      └── Dashboard

Docker
      │
      ├── Frontend Container
      └── Nginx
```

---

# 📈 Engineering Outcomes

The project provided practical experience in designing a real-world full-stack application involving multiple users, business workflows, real-time communication, database consistency, and secure API access.

Key areas of experience include:

* Backend API architecture
* Full-stack integration
* Authentication and authorization
* Database design
* Transaction management
* Real-time communication
* Containerized frontend deployment
* REST API development
* Business workflow modeling
* Production-oriented software practices

---

# 🔮 Future Improvements

Potential future enhancements include:

* [ ] Docker Compose for complete application orchestration
* [ ] Containerized backend
* [ ] Automated unit and integration testing
* [ ] CI/CD pipeline
* [ ] Distributed caching with Redis
* [ ] Background job processing
* [ ] Centralized logging
* [ ] Application monitoring
* [ ] Advanced analytics
* [ ] Cloud deployment
* [ ] Payment gateway integration
* [ ] Email/SMS notifications

---

# 📄 Project Information

| Detail               | Information                  |
| -------------------- | ---------------------------- |
| **Project**          | Restaurant Management System |
| **Type**             | Full-Stack Project           |
| **Backend**          | ASP.NET Core Web API         |
| **Frontend**         | React.js                     |
| **Database**         | MySQL                        |
| **Authentication**   | JWT                          |
| **Authorization**    | RBAC                         |
| **Real-Time**        | SignalR                      |
| **Data Access**      | Dapper                       |
| **Database Logic**   | Stored Procedures            |
| **Transactions**     | Atomic Database Transactions |
| **Containerization** | Docker                       |
| **Frontend Server**  | Nginx                        |
| **Architecture**     | Layered Architecture         |

---

<div align="center">

## 🍽️ Restaurant Management System

### Building reliable restaurant workflows with modern full-stack engineering.

**ASP.NET Core • C# • React.js • MySQL • Dapper • SignalR • JWT • RBAC • Docker**

⭐ **If you find this project useful, consider giving the repository a star!**

</div>
