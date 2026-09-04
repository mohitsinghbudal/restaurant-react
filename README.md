<div align="center">

# 🍽️ Restaurant Management System — Backend

### Scalable RESTful backend for restaurant operations, ordering, kitchen coordination, billing, and real-time order tracking.

[![.NET](https://img.shields.io/badge/.NET-ASP.NET%20Core-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-Backend-239120?logo=csharp&logoColor=white)](https://learn.microsoft.com/dotnet/csharp/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Dapper](https://img.shields.io/badge/Dapper-Micro%20ORM-1F2937)](https://github.com/DapperLib/Dapper)
[![SignalR](https://img.shields.io/badge/SignalR-Real--Time-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core/signalr/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1000&color=512BD4&center=true&vCenter=true&width=760&lines=RESTful+APIs+%7C+JWT+%7C+RBAC+%7C+SignalR;Dapper+%7C+MySQL+Stored+Procedures+%7C+Transactions;Restaurant+Operations+%7C+Order+Tracking+%7C+Billing" alt="Typing SVG" />
</a>

</div>

---

## 📌 Overview

The **Restaurant Management System** is a backend-focused restaurant operations platform built with **ASP.NET Core Web API**.

The system is designed around the complete restaurant workflow — from a customer starting a dining session and placing an order to kitchen preparation, waiter coordination, billing, payment, table cleaning, and making the table available again.

This repository contains the **backend/API layer only**.

### Core engineering goals

- Build clean and maintainable RESTful APIs
- Secure APIs using JWT authentication and role-based authorization
- Support API versioning and rate limiting
- Provide real-time order and service updates using SignalR
- Optimize database access using Dapper and MySQL stored procedures
- Maintain data consistency using atomic database transactions
- Follow SOLID principles and layered architecture
- Model restaurant operations as explicit business workflows and state transitions

---

## 🏗️ Architecture

The backend follows a **layered architecture** to separate API concerns, business logic, data access, and domain models.

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
│                  MySQL                      │
│ Tables • Relationships • Stored Procedures   │
└──────────────────────────────────────────────┘

                    ↕
              SignalR Hub
                    ↕
       Real-Time Order Communication
```

### Architectural principles

- **Separation of concerns**
- **SOLID principles**
- **Dependency Injection**
- **Thin controllers**
- **Business logic in services**
- **Data access isolated from application logic**
- **Atomic operations for critical workflows**

---

## 🔄 Restaurant Workflow

The backend models the restaurant's operational lifecycle as a sequence of controlled business states:

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

This workflow allows the backend to coordinate **customers, waiters, chefs, bar attendants, tables, orders, bills, and dining sessions**.

---

## 👥 Roles & Access Control

The system uses **JWT authentication** with **Role-Based Access Control (RBAC)**.

| Role | Responsibility |
|---|---|
| **Admin** | Manage restaurant-level operations and administrative resources |
| **Waiter** | Handle table service, waiter assignments, orders, serving, and customer requests |
| **Chef** | Receive and process kitchen orders and update preparation status |
| **Bar Attendant** | Handle beverage/bar-related order processing |
| **Customer / Guest** | Browse menu, start dining sessions, place orders, and request billing |

Authorization is enforced at the API level so that users can only perform operations permitted by their role.

---

## ⚡ Real-Time Communication

**SignalR** is used for real-time communication between restaurant services and connected clients.

Instead of requiring clients to continuously poll the API, important operational events can be pushed in real time.

### Example events

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

This is particularly useful for **order tracking, kitchen coordination, waiter notifications, and service-state updates**.

---

## 🔐 Security

### JWT Authentication

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

### Security mechanisms

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Authorization policies
- API rate limiting
- Input/model validation
- Controlled access to protected endpoints

---

## 🚦 API Versioning & Rate Limiting

### API Versioning

API versioning is implemented to allow the backend to evolve without unnecessarily breaking existing clients.

Example:

```http
GET /api/v1/orders
GET /api/v2/orders
```

This provides a controlled path for introducing future API changes.

### Rate Limiting

Rate limiting is applied to protect API resources from excessive requests and reduce the risk of abuse.

```text
Client Requests
      │
      ▼
Rate Limiter
      │
 ┌────┴────┐
 │         │
Allowed   Rejected
 │         │
 ▼         ▼
API      429 Too Many Requests
```

---

## 🗄️ Data Access

The backend uses **Dapper** as the micro-ORM for database access.

### Why Dapper?

- Lightweight data-access layer
- Explicit SQL control
- High performance
- Simple object mapping
- Works well with stored procedures
- Avoids unnecessary ORM abstraction for query-heavy operations

### Database technologies

- **MySQL**
- **Dapper**
- **Stored Procedures**
- **Parameterized Queries**
- **Transactions**
- **Relational data modeling**

---

## 🔒 Atomic Transactions

Critical multi-step operations are executed using database transactions to preserve consistency.

For example, order creation may involve multiple operations:

```text
Begin Transaction
      │
      ├── Validate dining session
      ├── Validate menu items
      ├── Create / update order
      ├── Create order items
      ├── Update required state
      └── Commit
             │
             ▼
          Success
```

If a critical operation fails:

```text
Rollback
   │
   ▼
No Partial Order State
```

This helps prevent inconsistent states when multiple related database operations must succeed together.

---

## 📦 Core Domain Areas

The backend is organized around the major restaurant business domains.

### Table Management

- Table availability
- Table identification through QR codes
- Table state transitions
- Table lifecycle after dining/payment/cleaning

### Dining Sessions

- Start and track dining sessions
- Associate customers with tables
- Maintain session timestamps
- Coordinate the active restaurant visit

### Menu & Orders

- Menu browsing
- Order creation
- Order item management
- Quantity updates
- Order status tracking

### Kitchen & Bar

- Receive new order notifications
- Process relevant items
- Update preparation status
- Notify waiters when orders become ready

### Waiter Operations

- Waiter assignment
- Customer service requests
- Order pickup
- Serving workflow

### Billing & Payment

- Generate/request bills
- Track billing state
- Coordinate payment completion
- Trigger table cleanup workflow

---

## 🧩 Backend Components

A typical backend structure is organized around responsibilities rather than putting all logic inside controllers.

```text
RestaurantManagementSystem
│
├── Controllers
│   ├── AuthController
│   ├── TableController
│   ├── DiningController
│   ├── MenuController
│   ├── OrderController
│   ├── BillController
│   └── ...
│
├── Services
│   ├── AuthService
│   ├── TableService
│   ├── DiningService
│   ├── OrderService
│   ├── BillingService
│   └── ...
│
├── Repositories
│   ├── TableRepository
│   ├── DiningRepository
│   ├── OrderRepository
│   ├── MenuRepository
│   └── ...
│
├── Models / DTOs
│
├── Hubs
│   └── RestaurantHub
│
├── Middleware
│
└── Database
    └── MySQL Stored Procedures
```

> Adjust folder names to match the exact structure of the repository.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Language | **C#** |
| Framework | **ASP.NET Core Web API** |
| API Style | **RESTful APIs** |
| Authentication | **JWT** |
| Authorization | **RBAC** |
| Real-Time | **SignalR** |
| Database | **MySQL** |
| Data Access | **Dapper** |
| Database Logic | **Stored Procedures** |
| Transactions | **Atomic Database Transactions** |
| API Management | **API Versioning, Rate Limiting** |
| Architecture | **Layered Architecture** |
| Design Principles | **SOLID** |
| Dependency Management | **Dependency Injection** |

---

## 🧪 API Design

The backend follows REST conventions for resource-oriented endpoints.

Example resource structure:

```http
GET    /api/v1/tables
GET    /api/v1/tables/{id}
POST   /api/v1/tables
PUT    /api/v1/tables/{id}
DELETE /api/v1/tables/{id}

GET    /api/v1/menu
GET    /api/v1/orders/{id}
POST   /api/v1/orders
PUT    /api/v1/orders/{id}/status

POST   /api/v1/dining-sessions
GET    /api/v1/dining-sessions/{id}

POST   /api/v1/bills
GET    /api/v1/bills/{id}
```

> Endpoint names should be updated to match the exact routes implemented in the repository.

---

## 🧠 Engineering Highlights

### 1. RESTful API Development
Designed backend endpoints around restaurant resources and business operations using ASP.NET Core Web API.

### 2. Secure Authentication & Authorization
Implemented JWT authentication and RBAC to protect business-critical endpoints.

### 3. Real-Time Restaurant Operations
Integrated SignalR to enable real-time communication for order status and restaurant service workflows.

### 4. Efficient Database Access
Used Dapper with MySQL stored procedures to maintain explicit and efficient data-access operations.

### 5. Transactional Consistency
Used atomic database transactions for operations involving multiple dependent database changes.

### 6. Maintainable Architecture
Applied layered architecture, dependency injection, and SOLID principles to keep responsibilities separated and the codebase maintainable.

### 7. API Reliability
Implemented API versioning and rate limiting to support API evolution and controlled resource usage.

---

## 🚀 Getting Started

### Prerequisites

Install the following:

- .NET SDK
- MySQL Server
- Git

Verify the .NET installation:

```bash
dotnet --version
```

Verify MySQL is available:

```bash
mysql --version
```

### Clone the repository

```bash
git clone <repository-url>
cd <backend-project-directory>
```

### Configure the database

Update the connection string in your application configuration:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=restaurant_management;User=root;Password=YOUR_PASSWORD;"
  }
}
```

**Do not commit real credentials to source control.**

Use environment variables or local development configuration for secrets.

### Configure JWT

Set the JWT configuration required by the application:

```json
{
  "Jwt": {
    "Key": "YOUR_DEVELOPMENT_SECRET",
    "Issuer": "YOUR_ISSUER",
    "Audience": "YOUR_AUDIENCE"
  }
}
```

For production, store secrets securely rather than committing them to the repository.

### Run the application

```bash
dotnet restore
dotnet build
dotnet run
```

The API will start using the configured HTTP/HTTPS ports.

---

## 📚 API Documentation

If Swagger/OpenAPI is enabled in the project, run the application and open the configured Swagger endpoint.

Swagger provides:

- Endpoint discovery
- Request/response schemas
- Authentication testing
- API exploration

---

## 📈 Possible Future Improvements

Potential extensions for the backend include:

- Automated integration testing
- Distributed caching
- Background job processing
- Observability with structured logging and metrics
- Containerization with Docker
- CI/CD pipeline
- Expanded policy-based authorization
- Advanced reporting and analytics

---

## 👨‍💻 Development Experience

This project demonstrates practical backend engineering experience with:

```text
ASP.NET Core
     │
     ├── RESTful API Design
     ├── JWT Authentication
     ├── RBAC
     ├── API Versioning
     ├── Rate Limiting
     ├── SignalR
     ├── Dependency Injection
     ├── SOLID Principles
     │
     └── Data Layer
          ├── Dapper
          ├── MySQL
          ├── Stored Procedures
          └── Transactions
```

---

## 📄 Project Context

**Project:** Restaurant Management System  
**Repository:** Backend  
**Role:** Backend / Full-Stack Project  
**Primary Focus:** Backend Engineering  
**Technology:** ASP.NET Core Web API  
**Database:** MySQL  
**Real-Time Communication:** SignalR  

---

<div align="center">

### 🍽️ Built to model real-world restaurant operations with a scalable backend architecture.

**ASP.NET Core • Dapper • MySQL • SignalR • JWT • RBAC**

</div>
