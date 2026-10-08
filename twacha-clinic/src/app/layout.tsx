import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { clinic, siteUrl } from '@/content/clinic';
import { clinicJsonLd, serializeJsonLd } from '@/lib/structured-data';
import { MotionProvider } from '@/components/ui/motion-provider';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MobileCtaBar } from '@/components/layout/mobile-cta-bar';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const title = `${clinic.doctor.name} – ${clinic.name} | Dermatologist in Talwandi, Kota`;
const description = `${clinic.name} in Talwandi, Kota — dermatology, hair & scalp and aesthetic care with ${clinic.doctor.name}. Book an appointment or message us on WhatsApp.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${clinic.name}, Kota` },
  description,
  keywords: ['dermatologist in Kota', 'skin clinic Kota', 'Twacha Clinic', 'Dr. Vivek Singhvi', 'skin specialist Talwandi', 'hair fall treatment Kota'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: `${clinic.name} – ${clinic.doctor.name}`,
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#faf7f2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(clinicJsonLd()) }} />
        <MotionProvider>
          <SmoothScroll>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <MobileCtaBar />
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
