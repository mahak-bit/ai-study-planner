import type { MediaKey } from '@/content/media';
import { media } from '@/content/media';
import { MediaFrame } from '@/components/ui/media-frame';
import { SectionHeading } from '@/components/ui/section-heading';
import { Stagger, StaggerItem } from '@/components/ui/reveal';

const tiles: { slot: MediaKey; className: string }[] = [
  { slot: 'galleryReception', className: 'col-span-2 row-span-2 lg:col-span-7 lg:row-span-2' },
  { slot: 'galleryConsultation', className: 'col-span-1 row-span-1 lg:col-span-5 lg:row-span-1' },
  { slot: 'galleryTreatment', className: 'col-span-1 row-span-1 lg:col-span-5 lg:row-span-1' },
  { slot: 'galleryEnvironment', className: 'col-span-1 row-span-1 lg:col-span-5 lg:row-span-1' },
  { slot: 'galleryEquipment', className: 'col-span-1 row-span-1 lg:col-span-7 lg:row-span-1' },
];

export function Gallery() {
  return (
    <section aria-labelledby="gallery-title" className="py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading
          id="gallery-title"
          eyebrow="The clinic"
          title={
            <>
              A calm space <em className="text-clay">for considered care</em>
            </>
          }
          intro="A look inside Twacha Clinic in Talwandi, Kota."
        />
        <Stagger className="mt-14 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] lg:mt-20 lg:auto-rows-[19rem] lg:grid-cols-12 lg:gap-4">
          {tiles.map(({ slot, className }) => (
            <StaggerItem key={slot} className={`group relative ${className}`}>
              <MediaFrame slot={slot} sizes="(min-width: 1024px) 50vw, 50vw" className="h-full w-full" showLabel={false} />
              <span className="absolute bottom-0 left-0 bg-ivory/90 px-3 py-2 text-[0.65rem] font-semibold tracking-[0.18em] text-charcoal uppercase backdrop-blur">
                {media[slot].label}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
