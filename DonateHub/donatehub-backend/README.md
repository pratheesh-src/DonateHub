# DonateHub Backend

A comprehensive donation platform backend built with Node.js, Express, and MongoDB.

## Features
- User authentication and authorization
- Donation management (blood, cash, books, food, knowledge, items)
- Item marketplace
- Transaction processing
- Real-time notifications
- Admin dashboard
- Image uploads (Cloudinary/local storage)
- Email notifications

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd donatehub-backend

npm install

cp .env.example .env
# Edit .env with your configuration

npm run seed

# Development
npm run dev

# Production
npm start

API Documentation
Base URL: http://localhost:5000/api

Authentication
POST /auth/register - Register a new user

POST /auth/login - Login user

POST /auth/logout - Logout user

POST /auth/refresh-token - Refresh access token

Donations
GET /donations - Get all donations

POST /donations - Create a donation

GET /donations/:id - Get single donation

PUT /donations/:id - Update donation

Items
GET /items - Get all items

POST /items - Create an item

GET /items/:id - Get single item

Environment Variables
See .env.example for all required variables.