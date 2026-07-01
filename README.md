# garvoday-website

Real estate website with AI chatbot for **Garvoday Developers Pvt. Ltd.**

Built with **Next.js (App Router)** + **Tailwind CSS v4**.

> **Current status:** Frontend website only (Home, Properties, Property Detail,
> Contact, floating WhatsApp button). Property data is placeholder/dummy for now.
> The database, admin panel, and AI chatbot will be added in later phases.

## Getting started

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the dev server at http://localhost:3000
```

Other commands:

```bash
npm run build    # production build
npm run start    # run the production build
```

## Project structure

```
app/
  layout.js              # shared layout (navbar, footer, WhatsApp button)
  page.js                # Home page (hero, featured properties)
  globals.css            # Tailwind + brand theme (navy + gold)
  properties/
    page.js              # Listings with search + city/type filters
    [id]/page.js         # Property detail page
  contact/
    page.js              # Contact form (frontend only for now)
components/
  Navbar.js              # responsive top navigation
  Footer.js
  WhatsAppButton.js      # floating WhatsApp button on all pages
  PropertyCard.js        # reusable property card
lib/
  properties.js          # placeholder property data + helpers
```

## Roadmap (from project proposal)

- [x] Website frontend (Home, Listings, Detail, Contact, WhatsApp button)
- [ ] Database (Supabase or MongoDB â€” to be decided)
- [ ] Admin panel (login, add/edit/delete properties, view leads)
- [ ] AI chatbot (property recommendations + lead capture)
- [ ] Deployment (domain, hosting, SSL)

## Notes

- Replace the WhatsApp number in `components/WhatsAppButton.js` and the contact
  details in `components/Footer.js` / `app/contact/page.js` with the real ones.
- Property images currently load from Unsplash (configured in `next.config.mjs`).
