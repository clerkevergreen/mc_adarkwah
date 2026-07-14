# MC Adarkwah — Project Audit & Reference

> Generated from full codebase review
> Date: 2026-07-13

---

## 1. DUPLICATE PROJECT (HIGH PRIORITY)

**Location:** `mc-adarkwa/` at repo root
**Issue:** This is a stale duplicate of the real Angular app. The active one is at the repo root (`src/`, `angular.json`, `package.json`). The nested copy has its own `node_modules`, `src/`, `angular.json`.

**Action:** Delete `mc-adarkwa/` entirely once confirmed the root is the live version.

---

## 2. EMPTY VALIDATORS DIRECTORY (HIGH PRIORITY)

**Location:** `backend/src/validators/` — exists but has ZERO files
**Issue:** `express-validator` is in `package.json` dependencies but never used. No route has request validation — no field type checks, sanitization, length limits, or custom error messages.

**All public POST endpoints that need validation:**

| Endpoint | Required Fields |
|---|---|
| POST `/api/auth/login` | email (valid email), password (min 6) |
| POST `/api/auth/register` | name, email, password |
| POST `/api/auth/forgot-password` | email |
| POST `/api/auth/reset-password` | token, password |
| POST `/api/bookings` | fullName, email, phone, eventType, eventDate |
| POST `/api/contact` | name, email, message |
| POST `/api/quotes` | name, email, phone, eventType |
| POST `/api/subscribers` | email |
| POST `/api/registrations` | fullName, email, phone, event |
| POST `/api/testimonials` | name, email... |
| POST `/api/upload` | multipart image validation |

**Pattern to follow:** Create `backend/src/validators/` files like:
- `auth.validator.js`
- `booking.validator.js`
- `contact.validator.js`
- `quote.validator.js`
- `subscriber.validator.js`
- `registration.validator.js`
- `testimonial.validator.js`

Each exports middleware arrays to be inserted into routes, e.g.:
```js
// booking.validator.js
const { body } = require('express-validator');
exports.createBooking = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  // ...
];
```

Then use in routes:
```js
const { createBooking } = require('../validators/booking.validator');
router.post('/', createBooking, bookingController.create);
```

---

## 3. AUTH RATE LIMITER NOT APPLIED (HIGH PRIORITY)

**Location:** `backend/src/routes/auth.js:85`
**Issue:** `authLimiter` is defined and exported from `middleware/rateLimiter.js:23` but never imported or used on the login route. No brute-force protection on login.

**Fix:**
```js
// In routes/auth.js
const { authLimiter } = require('../middleware/rateLimiter');
router.post('/login', authLimiter, login);
```

Also consider applying to `/forgot-password` to prevent spam.

---

## 4. CORS IS WIDE OPEN (MEDIUM PRIORITY)

**Location:** `backend/src/server.js:26-35`
**Issue:** Despite listing allowed origins, the callback falls through to `callback(null, true)` for ALL origins — effectively allowing any domain.

**Fix:** Remove the permissive fallback:
```js
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## 5. NO TESTS (MEDIUM PRIORITY)

**Location:** Entire project
**Issue:** `vitest` is installed in `package.json` but there are zero test files.

**Structure to create:**
```
src/app/**/*.spec.ts          — Component/service unit tests (optional for now)
backend/tests/
  api/
    auth.test.js
    events.test.js
    bookings.test.js
    gallery.test.js
    ...
  setup.js                   — Test DB connection
  helpers.js                 — Auth helper, cleanup
```

---

## 6. MISSING SWAGGER DOCS (MEDIUM PRIORITY)

**Issue:** Some route files lack `@swagger` annotations:
- `quotes.js`
- `registrations.js`
- `hero.js`
- `nav.js`
- `videos.js`
- `statistics.js`
- `profile.js`
- `dashboard.js`

Check each and add `@swagger` JSDoc blocks matching the existing pattern in `auth.js` or `events.js`.

Also `swagger.js` only lists the dev server URL — should include production:
```js
servers: [
  { url: 'http://localhost:5000', description: 'Development' },
  { url: 'https://mc-adarkwah.onrender.com', description: 'Production' },
],
```

---

## 7. INCOMPLETE EMAIL STATE HANDLING (LOW PRIORITY)

**Location:** `backend/src/utils/email.js:166-169`
**Issue:** `sendQuoteStatusUpdate` only defines messages for `contacted` and `closed` — the `pending` status has no message, falling through to the generic fallback.

**Fix:** Add a `pending` message to `statusMessages`:
```js
const statusMessages = {
  pending: 'Your quote request is still being reviewed. We will get back to you soon.',
  contacted: '...',
  closed: '...',
};
```

Also consider adding a `confirmed` status for quotes.

---

## 8. ALL SEED DATA USES PLACEHOLDER IMAGES (HIGH PRIORITY)

**Location:** `backend/src/seed.js`
**Issue:** Every single image URL is `https://placehold.co/...` — no real event photos, gallery items, team photos, or sponsor logos.

**Action:** Replace with real images. Options:
- Upload via the admin panel's upload API and store the returned URLs
- Update seed.js with real image URLs from cloud storage (Cloudinary, S3, etc.)

Resources needed:
- Event banners/photos
- Gallery images (at least 15-20)
- MC profile photo(s)
- Sponsor logos
- Testimonial contributor photos

---

## 9. FRONTEND ISSUES (VARIOUS PRIORITIES)

### 9.1 Placeholder images throughout UI
Components reference `assets/images/placeholder.jpg` and `assets/images/placeholder-avatar.jpg` — these files may not exist. Create them or replace with inline SVGs.

### 9.2 Template-driven forms lack user-friendly validation feedback
Forms use basic HTML5 validation attributes (`required`, `email`) but show no custom error messages or visual indicators. Consider adding `#errors` or a validation feedback component.

### 9.3 Forms don't handle API error responses gracefully
Most forms assume success on response. Error states (network failure, server error) are not surfaced to the user.

### 9.4 API URL is hardcoded
`src/environments/environment.ts` has `apiUrl: 'https://mc-adarkwah.onrender.com/api'` — should be configurabledeploy target.

---

## 10. BACKEND GAPS

### 10.1 No request timeout middleware
Add `connect-timeout` or a global timeout to prevent hung requests.

### 10.2 No helmet/security headers
Consider `helmet` for security headers (CSP, X-Frame-Options, etc.).

### 10.3 No request logging
No morgan or structured logger — only `console.log` statements. Add `morgan` for HTTP logging.

### 10.4 No DB indexing review
Check that frequently queried fields have MongoDB indexes (some do, but a full audit would be good).

### 10.5 No data sanitization
MongoDB is vulnerable to `$where`, `$regex`, NoSQL injection if query params are passed directly. Currently queries use `req.query` directly in some controllers — need to sanitize.

---

## 11. PROFESSIONAL ADDITIONS ROADMAP

See `PROJECT-PLAN.md` for the full prioritized implementation roadmap.

---

## FILE INDEX REFERENCE

| Area | Key Files |
|---|---|
| Backend entry | `backend/src/server.js` |
| Routes | `backend/src/routes/*.js` (20 files) |
| Controllers | `backend/src/controllers/*.js` (20 files) |
| Models | `backend/src/models/*.js` (18 files) |
| Middleware | `backend/src/middleware/auth.js`, `errorHandler.js`, `rateLimiter.js`, `upload.js` |
| Email | `backend/src/utils/email.js` |
| Seed | `backend/src/seed.js` |
| Frontend entry | `src/main.ts`, `src/index.html` |
| App component | `src/app/app.component.ts` |
| Routes | `src/app/app.routes.ts` |
| Pages | `src/app/pages/` (home, past-events) |
| Components | `src/app/components/` (24 components) |
| Admin | `src/app/admin/` (routes, guard, interceptor, 17 pages) |
| Services | `src/app/services/` (4 public + 19 admin) |
| Models | `src/app/models/` (6 interfaces) |
| Shared | `src/app/shared/` (directives, pipes) |
| Environment | `src/environments/` |
