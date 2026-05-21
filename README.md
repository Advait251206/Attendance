# 📊 Attendance — Full-Stack Attendance & Analytics Ecosystem

### *Production-Ready Enterprise Dashboard & FastAPI System*

---

<div align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI_&_SQLAlchemy-009688?style=for-the-badge&logo=fastapi" alt="FastAPI Badge" />
  <img src="https://img.shields.io/badge/Frontend-React_&_Tailwind-61DAFB?style=for-the-badge&logo=react" alt="React Badge" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_&_SQLite-4169E1?style=for-the-badge&logo=postgresql" alt="Database Badge" />
  <img src="https://img.shields.io/badge/Deployment-Vercel_Serverless-000000?style=for-the-badge&logo=vercel" alt="Vercel Badge" />
</div>

---

> 🚀 **An intelligent, enterprise-grade full-stack attendance administration hub.**  
> *Combining a highly secure, high-performance FastAPI service engine with a beautiful, responsive React dashboard, this platform enables organizations to track attendance logs, analyze absentees, and visualize structural trends in real time.*

---

## ⚡ Core Feature Modules

### 📈 1. Interactive Analytics Dashboard (React + Chart.js)
* **Real-Time Data Viz:** Displays comprehensive statistics, attendance margins, and monthly variations using **Chart.js** (`react-chartjs-2`).
* **Visual Transitions:** Provides fluid transitions and responsive card components powered by **Framer Motion** and **Tailwind CSS**.
* **Detailed Logs:** Lets managers view historical records, export logs, and track individual attendance levels dynamically.

### 🛡️ 2. Type-Safe Backend Service (FastAPI)
* **API Specifications:** Engineered with type-safe, asynchronous REST APIs built on **FastAPI**.
* **ORM Architecture:** Utilizes **SQLAlchemy** to interface cleanly with both development SQLite data and production PostgreSQL systems.
* **Database Migrations:** Configured with **Alembic** to safely apply database schema updates.

### 🔐 3. Robust Authentication Security
* **JWT Protocol:** Fully secure login and registration utilizing JSON Web Tokens via **python-jose**.
* **Password Encryption:** Ensures absolute credential security via **passlib[bcrypt]** hashing.
* **Access Scopes:** Restricts administrative controls, protecting log integrity and student records.

### 🌐 4. Cloud Native Serverless Deployments
* **Unified Vercel Orchestration:** Ready-to-go `vercel.json` routing configuration to deploy both client applications and REST API workers serverlessly under a unified origin.

---

## 🛠️ Tech Stack Architecture

### **Frontend Client** ⚛️
* **Library:** React (Create React App structure)
* **Styling Framework:** Tailwind CSS (Modern Glassmorphic styling tokens)
* **Animation Layer:** Framer Motion
* **Analytics Engine:** Chart.js & React-Chartjs-2
* **Icons:** Heroicons React

### **Backend Server** 🐍
* **Framework:** FastAPI
* **Local Web Server:** Uvicorn
* **Database Driver:** SQLAlchemy + Psycopg2 (PostgreSQL) + SQLite
* **Migrations Manager:** Alembic
* **Authentication Gateway:** Python-Jose & Passlib (Bcrypt)

---

## 🚀 Local Installation & Quick Start

Run both frontend and backend sub-services on your environment by executing the following steps:

### **Prerequisites**
* **Node.js** (v16 or higher)
* **Python 3.9** or higher installed.

---

### **1. Clone the Workspace**
Clone the repository and enter the directory:
```bash
git clone https://github.com/Advait251206/Attendance.git
cd Attendance
```

### **2. Set Up the Backend Server**
Establish a Python virtual environment and run the FastAPI server:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate     # On Windows
# source venv/bin/activate       # On Linux/macOS

# Install requirements
pip install -r requirements.txt

# Run the local database migrations (optional if launching sqlite automatically)
# alembic upgrade head

# Launch the FastAPI app with Uvicorn
uvicorn backend.app.main:app --reload
```
* The backend API interactive docs will load at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### **3. Set Up the Frontend Client**
Open a new terminal window to build and run the React project:
```bash
# Enter the frontend folder
cd frontend

# Install package dependencies
npm install

# Run the local server
npm start
```
* The client web dashboard will launch automatically at: [http://localhost:3000](http://localhost:3000)

---

## 📁 Repository Structure

```
├── .gitignore        # Ignores local SQLite files, virtualenvs, and Node node_modules
├── README.md         # Full enterprise-grade project documentation (No flowcharts)
├── requirements.txt  # FastAPI backend dependencies
├── vercel.json       # Route configurations for unified serverless deployment
├── backend/          # FastAPI REST endpoints, SQLAlchemy models, and schemas
└── frontend/         # React client interface, Tailwind templates, and Framer Motion charts
```

---

<br>
<p align="center">
  <i>Developed with precision to streamline organizational administration and tracking 📊.</i>
</p>
