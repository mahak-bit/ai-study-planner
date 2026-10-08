# Twacha Clinic — Dr. Vivek Singhvi

Marketing website for Twacha Clinic, the dermatology practice of Dr. Vivek Singhvi in Talwandi, Kota.

This is a standalone Next.js app, separate from the AI Study Planner in the repository root. It has its own
`package.json`, lockfile, lint and build setup.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Framer Motion (`LazyMotion`, reduced-motion aware) · Lucide icons.
Fonts: Cormorant Garamond (headings) + Manrope (body), self-hosted via `next/font`.

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
