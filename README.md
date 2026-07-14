# Airbnb Clone

A full-stack Airbnb-inspired web application that allows users to discover, book, and manage accommodation listings. The project includes a customer-facing booking platform and a dedicated host dashboard for managing properties, providing a complete property rental experience.

## Features

### Customer
- Secure user authentication
- Browse available listings
- Search and view property details
- View property images and amenities
- Make bookings
- View booking history
- Responsive design for desktop and mobile

### Host
- Host authentication
- Dedicated host dashboard
- Create new property listings
- Upload property images
- Edit existing listings
- Delete listings
- Manage property details, pricing, and availability

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Multer
- Cookie Parser
- CORS

## Project Structure

```
airbnb-clone/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── api/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── middleware/
│   ├── index.js
│   └── package.json
│
└── README.md
```

## Screenshots

Add screenshots of the following pages:

- Login
- Register
- Home Page
- Listings
- Single Listing
- Booking Page
- Account Page
- Host Dashboard
- Create Listing
- Edit Listing

---

# Installation

## Clone the repository

```bash
git clone https://github.com/yourusername/airbnb-clone.git
```

## Navigate to the project

```bash
cd airbnb-clone
```

## Backend Setup

```bash
cd api
npm install
```

Create a `.env` file.

Example:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend server.

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file.

```env
VITE_API_URL=http://localhost:4000
```

Run the development server.

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

# Authentication

Authentication is implemented using:

- JSON Web Tokens (JWT)
- HTTP-only Cookies
- bcrypt password hashing

Users remain authenticated through persistent cookie-based sessions.

---

# Image Uploads

Property images are uploaded using Multer.

> **Note:** Images are currently stored in the server's local `uploads` directory. On cloud hosting platforms such as Render, locally stored files are temporary and may be lost after server restarts. For production deployments, an external storage service such as Cloudinary or Amazon S3 is recommended.

---

# Main Pages

| Page | Description |
|-------|-------------|
| Login | User authentication |
| Register | User registration |
| Home | Featured properties |
| Listings | Browse all available properties |
| Property Details | View full property information |
| Account | Manage user profile |
| Bookings | View reservations |
| Host Dashboard | Manage listings |
| Add Listing | Create a new property |
| Edit Listing | Update listing information |

---

# API Endpoints

## Authentication

```
POST   /register
POST   /login
POST   /logout
GET    /profile
```

## Listings

```
GET    /listings
GET    /listings/:id
POST   /listings
PUT    /listings/:id
DELETE /listings/:id
```

## Uploads

```
POST /upload-by-link
POST /upload
```

## Bookings

```
GET    /bookings
POST   /bookings
```

---

# Future Improvements

- Cloudinary image storage
- Wishlist functionality
- Property reviews and ratings
- Google Maps integration
- Payment gateway integration
- Host analytics dashboard
- Advanced property filtering
- Messaging between hosts and guests
- Availability calendar
- Email notifications

---

# Deployment

### Frontend

- Render

### Backend

- Render

### Database

- MongoDB Atlas

---

# Live Link
- https://airbnb-clone-frontend-t3ml.onrender.com/
---

## License

This project was developed for educational purposes.
