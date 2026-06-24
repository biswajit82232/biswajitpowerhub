import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { SITE, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';

function LegalSection({ title, children }) {
  return (
    <section className="border-b border-line pb-8 last:border-0 last:pb-0">
      <h2 className="font-display text-lg font-bold text-heading">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-body">{children}</div>
    </section>
  );
}

export default function Privacy() {
  const { site } = useSite();

  return (
    <>
      <SEO
        title="Privacy Policy"
        description={`Privacy policy for ${SITE.name}. How we collect, use, and protect your personal information.`}
        path="/privacy"
      />

      <section className="border-b border-line bg-surface-alt/60">
        <div className="container-px py-12 sm:py-16">
          <Reveal>
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              Legal
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-2xl text-body">
              Your privacy matters to us. This policy explains what information we collect and how
              we use it when you interact with {SITE.name}.
            </p>
            <p className="mt-2 text-sm text-muted">Last updated: 24 June 2026</p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12 sm:py-16">
        <Reveal className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-10">
          <LegalSection title="1. Who we are">
            <p>
              {SITE.name} (&quot;we&quot;, &quot;us&quot;) operates an electric scooter dealership
              at {site.address.full}. This policy applies to our website, admin systems, showroom
              interactions, and customer communications.
            </p>
          </LegalSection>

          <LegalSection title="2. Information we collect">
            <p>We may collect the following when you interact with us:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Name, phone number, and email (contact forms, callbacks, test ride bookings)</li>
              <li>Messages you send via WhatsApp, phone, or our website forms</li>
              <li>Scooter preferences, review content, and photos you choose to submit</li>
              <li>Promo codes or offer details when you enquire about a promotion</li>
              <li>Anonymous website usage data (pages visited, calculator usage) to improve our service</li>
              <li>Admin account email if you log in to our dealership admin panel</li>
            </ul>
          </LegalSection>

          <LegalSection title="3. How we use your information">
            <p>We use your information to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Respond to enquiries, callback requests, and test ride bookings</li>
              <li>Process and validate promotional offer claims</li>
              <li>Provide quotes, EMI guidance, warranty support, and after-sales service</li>
              <li>Moderate and publish customer reviews you submit</li>
              <li>Follow up on leads and improve customer experience</li>
              <li>Understand website performance and popular products</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>
          </LegalSection>

          <LegalSection title="4. Cookies & local storage">
            <p>
              Our website may store an anonymous visitor identifier in your browser to track
              interactions (such as calculator usage) for lead scoring. This helps us serve you
              better. You can clear site data through your browser settings.
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
          </LegalSection>

          <LegalSection title="6. Data retention">
            <p>
              We retain enquiry, customer, and review records for as long as needed to fulfil the
              purposes above, comply with law, or resolve disputes. You may request deletion of
              non-essential data by contacting us.
            </p>
          </LegalSection>

          <LegalSection title="7. Security">
            <p>
              We implement reasonable technical measures to protect data, including secure hosting
              and access controls on our admin panel. No online transmission is 100% secure; please
              avoid sharing sensitive financial passwords through unsecured channels.
            </p>
          </LegalSection>

          <LegalSection title="8. Your rights">
            <p>
              You may request access, correction, or deletion of your personal information by
              contacting us. We will respond within a reasonable timeframe as required by applicable
              Indian law.
            </p>
          </LegalSection>

          <LegalSection title="9. Changes">
            <p>
              We may update this policy from time to time. The &quot;Last updated&quot; date at the
              top will reflect changes. Continued use of our website after updates constitutes
              acceptance.
            </p>
          </LegalSection>

          <LegalSection title="10. Contact">
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
