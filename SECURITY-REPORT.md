# Security Report — MC Adarkwah API

> Generated: 2026-07-13
> Covers: Phase 1 implementation

---

## BEFORE (Phase 0)

### Category 1: Mass Assignment (HIGH) — 24 instances

Every POST/PUT/PATCH endpoint spread `req.body` directly into database operations:

| Controller | Line | Risk |
|---|---|---|
| `bookingController.js` | `Booking.create(req.body)` | Attacker sets `status: 'confirmed'`, injects operators |
| `contactController.js` | `ContactMessage.create(req.body)` | Any field writable |
| `testimonialController.js` | `Testimonial.create(req.body)` | Attacker sets `isApproved: true` |
| `galleryController.js` | `GalleryItem.create(req.body)` | Any field writable |
| `faqController.js` | `FAQ.create(req.body)`, `findByIdAndUpdate(req.body)` | Any field writable |
| `quoteController.js` | `Quote.create(req.body)` | Attacker sets `status: 'closed'` |
| `registrationController.js` | `EventRegistration.create(req.body)` | Any field writable |
| `serviceController.js` | `Service.create(req.body)` | Any field writable |
| `sponsorController.js` | `Sponsor.create(req.body)` | Any field writable |
| `statisticController.js` | `Statistic.create(req.body)` | Any field writable |
| `navController.js` | `NavItem.create(req.body)` | Any field writable |
| `heroController.js` | `Object.assign(hero, req.body)` | Any field writable |
| `profileController.js` | `Object.assign(profile, req.body)` | Any field writable |
| `videoController.js` | `VideoHighlight.create(req.body)` | Any field writable |
| `newsController.js` | `NewsItem.create(req.body)` | Any field writable |
| `eventController.js` | `Event.create({...req.body})` | Any field writable |

### Category 2: Query Operator Injection (MEDIUM) — 6 instances

Express extended query parser converts `?status[$ne]=pending` to `{ status: { $ne: 'pending' } }`:

| Controller | Query |
|---|---|
| `bookingController.js:21` | `if (status) query.status = status` |
| `quoteController.js:21` | `if (status) query.status = status` |
| `registrationController.js:22` | `if (status) query.status = status` |
| `galleryController.js:7` | `if (category) query.category = category` |
| `newsController.js:8` | `if (category) query.category = category` |
| `eventController.js:14` | `{ $regex: location, $options: 'i' }` |

### Category 3: Missing Rate Limiting

| Endpoint | Missing limiter |
|---|---|
| `POST /api/auth/login` | (fixed in Phase 0) |
| `POST /api/auth/forgot-password` | No rate limiter |
| `POST /api/subscribers` | No rate limiter |

### Category 4: Missing Security Headers

- No `helmet` middleware installed
- No CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security headers
- No request logging (no `morgan`)

### Category 5: No Input Validation

- Zero validation on any endpoint
- No field type checks
- No length limits
- No email format validation
- No required field enforcement

---

## AFTER (Phase 1)

### Fix 1: Mass Assignment — ALL instances resolved

Every controller now destructures only whitelisted fields:

```js
// BEFORE
const booking = await Booking.create(req.body);

// AFTER
const { fullName, email, phone, eventType, eventDate, eventLocation, guestCount, budgetRange, additionalNotes, agreeToTerms } = req.body;
const booking = await Booking.create({ fullName, email, phone, eventType, eventDate: new Date(eventDate), eventLocation, ... });
```

Update handlers use the same whitelist pattern:
```js
const { icon, title, shortDescription, ... } = req.body;
const updateData = { icon, title, shortDescription, ... };
Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
const service = await Service.findByIdAndUpdate(req.params.id, updateData, ...);
```

**Result: 24 HIGH risks → 0**

### Fix 2: Query Operator Injection — ALL instances resolved

- Added `sanitizeQuery` global middleware that recursively strips `$`-prefixed MongoDB operators from all query strings
- Before reaching any controller, `?status[$ne]=pending` becomes `?status=pending`

**Files created:**
- `backend/src/middleware/sanitize.js` — exports `stripMongoOperators()`, `sanitizeQuery`, `sanitizeBody`

**Result: 6 MEDIUM risks → 0**

### Fix 3: Rate Limiting — ALL gaps closed

| Endpoint | Limiter | Window | Max |
|---|---|---|---|
| `POST /api/auth/login` | `authLimiter` | 15 min | 10 |
| `POST /api/auth/forgot-password` | `authLimiter` | 15 min | 10 |
| `POST /api/bookings` | `bookingLimiter` | 15 min | 5 |
| `POST /api/contact` | `contactLimiter` | 15 min | 3 |
| `POST /api/subscribers` | `subscribeLimiter` | 60 min | 10 |
| `POST /api/quotes` | `quoteLimiter` | 15 min | 5 |

**Result: All public POST endpoints rate-limited**

### Fix 4: Security Headers — Installed

`helmet` middleware added to `server.js`:
```js
app.use(helmet());
```

This adds:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security`
- `Referrer-Policy`
- `Permissions-Policy`

### Fix 5: Input Validation — Implemented

**File created:** `backend/src/middleware/validate.js`

Contains validation chains for every endpoint:

| Validator | Endpoints covered |
|---|---|
| `auth.setup` | POST `/api/auth/setup` |
| `auth.register` | POST `/api/auth/register` |
| `auth.login` | POST `/api/auth/login` |
| `auth.forgotPassword` | POST `/api/auth/forgot-password` |
| `auth.resetPassword` | POST `/api/auth/reset-password` |
| `auth.refresh` | POST `/api/auth/refresh` |
| `booking.create` | POST `/api/bookings` |
| `booking.statusUpdate` | PATCH `/api/bookings/:id/status` |
| `contact.create` | POST `/api/contact` |
| `quote.create` | POST `/api/quotes` |
| `quote.statusUpdate` | PATCH `/api/quotes/:id/status` |
| `subscriber.create` | POST `/api/subscribers` |
| `registration.create` | POST `/api/registrations` |
| `registration.statusUpdate` | PATCH `/api/registrations/:id/status` |
| `event.create` | POST `/api/events` |
| `event.update` | PUT `/api/events/:id` |
| `gallery.create/update` | POST/PUT `/api/gallery` |
| `testimonial.create/update` | POST/PUT `/api/testimonials` |
| `service.create/update` | POST/PUT `/api/services` |
| `faq.create/update/reorder` | POST/PUT `/api/faqs`, PUT `/api/faqs/reorder` |
| `news.create/update` | POST/PUT `/api/news` |
| `sponsor.create/update` | POST/PUT `/api/sponsors` |
| `hero.update` | PUT `/api/hero` |
| `nav.create/update` | POST/PUT `/api/nav` |
| `video.create/update` | POST/PUT `/api/videos` |
| `statistic.create/update` | POST/PUT `/api/statistics` |
| `profile.update` | PUT `/api/profile` |
| `idParam` | All DELETE routes |

Validates: email format, required fields, string lengths, ISO dates, MongoDB ObjectIds, enum values, array types, boolean coercion.

### Fix 6: JWT Authentication — Verified (no changes needed)

- `protect` middleware extracts Bearer token and verifies with `jsonwebtoken`
- Token expiry: 7 days (configurable via `JWT_EXPIRES_IN`)
- Refresh token: 30 days
- Password hashing: bcrypt with 12 salt rounds
- `toJSON()` strips password from all responses
- Rate-limited with `authLimiter` (10 requests per 15 min window)

### Fix 7: Secrets from Environment — Verified (no changes needed)

All secrets come from `.env`:
- `MONGODB_URI` — Atlas connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — token signing
- `SMTP_USER` / `SMTP_PASS` — email auth
- `MAX_FILE_SIZE` — upload limit

### Fix 8: Request Body Sanitization

Added `sanitizeBody` middleware that runs on all `/api/*` routes, stripping `$`-prefixed MongoDB operators from POST/PUT/PATCH bodies before they reach controllers.

---

## SUMMARY

| Issue | Before | After |
|---|---|---|
| Mass assignment (HIGH) | 24 instances | 0 |
| Query operator injection (MEDIUM) | 6 instances | 0 |
| Missing rate limiting | 2 endpoints | 0 |
| Security headers | None | Helmet (8 headers) |
| Input validation | 0 endpoints | 27+ endpoints |
| Body sanitization | None | Global middleware |
| Unvalidated ObjectId params | 15+ routes | All validated |

**New files:**
- `backend/src/middleware/validate.js` (420 lines)
- `backend/src/middleware/sanitize.js` (42 lines)

**Modified files:** 38 files across controllers, routes, and server.js

**Build status:** Angular frontend ✓ | Backend modules ✓
