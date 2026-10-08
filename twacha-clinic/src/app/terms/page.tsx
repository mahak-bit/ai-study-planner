import type { Metadata } from 'next';
import { clinic } from '@/content/clinic';
import { LegalPage } from '@/components/layout/legal-page';
import { Placeholder } from '@/components/ui/placeholder';

export const metadata: Metadata = { title: 'Terms of Use', alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        <Placeholder>Have these terms reviewed by the clinic and its legal adviser before launch</Placeholder>
      </p>
      <h2>Medical information</h2>
      <p>
        Content on this website is for general information only. It is not medical advice and is not a substitute for a consultation
        with a qualified doctor. Diagnosis and treatment are provided only after an in-person evaluation at {clinic.fullName}.
      </p>
      <h2>Appointments</h2>
      <p>
        Submitting an appointment request does not confirm an appointment. The clinic will contact you to confirm availability. In a
        medical emergency, contact your nearest emergency service or hospital.
      </p>
      <h2>Results</h2>
      <p>Responses to treatment vary between individuals. No specific outcome is promised or guaranteed.</p>
    </LegalPage>
  );
}
