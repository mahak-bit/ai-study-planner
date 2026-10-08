import type { Metadata } from 'next';
import { clinic, telHref } from '@/content/clinic';
import { LegalPage } from '@/components/layout/legal-page';
import { Placeholder } from '@/components/ui/placeholder';

export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        <Placeholder>Have this policy reviewed by the clinic and its legal adviser before launch</Placeholder>
      </p>
      <p>This policy explains how {clinic.fullName} handles information you share through this website.</p>
      <h2>Information you share</h2>
      <p>
        When you request an appointment, you may provide your name, phone number, email address, the concern you would like to
        discuss, and a preferred date and time. The form passes these details to the clinic through WhatsApp; this website does not
        store them on its own servers.
      </p>
      <h2>How it is used</h2>
      <p>Your details are used only to respond to your enquiry and arrange an appointment. They are not sold or shared for marketing.</p>
      <h2>Third-party services</h2>
      <p>This site embeds Google Maps and links to WhatsApp. These services have their own privacy policies.</p>
      <h2>Contact</h2>
      <p>
        For questions about your information, call the clinic on{' '}
        <a className="text-charcoal underline underline-offset-4" href={telHref(clinic.phone.value)}>
          {clinic.phone.value}
        </a>
        .
      </p>
    </LegalPage>
  );
}
