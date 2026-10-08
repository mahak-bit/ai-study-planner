import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-start justify-center pt-24">
      <p className="eyebrow">404</p>
      <h1 className="display mt-6 text-5xl sm:text-7xl">This page could not be found.</h1>
      <div className="mt-10">
        <ButtonLink href="/">Return home</ButtonLink>
      </div>
    </section>
  );
}
