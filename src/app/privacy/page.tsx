import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Simple header for public pages */}
      <header className="border-b border-[#1e293b] bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo-full-on-dark.png"
              alt="Ooustick"
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/login"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Customer Login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-gray-300">
            <strong>Effective Date:</strong> February 5, 2026
          </p>

          <p className="text-gray-300">
            OOUStream (&quot;Ooustick,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our streaming services.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p className="text-gray-300">We collect the following types of information:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, phone number</li>
            <li><strong>Service Credentials:</strong> Usernames and passwords for accessing our streaming service</li>
            <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
            <li><strong>Usage Data:</strong> Subscription status, service preferences, support interactions</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <p className="text-gray-300">We use your information to:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Provide and maintain your streaming service account</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send account-related notifications (payment reminders, expiration alerts)</li>
            <li>Deliver login credentials and portal access links</li>
            <li>Respond to support requests</li>
            <li>Improve our services</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. SMS/Text Messaging</h2>
          <p className="text-gray-300">
            By providing your phone number, you consent to receive SMS messages from OOUStream related to your account, including:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Payment and subscription reminders</li>
            <li>Login credentials delivery</li>
            <li>Portal access links</li>
            <li>Service status updates</li>
          </ul>
          <p className="text-gray-300 mt-4">
            <strong>Message frequency varies.</strong> Message and data rates may apply.
            Reply STOP to opt out of SMS messages at any time. Reply HELP for assistance.
          </p>
          <p className="text-gray-300">
            We do not sell, rent, or share your phone number with third parties for marketing purposes.
            Your phone number is only used for service-related communications.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Data Security</h2>
          <p className="text-gray-300">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Encrypted data transmission (SSL/TLS)</li>
            <li>Secure password storage</li>
            <li>Access controls and authentication</li>
            <li>Regular security assessments</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Data Retention</h2>
          <p className="text-gray-300">
            We retain your personal information for as long as your account is active or as needed to provide services.
            Upon account termination, we may retain certain information as required by law or for legitimate business purposes.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Third-Party Services</h2>
          <p className="text-gray-300">We use trusted third-party services to operate our business:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>SendGrid:</strong> Email delivery</li>
            <li><strong>Twilio:</strong> SMS messaging</li>
            <li><strong>Supabase:</strong> Data storage</li>
          </ul>
          <p className="text-gray-300 mt-2">
            These services have their own privacy policies and handle data in accordance with industry standards.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Your Rights</h2>
          <p className="text-gray-300">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of SMS communications</li>
            <li>Request a copy of your data</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">8. Children&apos;s Privacy</h2>
          <p className="text-gray-300">
            Our services are not intended for children under 18. We do not knowingly collect personal information from children.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Changes to This Policy</h2>
          <p className="text-gray-300">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">10. Contact Us</h2>
          <p className="text-gray-300">
            If you have questions about this Privacy Policy or your personal data, please contact us:
          </p>
          <ul className="list-none text-gray-300 space-y-1">
            <li>Email: info@ooustick.com</li>
            <li>Website: ooustick.com</li>
          </ul>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-[#1e293b] flex gap-6 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}
