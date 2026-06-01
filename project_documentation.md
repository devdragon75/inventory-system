# Ethara Inventory & Order Management System

## Overview

The Ethara Inventory System is a full-stack web application designed for comprehensive inventory tracking, order management, and customer relations. Built with modern "Clean Code" and SOLID design principles, this system provides a highly maintainable, scalable, and responsive architecture suitable for growing business needs.

## Architecture & Technology Stack

### **Backend**
The backend is a high-performance REST API built with Python, emphasizing asynchronous execution and strict data typing.
- **Framework:** FastAPI
- **Language:** Python 3.x
- **Database ORM:** SQLAlchemy (Async)
- **Data Validation:** Pydantic
- **Database Engine:** SQLite (configured for async operations, easily swappable for PostgreSQL in production)

### **Frontend**
The frontend is a modern Single Page Application (SPA) utilizing component-driven architecture for rapid development and high reusability.
- **Framework:** React.js (via Vite)
- **Routing:** React Router v6
- **Styling:** Vanilla CSS with custom modern aesthetics, glassmorphism, and responsive design
- **Icons:** `react-icons` (Feather Icons pack)
- **Data Visualization:** `recharts`

---

## Backend Design Patterns

The backend strictly adheres to a **Layered Architecture** and **SOLID Principles** to ensure a clean separation of concerns:

1. **Router Layer (`router.py`)**: 
   Responsible solely for handling HTTP requests and routing them to the appropriate service. It validates incoming JSON payloads against Pydantic schemas and serializes the outgoing responses.

2. **Service Layer (`service.py`)**: 
   Contains the core business logic. This layer was recently refactored to strictly adhere to the **Single Responsibility Principle (SRP)**. For example, order creation was decomposed from a massive monolithic function into smaller helper methods:
   - `_validate_customer(customer_id)`
   - `_aggregate_item_quantities(items)`
   - `_validate_inventory_and_calculate_total(aggregated_items)`
   - `_update_inventory_and_create_order(customer_id, validated_items, total_amount)`

3. **Repository Layer (`repository.py`)**:
   Responsible solely for database operations. It abstracts away SQL-level logic (e.g., executing `SELECT`, `INSERT`, `UPDATE` queries) from the business logic layer.

4. **Schema Layer (`schemas.py`)**:
   Pydantic models act as strict contracts for data passing through the API. Includes validations (e.g., regex for emails, non-negative constraints for prices/quantities).

5. **Model Layer (`models.py`)**:
   SQLAlchemy ORM models defining the database schema, relationships, and referential integrity constraints.

---

## Frontend Component Architecture

The React frontend utilizes a modular component architecture. The application recently underwent a major refactoring to remove "Large Component" code smells. 

### **Key Components:**
- `Dashboard.jsx`: The central hub providing at-a-glance metrics (Total Products, Revenue, Low Stock warnings) and visual data via charts.
- `Products.jsx` & `Customers.jsx`: Dedicated views for managing entities, featuring real-time client-side search and filtering capabilities.
- `Orders.jsx`: Refactored to act as an orchestrator for child components, managing state and API interactions for the order lifecycle.
  - `OrderForm.jsx`: A dedicated subcomponent that solely handles the complex logic of multi-item form state, validation, and dynamic row addition.
  - `OrderDetailsModal.jsx`: A dedicated stateless presentation component for rendering the popup invoice/order summary.

---

## Database Schema

The database relies on a relational structure with the following core entities:

### `products`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PK | Primary Key |
| name | String | Not Null | Product Name |
| sku | String | Unique, Index | Stock Keeping Unit identifier |
| price | Float | Not Null, >= 0 | Product Price |
| quantity | Integer | Not Null, >= 0| Current Stock Level |

### `customers`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PK | Primary Key |
| name | String | Not Null | Customer Name |
| email | String | Unique, Index | Validated Email Address |
| phone | String | Nullable | Contact Number |

### `orders`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PK | Primary Key |
| customer_id | Integer | FK | References `customers.id` (CASCADE DELETE) |
| total_amount | Float | Not Null | Computed total price of the order |
| created_at | DateTime | Default UTC | Order timestamp |

### `order_items`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PK | Primary Key |
| order_id | Integer | FK | References `orders.id` (CASCADE DELETE) |
| product_id | Integer | FK | References `products.id` |
| quantity | Integer | Not Null | Amount of product ordered |

---

## API Endpoints Reference

### **Products**
- `GET /products`: Retrieve a list of all products (supports pagination `skip`, `limit`).
- `POST /products`: Create a new product.
- `GET /products/{id}`: Retrieve a specific product.
- `PUT /products/{id}`: Update an existing product.
- `DELETE /products/{id}`: Remove a product from inventory.

### **Customers**
- `GET /customers`: Retrieve a list of all customers.
- `POST /customers`: Register a new customer.
- `GET /customers/{id}`: Retrieve a specific customer.
- `DELETE /customers/{id}`: Delete a customer (automatically cascades to delete their associated orders).

### **Orders**
- `GET /orders`: Retrieve order history.
- `POST /orders`: Process a new order. **(Transactional)** - Automatically deducts product quantities from inventory. If any item is out of stock, the entire transaction rolls back.
- `GET /orders/{id}`: Retrieve details of a specific order.
- `DELETE /orders/{id}`: Cancel an order. **(Transactional)** - Automatically restores the product quantities back to the inventory.

### **Dashboard**
- `GET /summary`: Aggregated endpoint providing totals (revenue, product counts, customer counts) and low-stock alerts in a single efficient database query for the frontend dashboard.

---

## Future Roadmap & Technical Debt

While the system is robust, the following areas are flagged for future enhancement:
1. **Authentication & Authorization**: Currently missing. Implementing JWT-based auth via FastAPI middleware is required for a secure production environment.
2. **Database Concurrency**: The `create_order` process requires `SELECT ... FOR UPDATE` (row-level locking) implementation in `repository.py` to prevent race conditions when multiple concurrent users attempt to buy the last remaining stock of a product.
3. **Backend Pagination/Filtering**: As the database grows, the frontend client-side filtering (currently implemented via JavaScript array filtering) will become a bottleneck. Pagination, search, and filtering logic should be shifted to SQLAlchemy queries.
4. **Unit Testing**: Introduce `pytest` for backend services, specifically targeting the newly decoupled, granular logic within `InventoryService`.
