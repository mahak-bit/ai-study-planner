import { HeartHandshake, MapPin, ScanFace, Sparkles, Sprout } from 'lucide-react';
import { clinic } from '@/content/clinic';
import { Stagger, StaggerItem } from '@/components/ui/reveal';

const points = [
  { icon: ScanFace, label: 'Clinical Dermatology' },
  { icon: Sprout, label: 'Hair & Scalp' },
  { icon: Sparkles, label: 'Aesthetic Dermatology' },
  { icon: HeartHandshake, label: 'Personalised Care' },
  { icon: MapPin, label: `Talwandi, ${clinic.city}` },
];

export function TrustStrip() {
  return (
    <section aria-label="What we offer" className="border-y border-line bg-cream/60">
      <Stagger as="ul" className="container-x grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5">
        {points.map(({ icon: Icon, label }, i) => (
          <StaggerItem
            as="li"
            key={label}
            className={`flex items-center gap-3 py-6 lg:justify-center lg:py-8 ${i === points.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <Icon aria-hidden className="size-5 shrink-0 text-clay" strokeWidth={1.4} />
            <span className="text-[0.8rem] font-medium tracking-wide text-charcoal">{label}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
