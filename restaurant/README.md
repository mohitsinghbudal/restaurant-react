# 📚 Library Management System

<div align="center">

<img src="https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
<img src="https://img.shields.io/badge/C%23-Backend-239120?style=for-the-badge&logo=csharp&logoColor=white" />
<img src="https://img.shields.io/badge/SQL%20Server-Database-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" />
<img src="https://img.shields.io/badge/React.js-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-Frontend-2496ED?style=for-the-badge&logo=docker&logoColor=white" />

<br/>

<a href="https://git.io/typing-svg">
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1000&color=512BD4&center=true&vCenter=true&width=850&lines=Library+Management+System;ASP.NET+Core+%7C+SQL+Server+%7C+React.js;JWT+%7C+RBAC+%7C+Pagination+%7C+Transactions;Dockerized+React+Frontend+%7C+Analytics+Dashboard" alt="Typing SVG" />
</a>

<br/>

**Secure • Role-Based • Data-Driven • Containerized**

</div>

---

## 📌 Overview

The **Library Management System** is a full-stack academic project developed from **August 2025 to December 2025**.

The system provides a centralized platform for managing library operations, including books, members, borrowing activities, overdue fines, notifications, and analytics.

The application implements **JWT-based authentication and Role-Based Access Control (RBAC)** for three primary roles:

* 👨‍💼 **Admin**
* 📚 **Librarian**
* 👨‍🎓 **Member**

The backend is developed using **ASP.NET Core Web API** with **SQL Server**, while the frontend is built with **React.js** and containerized using **Docker**.

---

# 🎯 Project Objectives

The main objectives of the project were to:

* 🔐 Implement JWT-based authentication.
* 👥 Implement role-specific API authorization.
* 🗄️ Design a normalized SQL Server database.
* 🔄 Develop RESTful CRUD APIs.
* 📄 Implement server-side pagination.
* ✅ Implement server-side validation.
* 💰 Automate overdue fine calculation.
* 🔒 Maintain data consistency using database transactions.
* 🔔 Provide overdue/fine notifications.
* 📊 Develop analytics dashboards using React.js.
* 🐳 Containerize the React frontend using Docker.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │       React.js           │
                         │     Analytics UI         │
                         │                         │
                         │   Docker Container       │
                         │        + Nginx            │
                         └────────────┬────────────┘
                                      │
                                      │ HTTP / REST
                                      ▼
                         ┌─────────────────────────┐
                         │    ASP.NET Core API     │
                         │                         │
                         │  Authentication         │
                         │  Authorization          │
                         │  CRUD Operations        │
                         │  Validation             │
                         │  Business Logic         │
                         │  Pagination             │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      SQL Server         │
                         │                         │
                         │  Normalized Schema      │
                         │  Transactions            │
                         │  Fine Data               │
                         │  Borrowing Records       │
                         └─────────────────────────┘
```

---

# 🔐 Authentication & Authorization

The application uses **JWT (JSON Web Token)** for authentication.

After successful login, the backend generates a JWT containing the authenticated user's information and role.

### Authentication Flow

```text
User
 │
 │ Login
 ▼
Authentication API
 │
 │ Validate Credentials
 ▼
JWT Token Generated
 │
 ▼
Client
 │
 │ Authorization: Bearer <token>
 ▼
ASP.NET Core API
 │
 ├── Validate JWT
 │
 ├── Identify User
 │
 ├── Check Role
 │
 └── Process Request
```

This provides **stateless authentication** between the client and backend API.

---

# 👥 Role-Based Access Control

The system implements **RBAC** to restrict API operations according to user roles.

| Role             | Responsibilities                                                   |
| ---------------- | ------------------------------------------------------------------ |
| 👨‍💼 **Admin**  | Manage users, roles, books, and administrative operations          |
| 📚 **Librarian** | Manage books, members, borrowing records, returns, and fines       |
| 👨‍🎓 **Member** | Browse books, borrow books, view borrowing history, and view fines |

Example protected endpoint:

```csharp
[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteBook(int id)
{
    // Delete book
}
```

Role authorization is enforced on the **backend**, ensuring that frontend restrictions cannot simply be bypassed by directly calling the API.

---

# 🗄️ Database Design

The application uses **Microsoft SQL Server** with a normalized relational database schema.

The database design focuses on:

* Reducing data redundancy
* Maintaining referential integrity
* Separating entities appropriately
* Avoiding update anomalies
* Maintaining consistent relationships

### Core Entities

```text
Users
 │
 └── Roles

Books
 │
 ├── Categories
 │
 └── Borrowing Records
          │
          ├── Borrow Date
          ├── Due Date
          ├── Return Date
          └── Fine

Members
 │
 └── Borrowing History

Fines
 │
 └── Fine Records
```

---

# 🔄 CRUD APIs

The backend exposes RESTful CRUD APIs for the major library resources.

### Example

```http
GET    /api/books
GET    /api/books/{id}
POST   /api/books
PUT    /api/books/{id}
DELETE /api/books/{id}
```

CRUD functionality is implemented for relevant resources such as:

* 📚 Books
* 👥 Members
* 👨‍💼 Users
* 🏷️ Categories
* 📖 Borrowing records
* 💰 Fines

---

# 📄 Server-Side Pagination

The API implements **server-side pagination** for large datasets.

Instead of returning the entire collection, the API retrieves only the requested page.

Example:

```http
GET /api/books?pageNumber=1&pageSize=10
```

### Pagination Flow

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
 │ Fetch requested records
 ▼
Paginated Response
 │
 ▼
Client
```

This reduces unnecessary data transfer and allows the API to handle larger datasets more efficiently.

---

# ✅ Server-Side Validation

The backend validates incoming requests before processing them.

Validation is applied to ensure that invalid data does not reach the business or database layer.

Examples include:

* Required fields
* Valid book information
* Valid member information
* Valid borrowing data
* Valid fine-related data
* Request model validation

This ensures that validation cannot be bypassed simply by sending requests directly to the API.

---

# 💰 Automated Overdue Fine Calculation

The system automates the calculation of overdue fines for borrowed books.

### Fine Workflow

```text
Book Borrowed
      │
      ▼
Due Date Assigned
      │
      ▼
Book Returned?
      │
 ┌────┴────┐
 │         │
Yes        No
 │         │
 ▼         ▼
No Fine   Check Due Date
            │
            ▼
       Book Overdue?
            │
            ▼
       Calculate Days
            │
            ▼
       Calculate Fine
            │
            ▼
       Store Fine
```

Example calculation:

```text
Fine Amount = Overdue Days × Fine Rate
```

Automating this process reduces manual calculation and keeps fine records consistent.

---

# 🔒 Database Transactions

Database transactions are used for operations where multiple related database changes need to be treated as a single unit.

For example, returning a book may involve:

```text
BEGIN TRANSACTION
       │
       ├── Update borrowing record
       │
       ├── Update book availability
       │
       ├── Calculate overdue fine
       │
       └── Store fine record
       │
       ▼
COMMIT TRANSACTION
```

If any critical operation fails:

```text
ROLLBACK TRANSACTION
        │
        ▼
Database remains consistent
```

This provides **atomicity and consistency** for critical library workflows.

---

# 🔔 Overdue Notifications

The system supports notifications related to overdue books and outstanding fines.

Example workflow:

```text
Book Becomes Overdue
        │
        ▼
Overdue Detected
        │
        ▼
Fine Calculated
        │
        ▼
Notification Generated
        │
        ▼
Member Notified
```

Members can then view their overdue information and outstanding fines through the application.

---

# 📊 Analytics Dashboard

The frontend includes an **analytics dashboard developed using React.js**.

The dashboard provides a visual overview of library operations.

### Example Metrics

* 📚 Total Books
* 👥 Total Members
* 📖 Borrowed Books
* 🔄 Returned Books
* ⏰ Overdue Books
* 💰 Outstanding Fines
* 📈 Borrowing Statistics

Example:

```text
┌─────────────────────────────────────────────┐
│              LIBRARY ANALYTICS              │
├──────────────┬──────────────┬───────────────┤
│ Total Books  │   Members    │   Borrowed    │
│     1250     │      420     │      186      │
├──────────────┼──────────────┼───────────────┤
│   Overdue    │    Fines     │   Returned    │
│      24      │     320      │      950      │
└──────────────┴──────────────┴───────────────┘
```

---

# 🐳 Dockerized React Frontend

The **React.js frontend is containerized using Docker** to provide a consistent and portable deployment environment.

The frontend is built into a production-ready application and served through **Nginx** inside the Docker container.

### Docker Workflow

```text
React Source Code
       │
       ▼
Docker Build
       │
       ▼
React Production Build
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

### Build the Frontend Image

Navigate to the frontend directory:

```bash
cd Frontend
```

Build the Docker image:

```bash
docker build -t library-management-frontend .
```

### Run the Container

```bash
docker run -d -p 3000:80 --name library-frontend library-management-frontend
```

The frontend will then be available at:

```text
http://localhost:3000
```

### Check Running Containers

```bash
docker ps
```

### Stop the Container

```bash
docker stop library-frontend
```

### Remove the Container

```bash
docker rm library-frontend
```

---

# 📦 Project Structure

```text
LibraryManagementSystem/
│
├── .gitignore
├── README.md
│
├── Backend/
│   │
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Models/
│   ├── DTOs/
│   ├── Middleware/
│   └── Program.cs
│
├── Frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── dashboard/
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── Database/
    │
    ├── Tables/
    ├── Procedures/
    └── Scripts/
```

> Update the folder names above if your actual repository structure differs.

---

# 🧩 Core Modules

## 🔐 Authentication

* User login
* JWT token generation
* JWT validation
* Role identification
* Protected endpoints

## 👨‍💼 Admin

* User management
* Role management
* Book management
* Administrative operations

## 📚 Librarian

* Book management
* Member management
* Borrowing management
* Return processing
* Fine management
* Overdue monitoring

## 👨‍🎓 Member

* Browse available books
* Borrow books
* View borrowing history
* View due dates
* View overdue fines

## 💰 Fine Management

* Overdue detection
* Fine calculation
* Fine records
* Overdue notifications

## 📊 Analytics

* Library statistics
* Borrowing statistics
* Overdue statistics
* Fine statistics
* Dashboard visualization

---

# 🛡️ Security Features

The application implements:

* 🔑 JWT-based authentication
* 👥 Role-Based Access Control
* 🔒 Protected API endpoints
* ✅ Server-side validation
* 🛡️ Role-specific authorization
* 🔐 Secure authenticated API requests

---

# 🛠️ Technology Stack

| Category             | Technology                 |
| -------------------- | -------------------------- |
| Programming Language | **C#**                     |
| Backend Framework    | **ASP.NET Core Web API**   |
| Frontend             | **React.js**               |
| Database             | **Microsoft SQL Server**   |
| Authentication       | **JWT**                    |
| Authorization        | **RBAC**                   |
| API Architecture     | **RESTful APIs**           |
| Validation           | **Server-Side Validation** |
| Pagination           | **Server-Side Pagination** |
| Data Integrity       | **Database Transactions**  |
| Containerization     | **Docker**                 |
| Frontend Server      | **Nginx**                  |

---

# 🚀 Getting Started

## Prerequisites

Install the following:

* .NET SDK
* SQL Server
* SQL Server Management Studio
* Node.js
* npm
* Docker
* Git

Verify installations:

```bash
dotnet --version
node --version
npm --version
docker --version
```

---

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>

cd LibraryManagementSystem
```

---

## 2️⃣ Configure SQL Server

Create the required SQL Server database and execute the database scripts.

Configure the backend connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=LibraryManagementSystem;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

⚠️ **Never commit production database credentials to GitHub.**

---

## 3️⃣ Configure JWT

Configure the JWT settings required by the backend:

```json
{
  "Jwt": {
    "Key": "YOUR_DEVELOPMENT_SECRET",
    "Issuer": "YOUR_ISSUER",
    "Audience": "YOUR_AUDIENCE"
  }
}
```

For production environments, use secure environment variables or a secrets manager.

---

## 4️⃣ Run the Backend

```bash
cd Backend

dotnet restore
dotnet build
dotnet run
```

The ASP.NET Core API will start using the configured HTTP/HTTPS ports.

---

## 5️⃣ Run the Frontend with Docker

Navigate to the frontend:

```bash
cd Frontend
```

Build the image:

```bash
docker build -t library-management-frontend .
```

Run the container:

```bash
docker run -d -p 3000:80 --name library-frontend library-management-frontend
```

Open:

```text
http://localhost:3000
```

---

# 📡 API Examples

Example API endpoints:

```http
# Authentication
POST /api/auth/login

# Books
GET    /api/books
GET    /api/books/{id}
POST   /api/books
PUT    /api/books/{id}
DELETE /api/books/{id}

# Members
GET    /api/members
GET    /api/members/{id}

# Borrowing
POST   /api/borrowings
GET    /api/borrowings
PUT    /api/borrowings/{id}/return

# Fines
GET    /api/fines
GET    /api/fines/{id}

# Analytics
GET    /api/analytics
```

> Update these routes according to the actual endpoints implemented in the repository.

---

# 🧠 Engineering Practices

This project provided practical experience with:

* RESTful API development
* ASP.NET Core Web API
* JWT authentication
* Role-Based Access Control
* SQL Server database design
* Database normalization
* CRUD operations
* Server-side pagination
* Server-side validation
* Database transactions
* Automated business logic
* React.js development
* Analytics dashboard development
* Docker containerization
* Nginx-based frontend serving
* Secure API design
* Separation of application responsibilities

---

# 📈 Key Learning Outcomes

The project strengthened practical understanding of full-stack application development:

```text
Authentication
       ↓
Authorization
       ↓
REST API Design
       ↓
Validation
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
       ↓
Docker Deployment
```

The project provided hands-on experience connecting a **React.js frontend** with a secure **ASP.NET Core Web API**, while maintaining relational data integrity through **SQL Server** and database transactions.

---

# 🔮 Future Improvements

Potential future enhancements include:

* [ ] Email/SMS notification integration
* [ ] Automated background jobs
* [ ] Advanced analytics and reporting
* [ ] Audit logging
* [ ] Automated unit and integration testing
* [ ] Docker Compose for multi-container deployment
* [ ] CI/CD pipeline
* [ ] Production monitoring and logging
* [ ] Cloud deployment
* [ ] Advanced book recommendation functionality

---

# 📄 Project Information

| Detail               | Information                 |
| -------------------- | --------------------------- |
| **Project**          | Library Management System   |
| **Type**             | Academic Project            |
| **Duration**         | August 2025 – December 2025 |
| **Backend**          | ASP.NET Core Web API        |
| **Frontend**         | React.js                    |
| **Database**         | Microsoft SQL Server        |
| **Authentication**   | JWT                         |
| **Authorization**    | RBAC                        |
| **Containerization** | Docker                      |
| **Frontend Server**  | Nginx                       |

---

<div align="center">

### 📚 Secure Library Management • Modern APIs • Containerized Frontend

**ASP.NET Core • C# • SQL Server • React.js • JWT • RBAC • Docker**

⭐ **If you find this project useful, consider giving the repository a star!**

</div>
