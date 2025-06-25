# Lavish Events Backend API

This is the backend API for Lavish Events, powering both the customer-facing application and admin dashboard.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Run the server: `npm start` or `npm run dev` for development mode

## API Endpoints

### Authentication

#### User Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user

#### Admin Authentication
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/paginated` - Get paginated users with search
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:id/status` - Update user status

### Orders

#### Customer Order Management
- `GET /api/orders` - Get all orders for authenticated customer
- `GET /api/orders/:id` - Get order details by ID for authenticated customer
- `POST /api/orders` - Create a new order as a customer
- `PATCH /api/orders/:id/cancel` - Cancel a customer order (if in pending status)

#### Admin Order Management
- `POST /api/admin/orders/create` - Create a new order (admin)
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/paginated` - Get paginated orders with search
- `GET /api/admin/orders/:id` - Get order details by ID
- `PATCH /api/admin/orders/:id/status` - Update order status

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID

## Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  mobile: String,
  password: String,
  alternateMobile: String,
  pincode: String,
  active: Boolean,
  blocked: Boolean
}
```

### Order
```javascript
{
  customerId: ObjectId,
  orderId: String,
  serviceName: String,
  occasion: String,
  date: String,
  timeSlot: String,
  venueAddress: String,
  pincode: String,
  alternateContact: String,
  whatsappNotifications: Boolean,
  source: String,
  balloonColors: Array,
  basePrice: Number,
  deliveryCharges: Number,
  addons: Array,
  totalAmount: Number,
  paymentPercentage: String,
  couponApplied: String,
  couponDiscount: Number,
  paidAmount: Number,
  duePayment: Number,
  grandTotal: Number,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  notes: String
}
```

## Authentication

The API uses JWT for authentication. When a user logs in, a token is returned which should be included in the Authorization header of subsequent requests:

```
Authorization: Bearer <token>
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a JSON object with:
```javascript
{
  success: false,
  message: "Error message",
  error: "Detailed error information" // In development mode
}
```




