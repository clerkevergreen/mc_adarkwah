# MC Adarkwah — Development Plan

> Multi-phase roadmap to production-ready professional MC website

---

## PHASE 0: CLEANUP & BASELINE (Do First — 1-2 days)

These fix existing bugs and remove dead weight before any new features.

| # | Task | File(s) | Effort |
|---|---|---|---|
| 0.1 | Delete duplicate nested project | `mc-adarkwa/` (entire directory) | 5 min |
| 0.2 | Apply `authLimiter` to login route | `backend/src/routes/auth.js` | 5 min |
| 0.3 | Fix CORS to properly reject unlisted origins | `backend/src/server.js` | 5 min |
| 0.4 | Add `pending` message to `sendQuoteStatusUpdate` | `backend/src/utils/email.js` | 5 min |
| 0.5 | Confirm placeholder assets exist or create them | `src/assets/images/` | 30 min |

---

## PHASE 1: SECURITY & VALIDATION (HIGH PRIORITY — 2-3 days)

Make the backend robust against bad data and attacks.

### 1.1 Input validation for all POST endpoints

Create `backend/src/validators/` with files:

| File | Route(s) |
|---|---|
| `auth.validator.js` | login, register, forgot-password, reset-password |
| `booking.validator.js` | create booking |
| `contact.validator.js` | contact form |
| `quote.validator.js` | quote request |
| `subscriber.validator.js` | newsletter subscribe |
| `registration.validator.js` | event registration |
| `testimonial.validator.js` | testimonial submit |

Hook each into its route using `express-validator` middleware.

### 1.2 Add security headers

Install `helmet` and apply in `server.js`:
```js
const helmet = require('helmet');
app.use(helmet());
```
Update `package.json`.

### 1.3 Add request logging

Install `morgan`:
```js
const morgan = require('morgan');
app.use(morgan('combined'));
```

### 1.4 Sanitize query parameters

In `eventController.js` and any controller that uses `req.query` directly:
- Strip `$` prefixed operators
- Whitelist allowed query params
- Convert strings to proper types

### 1.5 Add global request timeout

```js
const timeout = require('connect-timeout');
app.use(timeout('30s'));
app.use(haltOnTimedout);
```

---

## PHASE 2: REAL CONTENT (HIGH PRIORITY — Ongoing)

### 2.1 Collect and upload real images
- Event photos (banners + thumbnails)
- Gallery images (20+ across categories)
- MC profile photos (headshot + action shots)
- Sponsor logos
- Testimonial contributor photos

### 2.2 Update seed.js with real URLs
Replace all `placehold.co` URLs with real uploaded image URLs.

### 2.3 Record and add video showreel
- 60-90 second highlight reel of MC in action
- Upload via admin panel or embed YouTube/Vimeo
- Place in hero section background or new video area

### 2.4 Write real content
- Replace all placeholder/lorem content in seed data
- Add real event descriptions, service details, about text
- Add real FAQ answers
- Write 3-5 real news/blog posts

---

## PHASE 3: TESTING (MEDIUM PRIORITY — 2-3 days)

### 3.1 Set up test infrastructure
```bash
backend/tests/
  setup.js          — MongoDB memory server or test DB connection
  helpers.js         — createTestAdmin(), login(), cleanup()
```

### 3.2 Write API tests (priority order)
| Route file | Test coverage |
|---|---|
| `auth.test.js` | Login success/fail, register, token expiry, refresh |
| `events.test.js` | CRUD, filtering, pagination, slug lookup |
| `bookings.test.js` | Create, rate limiting, status update, list |
| `gallery.test.js` | CRUD, category filter |
| `services.test.js` | CRUD, order sorting |
| `testimonials.test.js` | Create, approve, list approved only |
| `faqs.test.js` | CRUD, reorder |
| `contact.test.js` | Create, rate limiting |

Run with: `npx vitest` or `npm test` (configure in backend `package.json`)

---

## PHASE 4: FRONTEND POLISH (MEDIUM PRIORITY — 3-5 days)

### 4.1 Form validation UX
- Add inline error messages for each form field
- Show visual error states (red borders, error icons)
- Submit button disabled until form valid
- Handle API errors (show server error messages in form)

### 4.2 Loading & empty states
- Add loading skeletons for every data-driven section
- Add "no data" empty states with helpful messages
- Add retry buttons on API failure

### 4.3 Error handling
- Global error boundary or error handler
- Toast notifications for API errors
- Network-offline detection (show banner)

### 4.4 Placeholder image replacement
- Replace all `assets/images/placeholder.jpg` references
- Replace placeholder-avatar with generated initials SVG or real image

---

## PHASE 5: PROFESSIONAL FEATURES (1-2 weeks)

### 5.1 Availability calendar
**Backend:** New model + route for blocked/available dates
**Frontend:** Month-view calendar showing booked dates, only available dates clickable for booking

### 5.2 Online payments
Integrate **Paystack** or **Flutterwave** (popular in Ghana):
- Add deposit/payment model to backend
- Payment form on booking confirmation
- Webhook handler for payment confirmation
- Update booking status automatically on payment

### 5.3 PDF contract generation
Use `pdfkit` or `jspdf`:
- Auto-generate booking agreement on booking confirmation
- Send as email attachment
- Store in admin panel for download

### 5.4 Client portal
- Simple login for clients (separate from admin)
- View booking status, history, invoices
- Upload event files (schedule, guest list, etc.)
- Message admin directly

### 5.5 SMS notifications
Integrate **Twilio** or **AfricasTalking**:
- SMS on booking confirmed
- SMS reminder 48h before event
- Admin SMS alert on new booking

---

## PHASE 6: MARKETING & CONTENT (ONGOING)

### 6.1 Social feed integration
Embed Instagram feed using Instagram Graph API or a no-code widget.

### 6.2 Media/press kit download
Create a `/media-kit` page or download link with:
- High-res headshots
- Bio (short + long)
- Stats/media mentions
- Logo files
- Previous event list

### 6.3 Blog/content system
The `NewsItem` model already exists. Build out:
- Blog list page on public site
- Blog detail page with rich content
- Category filtering
- RSS feed
- Related posts

### 6.4 SEO improvements
- Auto-generate XML sitemap
- Add `meta robots`, canonical tags dynamically
- Add breadcrumb structured data
- Ensure all pages have unique meta titles/descriptions

### 6.5 Analytics
- Google Analytics 4 + Google Tag Manager
- Track conversions (booking submitted, quote requested, contact form)
- Event tracking for key interactions

---

## PHASE 7: INFRASTRUCTURE & DEVOPS (1-2 days)

### 7.1 Image CDN
Serve uploaded images through CDN (Cloudinary, ImageKit) instead of direct from server:
- Connect multer/sharp pipeline to upload to CDN
- Return CDN URL instead of local URL
- Add image transformation params for thumbnails

### 7.2 PWA support
- Add `manifest.webmanifest`
- Add service worker for offline support
- Add install prompt
- Improve Lighthouse PWA score

### 7.3 Monitoring
- Add uptime monitoring (UptimeRobot, Better Uptime)
- Add error tracking (Sentry)
- Add server health endpoint with DB status

### 7.4 Backup strategy
- Automated MongoDB backups (Atlas has this built-in)
- Database backup before seed or migrate operations
- Upload folder backup

### 7.5 Multilingual support
- Add i18n library (transloco or ngx-translate)
- Translate key pages (at minimum English + Twi)
- Language selector in navbar

---

## PHASE 8: SWAGGER / API DOCUMENTATION (LOW PRIORITY)

### 8.1 Add missing `@swagger` blocks to:
- `routes/quotes.js`
- `routes/registrations.js`
- `routes/hero.js`
- `routes/nav.js`
- `routes/videos.js`
- `routes/statistics.js`
- `routes/profile.js`
- `routes/dashboard.js`

### 8.2 Add production server URL to swagger config

---

## DEPENDENCY GRAPH

```
Phase 0 (Cleanup)
    |
    v
Phase 1 (Security & Validation)
    |
    v
Phase 2 (Real Content) ── can run in parallel with Phase 3
    |
    v
Phase 3 (Testing)
    |
    v
Phase 4 (Frontend Polish) ── depends on Phase 1 fix
    |
    v
Phase 5 (Professional Features)
    |
    ├── 5.1 Availability Calendar
    ├── 5.2 Online Payments
    ├── 5.3 PDF Contracts
    ├── 5.4 Client Portal
    └── 5.5 SMS Notifications
    |
    v
Phase 6 (Marketing & Content) ── ongoing, no strict dependency
    |
    v
Phase 7 (Infrastructure) ── can overlap with Phase 5, 6
    |
    v
Phase 8 (Swagger Docs) ── low priority, anytime
```

---

## QUICK-START CHECKLIST (First Session)

- [ ] Delete `mc-adarkwa/` duplicate
- [ ] Apply `authLimiter` to login
- [ ] Fix CORS fallback
- [ ] Create `backend/src/validators/auth.validator.js`
- [ ] Install `helmet`, `morgan`
- [ ] Add `pending` quote status email message
- [ ] Test current app runs (`cd backend && npm start`)
