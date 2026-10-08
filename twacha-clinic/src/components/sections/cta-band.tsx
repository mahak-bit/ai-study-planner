import { clinic, whatsappHref } from '@/content/clinic';
import { ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-sand blur-3xl" />
      <Reveal className="container-x relative text-center">
        <p className="eyebrow">Begin here</p>
        <h2 id="cta-title" className="display mx-auto mt-6 max-w-4xl text-[2.6rem] sm:text-6xl lg:text-7xl">
          Every plan starts with <em className="text-clay">a conversation.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted sm:text-lg">
          Request an appointment with {clinic.doctor.name}, or message the clinic on WhatsApp with your question.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/book">Book an Appointment</ButtonLink>
          <ButtonLink href={whatsappHref()} variant="outline" icon={<WhatsAppIcon className="size-4" />}>
            Message on WhatsApp
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
