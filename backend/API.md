# MC Adarkwah API Documentation

Base URL: `http://localhost:5000/api`

## Common Patterns

### Authentication
- Protected endpoints require a `Bearer` token in the `Authorization` header:
  ```
  Authorization: Bearer <jwt-token>
  ```
- Tokens are obtained via `POST /api/auth/login` or `POST /api/auth/setup`.
- Token expiry: 7 days (access), 30 days (refresh).

### Success Response Format
```json
{ "success": true, "data": { ... } }
```

### Validation Error Response (400)
Returned by `express-validator` middleware when request body fails rules.
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

### Rate-Limit Error Response (429)
```json
{ "success": false, "message": "Too many login attempts. Please try again in 15 minutes." }
```

### Unauthorized Error Response (401)
```json
{ "success": false, "message": "Not authorized, no token provided" }
```

### Server Error Response (500)
```json
{ "success": false, "message": "Internal server error" }
```

### Other Error Responses (400)
| Type | Condition | Example |
|------|-----------|---------|
| Mongoose ValidationError | Schema validation fails | `{ "success": false, "message": "Validation error", "error": ["Path `email` is required"] }` |
| Duplicate key (code 11000) | Unique field duplicated | `{ "success": false, "message": "Duplicate value for email" }` |
| CastError | Invalid ObjectId | `{ "success": false, "message": "Invalid ID format" }` |
| MulterError | File upload error | `{ "success": false, "message": "Upload error: Unexpected field" }` |

### Rate Limiters
| Limiter | Window | Max Requests | Applied To |
|---------|--------|--------------|------------|
| `authLimiter` | 15 min | 10 | `POST /api/auth/login`, `POST /api/auth/forgot-password` |
| `subscribeLimiter` | 60 min | 10 | `POST /api/subscribers` |
| `quoteLimiter` | 15 min | 5 | `POST /api/quotes` |

> **Note:** `bookingLimiter` (5/15min) and `contactLimiter` (3/15min) are defined in `rateLimiter.js` but are **not yet applied** to any route.

### Global Security Middleware (applied to every request)
| Middleware | Purpose |
|------------|---------|
| `helmet()` | Security headers (CSP, HSTS, X-Frame-Options, etc.) |
| `sanitizeQuery` | Strips MongoDB operators (`$ne`, `$gt`, `$regex`, `$where`, etc.) from query params |
| `sanitizeBody` | Strips MongoDB operators from request body (applied to `/api` prefix only) |
| `cors` | Only allows configured origins (localhost:4200, FRONTEND_URL, Vercel) |

---

## 1. Auth — `/api/auth`

---

### 1.1 GET /api/auth/setup
Check if initial admin setup is needed.

- **Auth:** None
- **Query params:** None

**Success Response (200):**
```json
{ "success": true, "message": "Setup required" }
```

**Error Response (400)** — when admin already exists:
```json
{ "success": false, "message": "Admin already exists. Please login instead." }
```

---

### 1.2 POST /api/auth/setup
Create the first super-admin account. Only works when no admins exist.

- **Auth:** None
- **Rate limited:** No
- **Validation rules:** `validate.auth.setup`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Not empty, trimmed |
| `email` | string | Yes | Valid email, normalized |
| `password` | string | Yes | Min 6 characters |

**Request body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "admin": { "_id": "...", "name": "Admin User", "email": "admin@example.com", "role": "superadmin" },
    "token": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

**Error (400)** — admin already exists:
```json
{ "success": false, "message": "Admin already exists. Please login instead." }
```

---

### 1.3 POST /api/auth/login
Authenticate and receive JWT tokens.

- **Auth:** None
- **Rate limited:** `authLimiter` (10 req / 15 min)
- **Validation rules:** `validate.auth.login`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Not empty |

**Request body:**
```json
{ "email": "admin@example.com", "password": "password123" }
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "admin": { "_id": "...", "name": "Admin User", "email": "admin@example.com", "role": "superadmin" },
    "token": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

**Error (401):**
```json
{ "success": false, "message": "Invalid email or password" }
```

---

### 1.4 POST /api/auth/forgot-password
Send a password reset email. Returns reset URL directly (no email dependency).

- **Auth:** None
- **Rate limited:** `authLimiter` (10 req / 15 min)
- **Validation rules:** `validate.auth.forgotPassword`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email |

**Request body:**
```json
{ "email": "admin@example.com" }
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email",
  "data": {
    "resetUrl": "https://.../admin/reset-password/<token>",
    "emailSent": true
  }
}
```

If SMTP unavailable, `emailSent: false` and the URL is provided directly.

**Error (404) — no admin with that email:**
```json
{ "success": false, "message": "No admin found with that email" }
```

---

### 1.5 POST /api/auth/reset-password
Reset password using a reset token.

- **Auth:** None
- **Rate limited:** No
- **Validation rules:** `validate.auth.resetPassword`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | Yes | Not empty |
| `password` | string | Yes | Min 6 characters |

**Request body:**
```json
{ "token": "abc123...", "password": "newpassword123" }
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": { "token": "eyJhbG...", "refreshToken": "eyJhbG..." }
}
```

**Error (400) — invalid or expired token:**
```json
{ "success": false, "message": "Token is invalid or has expired" }
```

---

### 1.6 POST /api/auth/refresh
Obtain a new access token using a refresh token.

- **Auth:** None
- **Rate limited:** No
- **Validation rules:** `validate.auth.refresh`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `refreshToken` | string | Yes | Not empty |

**Request body:**
```json
{ "refreshToken": "eyJhbG..." }
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

**Error (401):**
```json
{ "success": false, "message": "Invalid refresh token" }
```

---

### 1.7 POST /api/auth/register
Register a new admin (requires existing admin session).

- **Auth:** Required (Bearer token)
- **Rate limited:** No
- **Validation rules:** `validate.auth.register`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Not empty, trimmed |
| `email` | string | Yes | Valid email, normalized |
| `password` | string | Yes | Min 6 characters |

**Request body:** Same as setup.
**Success Response (201):** Same shape as login.

**Error (400) — duplicate email:**
```json
{ "success": false, "message": "Admin with this email already exists" }
```

---

### 1.8 GET /api/auth/me
Get the currently authenticated admin's profile.

- **Auth:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": { "_id": "...", "name": "Admin User", "email": "admin@example.com", "role": "superadmin" }
}
```

---

### 1.9 GET /api/auth/test-email
Debug endpoint that tests SMTP connectivity on ports 587 and 465.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "results": { "587": "OK", "465": "OK" }
}
```

**Partial failure (500):**
```json
{
  "success": false,
  "results": { "587": "Invalid login", "465": "Connection refused" }
}
```

---

## 2. Events — `/api/events`

---

### 2.1 GET /api/events
List all events with optional filters.

- **Auth:** None

| Query Param | Type | Required | Description |
|-------------|------|----------|-------------|
| `category` | string | No | Filter by category |
| `year` | number | No | Filter by year (e.g., 2026) |
| `location` | string | No | Search in city or location fields (regex) |
| `isUpcoming` | boolean | No | Filter upcoming events |
| `isFeatured` | boolean | No | Filter featured events |
| `search` | string | No | Text search (MongoDB `$text`) |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 12) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Annual Gala Night",
      "slug": "annual-gala-night-2026",
      "category": "Corporate",
      "date": "2026-12-15T19:00:00.000Z",
      "description": "Full event description...",
      "shortDescription": "A night to remember",
      "venue": "Grand Ballroom",
      "location": "Accra, Ghana",
      "city": "Accra",
      "attendeeCount": 500,
      "bannerImage": "/uploads/banner.jpg",
      "thumbnailImage": "/uploads/thumb.jpg",
      "ticketUrl": "https://tickets.example.com",
      "registrationUrl": "/register/...",
      "highlights": ["Keynote speech", "Networking session"],
      "tags": ["corporate", "gala"],
      "isUpcoming": true,
      "isFeatured": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 45, "pages": 4 }
}
```

---

### 2.2 GET /api/events/:slug
Get a single event by its URL slug.

- **Auth:** None

**Success Response (200):**
```json
{ "success": true, "data": { ...event } }
```

**Error (404):**
```json
{ "success": false, "message": "Event not found" }
```

---

### 2.3 POST /api/events
Create a new event.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.event.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Not empty, trimmed |
| `category` | string | Yes | Not empty, trimmed |
| `date` | string (ISO8601) | Yes | Valid ISO date |
| `description` | string | No | Trimmed |
| `shortDescription` | string | No | Trimmed |
| `venue` | string | No | Trimmed |
| `location` | string | No | Trimmed |
| `city` | string | No | Trimmed |
| `attendeeCount` | number | No | Integer ≥ 0 |
| `bannerImage` | string | No | Trimmed |
| `thumbnailImage` | string | No | Trimmed |
| `ticketUrl` | string | No | Trimmed |
| `registrationUrl` | string | No | Trimmed |
| `highlights` | array | No | Must be array |
| `tags` | array | No | Must be array |
| `isUpcoming` | boolean | No | Must be boolean |
| `isFeatured` | boolean | No | Must be boolean |

Slug is auto-generated from title.

**Success Response (201):** `{ "success": true, "data": { ...event } }`

---

### 2.4 PUT /api/events/:id
Update an event by ID.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.event.update`

Accepts the same fields as create, all optional.
Explicitly rejects `slug` field: `{ "errors": [{ "field": "slug", "message": "Slug cannot be manually set" }] }`

**Success Response (200):** `{ "success": true, "data": { ...event } }`

**Error (404):**
```json
{ "success": false, "message": "Event not found" }
```

---

### 2.5 DELETE /api/events/:id
Delete an event by ID.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam` (ID must be valid MongoDB ObjectId)

**Success Response (200):**
```json
{ "success": true, "message": "Event deleted successfully" }
```

---

### 2.6 PATCH /api/events/:id/toggle-feature
Toggle the `isFeatured` flag on an event.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.event.toggleFeature` (ID must be valid ObjectId)

**Success Response (200):**
```json
{ "success": true, "data": { ...event } }
```

---

## 3. Gallery — `/api/gallery`

---

### 3.1 GET /api/gallery
List all gallery items.

- **Auth:** None

| Query Param | Type | Description |
|-------------|------|-------------|
| `category` | string | Filter by category |
| `featured` | boolean | Filter featured items |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Wedding Reception",
      "description": "Beautiful setup",
      "imageUrl": "/uploads/gallery1.jpg",
      "category": "Wedding",
      "type": "image",
      "featured": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3.2 GET /api/gallery/:id
Get a single gallery item by ID.

- **Auth:** None

**Success Response (200):** `{ "success": true, "data": { ...item } }`
**Error (404):** `{ "success": false, "message": "Gallery item not found" }`

---

### 3.3 POST /api/gallery
Create a new gallery item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.gallery.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Not empty, trimmed |
| `imageUrl` | string | No | Trimmed |
| `category` | string | No | Trimmed |
| `type` | string | No | Must be `"image"` or `"video"` |
| `description` | string | No | Trimmed |
| `featured` | boolean | No | Must be boolean |

**Success Response (201):** `{ "success": true, "data": { ...item } }`

---

### 3.4 PUT /api/gallery/:id
Update a gallery item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.gallery.update`

Same fields as create, all optional.

---

### 3.5 DELETE /api/gallery/:id
Delete a gallery item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

**Success Response (200):**
```json
{ "success": true, "message": "Gallery item deleted" }
```

---

## 4. Services — `/api/services`

---

### 4.1 GET /api/services
List all services, sorted by `order`.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Wedding MC",
      "shortDescription": "Professional MC for your wedding",
      "description": "Full description...",
      "icon": "fas fa-ring",
      "imageUrl": "/uploads/service1.jpg",
      "priceRange": "£500 - £1,500",
      "features": ["Ceremony hosting", "Reception coordination"],
      "order": 1
    }
  ]
}
```

---

### 4.2 POST /api/services
Create a new service.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.service.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Not empty, trimmed |
| `shortDescription` | string | No | Trimmed |
| `description` | string | No | Trimmed |
| `icon` | string | No | Trimmed |
| `imageUrl` | string | No | Trimmed |
| `priceRange` | string | No | Trimmed |
| `features` | array | No | Must be array |
| `order` | number | No | Integer ≥ 0 |

**Success Response (201):** `{ "success": true, "data": { ...service } }`

---

### 4.3 PUT /api/services/:id
Update a service.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.service.update`

Same fields as create, all optional.

---

### 4.4 DELETE /api/services/:id
Delete a service.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

**Success Response (200):** `{ "success": true, "message": "Service deleted" }`

---

## 5. Bookings — `/api/bookings`

---

### 5.1 POST /api/bookings
Submit a new booking request.

- **Auth:** None
- **Rate limited:** No (bookingLimiter is defined but not applied)
- **Validation rules:** `validate.booking.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullName` | string | Yes | Not empty, trimmed |
| `email` | string | Yes | Valid email, normalized |
| `phone` | string | Yes | Not empty, trimmed |
| `eventType` | string | Yes | Not empty, trimmed |
| `eventDate` | string (ISO8601) | Yes | Valid ISO date |
| `eventLocation` | string | No | Trimmed |
| `guestCount` | number | No | Integer ≥ 1 |
| `budgetRange` | string | No | Trimmed |
| `additionalNotes` | string | No | Trimmed |
| `agreeToTerms` | boolean | No | Must be boolean |

Triggers email: `sendBookingConfirmation` (to client), `sendAdminNotification` (to admin).

**Request body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "eventType": "Wedding",
  "eventDate": "2026-12-25",
  "eventLocation": "Accra",
  "guestCount": 150,
  "budgetRange": "£5000 - £10000",
  "additionalNotes": "We prefer outdoor setup"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": { "_id": "...", "fullName": "John Doe", ... },
  "message": "Booking request received. We will contact you within 24 hours."
}
```

---

### 5.2 GET /api/bookings
List all bookings (admin only).

- **Auth:** Required (Bearer token)

| Query Param | Type | Description |
|-------------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [ ...bookings ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
}
```

---

### 5.3 PATCH /api/bookings/:id/status
Update a booking's status.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.booking.statusUpdate`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | Yes | Must be one of: `pending`, `confirmed`, `cancelled`, `completed` |

Triggers email `sendBookingConfirmed` when status is changed to `confirmed`.

**Success Response (200):** `{ "success": true, "data": { ...booking } }`

---

### 5.4 DELETE /api/bookings/:id
Delete a booking.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

**Success Response (200):** `{ "success": true, "message": "Booking deleted" }`

---

## 6. Event Registrations — `/api/registrations`

---

### 6.1 POST /api/registrations
Register for an event.

- **Auth:** None
- **Rate limited:** No
- **Validation rules:** `validate.registration.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullName` | string | Yes | Not empty, trimmed |
| `email` | string | Yes | Valid email, normalized |
| `phone` | string | Yes | Not empty, trimmed |
| `event` | string (MongoId) | Yes | Valid ObjectId |
| `message` | string | No | Trimmed |

Triggers email: `sendRegistrationAdminNotification` (to admin).

**Request body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "event": "507f1f77bcf86cd799439011",
  "message": "Looking forward to it!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": { "_id": "...", ... },
  "message": "Registration successful!"
}
```

---

### 6.2 GET /api/registrations
List registrations (admin only). Event data is populated.

- **Auth:** Required (Bearer token)

| Query Param | Type | Description |
|-------------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

---

### 6.3 GET /api/registrations/event/:eventId
Get registrations for a specific event.

- **Auth:** Required (Bearer token)

---

### 6.4 PATCH /api/registrations/:id/status
Update registration status.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.registration.statusUpdate`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | Yes | Must be one of: `pending`, `confirmed`, `cancelled` |

Triggers email `sendRegistrationConfirmed` when status is changed to `confirmed`.

---

### 6.5 DELETE /api/registrations/:id
Delete a registration.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 7. Testimonials — `/api/testimonials`

---

### 7.1 GET /api/testimonials
List approved testimonials.

- **Auth:** None

| Query Param | Type | Description |
|-------------|------|-------------|
| `approved` | boolean | If omitted or `true`, returns approved only. Set to `false` for all. |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "photo": "/uploads/photo.jpg",
      "eventName": "Wedding",
      "rating": 5,
      "review": "Absolutely amazing MC!",
      "designation": "Bride",
      "isApproved": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 7.2 POST /api/testimonials
Submit a new testimonial (public).

- **Auth:** None
- **Validation rules:** `validate.testimonial.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Not empty, trimmed |
| `review` | string | Yes | Not empty, trimmed |
| `rating` | number | No | Integer 1-5 |
| `eventName` | string | No | Trimmed |
| `photo` | string | No | Trimmed |
| `designation` | string | No | Trimmed |

**Success Response (201):**
```json
{
  "success": true,
  "data": { ...testimonial },
  "message": "Thank you for your testimonial! It will be displayed after approval."
}
```

---

### 7.3 PUT /api/testimonials/:id
Update a testimonial.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.testimonial.update`

---

### 7.4 PATCH /api/testimonials/:id/approve
Toggle the `isApproved` flag on a testimonial.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

### 7.5 DELETE /api/testimonials/:id
Delete a testimonial.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 8. FAQs — `/api/faqs`

---

### 8.1 GET /api/faqs
List all FAQs, sorted by `order`.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "question": "How do I book?", "answer": "Fill out the booking form...", "category": "General", "order": 1 }
  ]
}
```

---

### 8.2 POST /api/faqs
Create a new FAQ.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.faq.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `question` | string | Yes | Not empty, trimmed |
| `answer` | string | Yes | Not empty, trimmed |
| `category` | string | No | Trimmed |
| `order` | number | No | Integer ≥ 0 |

---

### 8.3 PUT /api/faqs/:id
Update a FAQ.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.faq.update`

---

### 8.4 PUT /api/faqs/reorder
Reorder multiple FAQs at once.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.faq.reorder`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `orders` | array | Yes | Min 1 item |
| `orders[].id` | string (MongoId) | Yes | Valid ObjectId |
| `orders[].order` | number | Yes | Integer ≥ 0 |

**Request body:**
```json
{
  "orders": [
    { "id": "507f1f77bcf86cd799439011", "order": 1 },
    { "id": "507f1f77bcf86cd799439012", "order": 2 }
  ]
}
```

---

### 8.5 DELETE /api/faqs/:id
Delete a FAQ.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 9. News — `/api/news`

---

### 9.1 GET /api/news
List news items.

- **Auth:** None

| Query Param | Type | Description |
|-------------|------|-------------|
| `category` | string | Filter by category |
| `featured` | boolean | Filter featured items |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "New Event Announced",
      "slug": "new-event-announced",
      "excerpt": "Brief summary...",
      "content": "Full article content...",
      "imageUrl": "/uploads/news1.jpg",
      "category": "Announcement",
      "author": "Admin",
      "tags": ["event", "announcement"],
      "featured": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 10, "pages": 1 }
}
```

---

### 9.2 GET /api/news/:slug
Get a single news item by slug.

- **Auth:** None

---

### 9.3 POST /api/news
Create a news item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.news.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Not empty, trimmed |
| `content` | string | Yes | Not empty, trimmed |
| `excerpt` | string | No | Trimmed |
| `imageUrl` | string | No | Trimmed |
| `category` | string | No | Trimmed |
| `author` | string | No | Trimmed |
| `tags` | array | No | Must be array |
| `featured` | boolean | No | Must be boolean |

Slug is auto-generated from title.

---

### 9.4 PUT /api/news/:id
Update a news item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.news.update`

Same fields as create, all optional. `slug` cannot be manually set.

---

### 9.5 DELETE /api/news/:id
Delete a news item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 10. Sponsors — `/api/sponsors`

---

### 10.1 GET /api/sponsors
List sponsors, sorted by `order`.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "ABC Corp", "logo": "/uploads/logo1.png", "website": "https://abc.com", "order": 1 }
  ]
}
```

---

### 10.2 POST /api/sponsors
Create a sponsor.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.sponsor.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Not empty, trimmed |
| `logo` | string | No | Trimmed |
| `website` | string | No | Trimmed |
| `order` | number | No | Integer ≥ 0 |

---

### 10.3 PUT /api/sponsors/:id
Update a sponsor.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.sponsor.update`

---

### 10.4 DELETE /api/sponsors/:id
Delete a sponsor.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 11. Subscribers — `/api/subscribers`

---

### 11.1 POST /api/subscribers
Subscribe to the newsletter.

- **Auth:** None
- **Rate limited:** `subscribeLimiter` (10 req / 60 min)
- **Validation rules:** `validate.subscriber.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email, normalized |

**Request body:**
```json
{ "email": "user@example.com" }
```

**Success Response (201):**
```json
{ "success": true, "message": "Successfully subscribed to our newsletter!" }
```

**Error (400) — duplicate email:**
```json
{ "success": false, "message": "Email already subscribed" }
```

---

### 11.2 GET /api/subscribers
List all subscribers (admin only).

- **Auth:** Required (Bearer token)

---

### 11.3 DELETE /api/subscribers/:id
Unsubscribe / delete a subscriber.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 12. Contact — `/api/contact`

---

### 12.1 POST /api/contact
Send a contact message.

- **Auth:** None
- **Rate limited:** No (contactLimiter is defined but not applied)
- **Validation rules:** `validate.contact.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Not empty, trimmed |
| `email` | string | Yes | Valid email, normalized |
| `message` | string | Yes | Not empty, trimmed |
| `subject` | string | No | Trimmed |

Triggers email: `sendContactNotification` (to admin).

**Request body:**
```json
{
  "name": "John",
  "email": "john@example.com",
  "subject": "Booking Inquiry",
  "message": "I'd like to book your services for my wedding."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": { ...message },
  "message": "Your message has been received. We will get back to you soon."
}
```

---

### 12.2 GET /api/contact
List contact messages (admin only).

- **Auth:** Required (Bearer token)

---

### 12.3 DELETE /api/contact/:id
Delete a contact message.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 13. Quotes — `/api/quotes`

---

### 13.1 POST /api/quotes
Request a personalized quote.

- **Auth:** None
- **Rate limited:** `quoteLimiter` (5 req / 15 min)
- **Validation rules:** `validate.quote.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Not empty, trimmed |
| `email` | string | Yes | Valid email, normalized |
| `phone` | string | Yes | Not empty, trimmed |
| `eventType` | string | Yes | Not empty, trimmed |
| `eventDate` | string (ISO8601) | No | Valid ISO date if provided |
| `guestCount` | number | No | Integer ≥ 1 |
| `message` | string | No | Trimmed |

Triggers emails: `sendQuoteNotification` (to admin), `sendQuoteConfirmation` (to client).

**Request body:**
```json
{
  "name": "John",
  "email": "john@example.com",
  "phone": "+1234567890",
  "eventType": "Corporate Event",
  "eventDate": "2026-06-15",
  "guestCount": 200,
  "message": "We need an MC for our annual conference"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": { ...quote },
  "message": "Quote request received. We will get back to you within 24 hours."
}
```

---

### 13.2 GET /api/quotes
List quote requests (admin only).

- **Auth:** Required (Bearer token)

| Query Param | Type | Description |
|-------------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

---

### 13.3 PATCH /api/quotes/:id/status
Update a quote's status. Sends status update email to client.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.quote.statusUpdate`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | Yes | Must be one of: `pending`, `contacted`, `closed` |

---

### 13.4 DELETE /api/quotes/:id
Delete a quote request.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 14. File Upload — `/api/upload`

---

### 14.1 POST /api/upload
Upload a single image.

- **Auth:** Required (Bearer token)
- **Middleware:** `multer.single('image')` + `optimizeImage` (converts to WebP)

**Request:** Multipart/form-data with field `image`.

**Success Response (201):**
```json
{ "success": true, "data": { "url": "/uploads/1712345678-image.webp", "filename": "1712345678-image.webp" } }
```

---

### 14.2 POST /api/upload/multiple
Upload up to 10 images at once.

- **Auth:** Required (Bearer token)
- **Middleware:** `multer.array('images', 10)` + inline WebP optimizer

**Request:** Multipart/form-data with field `images` (max 10 files).

**Success Response (201):**
```json
{
  "success": true,
  "data": [
    { "url": "/uploads/1712345678-img1.webp", "filename": "1712345678-img1.webp" },
    { "url": "/uploads/1712345678-img2.webp", "filename": "1712345678-img2.webp" }
  ]
}
```

---

## 15. Dashboard — `/api/dashboard`

---

### 15.1 GET /api/dashboard
Get aggregated dashboard statistics.

- **Auth:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEvents": 45,
    "upcomingEvents": 12,
    "pastEvents": 33,
    "totalBookings": 120,
    "pendingBookings": 8,
    "confirmedBookings": 95,
    "totalTestimonials": 30,
    "approvedTestimonials": 25,
    "totalContacts": 60,
    "totalSubscribers": 200,
    "recentBookings": [ ...last 5 bookings ],
    "eventsByCategory": { "Wedding": 20, "Corporate": 15, "Social": 10 }
  }
}
```

---

## 16. Profile — `/api/profile`

---

### 16.1 GET /api/profile
Get the MC profile (public). Auto-creates an empty profile if none exists.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "MC Adarkwah",
    "title": "Professional Master of Ceremonies",
    "bio": "Short bio...",
    "fullBio": "Extended bio...",
    "image": "/uploads/profile.jpg",
    "image2": "/uploads/profile2.jpg",
    "yearsExperience": 10,
    "exchangeRate": 15.50,
    "achievements": ["Award 1", "Award 2"],
    "milestones": ["First event in 2015"],
    "socialMedia": { "instagram": "...", "facebook": "...", "twitter": "...", "youtube": "...", "linkedin": "..." },
    "contact": { "phone": "+44 7507 615314", "email": "contact@mcadarkwah.com" },
    "budgetRanges": [
      { "label": "Basic", "min": 500, "max": 1000 },
      { "label": "Premium", "min": 1500, "max": 3000 }
    ]
  }
}
```

---

### 16.2 PUT /api/profile
Update the MC profile (admin only, upserts).

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.profile.update`

All fields optional. The controller destructures: `name`, `title`, `bio`, `fullBio`, `image`, `image2`, `yearsExperience`, `achievements`, `milestones`, `socialMedia`, `contact`, `exchangeRate`, `budgetRanges`.

---

## 17. Statistics — `/api/statistics`

---

### 17.1 GET /api/statistics
List statistics counters, sorted by `order`.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "label": "Events Hosted", "value": 500, "suffix": "+", "icon": "fas fa-calendar", "order": 1 }
  ]
}
```

---

### 17.2 POST /api/statistics
Create a statistic counter.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.statistic.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `label` | string | Yes | Not empty, trimmed |
| `value` | number | Yes | Integer ≥ 0 |
| `suffix` | string | No | Trimmed |
| `icon` | string | No | Trimmed |
| `order` | number | No | Integer ≥ 0 |

---

### 17.3 PUT /api/statistics/:id
Update a statistic.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.statistic.update`

---

### 17.4 DELETE /api/statistics/:id
Delete a statistic.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 18. Hero Section — `/api/hero`

---

### 18.1 GET /api/hero
Get the hero section content (public). Returns active hero or auto-creates default.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "badge": "Professional MC",
    "title": "Making Every Event Unforgettable",
    "subtitle": "Premium master of ceremonies services...",
    "primaryBtnText": "Book Now",
    "primaryBtnAction": "/book",
    "secondaryBtnText": "Learn More",
    "secondaryBtnAction": "/about",
    "isActive": true
  }
}
```

---

### 18.2 PUT /api/hero
Update the hero section.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.hero.update`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `badge` | string | No | Trimmed |
| `title` | string | No | Trimmed |
| `subtitle` | string | No | Trimmed |
| `primaryBtnText` | string | No | Trimmed |
| `primaryBtnAction` | string | No | Trimmed |
| `secondaryBtnText` | string | No | Trimmed |
| `secondaryBtnAction` | string | No | Trimmed |
| `isActive` | boolean | No | Must be boolean |

The controller also accepts `stat1`, `stat2` (no validation).

---

## 19. Videos — `/api/videos`

---

### 19.1 GET /api/videos
List active video highlights (public).

- **Auth:** None
- Returns only `isActive: true`, sorted by `order`.

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "title": "Wedding Highlight", "url": "https://youtube.com/watch?v=...", "thumbnail": "/uploads/thumb.jpg", "order": 1, "isActive": true }
  ]
}
```

---

### 19.2 GET /api/videos/all
List all videos including inactive (admin only).

- **Auth:** Required (Bearer token)

---

### 19.3 POST /api/videos
Create a video highlight.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.video.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Not empty, trimmed |
| `url` | string | Yes | Not empty, trimmed |
| `thumbnail` | string | No | Trimmed |
| `order` | number | No | Integer ≥ 0 |
| `isActive` | boolean | No | Must be boolean |

---

### 19.4 PUT /api/videos/:id
Update a video.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.video.update`

---

### 19.5 DELETE /api/videos/:id
Delete a video.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 20. Navigation — `/api/nav`

---

### 20.1 GET /api/nav
List active navigation items (public).

- **Auth:** None
- Returns only `isActive: true`, sorted by `order`.

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "label": "Home", "path": "/", "icon": "fas fa-home", "order": 1, "isActive": true }
  ]
}
```

---

### 20.2 GET /api/nav/all
List all navigation items including inactive (admin only).

- **Auth:** Required (Bearer token)

---

### 20.3 POST /api/nav
Create a navigation item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.nav.create`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `label` | string | Yes | Not empty, trimmed |
| `path` | string | No | Trimmed |
| `fragment` | string | No | Trimmed |
| `icon` | string | No | Trimmed |
| `order` | number | No | Integer ≥ 0 |
| `isActive` | boolean | No | Must be boolean |

---

### 20.4 PUT /api/nav/:id
Update a navigation item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.nav.update`

---

### 20.5 DELETE /api/nav/:id
Delete a navigation item.

- **Auth:** Required (Bearer token)
- **Validation rules:** `validate.idParam`

---

## 21. Inline Routes — `/api`

---

### 21.1 GET /api/health
Health check endpoint.

- **Auth:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "MC Adarkwah API is running",
  "timestamp": "2026-07-13T12:00:00.000Z"
}
```

---

### 21.2 GET /api/smtp-debug
Returns SMTP configuration status (without connecting).

- **Auth:** None

**Success Response (200):**
```json
{
  "host": "smtp.gmail.com",
  "port": "465",
  "userExists": true,
  "passExists": true,
  "contactExists": true
}
```

---

### 21.3 GET /api/smtp-test-connection
Tests raw TCP connectivity to the SMTP server.

- **Auth:** None

**Success Response (200):**
```json
{ "success": true, "message": "Connected to SMTP server" }
```

**Error Response:**
```json
{ "success": false, "error": "Connection refused" }
```

---

## 22. Swagger UI

Available at: `http://localhost:5000/api-docs`

Serves OpenAPI 3.0 specification auto-generated from JSDoc annotations in route files.

---

## Appendix: Validation Rule Reference

All validation chains are defined in `backend/src/middleware/validate.js`. The `validate()` runner returns:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "<field_name>", "message": "<error_message>" }
  ]
}
```

### Field-Level Validator Summary

| Validator | Applies To |
|-----------|------------|
| `.trim().notEmpty()` | Required string fields |
| `.isEmail().normalizeEmail()` | Email fields throughout |
| `.isLength({ min: 6 })` | Passwords, tokens |
| `.isISO8601()` | Date fields (eventDate, date) |
| `.isMongoId()` | ID params, event references |
| `.isIn([...])` | Status enums |
| `.isInt({ min, max })` | Numeric fields (guestCount, rating, order, attendeeCount, value, yearsExperience) |
| `.isFloat({ min: 0 })` | exchangeRate |
| `.isBoolean()` | Boolean flags (isActive, isFeatured, isUpcoming, agreeToTerms, featured, isApproved) |
| `.isArray()` | Array fields (highlights, tags, features, orders) |
| `.not().exists()` | Slug fields (prevent manual setting) |

### Applied Validation Chains by Entity

| Entity | create | update | Other |
|--------|--------|--------|-------|
| auth.setup | ✓ | — | — |
| auth.register | ✓ | — | — |
| auth.login | ✓ | — | — |
| auth.forgotPassword | ✓ | — | — |
| auth.resetPassword | ✓ | — | — |
| auth.refresh | ✓ | — | — |
| booking | ✓ | — | statusUpdate ✓ |
| contact | ✓ | — | — |
| quote | ✓ | — | statusUpdate ✓ |
| subscriber | ✓ | — | — |
| registration | ✓ | — | statusUpdate ✓ |
| event | ✓ | ✓ | toggleFeature ✓ |
| gallery | ✓ | ✓ | — |
| service | ✓ | ✓ | — |
| testimonial | ✓ | ✓ | — |
| faq | ✓ | ✓ | reorder ✓ |
| news | ✓ | ✓ | — |
| sponsor | ✓ | ✓ | — |
| hero | — | ✓ | — |
| nav | ✓ | ✓ | — |
| video | ✓ | ✓ | — |
| statistic | ✓ | ✓ | — |
| profile | — | ✓ | — |
| idParam (generic) | Used by all DELETE, PATCH status, toggle endpoints | | |

---

## Appendix: Endpoint Summary Table

| # | Method | URL | Auth | Rate Limited |
|---|--------|-----|------|-------------|
| 1 | GET | /api/auth/setup | — | — |
| 2 | POST | /api/auth/setup | — | — |
| 3 | POST | /api/auth/register | ✓ | — |
| 4 | POST | /api/auth/login | — | authLimiter |
| 5 | POST | /api/auth/forgot-password | — | authLimiter |
| 6 | POST | /api/auth/reset-password | — | — |
| 7 | GET | /api/auth/me | ✓ | — |
| 8 | POST | /api/auth/refresh | — | — |
| 9 | GET | /api/auth/test-email | — | — |
| 10 | GET | /api/events | — | — |
| 11 | GET | /api/events/:slug | — | — |
| 12 | POST | /api/events | ✓ | — |
| 13 | PUT | /api/events/:id | ✓ | — |
| 14 | DELETE | /api/events/:id | ✓ | — |
| 15 | PATCH | /api/events/:id/toggle-feature | ✓ | — |
| 16 | GET | /api/gallery | — | — |
| 17 | GET | /api/gallery/:id | — | — |
| 18 | POST | /api/gallery | ✓ | — |
| 19 | PUT | /api/gallery/:id | ✓ | — |
| 20 | DELETE | /api/gallery/:id | ✓ | — |
| 21 | GET | /api/services | — | — |
| 22 | POST | /api/services | ✓ | — |
| 23 | PUT | /api/services/:id | ✓ | — |
| 24 | DELETE | /api/services/:id | ✓ | — |
| 25 | POST | /api/bookings | — | — |
| 26 | GET | /api/bookings | ✓ | — |
| 27 | PATCH | /api/bookings/:id/status | ✓ | — |
| 28 | DELETE | /api/bookings/:id | ✓ | — |
| 29 | POST | /api/registrations | — | — |
| 30 | GET | /api/registrations | ✓ | — |
| 31 | GET | /api/registrations/event/:eventId | ✓ | — |
| 32 | PATCH | /api/registrations/:id/status | ✓ | — |
| 33 | DELETE | /api/registrations/:id | ✓ | — |
| 34 | GET | /api/testimonials | — | — |
| 35 | POST | /api/testimonials | — | — |
| 36 | PUT | /api/testimonials/:id | ✓ | — |
| 37 | PATCH | /api/testimonials/:id/approve | ✓ | — |
| 38 | DELETE | /api/testimonials/:id | ✓ | — |
| 39 | GET | /api/faqs | — | — |
| 40 | POST | /api/faqs | ✓ | — |
| 41 | PUT | /api/faqs/:id | ✓ | — |
| 42 | PUT | /api/faqs/reorder | ✓ | — |
| 43 | DELETE | /api/faqs/:id | ✓ | — |
| 44 | GET | /api/news | — | — |
| 45 | GET | /api/news/:slug | — | — |
| 46 | POST | /api/news | ✓ | — |
| 47 | PUT | /api/news/:id | ✓ | — |
| 48 | DELETE | /api/news/:id | ✓ | — |
| 49 | GET | /api/sponsors | — | — |
| 50 | POST | /api/sponsors | ✓ | — |
| 51 | PUT | /api/sponsors/:id | ✓ | — |
| 52 | DELETE | /api/sponsors/:id | ✓ | — |
| 53 | POST | /api/subscribers | — | subscribeLimiter |
| 54 | GET | /api/subscribers | ✓ | — |
| 55 | DELETE | /api/subscribers/:id | ✓ | — |
| 56 | POST | /api/contact | — | — |
| 57 | GET | /api/contact | ✓ | — |
| 58 | DELETE | /api/contact/:id | ✓ | — |
| 59 | POST | /api/quotes | — | quoteLimiter |
| 60 | GET | /api/quotes | ✓ | — |
| 61 | PATCH | /api/quotes/:id/status | ✓ | — |
| 62 | DELETE | /api/quotes/:id | ✓ | — |
| 63 | POST | /api/upload | ✓ | — |
| 64 | POST | /api/upload/multiple | ✓ | — |
| 65 | GET | /api/dashboard | ✓ | — |
| 66 | GET | /api/profile | — | — |
| 67 | PUT | /api/profile | ✓ | — |
| 68 | GET | /api/statistics | — | — |
| 69 | POST | /api/statistics | ✓ | — |
| 70 | PUT | /api/statistics/:id | ✓ | — |
| 71 | DELETE | /api/statistics/:id | ✓ | — |
| 72 | GET | /api/hero | — | — |
| 73 | PUT | /api/hero | ✓ | — |
| 74 | GET | /api/videos | — | — |
| 75 | GET | /api/videos/all | ✓ | — |
| 76 | POST | /api/videos | ✓ | — |
| 77 | PUT | /api/videos/:id | ✓ | — |
| 78 | DELETE | /api/videos/:id | ✓ | — |
| 79 | GET | /api/nav | — | — |
| 80 | GET | /api/nav/all | ✓ | — |
| 81 | POST | /api/nav | ✓ | — |
| 82 | PUT | /api/nav/:id | ✓ | — |
| 83 | DELETE | /api/nav/:id | ✓ | — |
| 84 | GET | /api/health | — | — |
| 85 | GET | /api/smtp-debug | — | — |
| 86 | GET | /api/smtp-test-connection | — | — |
| 87 | GET | /api-docs | — | Swagger UI |
