# 📚 Library Management System

<div align="center">

<img src="https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
<img src="https://img.shields.io/badge/C%23-Backend-239120?style=for-the-badge&logo=csharp&logoColor=white" />
<img src="https://img.shields.io/badge/SQL%20Server-Database-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" />
<img src="https://img.shields.io/badge/React.js-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

<br/>

### 🔐 Secure • Scalable • Role-Based Library Management

A full-stack Library Management System built with **ASP.NET Core Web API, SQL Server, JWT authentication, RBAC, and React.js**, designed to manage books, members, librarians, borrowing activities, overdue fines, and analytics.

</div>

---

## ✨ Project Overview

The **Library Management System** is an academic project developed from **August 2025 to December 2025**.

The system provides a centralized platform for managing library operations while implementing secure, role-specific access to different resources.

The application supports three primary roles:

* 👨‍💼 **Admin**
* 📚 **Librarian**
* 👨‍🎓 **Member**

Each role has specific permissions enforced through **JWT-based Role-Based Access Control (RBAC)**.

---

## 🎯 Objectives

The project was developed with the following objectives:

* Implement secure JWT-based authentication.
* Restrict API access according to user roles.
* Design a normalized SQL Server database.
* Develop reusable CRUD APIs.
* Implement server-side pagination.
* Validate incoming API requests.
* Automate overdue fine calculation.
* Process fine-related operations using database transactions.
* Notify members about overdue books and fines.
* Provide analytics dashboards using React.js.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │    Web Dashboard    │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST
                               ▼
                    ┌─────────────────────┐
                    │   ASP.NET Core API  │
                    │                     │
                    │ Authentication      │
                    │ Authorization       │
                    │ Validation          │
                    │ CRUD Operations     │
                    │ Business Logic      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     SQL Server      │
                    │                     │
                    │ Normalized Schema   │
                    │ Transactions        │
                    │ Fine Calculation    │
                    └─────────────────────┘
```

---

# 🔐 Authentication & Authorization

The application uses **JWT (JSON Web Token)** for secure authentication.

### Authentication Flow

```text
User Login
    │
    ▼
Credentials Validation
    │
    ▼
JWT Token Generated
    │
    ▼
Client Stores Token
    │
    ▼
Token Sent With API Requests
    │
    ▼
JWT Middleware Validates Token
    │
    ▼
Role-Based Authorization
    │
    ├── Admin
    ├── Librarian
    └── Member
```

JWT claims are used to identify the authenticated user and determine their role.

---

# 👥 Role-Based Access Control

The system implements role-specific API authorization.

| Role         | Responsibilities                                                    |
| ------------ | ------------------------------------------------------------------- |
| 👨‍💼 Admin  | Manage users, roles, books, and system-level operations             |
| 📚 Librarian | Manage books, borrowing activities, members, and fines              |
| 👨‍🎓 Member | Browse books, borrow books, view borrowing history, and check fines |

Authorization is enforced at the API level so that users cannot access resources outside their assigned permissions.

Example:

```csharp
[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteBook(int id)
{
    // Delete operation
}
```

---

# 🗄️ Database Design

The system uses **Microsoft SQL Server** with a normalized relational database design.

The database was designed to minimize:

* Data redundancy
* Update anomalies
* Inconsistent records
* Unnecessary duplication

### Major Entities

```text
Users
  │
  └── Roles

Books
  │
  └── Categories

Members
  │
  └── Borrowing Records
          │
          ├── Borrow Date
          ├── Due Date
          ├── Return Date
          └── Fine

Fines
  │
  └── Fine Transactions
```

The schema separates entities into appropriate relational tables and uses keys and relationships to maintain data integrity.

---

# 🔄 CRUD API Development

RESTful APIs were developed for core library operations.

### Example API Structure

```http
GET    /api/books
GET    /api/books/{id}
POST   /api/books
PUT    /api/books/{id}
DELETE /api/books/{id}
```

Similar CRUD operations can be provided for:

* Users
* Members
* Books
* Categories
* Borrowing records
* Fines

---

# 📄 Server-Side Pagination

For large datasets, the application implements **server-side pagination** rather than returning every record in a single response.

Example:

```http
GET /api/books?pageNumber=1&pageSize=10
```

Conceptually:

```text
Client
  │
  │ pageNumber=2
  │ pageSize=10
  ▼
ASP.NET Core API
  │
  ▼
SQL Server
  │
  │ Return only requested records
  ▼
Paginated Response
```

This reduces unnecessary data transfer and improves API performance as the dataset grows.

---

# ✅ Server-Side Validation

Incoming API requests are validated on the server before business operations are performed.

Validation helps prevent:

* Invalid book records
* Missing required fields
* Invalid user information
* Incorrect borrowing information
* Invalid fine-related data

This ensures that API consumers cannot bypass business rules simply by modifying frontend requests.

---

# 💰 Automated Overdue Fine Calculation

The system automatically calculates fines when borrowed books become overdue.

Example:

```text
Book Due Date
      │
      ▼
Compare with Current Date
      │
      ├── Not overdue
      │       │
      │       └── No fine
      │
      └── Overdue
              │
              ▼
       Calculate Overdue Days
              │
              ▼
       Calculate Fine Amount
              │
              ▼
       Store Fine Information
```

Example calculation:

```text
Fine = Overdue Days × Fine Rate
```

This reduces manual calculation and ensures consistent fine processing.

---

# 🔒 Database Transactions

Database transactions are used for operations where multiple database changes need to succeed or fail together.

Example:

```text
Return Book
     │
     ├── Update Borrowing Record
     │
     ├── Update Book Availability
     │
     └── Create/Update Fine
             │
             ▼
        Transaction Commit
```

If an operation fails:

```text
Transaction
     │
     ▼
Rollback
     │
     ▼
Database remains consistent
```

This helps maintain **atomicity and data consistency** during critical library operations.

---

# 🔔 Overdue Notifications

The system supports notifications related to overdue books and outstanding fines.

Example workflow:

```text
Book Becomes Overdue
        │
        ▼
Overdue Status Detected
        │
        ▼
Fine Calculated
        │
        ▼
Member Notification
        │
        ▼
Member Can View Outstanding Fine
```

---

# 📊 Analytics Dashboard

A **React.js analytics dashboard** provides a visual representation of library data.

Potential dashboard metrics include:

* 📚 Total books
* 👥 Total members
* 📖 Borrowed books
* 🔄 Returned books
* ⏰ Overdue books
* 💰 Outstanding fines
* 📈 Borrowing trends

Example:

```text
┌───────────────────────────────────────────┐
│          LIBRARY ANALYTICS                │
├───────────┬───────────┬───────────────────┤
│ Books     │ Members   │ Borrowed          │
│   1250    │    420    │    186            │
├───────────┼───────────┼───────────────────┤
│ Overdue   │ Fines     │ Returned          │
│    24     │  $320     │    950            │
└───────────┴───────────┴───────────────────┘
```

---

# 🧩 Core Modules

### 🔐 Authentication Module

* User registration/login
* JWT token generation
* Token validation
* Role identification

### 👨‍💼 Admin Module

* User management
* Role management
* Book management
* System-level operations

### 📚 Librarian Module

* Add/update/remove books
* Manage borrowing records
* Manage members
* Monitor overdue books
* Manage fines

### 👨‍🎓 Member Module

* Browse available books
* Borrow books
* View borrowing history
* View due dates
* View overdue fines

### 💰 Fine Management

* Overdue detection
* Fine calculation
* Fine records
* Overdue notifications

### 📊 Analytics

* Library statistics
* Borrowing trends
* Overdue analysis
* Fine statistics

---

# 🛡️ Security Features

The application implements several security practices:

* 🔑 JWT-based authentication
* 👥 Role-Based Access Control
* 🔒 Protected API endpoints
* ✅ Server-side validation
* 🛡️ Authorization checks
* 🔐 Secure handling of authenticated requests
* 🗄️ Transaction-based database operations

---

# 🛠️ Technology Stack

## Backend

| Technology           | Purpose              |
| -------------------- | -------------------- |
| C#                   | Programming Language |
| ASP.NET Core Web API | Backend/API          |
| JWT                  | Authentication       |
| RBAC                 | Authorization        |
| REST                 | API Architecture     |

## Database

| Technology            | Purpose             |
| --------------------- | ------------------- |
| Microsoft SQL Server  | Relational Database |
| SQL                   | Data Management     |
| Database Transactions | Data Consistency    |
| Normalized Schema     | Data Integrity      |

## Frontend

| Technology           | Purpose               |
| -------------------- | --------------------- |
| React.js             | User Interface        |
| JavaScript           | Frontend Logic        |
| REST APIs            | Backend Communication |
| Dashboard Components | Analytics             |

---

# 📂 Project Structure

```text
LibraryManagementSystem/
│
├── Backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   ├── DTOs/
│   ├── Repositories/
│   ├── Middleware/
│   └── Program.cs
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── dashboard/
│   │
│   └── package.json
│
├── Database/
│   ├── Tables/
│   ├── Procedures/
│   └── Scripts/
│
└── README.md
```

> Adjust the folder structure above to match the actual repository structure.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* .NET SDK
* SQL Server
* SQL Server Management Studio
* Node.js
* npm
* Git

---

## 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd LibraryManagementSystem
```

---

## 2️⃣ Configure Database

Create the SQL Server database and execute the required database scripts.

Update the backend connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=LibraryManagementSystem;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

---

## 3️⃣ Run Backend

```bash
cd Backend
dotnet restore
dotnet build
dotnet run
```

The API will start on the configured ASP.NET Core port.

---

## 4️⃣ Run Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

# 📡 API Design

The backend follows RESTful API conventions.

Example:

```text
/api/auth
/api/books
/api/members
/api/users
/api/borrowings
/api/fines
/api/categories
/api/analytics
```

Example request:

```http
GET /api/books?pageNumber=1&pageSize=10
Authorization: Bearer <JWT_TOKEN>
```

---

# 🧠 Engineering Practices

This project provided practical experience with:

* RESTful API development
* JWT authentication
* Role-Based Access Control
* ASP.NET Core Web API
* SQL Server database design
* Database normalization
* CRUD operations
* Server-side pagination
* Server-side validation
* Database transactions
* Automated business logic
* React.js frontend development
* Analytics dashboard development
* API security
* Separation of application responsibilities

---

# 📌 Key Learning Outcomes

Through this project, I gained hands-on experience in designing and developing a full-stack application while focusing on **secure backend development and relational database design**.

The project strengthened my understanding of:

```text
Authentication
      ↓
Authorization
      ↓
API Design
      ↓
Business Logic
      ↓
Database Design
      ↓
Transactions
      ↓
Frontend Integration
      ↓
Analytics
```

---

# 🔮 Future Improvements

Potential future improvements include:

* [ ] Email/SMS notification integration
* [ ] Advanced reporting
* [ ] Book recommendation system
* [ ] Fine payment gateway integration
* [ ] Audit logging
* [ ] Automated background jobs
* [ ] Docker containerization
* [ ] Automated testing
* [ ] CI/CD pipeline
* [ ] API documentation with Swagger/OpenAPI

---

# 👨‍💻 Project Information

**Project:** Library Management System
**Type:** Academic Project
**Duration:** August 2025 – December 2025
**Backend:** ASP.NET Core Web API
**Frontend:** React.js
**Database:** Microsoft SQL Server
**Authentication:** JWT
**Authorization:** RBAC

---

<div align="center">

### 📚 Building secure and reliable systems, one API at a time.

⭐ If you find this project interesting, consider giving the repository a star!

</div>
