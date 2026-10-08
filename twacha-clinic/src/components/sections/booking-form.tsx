'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { CheckCircle2, Info } from 'lucide-react';
import { clinic, telHref, whatsappHref } from '@/content/clinic';
import { hairConditions, skinConditions } from '@/content/conditions';
import { treatmentCategories } from '@/content/treatments';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { buttonClasses } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type Fields = {
  name: string;
  phone: string;
  email: string;
  concern: string;
  date: string;
  time: string;
  message: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const TIME_PREFERENCES = ['Morning', 'Afternoon', 'Evening', 'Any time'];

const concernOptions = [
  { group: 'Skin', items: skinConditions.map((c) => c.name) },
  { group: 'Hair & Scalp', items: hairConditions.map((c) => c.name) },
  { group: 'Treatments', items: treatmentCategories.flatMap((c) => c.treatments.map((t) => t.name)) },
];
const allConcerns = new Set(concernOptions.flatMap((g) => g.items));

function resolveConcern(param: string | null) {
  if (!param) return '';
  const bySlug = [...skinConditions, ...hairConditions].find((c) => c.slug === param);
  if (bySlug) return bySlug.name;
  return allConcerns.has(param) ? param : '';
}

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!/^\+?[\d\s-]{10,15}$/.test(f.phone.trim())) e.phone = 'Please enter a valid phone number.';
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Please enter a valid email address.';
  if (!f.concern) e.concern = 'Please choose the concern you would like to discuss.';
  return e;
}

function buildMessage(f: Fields) {
  return [
    `Appointment request — ${clinic.name}`,
    '',
    `Name: ${f.name}`,
    `Phone: ${f.phone}`,
    f.email && `Email: ${f.email}`,
    `Concern: ${f.concern}`,
    f.date && `Preferred date: ${f.date}`,
    f.time && `Preferred time: ${f.time}`,
    f.message && `Message: ${f.message}`,
  ]
    .filter(Boolean)
    .join('\n');
}

const inputClasses =
  'mt-2 block w-full border-0 border-b border-charcoal/20 bg-transparent px-0 py-3 text-base text-ink placeholder:text-taupe/70 transition-colors focus:border-clay focus-visible:outline-offset-4 aria-[invalid=true]:border-red-700';

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow text-[0.62rem] text-charcoal">
        {label} {optional ? <span className="font-normal tracking-normal text-taupe normal-case">(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function BookingForm() {
  const params = useSearchParams();
  const initialConcern = useMemo(() => resolveConcern(params.get('concern')), [params]);
  const [fields, setFields] = useState<Fields>({ name: '', phone: '', email: '', concern: initialConcern, date: '', time: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const set = (key: keyof Fields) => (e: { target: { value: string } }) => setFields((f) => ({ ...f, [key]: e.target.value }));
  const describedBy = (key: keyof Fields) => (errors[key] ? `${key}-error` : undefined);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      document.getElementById(first)?.focus();
      return;
    }
    // No server is configured yet, so the request is handed to the clinic via WhatsApp.
    window.open(whatsappHref(buildMessage(fields)), '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <m.div
          key="done"
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-line bg-cream p-8 sm:p-12"
        >
          <CheckCircle2 aria-hidden className="size-10 text-clay" strokeWidth={1.3} />
          <h2 className="mt-6 font-serif text-4xl text-ink">Thank you, {fields.name.split(' ')[0]}.</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted">
            Your appointment request will be reviewed by the clinic. We&apos;ve opened WhatsApp with your details — please press{' '}
            <strong className="font-semibold text-charcoal">send</strong> so the clinic receives it. The clinic will contact you to confirm a time.
            Submitting a request does not by itself confirm an appointment.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappHref(buildMessage(fields))} target="_blank" rel="noopener noreferrer" className={buttonClasses('primary')}>
              <WhatsAppIcon className="size-4" /> Open WhatsApp again
            </a>
            <a href={telHref(clinic.phone.value)} className={buttonClasses('outline')}>
              Call {clinic.phone.value}
            </a>
          </div>
          <button type="button" onClick={() => setSubmitted(false)} className="mt-8 text-sm text-muted underline underline-offset-4 hover:text-clay">
            Edit my request
          </button>
        </m.div>
      ) : (
        <m.form key="form" noValidate onSubmit={onSubmit} exit={{ opacity: 0, y: -8 }} className="space-y-9" aria-describedby="form-note">
          <div className="grid gap-9 sm:grid-cols-2">
            <Field id="name" label="Full name" error={errors.name}>
              <input id="name" name="name" autoComplete="name" required value={fields.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={describedBy('name')} className={inputClasses} placeholder="Your name" />
            </Field>
            <Field id="phone" label="Phone" error={errors.phone}>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={fields.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={describedBy('phone')} className={inputClasses} placeholder="+91" />
            </Field>
            <Field id="email" label="Email" optional error={errors.email}>
              <input id="email" name="email" type="email" autoComplete="email" value={fields.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={describedBy('email')} className={inputClasses} placeholder="you@example.com" />
            </Field>
            <Field id="concern" label="Concern" error={errors.concern}>
              <select id="concern" name="concern" required value={fields.concern} onChange={set('concern')} aria-invalid={!!errors.concern} aria-describedby={describedBy('concern')} className={cn(inputClasses, !fields.concern && 'text-taupe/70')}>
                <option value="">Select a concern</option>
                {concernOptions.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((item) => (
                      <option key={`${g.group}-${item}`} value={item}>
                        {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Other / not sure">Other / not sure</option>
              </select>
            </Field>
            <Field id="date" label="Preferred date" optional>
              <input id="date" name="date" type="date" min={today} value={fields.date} onChange={set('date')} className={inputClasses} />
            </Field>
            <Field id="time" label="Preferred time" optional>
              <select id="time" name="time" value={fields.time} onChange={set('time')} className={cn(inputClasses, !fields.time && 'text-taupe/70')}>
                <option value="">No preference</option>
                {TIME_PREFERENCES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="message" label="Message" optional>
            <textarea id="message" name="message" rows={4} value={fields.message} onChange={set('message')} className={cn(inputClasses, 'resize-y')} placeholder="Briefly describe your concern, if you'd like" />
          </Field>

          <div id="form-note" className="flex gap-3 border-l-2 border-clay/50 bg-cream px-5 py-4 text-sm leading-relaxed text-muted">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-clay" />
            <p>
              Your appointment request will be reviewed by the clinic. Submitting this form does not guarantee an appointment — the clinic
              will contact you to confirm availability. Please do not use this form for medical emergencies.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className={buttonClasses('primary', 'w-full sm:w-auto')}>
              Request Appointment
            </button>
            <p className="text-xs text-muted">Your details will be sent to the clinic via WhatsApp.</p>
          </div>
        </m.form>
      )}
    </AnimatePresence>
  );
}
