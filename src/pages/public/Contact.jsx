import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, MessageCircle, Send, Navigation } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { SiteImage } from '@/components/common/SiteImage';
import { Field, Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CallbackForm } from '@/features/leads/CallbackForm';
import { useToast } from '@/components/ui/Toast';
import { submitContact } from '@/features/leads/leadService';
import {
  isValidName,
  isValidPhone,
  isValidEmail,
  isHoneypotFilled,
  normalizeIndianMobile,
  clearFieldError,
  focusFirstError,
} from '@/features/leads/validation';
import { HoneypotField } from '@/features/leads/HoneypotField';
import { useLocale } from '@/context/LocaleContext';
import { SITE, SITE_URL, whatsappUrl, telUrl, formatPhoneDisplay, siteSameAs } from '@/config/site';
import { safeMapsEmbedUrl } from '@/lib/mapsEmbed';
import { getPriorityLocations, getServiceAreaNames } from '@/data/locations';
import { useSite } from '@/context/SiteSettingsContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { breadcrumbList, postalAddressSchema, openingHoursSchema } from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

function ContactMessageForm() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (isHoneypotFilled(form.website)) {
      toast(t('toast.contactOk'), 'success');
      setForm({ name: '', phone: '', email: '', message: '', website: '' });
      return;
    }
    const e = {};
    if (!isValidName(form.name)) e.name = t('form.errName');
    if (!isValidPhone(form.phone)) e.phone = t('form.errPhone');
    if (!isValidEmail(form.email)) e.email = t('form.errEmail');
    if (!form.message || form.message.trim().length < 5) e.message = t('form.errMessage');
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(ev.currentTarget, e);
      return;
    }
    setLoading(true);
    try {
      await submitContact({
        name: form.name.trim(),
        phone: normalizeIndianMobile(form.phone),
        email: form.email.trim(),
        message: form.message.trim(),
        from: 'contact_page',
      });
      toast(t('toast.contactOk'), 'success');
      setForm({ name: '', phone: '', email: '', message: '', website: '' });
    } catch {
      toast(t('toast.contactFail'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <HoneypotField
        id="ct-website"
        value={form.website}
        onChange={(website) => setForm({ ...form, website })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('form.name')} htmlFor="ct-name" required error={errors.name}>
          <Input
            id="ct-name"
            name="name"
            value={form.name}
            error={errors.name}
            autoComplete="name"
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              clearFieldError(setErrors, 'name');
            }}
          />
        </Field>
        <Field label={t('form.phone')} htmlFor="ct-phone" required error={errors.phone}>
          <Input
            id="ct-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            maxLength={16}
          placeholder={t('form.phoneHint')}
            autoComplete="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => {
              setForm({ ...form, phone: e.target.value });
              clearFieldError(setErrors, 'phone');
            }}
          />
        </Field>
      </div>
      <Field label={t('form.email')} htmlFor="ct-email" error={errors.email} hint={t('form.optional')}>
        <Input
          id="ct-email"
          name="email"
          type="email"
          value={form.email}
          error={errors.email}
          autoComplete="email"
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            clearFieldError(setErrors, 'email');
          }}
        />
      </Field>
      <Field label={t('form.message')} htmlFor="ct-msg" required error={errors.message}>
        <Textarea
          id="ct-msg"
          name="message"
          rows={4}
          value={form.message}
          error={errors.message}
          onChange={(e) => {
            setForm({ ...form, message: e.target.value });
            clearFieldError(setErrors, 'message');
          }}
          placeholder={t('form.help')}
        />
      </Field>
      <Button
        type="submit"
        variant="dealerPrimary"
        size="lg"
        fullWidth
        loading={loading}
        icon={Send}
        className="min-h-12"
      >
        {t('form.send')}
      </Button>
    </form>
  );
}

export default function Contact() {
  const { site } = useSite();
  const { t } = useLocale();
  const { photos } = useSitePhotos();
  const landmarkPhoto = photos?.gallery?.[0]?.url || photos?.hero?.url || photos?.about?.url || null;
  const landmarkAlt =
    photos?.gallery?.[0]?.alt ||
    photos?.hero?.alt ||
    'Biswajit Power Hub showroom near Chunakhali Bus Stand, Berhampore';

  const contactJsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'MotorcycleDealer', 'Store'],
        '@id': `${SITE_URL}/#dealership`,
        name: SITE.name,
        // Keep canonical business URL identical to Home for the same @id
        url: SITE_URL,
        logo: `${SITE_URL}/logo-512.png`,
        image: `${SITE_URL}/logo-512.png`,
        description: SITE.description,
        telephone: `+91${site.phones[0]}`,
        address: postalAddressSchema(site.address),
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SITE.geo.latitude,
          longitude: SITE.geo.longitude,
        },
        hasMap: site.maps.link,
        openingHoursSpecification: openingHoursSchema(site.hoursPerDay),
        sameAs: siteSameAs(site),
        areaServed: getServiceAreaNames(),
      },
    ],
    [site],
  );

  const priorityTowns = getPriorityLocations();

  return (
    <>
      <SEO
        title="Showroom Near Chunakhali, Berhampore | Biswajit Power Hub"
        description="Electric scooter showroom near Chunakhali Bus Stand, Berhampore. Serving Murshidabad towns — free test ride. Call 096355 05436 or WhatsApp us."
        path="/contact"
        jsonLd={contactJsonLd}
        titleTemplate={false}
      />

      {/* Atmosphere: landmark / entrance photo first */}
      <section className="relative isolate min-h-[42vh] overflow-hidden bg-heading sm:min-h-[48vh]">
        <SiteImage
          src={landmarkPhoto}
          alt={landmarkAlt}
          width={1600}
          height={900}
          loading="eager"
          className="absolute inset-0 h-full w-full !aspect-auto bg-heading"
          imgClassName="object-cover object-center"
          placeholderLabel="Find us at Chunakhali Bus Stand, Nimtala"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-heading via-heading/55 to-heading/25"
          aria-hidden
        />
        <div className="container-px relative flex min-h-[42vh] flex-col justify-end pb-10 pt-20 sm:min-h-[48vh] sm:pb-14">
          <Breadcrumbs
            items={[{ name: t('crumb.home'), to: '/' }, { name: t('nav.contact') }]}
            className="mb-0 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
          />
          <Reveal>
            <h1 className="mt-4 font-display text-display-lg font-extrabold uppercase tracking-wide text-white">
              {t('contact.h1')}
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/80 sm:text-lg">
              {t('contact.heroSub')}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Place first: map + hours + CTAs */}
          <div className="space-y-10">
            <Reveal>
              <h2 className="font-display text-2xl font-extrabold text-heading">{t('contact.findUs')}</h2>
              <address className="mt-4 not-italic leading-relaxed text-body">
                <strong className="font-display text-lg text-heading">{SITE.name}</strong>
                <br />
                Chunakhali Bus Stand, Nimtala
                <br />
                Berhampore, Murshidabad, West Bengal — 742149
              </address>

              <div className="mt-6 overflow-hidden ring-1 ring-line">
                {safeMapsEmbedUrl(site.maps.embed) ? (
                <iframe
                  src={safeMapsEmbedUrl(site.maps.embed)}
                  title="Biswajit Power Hub location map — Chunakhali Bus Stand, Berhampore"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-56 w-full border-0 sm:h-72"
                  allowFullScreen
                />
                ) : null}
              </div>

              <div className="mt-5 flex items-start gap-3 text-sm text-body">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <p>
                  <span className="font-semibold text-heading">{t('contact.hours')} </span>
                  {site.hours?.summary || 'Open all days 9:00 AM – 8:30 PM'}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  href={telUrl(undefined, site)}
                  target="_self"
                  variant="dealerPrimary"
                  size="lg"
                  icon={Phone}
                  onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'contact' })}
                >
                  {t('cta.call')}: {formatPhoneDisplay(site.phones[0])}
                </Button>
                <Button
                  href={whatsappUrl(undefined, site)}
                  variant="whatsapp"
                  size="lg"
                  icon={MessageCircle}
                  className="!rounded-dealer"
                  onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'contact' })}
                >
                  {t('contact.chatWa')}
                </Button>
                <Button
                  href={site.maps.link}
                  variant="dealerSecondary"
                  size="lg"
                  icon={Navigation}
                  onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'contact' })}
                >
                  {t('home.getDirection')}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="flex items-start gap-3 border-t border-line pt-8 text-sm text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <p>{t('contact.landmark')}</p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="border-t border-line pt-8">
                <h3 className="font-display text-lg font-bold text-heading">{t('contact.areas')}</h3>
                <p className="mt-1 text-sm text-muted">
                  {t('contact.areasBefore')}
                  <Link to="/electric-scooter-near-me-berhampore" className="font-semibold text-brand-600 hover:underline">
                    {t('contact.nearLink')}
                  </Link>
                  {t('contact.areasMid')}
                  <Link to="/areas-we-serve" className="font-semibold text-brand-600 hover:underline">
                    {t('contact.areasLink')}
                  </Link>
                  {t('contact.areasAfter')}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {priorityTowns.map((town) => (
                    <li key={town.slug}>
                      <Link
                        to={town.path}
                        className="inline-flex rounded-lg bg-surface-alt px-2.5 py-1.5 text-xs font-semibold text-heading ring-1 ring-line hover:bg-brand-50 hover:text-brand-700"
                      >
                        {town.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Forms secondary */}
          <div className="space-y-8">
            <Reveal>
              <h3 className="font-display text-xl font-bold text-heading">{t('contact.send')}</h3>
              <p className="mt-1 text-sm text-muted">{t('contact.sendHint')}</p>
              <div className="mt-5 border-t border-line pt-5">
                <ContactMessageForm />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div id="callback" className="scroll-mt-24 border-t border-line pt-8">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-navy">{t('contact.callback')}</h3>
                <p className="mt-1 text-sm text-muted">{t('contact.callbackHint')}</p>
                <div className="mt-5">
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
