import { useMemo, useState } from 'react';
import { Phone, MapPin, Clock, MessageCircle, Send, Navigation } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { Field, Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CallbackForm } from '@/features/leads/CallbackForm';
import { useToast } from '@/components/ui/Toast';
import { submitContact } from '@/features/leads/leadService';
import { isValidName, isValidPhone, isValidEmail } from '@/features/leads/validation';
import { SITE, whatsappUrl, telUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

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
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={Send} className="min-h-12">
        Send Message
      </Button>
    </form>
  );
}

export default function Contact() {
  const { site } = useSite();
  const contactJsonLd = useMemo(
    () =>
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ]),
    [],
  );

  return (
    <>
      <SEO
        title="Visit Our Showroom — Chunakhali, Berhampore | Biswajit Power Hub"
        description="Visit Biswajit Power Hub at Chunakhali Bus Stand, Berhampore. Electric scooter dealer. Call 096355 05436 or WhatsApp us."
        path="/contact"
        jsonLd={contactJsonLd}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-[#f5f5f5]/50">
        <div className="container-px py-12 sm:py-16">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Contact' }]} />
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-[#ff6600]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff6600]">
              Contact
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">
              Visit Our Showroom — Chunakhali, Berhampore | Biswajit Power Hub
            </h1>
            <p className="mt-3 max-w-xl text-body">
              Near Chunakhali Bus Stand, Nimtala. Call or WhatsApp for prices, EMI, and test rides — we
              don&apos;t sell online.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <Reveal>
              <h2 className="border-b border-line pb-3 font-display text-2xl font-extrabold text-heading">
                Visit Our Showroom in Berhampore
              </h2>
              <div className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow-soft ring-1 ring-line sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4285f4]/10 text-[#4285f4]">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <address className="not-italic text-base leading-relaxed text-body">
                    <strong className="font-display text-lg text-heading">{SITE.name}</strong>
                    <br />
                    Chunakhali Bus Stand, Nimtala
                    <br />
                    Berhampore, Murshidabad
                    <br />
                    West Bengal — 742149, India
                    <br />
                    <span className="mt-2 block font-medium text-[#ff6600]">
                      Near Chunakhali Bus Stand
                    </span>
                  </address>
                </div>

                <a
                  href={site.maps.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'contact' })}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-base font-bold text-white sm:w-auto"
                  style={{ backgroundColor: '#4285f4' }}
                >
                  <Navigation className="h-5 w-5" aria-hidden />
                  Get Directions
                </a>

                <a
                  href={site.maps.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'contact-map' })}
                  className="block overflow-hidden rounded-xl ring-1 ring-line"
                >
                  <img
                    src="https://maps.wikimedia.org/img/osm-intl,15,24.0987,88.2519,800x400.png"
                    alt="Map placeholder — Biswajit Power Hub near Chunakhali Bus Stand Berhampore"
                    width={800}
                    height={400}
                    loading="lazy"
                    className="h-48 w-full max-w-full object-cover sm:h-56"
                  />
                  <span className="block bg-[#f5f5f5] px-4 py-2 text-center text-xs text-muted">
                    Static map preview — tap for Google Maps directions
                  </span>
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="border-b border-line pb-3 font-display text-2xl font-extrabold text-heading">
                Contact Information
              </h2>
              <div className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-soft ring-1 ring-line sm:p-8">
                <a
                  href={telUrl(undefined, site)}
                  onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'contact' })}
                  className="flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-lg font-bold text-white"
                  style={{ backgroundColor: '#ff6600' }}
                >
                  <Phone className="h-5 w-5" />
                  Call {formatPhoneDisplay(site.phones[0])}
                </a>
                <a
                  href={whatsappUrl(undefined, site)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'contact' })}
                  className="flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-lg font-bold text-white"
                  style={{ backgroundColor: '#25d366' }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
                <div className="flex items-start gap-3 pt-2 text-sm text-body">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4 font-medium text-heading">Mon–Sat</td>
                        <td className="py-1">9:00 AM – 8:00 PM</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 font-medium text-heading">Sunday</td>
                        <td className="py-1">Closed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal>
              <div className="rounded-xl bg-white p-6 shadow-soft ring-1 ring-line sm:p-8">
                <h3 className="font-display text-xl font-bold text-heading">Send us a message</h3>
                <p className="mt-1 text-sm text-muted">We typically reply within a few hours.</p>
                <div className="mt-5">
                  <ContactMessageForm />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-xl p-6 shadow-card sm:p-8" style={{ background: 'linear-gradient(135deg, #ff6600, #4285f4)' }}>
                <h3 className="font-display text-xl font-bold text-white">Prefer a callback?</h3>
                <p className="mt-1 text-sm text-white/90">Drop your number and we&apos;ll call you.</p>
                <div className="mt-5 rounded-xl bg-white p-5">
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
