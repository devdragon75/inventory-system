# Ethara Inventory & Order Management System

Welcome to the **Ethara Inventory System**, a full-stack web application tailored for comprehensive inventory tracking, seamless order management, and robust customer relations.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

## ✨ Features
- **Dashboard Metrics**: At-a-glance visualization of total revenue, product count, and customers, alongside real-time low-stock alerts.
- **Product Management**: Real-time search, filtering, and CRUD operations for your catalog.
- **Customer Database**: Track customer details and contact information.
- **Order Processing**: Transactional order creation with automatic inventory deduction. Canceling an order automatically restores stock.
- **Responsive Design**: Modern glassmorphism aesthetics utilizing responsive `react-icons` and `recharts` for dynamic data presentation.

## 🏗 Architecture

This project is built using modern **Clean Code** and **SOLID design principles**, ensuring long-term maintainability.

- **Backend (Python / FastAPI)**: A high-performance async REST API. It strictly enforces a Layered Architecture separating routing, Pydantic schemas, business logic (Service Layer), and SQLAlchemy ORM database queries (Repository Layer).
- **Frontend (React / Vite)**: A Single Page Application (SPA) utilizing a highly modular, component-driven approach.

> 📖 **Deep Dive:** For a comprehensive explanation of the database schemas, design patterns, API endpoints, and technical debt, please see our detailed [Project Documentation](./project_documentation.md).

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.10+)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The backend API will run on `http://localhost:8000`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React frontend will be accessible via `http://localhost:5173`.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
