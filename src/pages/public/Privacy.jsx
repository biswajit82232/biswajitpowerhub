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

export default function Privacy() {
  const { site } = useSite();

  return (
    <>
      <SEO
        title="Privacy Policy | Biswajit Power Hub"
        description="Privacy policy for Biswajit Power Hub — how we collect, use, and safeguard your data at our Berhampore showroom."
        path="/privacy"
        jsonLd={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Privacy', path: '/privacy' },
        ])}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-white">
        <div className="container-px py-10 sm:py-12">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Legal</p>
            <h1 className="mt-2 font-display text-display-lg font-extrabold uppercase tracking-wide text-navy">
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-2xl text-body">
              Your privacy matters to us. This policy explains what information we collect, how we
              use it, and the safeguards we apply when you interact with {SITE.name}.
            </p>
            <p className="mt-2 text-sm text-muted">Last updated: 12 August 2026</p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-10 sm:py-14">
        <Reveal className="mx-auto max-w-prose space-y-8 border border-line bg-white p-6 shadow-soft sm:p-10">
          <LegalSection title="1. Who we are">
            <p>
              {SITE.name} (&quot;we&quot;, &quot;us&quot;) operates an electric scooter dealership
              at {site.address.full}. This policy applies to our website, admin systems, showroom
              interactions, and customer communications. Related purchase terms (including warranty
              as per manufacturer and no-return policy) are in our{' '}
              <Link to="/terms" className="font-semibold text-brand-600 hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </LegalSection>

          <LegalSection title="2. Information we collect">
            <p>We may collect the following when you interact with us:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Name, phone number, and email (contact forms, callbacks, test ride / service bookings)</li>
              <li>Messages you send via WhatsApp, phone, or our website forms</li>
              <li>Scooter preferences, review content, and photos you choose to submit</li>
              <li>Promo codes or offer details when you enquire about a promotion</li>
              <li>
                Anonymous or aggregated website usage data (pages visited, calculator usage) to
                improve our service
              </li>
              <li>Invoice / purchase details needed for after-sales and warranty coordination</li>
              <li>Admin account email if you log in to our dealership admin panel</li>
            </ul>
            <p>
              Please do not submit sensitive financial passwords, OTP codes, or full card details
              through website forms or public WhatsApp chats.
            </p>
          </LegalSection>

          <LegalSection title="3. How we use your information">
            <p>We use your information to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Respond to enquiries, callback requests, test rides, and service bookings</li>
              <li>Process and validate promotional offer claims</li>
              <li>
                Provide quotes, EMI guidance, after-sales support, and coordination with
                manufacturer warranty processes (warranty terms remain as per manufacturer)
              </li>
              <li>Moderate and publish community stories you submit (with your consent via submission)</li>
              <li>Follow up on leads and improve customer experience</li>
              <li>Understand website performance and popular products</li>
              <li>Protect against spam, fraud, and abuse of our forms or systems</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>
          </LegalSection>

          <LegalSection title="4. Cookies & local storage">
            <p>
              Our website may store an anonymous visitor identifier in your browser to track
              interactions (such as calculator usage) for lead scoring and product popularity. This
              helps us serve you better. You can clear site data through your browser settings.
            </p>
            <p>
              If you install our admin web app, your browser may also store session and preference
              data required for login and offline functionality.
            </p>
          </LegalSection>

          <LegalSection title="5. Third-party services">
            <p>
              We use trusted services such as Supabase (database and file storage), Vercel (website
              hosting), Google Maps (location), and WhatsApp (messaging). When you use those
              services via links on our site, their respective privacy policies apply.
            </p>
            <p>
              We also use <strong>Google Analytics 4</strong> to understand anonymised site usage
              (pages viewed, approximate location, device type). If Google Ads conversion or
              remarketing tags are enabled on this site, Google may process advertising identifiers
              according to Google&apos;s policies. You can limit ad personalisation in your Google
              account settings.
            </p>
            <p>
              Finance / EMI partners (if you choose to apply for a loan) may collect additional data
              under their own policies; {SITE.name} does not control lender data practices.
            </p>
          </LegalSection>

          <LegalSection title="6. Data retention">
            <p>
              We retain enquiry, customer, invoice-related, and review records for as long as needed
              to fulfil the purposes above, support warranty / service history, comply with law, or
              resolve disputes. You may request deletion of non-essential marketing data by
              contacting us; we may retain records required for legal or accounting reasons.
            </p>
          </LegalSection>

          <LegalSection title="7. Security & safeguards">
            <p>
              We implement reasonable technical and organisational measures to protect data,
              including:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Secure hosting (HTTPS) and encrypted transport where provided by our vendors</li>
              <li>Access controls on our admin panel (authenticated staff only)</li>
              <li>Database access rules that limit who can read or change customer records</li>
              <li>Spam / abuse safeguards on public forms (including honeypot checks)</li>
              <li>Moderation of public reviews and uploaded photos before publication</li>
            </ul>
            <p>
              No online transmission or storage is 100% secure. You are responsible for keeping
              devices and OTPs safe. Avoid sharing Aadhaar, full card numbers, or banking passwords
              over unsecured channels.
            </p>
          </LegalSection>

          <LegalSection title="8. Your rights">
            <p>
              Under applicable Indian law (including the Digital Personal Data Protection Act, 2023,
              as it applies), you may request access, correction, or deletion of your personal
              information by contacting us. We will respond within a reasonable timeframe. Some
              requests may be limited where we must retain data for legal, warranty, or dispute
              purposes.
            </p>
          </LegalSection>

          <LegalSection title="9. Children">
            <p>
              Our website and products are directed at adults capable of purchasing or enquiring
              about vehicles. We do not knowingly collect personal data from children for
              marketing. If you believe a child has submitted data, contact us to remove it.
            </p>
          </LegalSection>

          <LegalSection title="10. Changes">
            <p>
              We may update this policy from time to time. The &quot;Last updated&quot; date at the
              top will reflect changes. Continued use of our website after updates constitutes
              acceptance of the revised policy.
            </p>
          </LegalSection>

          <LegalSection title="11. Contact">
            <p>
              For privacy-related questions, contact {SITE.name} at{' '}
              {site.phones.map((p, i) => (
                <span key={p}>
                  {i > 0 && ' or '}
                  <a href={telUrl(p, site)} className="font-semibold text-brand-600 hover:underline">
                    +91 {p}
                  </a>
                </span>
              ))}{' '}
              or{' '}
              <Link to="/contact" className="font-semibold text-brand-600 hover:underline">
                visit our showroom
              </Link>
              .
            </p>
          </LegalSection>
        </Reveal>
      </div>
    </>
  );
}
