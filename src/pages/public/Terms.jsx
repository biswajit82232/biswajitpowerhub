import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { SITE, PREMIUM_PERKS, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';

function LegalSection({ title, children }) {
  return (
    <section className="border-b border-line pb-8 last:border-0 last:pb-0">
      <h2 className="font-display text-lg font-bold text-heading">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-body">{children}</div>
    </section>
  );
}

export default function Terms() {
  const { site } = useSite();
  const hourLines = site.hours.groups || [];

  return (
    <>
      <SEO
        title="Terms of Service"
        description={`Terms of service for ${SITE.name} — electric scooter dealership in Berhampore, West Bengal.`}
        path="/terms"
      />

      <section className="border-b border-line bg-surface-alt/60">
        <div className="container-px py-12 sm:py-16">
          <Reveal>
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              Legal
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">
              Terms of Service
            </h1>
            <p className="mt-3 max-w-2xl text-body">
              Please read these terms carefully before using our website, claiming an offer, or
              purchasing from {SITE.name}.
            </p>
            <p className="mt-2 text-sm text-muted">Last updated: 24 June 2026</p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12 sm:py-16">
        <Reveal className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-10">
          <LegalSection title="1. About us">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of the website and services
              offered by <strong>{SITE.name}</strong> ({SITE.tagline}), located at{' '}
              {site.address.full}. By accessing our website, submitting an enquiry, or visiting our
              showroom, you agree to these Terms.
            </p>
            <p>
              Showroom hours:{' '}
              {hourLines.map((g, i) => (
                <span key={g.label}>
                  {i > 0 && '; '}
                  {g.label} {g.text}
                </span>
              ))}.
            </p>
          </LegalSection>

          <LegalSection title="2. Products & eligibility">
            <p>
              We sell low-speed electric scooters and related accessories. Certain models may not
              require a driving licence or registration under applicable Indian motor vehicle rules
              — eligibility depends on the specific model, speed rating, and local regulations. We
              will explain requirements clearly at the time of purchase.
            </p>
            <p>
              Product images, specifications, range figures, and prices on this website are
              indicative. Final on-road price, colours, and availability are confirmed at our
              showroom in {site.address.city}.
            </p>
          </LegalSection>

          <LegalSection title="3. Showroom benefits">
            <p>
              From time to time, {SITE.name} may offer showroom benefits such as:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {PREMIUM_PERKS.map((perk) => (
                <li key={perk.id}>
                  <strong>{perk.title}</strong> — {perk.desc}
                </li>
              ))}
            </ul>
            <p>
              These benefits apply only to eligible purchases as communicated at the showroom,
              are non-transferable unless stated otherwise, and may be changed or withdrawn without
              prior notice on the website.
            </p>
          </LegalSection>

          <LegalSection title="4. Promotional offers">
            <p>
              Promotional offers displayed on our website (including discount amounts and promo
              codes) are valid only while marked active and subject to stock availability. An offer
              must be claimed at our showroom or through our official WhatsApp number before or at
              the time of purchase unless we confirm otherwise in writing.
            </p>
            <p>
              Promo codes cannot be combined with other offers unless explicitly stated. We reserve
              the right to modify, suspend, or cancel any promotion at any time. Displayed offers
              on the website do not constitute a binding contract until confirmed by our team.
            </p>
          </LegalSection>

          <LegalSection title="5. Orders, payment & delivery">
            <p>
              A purchase is confirmed only after payment terms are agreed and documented at our
              showroom. We accept payment methods as displayed on site. Delivery timelines depend
              on stock and location; estimated dates are not guaranteed but we strive to meet them.
            </p>
          </LegalSection>

          <LegalSection title="6. Warranty & service">
            <p>
              In addition to any manufacturer warranty supplied with the vehicle, {SITE.name} may
              provide supplementary coverage such as motor and controller warranty and complimentary
              servicing as described in Section 3. Manufacturer warranty terms apply to each vehicle
              and are provided at delivery.
            </p>
            <p>
              Warranty and service claims must follow the process explained at purchase. Complimentary
              servicing, where offered, must be availed within the validity period and scheduling
              windows communicated by us. We assist with warranty coordination but do not extend
              manufacturer warranties beyond their stated terms.
            </p>
          </LegalSection>

          <LegalSection title="7. Finance & EMI estimates">
            <p>
              EMI figures, savings calculators, and cost estimates on this website are for
              illustration only. Actual loan terms depend on the lender&apos;s approval, interest
              rates, and your credit profile. {SITE.name} is not a financial institution and does
              not guarantee loan approval.
            </p>
          </LegalSection>

          <LegalSection title="8. Website use">
            <p>
              You may not misuse this website, attempt unauthorised access, scrape content, or
              submit false information through our forms. We may suspend access if we detect abuse.
            </p>
          </LegalSection>

          <LegalSection title="9. Limitation of liability">
            <p>
              To the fullest extent permitted by law, {SITE.name} is not liable for indirect or
              consequential damages arising from website use, calculator estimates, promotional
              offers, or third-party services linked from our site.
            </p>
          </LegalSection>

          <LegalSection title="10. Governing law">
            <p>
              These Terms are governed by the laws of India. Disputes shall be subject to the
              jurisdiction of courts in Murshidabad, West Bengal.
            </p>
          </LegalSection>

          <LegalSection title="11. Contact">
            <p>
              Questions about these Terms? Call{' '}
              {site.phones.map((p, i) => (
                <span key={p}>
                  {i > 0 && ' or '}
                  <a href={telUrl(p, site)} className="font-semibold text-brand-600 hover:underline">
                    +91 {p}
                  </a>
                </span>
              ))}{' '}
              or visit our{' '}
              <Link to="/contact" className="font-semibold text-brand-600 hover:underline">
                contact page
              </Link>
              .
            </p>
          </LegalSection>
        </Reveal>
      </div>
    </>
  );
}
