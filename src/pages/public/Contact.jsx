import { useState } from 'react';
import { Phone, MapPin, Clock, MessageCircle, Send, Navigation } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { Field, Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CallbackForm } from '@/features/leads/CallbackForm';
import { useToast } from '@/components/ui/Toast';
import { submitContact } from '@/features/leads/leadService';
import { isValidName, isValidPhone, isValidEmail } from '@/features/leads/validation';
import { SITE, whatsappUrl, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

function ContactMessageForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!isValidName(form.name)) e.name = 'Please enter your name';
    if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit number';
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email';
    if (!form.message || form.message.trim().length < 5) e.message = 'Add a short message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitContact(form);
      toast('Message sent! We will get back to you soon.', 'success');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      toast('Could not send message. Please WhatsApp us.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="ct-name" required error={errors.name}>
          <Input id="ct-name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Phone" htmlFor="ct-phone" required error={errors.phone}>
          <Input id="ct-phone" type="tel" inputMode="numeric" maxLength={10} value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} />
        </Field>
      </div>
      <Field label="Email" htmlFor="ct-email" error={errors.email} hint="Optional">
        <Input id="ct-email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label="Message" htmlFor="ct-msg" required error={errors.message}>
        <Textarea id="ct-msg" rows={4} value={form.message} error={errors.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
      </Field>
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={Send}>
        Send Message
      </Button>
    </form>
  );
}

function InfoRow({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-bold text-heading">{title}</p>
        <div className="mt-0.5 text-sm text-body">{children}</div>
      </div>
    </div>
  );
}

export default function Contact() {
  const { site } = useSite();
  const hourLines = site.hours.groups || [];

  return (
    <>
      <SEO title="Contact Us" description={`Visit BISWAJIT POWER HUB at ${site.address.full}. Call, WhatsApp, or request a callback.`} path="/contact" />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-12 sm:py-16">
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              Contact
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">{SITE.name}</h1>
            <p className="mt-2 text-base font-semibold text-gradient">{SITE.tagline}</p>
            <p className="mt-3 max-w-xl text-body">
              We&apos;d love to help you find the perfect electric ride. Questions about custom battery upgrades? Reach out any way you like.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Info + map */}
          <div>
            <Reveal>
              <div className="space-y-6 rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-8">
                <InfoRow icon={Phone} title="Call us">
                  <div className="flex flex-col gap-1">
                    {site.phones.map((p) => (
                      <a key={p} href={telUrl(p, site)} onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'contact' })} className="font-medium transition hover:text-brand-700">
                        +91 {p}
                      </a>
                    ))}
                  </div>
                </InfoRow>
                <InfoRow icon={MapPin} title="Visit our showroom">
                  {site.address.full}
                </InfoRow>
                <InfoRow icon={Clock} title="Opening hours">
                  {hourLines.map((g, i) => (
                    <span key={g.label}>
                      {i > 0 && <br />}
                      {g.label}: {g.text}
                    </span>
                  ))}
                </InfoRow>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button href={whatsappUrl(undefined, site)} variant="whatsapp" icon={MessageCircle} fullWidth onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'contact' })}>
                    WhatsApp Us
                  </Button>
                  <Button href={site.maps.link} variant="secondary" icon={Navigation} fullWidth>
                    Get Directions
                  </Button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="mt-6">
              <div className="overflow-hidden rounded-2xl ring-1 ring-line shadow-soft">
                <iframe
                  title="BISWAJIT POWER HUB location"
                  src={site.maps.embed}
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Reveal>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            <Reveal>
              <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-8">
                <h2 className="font-display text-xl font-bold text-heading">Send us a message</h2>
                <p className="mt-1 text-sm text-muted">We typically reply within a few hours.</p>
                <div className="mt-5">
                  <ContactMessageForm />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-2xl bg-brand-gradient p-6 shadow-card sm:p-8">
                <h2 className="font-display text-xl font-bold text-white">Prefer a callback?</h2>
                <p className="mt-1 text-sm text-white/85">Drop your number and we'll call you.</p>
                <div className="mt-5 rounded-2xl bg-surface p-5">
                  <CallbackForm compact />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
