import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { SITE } from '@/config/site';

function LegalSection({ title, children }) {
  return (
    <section className="border-b border-line pb-8 last:border-0 last:pb-0">
      <h2 className="font-display text-lg font-bold text-heading">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-body">{children}</div>
    </section>
  );
}

export default function Terms() {
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
              Please read these terms carefully before using our website or purchasing from{' '}
              {SITE.name}.
            </p>
            <p className="mt-2 text-sm text-muted">Last updated: June 2026</p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12 sm:py-16">
        <Reveal className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-10">
          <LegalSection title="1. About us">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of the website and services
              offered by <strong>{SITE.name}</strong>, located at {SITE.address.full}. By accessing
              our website or visiting our showroom, you agree to these Terms.
            </p>
          </LegalSection>

          <LegalSection title="2. Products & eligibility">
            <p>
              We sell low-speed electric scooters and related accessories. Certain models may not
              require a driving licence or registration under applicable Indian motor vehicle
              rules — eligibility depends on the specific model, speed rating, and local regulations.
              We will explain requirements clearly at the time of purchase.
            </p>
            <p>
              Product images, specifications, range figures, and prices on this website are
              indicative. Final on-road price, colours, and availability are confirmed at our
              showroom.
            </p>
          </LegalSection>

          <LegalSection title="3. Orders, payment & delivery">
            <p>
              A purchase is confirmed only after payment terms are agreed and documented. We accept
              payment methods as displayed at our showroom. Delivery timelines depend on stock and
              location; estimated dates are not guaranteed but we strive to meet them.
            </p>
          </LegalSection>

          <LegalSection title="4. Warranty & service">
            <p>
              Manufacturer warranty terms apply to each vehicle and are provided at delivery.
              Warranty claims must follow the manufacturer&apos;s authorised process. We assist with
              warranty coordination but do not extend manufacturer warranties beyond their stated
              terms.
            </p>
          </LegalSection>

          <LegalSection title="5. Finance & EMI estimates">
            <p>
              EMI figures, savings calculators, and cost estimates on this website are for
              illustration only. Actual loan terms depend on the lender&apos;s approval, interest
              rates, and your credit profile. {SITE.name} is not a financial institution.
            </p>
          </LegalSection>

          <LegalSection title="6. Website use">
            <p>
              You may not misuse this website, attempt unauthorised access, scrape content, or
              submit false information through our forms. We may suspend access if we detect abuse.
            </p>
          </LegalSection>

          <LegalSection title="7. Limitation of liability">
            <p>
              To the fullest extent permitted by law, {SITE.name} is not liable for indirect or
              consequential damages arising from website use, calculator estimates, or third-party
              services linked from our site.
            </p>
          </LegalSection>

          <LegalSection title="8. Governing law">
            <p>
              These Terms are governed by the laws of India. Disputes shall be subject to the
              jurisdiction of courts in Murshidabad, West Bengal.
            </p>
          </LegalSection>

          <LegalSection title="9. Contact">
            <p>
              Questions about these Terms? Call us at{' '}
              <a href={`tel:+91${SITE.phones[0]}`} className="font-semibold text-brand-600 hover:underline">
                +91 {SITE.phones[0]}
              </a>{' '}
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
