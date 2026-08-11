import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { SITE, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { breadcrumbList } from '@/lib/schemaHelpers';

function LegalSection({ title, children }) {
  return (
    <section className="border-b border-line pb-8 last:border-0 last:pb-0">
      <h2 className="font-display text-lg font-bold uppercase tracking-wide text-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-body">{children}</div>
    </section>
  );
}

export default function Terms() {
  const { site } = useSite();
  const hourLines = site.hours.groups || [];
  const perks = site.perks?.length ? site.perks : [];

  return (
    <>
      <SEO
        title="Terms & Conditions | Biswajit Power Hub"
        description="Terms of service for Biswajit Power Hub electric scooter dealership in Berhampore — warranty, no returns, and showroom safeguards."
        path="/terms"
        jsonLd={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Terms', path: '/terms' },
        ])}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-white">
        <div className="container-px py-10 sm:py-12">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Legal</p>
            <h1 className="mt-2 font-display text-display-lg font-extrabold uppercase tracking-wide text-navy">
              Terms &amp; Conditions
            </h1>
            <p className="mt-3 max-w-2xl text-body">
              Please read these terms carefully before using our website, claiming an offer, booking
              a test ride, or purchasing from {SITE.name}.
            </p>
            <p className="mt-2 text-sm text-muted">Last updated: 12 August 2026</p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-10 sm:py-14">
        <Reveal className="mx-auto max-w-prose space-y-8 border border-line bg-white p-6 shadow-soft sm:p-10">
          <LegalSection title="1. About us">
            <p>
              These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the website and
              services offered by <strong>{SITE.name}</strong> ({SITE.tagline}), located at{' '}
              {site.address.full}. By accessing our website, submitting an enquiry, booking a test
              ride or service, or purchasing at our showroom, you agree to these Terms and our{' '}
              <Link to="/privacy" className="font-semibold text-brand-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              Showroom hours:{' '}
              {hourLines.map((g, i) => (
                <span key={g.label}>
                  {i > 0 && '; '}
                  {g.label} {g.text}
                </span>
              ))}
              .
            </p>
          </LegalSection>

          <LegalSection title="2. Products & eligibility">
            <p>
              We sell low-speed electric scooters and related accessories. Certain models may not
              require a driving licence or registration under applicable Indian motor vehicle rules
              — eligibility depends on the specific model, speed rating, and local regulations. We
              will explain requirements at the time of purchase; you are responsible for complying
              with applicable law after sale.
            </p>
            <p>
              Product images, specifications, range figures, charging times, and prices on this
              website are indicative only. Final on-road price, colours, battery pack, and
              availability are confirmed only at our showroom in {site.address.city}. Real-world
              range varies with rider weight, terrain, speed, load, tyre pressure, and battery
              condition.
            </p>
          </LegalSection>

          <LegalSection title="3. Warranty — as per manufacturer">
            <p>
              <strong>
                All product warranties (vehicle, battery, charger, motor, controller, and
                accessories) are provided strictly as per the manufacturer&apos;s / brand&apos;s
                warranty policy
              </strong>{' '}
              supplied with the product or as stated on the warranty card / invoice at delivery.
              Warranty period, coverage, exclusions, and claim process are defined by the
              manufacturer — not by this website&apos;s marketing copy.
            </p>
            <p>
              {SITE.name} may assist with warranty coordination and local servicing, but we do not
              create, extend, or replace manufacturer warranty terms. Tampering, misuse, water
              damage (where excluded), incorrect charging, unauthorised repairs, or use beyond
              stated specifications may void warranty as per manufacturer rules.
            </p>
            <p>
              Any complimentary showroom benefits (for example free servicing visits or local motor
              / controller support described below) are separate goodwill benefits and do not alter
              manufacturer warranty limits.
            </p>
          </LegalSection>

          <LegalSection title="4. Showroom benefits">
            <p>From time to time, {SITE.name} may offer showroom benefits such as:</p>
            <ul className="list-disc space-y-1 pl-5">
              {perks.map((perk) => (
                <li key={perk.id}>
                  <strong>{perk.title}</strong> — {perk.desc}
                </li>
              ))}
            </ul>
            <p>
              These benefits apply only to eligible purchases as communicated at the showroom, are
              non-transferable unless stated otherwise, must be availed within the validity and
              scheduling windows we communicate, and may be changed or withdrawn without prior
              notice on the website.
            </p>
          </LegalSection>

          <LegalSection title="5. No return, exchange & cancellation">
            <p>
              <strong>
                All sales of scooters, batteries, chargers, and accessories are final.
              </strong>{' '}
              Once a purchase is completed and the product is delivered / taken from the showroom,
              we do not accept returns, exchanges, or refunds for change of mind, colour
              preference, perceived range difference, or similar reasons.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Booking / advance amounts (if any) are subject to the written terms agreed at the
                showroom; unused advances may be forfeited if you cancel without our written
                consent.
              </li>
              <li>
                Wrong-item or manufacturing-defect claims, if any, are handled only under the
                manufacturer warranty / applicable consumer law — not as a free return policy.
              </li>
              <li>
                Custom battery upgrades or modifications, once fitted at your request, are
                non-returnable.
              </li>
            </ul>
            <p>
              Nothing in these Terms limits rights that cannot be excluded under applicable Indian
              consumer protection law.
            </p>
          </LegalSection>

          <LegalSection title="6. Test rides, inspection & safety safeguards">
            <p>
              Free or supervised test rides are offered at our discretion during showroom hours.
              By taking a test ride you agree that:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                You will follow staff instructions, wear available safety gear if provided, and ride
                only in the designated area at a safe speed.
              </li>
              <li>
                You are responsible for your own safety and for any damage caused by reckless use
                during the ride (to the extent permitted by law).
              </li>
              <li>
                Test rides do not create an obligation to sell or reserve a specific colour /
                battery pack unless we confirm stock in writing.
              </li>
            </ul>
            <p>
              Before taking delivery, inspect the scooter and accessories carefully (body, battery
              seals, charger, documents). Once you accept delivery and leave the premises, cosmetic
              or missing-item claims not noted at handover are not accepted except as required by
              law or manufacturer policy.
            </p>
            <p>
              Electric scooters are powered vehicles. Ride responsibly, obey traffic rules, and do
              not overload beyond stated capacity. Improper charging, use of non-approved chargers,
              or water immersion may cause damage and safety risk — follow the user manual.
            </p>
          </LegalSection>

          <LegalSection title="7. Promotional offers">
            <p>
              Promotional offers displayed on our website (including discount amounts and promo
              codes) are valid only while marked active and subject to stock availability. An offer
              must be claimed at our showroom or through our official WhatsApp number before or at
              the time of purchase unless we confirm otherwise in writing.
            </p>
            <p>
              Promo codes cannot be combined with other offers unless explicitly stated. We reserve
              the right to modify, suspend, or cancel any promotion at any time. Displayed offers
              on the website do not constitute a binding contract until confirmed by our team at
              the showroom.
            </p>
          </LegalSection>

          <LegalSection title="8. Orders, payment & delivery">
            <p>
              A purchase is confirmed only after payment terms are agreed and documented at our
              showroom (bill / invoice). We accept payment methods as displayed or agreed on site.
              Delivery or pickup timelines depend on stock and location; estimated dates are not
              guaranteed.
            </p>
            <p>
              Title and risk in the goods pass to you on delivery / handover unless otherwise agreed
              in writing. Keep your invoice and warranty card safe — they are required for service
              and warranty claims.
            </p>
          </LegalSection>

          <LegalSection title="9. Finance & EMI estimates">
            <p>
              EMI figures, savings calculators, and cost estimates on this website are for
              illustration only. Actual loan terms depend on the lender&apos;s approval, interest
              rates, processing fees, and your credit profile. {SITE.name} is not a bank or NBFC and
              does not guarantee loan approval, interest rate, or EMI amount.
            </p>
          </LegalSection>

          <LegalSection title="10. Website use & content safeguards">
            <p>
              You may not misuse this website, attempt unauthorised access, scrape content, submit
              false or abusive information through our forms, or interfere with site security. We
              may suspend access, ignore spam submissions, and report abuse.
            </p>
            <p>
              Website content (including SEO pages, guides, and calculators) is informational. It is
              not legal, financial, or safety advice. We may update prices, stock, and copy without
              notice. If website information conflicts with what our showroom staff confirm in
              writing at purchase, the showroom confirmation prevails.
            </p>
          </LegalSection>

          <LegalSection title="11. Limitation of liability">
            <p>
              To the fullest extent permitted by law, {SITE.name} is not liable for indirect,
              incidental, or consequential damages arising from website use, calculator estimates,
              promotional offers, third-party finance partners, manufacturer warranty decisions,
              or third-party services linked from our site.
            </p>
            <p>
              Our total liability for any claim arising from a sale (except where prohibited by law)
              is limited to the amount you paid to us for the specific product giving rise to the
              claim.
            </p>
          </LegalSection>

          <LegalSection title="12. Governing law">
            <p>
              These Terms are governed by the laws of India. Disputes shall be subject to the
              exclusive jurisdiction of courts in Murshidabad, West Bengal, subject to any
              mandatory consumer forum rights you may have.
            </p>
          </LegalSection>

          <LegalSection title="13. Contact">
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
