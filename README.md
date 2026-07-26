# 🏨 Grand Horizon - Hotel Management System

A modern, full-stack enterprise Hotel Management System built with **React 19**, **Vite**, **Redux Toolkit**, **Node.js**, **Express**, and **MongoDB**. Designed with role-based access control (RBAC), responsive mobile-friendly card grids, real-time room service tracking, and automated workflow management for guests, staff, managers, and administrators.

---

## 🌟 Key Features & Role Capabilities

### 👑 Administrator (`admin`)
- **Executive Analytics**: Real-time business metrics including estimated revenue (calculated from active reservations), total inventory counts, guest registration stats, and booking distributions.
- **User & Staff Management**: View, filter, and modify user roles across the platform (Customer, Employee, Manager, Admin).
- **Room Catalogue Control**: Create, update, and manage room pricing, image galleries, room numbers, and suite classifications.
- **System-Wide Booking Oversight**: Monitor all reservations with desktop table and mobile-friendly grid views.

### 👔 Hotel Manager (`manager`)
- **Reservation Workflow**: Process incoming stay requests (`pending` ➔ `accepted` ➔ `checked-in` ➔ `checked-out`).
- **Guest Profiles**: Detailed guest lookup modal showcasing customer booking history, stay details, and active requests.
- **Task Delegation**: Assign housekeeping, maintenance, and operational duties to specific employees with set priority levels (`low`, `medium`, `high`, `urgent`).
- **Room Maintenance Control**: Toggle room availability and occupancy states.

### 🧹 Hotel Staff / Employee (`employee`)
- **Duty Dashboard**: Personalized task board displaying assigned responsibilities, due dates, and priority badges.
- **Task Progress Tracking**: Update task lifecycle status (`pending` ➔ `in-progress` ➔ `completed`).
- **Room Service Fulfillment**: View and resolve live guest requests for dining, laundry, cleaning, and amenities.

### 🧳 Guest / Customer (`customer`)
- **Explore & Filter Rooms**: Paginated suite catalogue searchable by room class (Single, Double), availability status, and max night budget.
- **Room Details & Instant Reservation**: Interactive date pickers with automatic stay duration and price calculations.
- **In-Stay Room Service**: Request food/dining, laundry, cleaning, or towels directly from the guest portal during active stays.
- **Reservation Self-Service**: Track reservation status and cancel pending bookings.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 + Vite 6
- **State Management**: Redux Toolkit (`authSlice`, `roomSlice`)
- **Styling**: Tailwind CSS v4 (Glassmorphism, custom dark theme, HSL palette)
- **UI Components & Icons**: Lucide React, React Icons, MUI Material Pagination
- **Routing & Notifications**: React Router DOM v7, Sonner Toast

### **Backend**
- **Runtime & Server**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) stored via secure HTTP-Only Cookies, Bcryptjs password hashing
- **Input Validation & Security**: Validator.js, CORS, Cookie Parser

---

## 📁 Project Structure

```
Hotel Management System/
├── backend/
│   ├── config/          # Database configuration (MongoDB connection)
│   ├── controllers/     # Business logic (admin, auth, booking, room, task)
│   ├── middleware/      # Auth & RBAC middlewares (isAuthenticated, restrictTo)
│   ├── models/          # Mongoose Schemas (User, Room, Booking, Task)
│   ├── routes/          # Express route definitions
│   ├── index.js         # Backend entry point & Express app setup
│   └── package.json
│
├── frontend/
│   ├── public/          # Static assets & favicon
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── pages/       # Dashboard & views (Home, Rooms, Dashboards, Auth)
│   │   ├── store/       # Redux Toolkit store & slices (authSlice, roomSlice)
│   │   ├── utils/       # Axios API client setup with cookie support
│   │   ├── App.jsx      # Main application router
│   │   └── main.jsx     # Frontend entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md            # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **pnpm** or **npm**
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hotel_management
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Start the backend development server:

```bash
npm run dev
```
The API server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the Vite frontend development server:

```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register new customer account |
| `POST` | `/login` | Public | User authentication & JWT cookie issuance |
| `GET` | `/me` | Authenticated | Get current authenticated user session |
| `POST` | `/logout` | Authenticated | Clear session cookie |

### Rooms (`/api/rooms`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | List rooms with pagination & filters |
| `GET` | `/top-featured` | Public | Fetch top featured rooms for landing page |
| `GET` | `/:id` | Public | Fetch single room specifications |
| `POST` | `/` | Admin / Manager | Create new room listing |
| `PUT` | `/:id` | Admin / Manager | Update room details |
| `DELETE` | `/:id` | Admin | Delete room listing |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Customer | Create stay reservation |
| `GET` | `/my-bookings` | Customer | Fetch current customer booking history |
| `POST` | `/:id/room-service` | Customer | Request in-stay room service |
| `GET` | `/` | Staff / Admin | Get all hotel bookings |
| `PUT` | `/:id/status` | Staff / Admin / Customer | Update reservation status |
| `PUT` | `/:id/room-service/:reqId` | Staff / Admin | Fulfill room service request |

### Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Manager / Admin | Delegate new task to employee |
| `GET` | `/my-tasks` | Employee | Fetch tasks assigned to logged-in employee |
| `GET` | `/` | Manager / Admin | View all staff task assignments |
| `PUT` | `/:id/status` | Employee / Manager | Update task progress status |

### Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin | System business metrics & revenue analytics |
| `GET` | `/users` | Admin / Manager | Fetch registered user list by role |
| `PUT` | `/users/:id/role` | Admin | Promote/demote user account roles |

---

## 🎨 Design System & Highlights
- **Responsive Architecture**: Legacy scrollable tables adapt seamlessly into card-based grid layouts on mobile viewports.
- **Glassmorphism Theme**: Dark slate aesthetics with amber accent highlights, smooth CSS transitions, and backdrop blur panels.
- **State Persistence**: Cookie-backed authentication state paired with Redux Toolkit for seamless session maintenance across page reloads.
