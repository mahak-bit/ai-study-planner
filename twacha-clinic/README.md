# Twacha Clinic — Dr. Vivek Singhvi

Marketing website for Twacha Clinic, the dermatology practice of Dr. Vivek Singhvi in Talwandi, Kota.

This is a standalone Next.js app, separate from the AI Study Planner in the repository root. It has its own
`package.json`, lockfile, lint and build setup.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Framer Motion (`LazyMotion`) · Lucide icons.
Fonts: Cormorant Garamond (headings) + Manrope (body), self-hosted via `next/font`.

## Motion & 3D

Each animated property has one owner: **GSAP** drives everything scroll-linked, and **Framer Motion** handles component state
(menu, tabs, accordions, form, section reveals).

| Piece | Where | What it does |
| --- | --- | --- |
| Hero film | `components/film/` | Real-time WebGL fragment shader (no 3D library). A satin, skin-like surface and a golden serum droplet that falls, is absorbed and ripples outward as you scroll. The camera pushes in, and lines two and three of the headline fill in letter by letter. |
| Skin, layer by layer | `sections/skin-layers.tsx` | Pinned CSS-3D stack of four skin layers that separates on scroll, lifting each layer in turn with the concerns found at that depth. |
| Featured care | `sections/featured.tsx` | Pinned horizontal scroll on desktop, with 3D slide swing and image parallax. A native snap carousel elsewhere. |
| Cards | `ui/tilt.tsx` | Pointer-driven 3D tilt with a soft glare (mouse only). |
| Gallery | `sections/gallery.tsx` | Circle-wipe reveals. |
| Smooth scroll | `ui/smooth-scroll.tsx` | Lenis on GSAP's ticker. Also handles same-page `#anchor` links. |

**Reduced motion** (`prefers-reduced-motion: reduce`): no smooth scrolling and no pinning. The hero renders one still frame with the
full headline, and the skin layers show as a static 3D stack with all four descriptions.

The hero film is procedural, so there are no video frames to download. An AI-generated, scroll-scrubbed film (via the
scroll-site-generator skill and Higgsfield) can be layered in later. It was not generated for this build because the connected
Higgsfield account had no credits. If you add one, keep it abstract: no people, and nothing that could be mistaken for the real clinic.

## Run locally

```bash
cd twacha-clinic
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) to the production domain. It is used for canonical URLs,
Open Graph, the sitemap and structured data.

## Deploy (Vercel)

Create a **new** Vercel project from this repository and set **Root Directory** to `twacha-clinic`.
Add `NEXT_PUBLIC_SITE_URL` as an environment variable.

## Where content lives

All copy and facts are in `src/content/`. Components never hard-code clinic details.

| File | What it controls |
| --- | --- |
| `clinic.ts` | Name, doctor, qualifications, address, phone, WhatsApp, email, hours, social links |
| `media.ts` | Every image slot. `src: null` renders a labelled placeholder |
| `conditions.ts` | Skin and hair conditions grid |
| `treatments.ts` | Treatment explorer categories and featured slides |
| `faqs.ts` | FAQ accordion (also emitted as FAQPage JSON-LD) |
| `reviews.ts` | Patient reviews. Empty = placeholder slots |
| `before-after.ts` | Before/after cases. Empty = section hidden |

To add photos, put files in `public/images/` and set the matching `src` in `media.ts`
(for example `'/images/doctor.jpg'`). They are served through `next/image`.

## Launch checklist: verify before going live

Facts marked `source: 'listing'` in `clinic.ts` came from public directory listings (Justdial, DocIndia, Lybrate, Practo, Yappe),
**not from the clinic itself**. Confirm each with the clinic:

- [ ] Address: `464-A, Talwandi, Near DAV School, Opp. Hanuman Mandir, Kota 324005` (one listing says 465, Sector A)
- [ ] Phone `+91 82906 92839`, and confirm it is also the WhatsApp number
- [ ] Qualifications: MD (DVL), M.R. Medical College, Gulbarga; MBBS, RNT Medical College, Udaipur
- [ ] Opening hours (only "closed on Sundays" was found)
- [ ] Email, years of experience, professional memberships (currently placeholders)
- [ ] The conditions and treatments lists match what the clinic offers
- [ ] Real photographs of the doctor and clinic (all image slots are placeholders)
- [ ] Genuine, permitted patient reviews (none are invented)
- [ ] Privacy Policy and Terms reviewed by the clinic
- [ ] Official Instagram/Facebook URLs, if any (icons hidden until set)

Search for `<Placeholder` in `src/` to find every remaining visible gap.

## Content rules

No invented qualifications, awards, statistics, ratings, testimonials or before/after images. Medical copy is
deliberately conservative and never promises outcomes. Structured data includes only fields that exist in `clinic.ts`.

## Appointment form

No backend is configured. On submit, the form validates the input, then opens WhatsApp with a pre-filled
message to the clinic, and tells the patient the request will be reviewed and is not yet confirmed. To send requests
by email or to a CRM instead, replace the `window.open` call in `src/components/sections/booking-form.tsx`
with a Server Action or API route.
