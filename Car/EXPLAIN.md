# PROJECT ARCHITECTURE & EXPLANATION (EXPLAIN FILE)

This document provides a comprehensive overview of the Car Showroom & Management System architecture, directory structure, and setup instructions.

---

## 1. System Architecture Details

The system implements a **Decoupled Client-Server Architecture** utilizing a **RESTful Web Service** pattern. This separation of concerns ensures that the frontend (Client) and backend (Server) operate as independent entities, communicating over standard HTTP/HTTPS protocols using JSON (JavaScript Object Notation).

### Architectural Patterns
*   **Client-Side (Frontend - SPA):** Built as a **Single Page Application (SPA)** using React. It follows a **Component-Based Architecture**, where the user interface is a composition of modular, stateful components. Data flow is managed via a **Unidirectional Data Flow** pattern (Redux), ensuring predictable state transitions.
*   **Server-Side (Backend - REST API):** Powered by Django and Django REST Framework (DRF). While Django traditionally follows the **MVT (Model-View-Template)** pattern, this system adapts it for a decoupled environment:
    *   **Model:** Handles the data structure and database logic (ORM).
    *   **View (Controller):** Handles the request/response logic and business rules.
    *   **Serializer (The "T" Replacement):** Instead of HTML templates, Serializers transform complex ORM data into JSON for the client.
*   **Database Layer (RDBMS):** Utilizes a **Relational Database Management System** (MySQL running on MAMP) to maintain strict data integrity and relational mapping.

### Architecture Comparison
The project utilizes a standard Django/DRF flow, which optimizes development speed by leveraging the powerful built-in features of the Django ORM and ViewSets. Below is a comparison between a traditional "Clean Architecture" (using Service/Repository layers) and the actual flow implemented in this system:

| Clean Architecture (Service/Repository) | Actual System Flow (DRF Standard) |
| :--- | :--- |
| **View** (Request handling) | **View (ViewSet)** (Request handling & Logic) |
| **Serializer** (Data format) | **Serializer** (Data format & Validation) |
| **Service** (Business logic) | *(Logic handled within the View/Serializer)* |
| **Repository** (DB access) | *(Handled directly by Django ORM)* |
| **Model** (Data structure) | **Model** (Data structure & Database) |

---

## 2. The Request Journey (Step-by-Step)

From the moment a user interacts with the UI until the response is rendered, the request undergoes the following lifecycle:

1.  **User Interaction (Trigger):** The user performs an action (e.g., clicking a "Book Service" button).
2.  **Event Handling (UI Logic):** React captures the event. An asynchronous handler function is invoked, preparing the necessary data payload.
3.  **HTTP Request Dispatch:** The **Axios** library constructs an HTTP request (e.g., `POST /api/v1/workshop/book/`). This includes the payload, Content-Type headers, and **JWT Authentication Tokens** stored in the client's memory or local storage.
4.  **Network Transmission:** The request travels over the network to the server's endpoint.
5.  **Middleware Processing:** Django receives the request. It passes through several **Middlewares**:
    *   **CORS Middleware:** Validates if the request origin is allowed.
    *   **Authentication Middleware:** Extracts the JWT token and identifies the user.
    *   **Security Middlewares:** Checks for common vulnerabilities.
6.  **URL Routing:** The **URL Dispatcher** matches the request path to the specific application ViewSet (e.g., `AppointmentViewSet`).
7.  **View Execution & Business Logic:** The matched view function is triggered. It interacts with the **Serializer** to validate the incoming data (Schema validation).
8.  **Database Interaction (ORM):** The view calls the **Model** layer. Django's ORM generates **SQL queries** to fetch or persist data (e.g., inserting a new appointment record).
9.  **Serialization:** Once the database operation is complete, the resulting Python objects are passed back to the Serializer, which converts them into a JSON string.
10. **HTTP Response:** The server sends back an HTTP Response (e.g., `201 Created`) containing the JSON data.
11. **Client-Side Resolution:** Axios receives the response. The logic layer updates the **Application State** (Redux or React State).
12. **UI Reconciliation (Re-render):** React's Virtual DOM detects the state change and efficiently updates only the affected parts of the real DOM, displaying the result to the user.

---

## 3. Frontend Map (React)

**Source Location:** `/frontend`

### Key Directories
- `src/pages/`: Contains all full-page components.
- `src/components/`: Reusable UI elements (buttons, cards, inputs).
- `src/layouts/`: Wrapper components for different sections (Admin vs Public).
- `src/routes/`: Route definitions and protection logic.
- `src/store/`: Redux slices and store configuration.

### Frontend Routes & Pages
Located in `src/App.jsx`, the main routes are:

#### Public Routes
- `/` -> `HomePage`
- `/catalog` -> `CarCatalog`
- `/cars/:id` -> `CarDetails`
- `/store` -> `StoreFront`
- `/store/part/:id` -> `PartDetails`
- `/workshop/track` -> `ServiceTracker`
- `/login` & `/register` -> Authentication pages

#### Protected User Routes (Requires Login)
- `/cart` -> `CartPage`
- `/workshop/book` -> `BookService`
- `/profile` -> `UserProfile`
- `/my-rentals` -> `MyRentals`
- `/my-purchases` -> `MyPurchases`

#### Admin Routes (Requires Admin/Manager Role)
- `/admin` -> `AdminDashboard`
- `/admin/inventory` -> `InventoryApp` (Cars management)
- `/admin/store` -> `ManageStore` (Parts/Accessories management)
- `/admin/workshop` -> `WorkshopDashboard`
- `/admin/users` -> `ClientRelations`

---

## 4. Backend Map (Django)

**Source Location:** `/backend`

### App Structure
The backend is divided into modular Django apps:
- `users`: Custom user model, authentication, and profiles.
- `cars`: Vehicle inventory, purchases, and rentals logic.
- `store`: Parts and accessories catalog, orders, and compatibility.
- `workshop`: Appointments, services, and work orders.
- `interactions`: User feedback, favorites, and reviews.
- `operations`: Financial tracking and system logs.
- `core`: Project configuration (`settings.py`, `urls.py`).

### Backend Routes (API v1)
Main entry point: `backend/core/urls.py`
- `api/v1/users/` -> User management
- `api/v1/cars/` -> Vehicles, Rentals, Purchases
- `api/v1/store/` -> Parts, Accessories, Orders
- `api/v1/workshop/` -> Appointments, Work Orders
- `api/v1/interactions/` -> Reviews, Favorites

### Back-end Functions (Views)
Functions/Classes that handle logic are located in `views.py` within each app:
- **Cars**: `backend/cars/views.py` (CarViewSet, RentalViewSet)
- **Store**: `backend/store/views.py` (PartViewSet, StoreOrderViewSet)
- **Users**: `backend/users/views.py` (Auth logic)

### Migrations
Each app has a `migrations/` folder tracking database schema changes:
- Path example: `backend/cars/migrations/`
- Run them using: `python manage.py migrate`

---

## 5. Setup & Running the Project

### Environment Requirements
- **Node.js** (v18+) & **npm/yarn**
- **Python** (v3.10+)
- **MAMP** (For local MySQL database)
- **Redis** (Optional, for Celery tasks)

### Running Front-end
1. Navigate to directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Access at: `http://localhost:5173`

### Running Back-end
1. Navigate to directory: `cd backend`
2. Create Virtual Environment: `python -m venv venv`
3. Activate Venv:
   - Mac/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run Migrations: `python manage.py migrate`
6. Start server: `python manage.py runserver`
7. Access API at: `http://localhost:8000/api/v1/`

### MySQL (MAMP) Configuration
The project is configured to connect to a local MySQL instance provided by MAMP:
- **Host**: `127.0.0.1`
- **Port**: `3306`
- **User/Pass**: `root`/`root`
- **Database Name**: `car_showroom`
- **Driver**: `PyMySQL` (configured in `core/__init__.py`)

---

## 6. Data Retrieval Guide

### How to fetch Data
All data is retrieved via HTTP GET requests to the backend API.

- **Cars**: `GET /api/v1/cars/`
  - Filters: `?is_for_sale=true`, `?make=Toyota`
- **Accessories**: `GET /api/v1/store/parts/?is_accessory=true`
- **Spare Parts**: `GET /api/v1/store/parts/?is_accessory=false`

### Images & Media
- **Storage**: Images are stored in `backend/media/` (e.g., `media/cars/` or `media/parts/`).
- **Serving**: In development, Django serves media via the `/media/` URL prefix.
- **Frontend Usage**: The API returns an `image_url` or `image` field. In the React code, prepend the backend base URL (e.g., `http://localhost:8000`) to the path if it's relative.

Example: If API returns `/media/cars/bmw.jpg`, the full URL is `http://localhost:8000/media/cars/bmw.jpg`.

---

## 7. Transferring to another Laptop
1. **Copy Files**: Transfer the entire project folder.
2. **Backend**: Follow "Running Back-end" steps (Step 2-5 are crucial as `venv` is not transferable).
3. **Frontend**: Follow "Running Front-end" steps (Step 2 is crucial as `node_modules` is not transferable).
4. **Database**: The system uses MySQL. You must export your database from MAMP (phpMyAdmin) on the old laptop and import it into MAMP on the new one.
