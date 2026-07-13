# SEO Content — MC Adarkwah

## Status
- `SeoService` exists at `src/app/services/seo.service.ts` (Title + Meta + JSON-LD injection)
- Currently used by: `HomeComponent`, `PastEventsComponent` (title only), `EventDetailComponent`
- Admin pages have no SEO treatment (acceptable — auth-guarded)
- **No SSR** configured — dynamic SEO is client-side only

---

## 1. Per-Page Meta Content

### Homepage (`/`)
| Tag | Value |
|---|---|
| **Title** | `Home | MC Adarkwah - Professional MC` *(current, OK)* |
| **Meta description** | MC Adarkwah — Ghana's premier professional Master of Ceremonies. 500+ events hosted across corporate events, weddings, conferences, concerts, and awards nights. Book Ghana's best event host. |
| **og:title** | MC Adarkwah — Professional Master of Ceremonies | Ghana's Premier Event Host |
| **og:description** | Making every event memorable with elegance, energy, and excellence. Ghana's most sought-after MC for corporate events, weddings, conferences, and concerts. |
| **og:image** | `https://mcadarkwah.com/assets/images/og-image.jpg` |
| **og:url** | `https://mcadarkwah.com` |
| **Canonical** | `https://mcadarkwah.com` |

### Past Events (`/past-events`)
| Tag | Value |
|---|---|
| **Title** | `Past Events | MC Adarkwah - Professional MC` |
| **Meta description** | View MC Adarkwah's portfolio of past events — corporate galas, award ceremonies, weddings, conferences, and concerts hosted across Ghana and internationally. |
| **og:title** | Past Events Hosted by MC Adarkwah |
| **og:description** | Explore the events MC Adarkwah has hosted — from corporate awards to royal weddings. See why she is Ghana's most trusted master of ceremonies. |
| **og:image** | `https://mcadarkwah.com/assets/images/og-image.jpg` *(fallback)* |
| **og:url** | `https://mcadarkwah.com/past-events` |

### Event Detail (`/events/:slug`)
| Tag | Value |
|---|---|
| **Title** | `{{event.title}} | MC Adarkwah - Professional MC` *(dynamic, current)* |
| **Meta description** | {{event.shortDescription || event.description}} *(dynamic, current)* |
| **og:title** | {{event.title}} | Hosted by MC Adarkwah *(dynamic)* |
| **og:description** | {{event.shortDescription}} — {{event.venue}}, {{event.date\|date}} *(dynamic)* |
| **og:image** | {{event.bannerImage}} *(dynamic)* |
| **og:url** | `https://mcadarkwah.com/events/{{slug}}` *(dynamic)* |

### Services Page (if added as standalone)
| Tag | Value |
|---|---|
| **Title** | Services | MC Adarkwah - Professional MC |
| **Meta description** | Professional MC services for weddings, corporate events, conferences, concerts, product launches, awards nights, church programs, and private events in Ghana. |
| **og:title** | MC Services — Wedding, Corporate, Conference Hosting in Ghana |
| **og:description** | From corporate galas to intimate weddings, MC Adarkwah offers professional emcee services for every occasion. Book Ghana's premier event host. |

### Booking / Contact Page (if added as standalone)
| Tag | Value |
|---|---|
| **Title** | Book MC Adarkwah | Professional MC for Your Event |
| **Meta description** | Book MC Adarkwah for your next event. Fill out the booking form or contact us directly. Weddings, corporate events, conferences, concerts, and more. |
| **og:title** | Book MC Adarkwah — Ghana's Premier Master of Ceremonies |
| **og:description** | Ready to make your event unforgettable? Book MC Adarkwah for your wedding, corporate event, conference, or concert in Ghana. |

---

## 2. Schema.org JSON-LD Templates

### 2.1 LocalBusiness (Primary — replaces current Person schema)

Use on **Homepage** to represent MC Adarkwah's professional service:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://mcadarkwah.com",
  "name": "MC Adarkwah",
  "alternateName": "MC Adarkwah — Professional Master of Ceremonies",
  "description": "Ghana's premier professional Master of Ceremonies. Specializing in corporate events, weddings, conferences, concerts, awards nights, and private celebrations.",
  "url": "https://mcadarkwah.com",
  "telephone": "[NEEDS OWNER INPUT]",
  "email": "[NEEDS OWNER INPUT]",
  "image": "https://mcadarkwah.com/assets/images/og-image.jpg",
  "logo": "https://mcadarkwah.com/assets/images/og-image.jpg",
  "founder": {
    "@type": "Person",
    "name": "MC Adarkwah",
    "jobTitle": "Professional Master of Ceremonies"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Accra",
    "addressCountry": "GH"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Accra"
    },
    {
      "@type": "Country",
      "name": "Ghana"
    }
  ],
  "priceRange": "GHS 2,000 — 25,000",
  "sameAs": [
    "https://instagram.com/mc_adarkwah",
    "https://twitter.com/mc_adarkwah",
    "https://facebook.com/mc_adarkwah",
    "https://youtube.com/@mc_adarkwah",
    "https://linkedin.com/in/mc-adarkwah"
  ],
  "openingHours": "Mo-Su 08:00-20:00",
  "currenciesAccepted": "GHS, USD",
  "paymentAccepted": ["Cash", "Bank Transfer", "Mobile Money"]
}
```

**Implementation:** Replace the current `Person` JSON-LD in `SeoService` (or use this alongside it). The `@id` should match the page URL.

### 2.2 Event (for dynamic event detail pages)

Use in `EventDetailComponent` for each event:

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": "https://mcadarkwah.com/events/{{slug}}",
  "name": "{{event.title}}",
  "description": "{{event.shortDescription}}",
  "startDate": "{{event.date | date:'yyyy-MM-dd'}}",
  "eventStatus": "{{event.isUpcoming ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventPast'}}",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "{{event.venue}}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "{{event.venue}}",
      "addressLocality": "{{event.city}}",
      "addressCountry": "{{event.country}}"
    }
  },
  "image": "{{event.bannerImage}}",
  "performer": {
    "@type": "Person",
    "name": "MC Adarkwah",
    "jobTitle": "Master of Ceremonies"
  },
  "organizer": {
    "@type": "Organization",
    "name": "MC Adarkwah"
  }
}
```

**Implementation:** Add this to `EventDetailComponent.ngOnInit()` alongside the existing `setMetaTags` call. Use `this.seo.setStructuredData(eventSchema)`.

### 2.3 BreadcrumbList (for all pages)

Add to every page for breadcrumb navigation schema:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mcadarkwah.com"
    },
    {{#if isPastEvents}}
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Past Events",
      "item": "https://mcadarkwah.com/past-events"
    }
    {{/if}}
    {{#if isEventDetail}}
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Past Events",
      "item": "https://mcadarkwah.com/past-events"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{{event.title}}",
      "item": "https://mcadarkwah.com/events/{{slug}}"
    }
    {{/if}}
  ]
}
```

### 2.4 FAQPage (for the FAQ section)

If FAQs are displayed on a dedicated page:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I book MC Adarkwah for my event?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simply fill out the booking form on our website or contact us via phone, email, or WhatsApp. We will get back to you within 24 hours to discuss your event requirements and availability."
      }
    },
    {
      "@type": "Question",
      "name": "How far in advance should I book?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend booking at least 2-3 months in advance for major events. However, we do accommodate last-minute bookings subject to availability."
      }
    }
    // ... continue for all 10 FAQs
  ]
}
```

---

## 3. Image Alt Text Recommendations

When images are replaced, use these alt text patterns:

| Image Type | Alt Text Pattern | Example |
|---|---|---|
| Event banner | `MC Adarkwah hosting [event name] at [venue]` | MC Adarkwah hosting Ghana Corporate Excellence Awards at Accra International Conference Centre |
| Event thumbnail | `[event name] — hosted by MC Adarkwah` | Pan-African Tech Summit — hosted by MC Adarkwah |
| Gallery photo | `MC Adarkwah at [event type] — [brief description]` | MC Adarkwah at corporate gala — red carpet hosting |
| Headshot/avatar | `[name] — [title], gave testimonial for MC Adarkwah` | Sarah Mensah — Event Director, MTN Ghana |
| Service image | `MC Adarkwah hosting [service type]` | MC Adarkwah hosting a wedding ceremony |
| Video thumbnail | `[video title] — MC Adarkwah` | Corporate Awards Night 2025 Highlights — MC Adarkwah |

---

## 4. Implementation Priority

| Priority | Task | File | Effort |
|---|---|---|---|
| P0 | Add Event JSON-LD to `EventDetailComponent` | `src/app/components/event-detail/event-detail.component.ts` | ~10 min |
| P0 | Add meta description + OG tags to `PastEventsComponent` | `src/app/pages/past-events/past-events.component.ts` | ~5 min |
| P1 | Upgrade `Person` schema → `LocalBusiness` in `SeoService` / `HomeComponent` | `src/app/pages/home/home.component.ts` | ~15 min |
| P2 | Add BreadcrumbList JSON-LD to all page components | Each page component | ~5 min/page |
| P2 | Add FAQPage JSON-LD if FAQ section gets its own page | New/Existing component | ~10 min |
| P3 | Configure Angular SSR/Universal for crawler-visible SEO | Project-wide | ~1 day |
