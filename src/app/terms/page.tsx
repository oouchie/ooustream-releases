import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-gray-300">
            <strong>Effective Date:</strong> February 5, 2026
          </p>

          <p className="text-gray-300">
            Welcome to OOUStream (&quot;Ooustick,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By using our services,
            you agree to these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Service Description</h2>
          <p className="text-gray-300">
            OOUStream provides streaming entertainment services on a subscription basis.
            We provide you with login credentials to access our streaming platform and a customer portal
            to manage your account, view subscription status, and contact support.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Account Registration</h2>
          <p className="text-gray-300">To use our services, you must:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Be at least 18 years old</li>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
          <p className="text-gray-300 mt-4">
            You are responsible for all activity that occurs under your account.
            Do not share your login credentials with others.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Subscription and Payment</h2>
          <h3 className="text-lg font-medium text-white mt-4">Pricing</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Monthly: $20.00</li>
            <li>6 Months: $90.00</li>
            <li>Yearly: $170.00</li>
          </ul>
          <p className="text-gray-300 mt-2">
            Custom pricing may be available for select customers at our discretion.
          </p>

          <h3 className="text-lg font-medium text-white mt-4">Payment Terms</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Payment is due before the start of each subscription period</li>
            <li>We accept credit/debit cards, Cash App Pay, Apple Pay, and Google Pay</li>
            <li>All payments are processed securely through Stripe</li>
            <li>Prices are in US Dollars (USD)</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-4">Subscription Expiration</h3>
          <p className="text-gray-300">
            Your service will be suspended upon subscription expiration.
            We will send reminders at 7 days, 3 days, and 1 day before expiration.
            To restore service, you must renew your subscription through the customer portal.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. SMS Communications</h2>
          <p className="text-gray-300">
            By providing your phone number, you consent to receive SMS text messages from OOUStream regarding:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Payment reminders and subscription alerts</li>
            <li>Login credentials and account information</li>
            <li>Portal access links</li>
            <li>Service notifications</li>
          </ul>
          <p className="text-gray-300 mt-4">
            <strong>Message frequency varies based on account activity.</strong> Message and data rates may apply.
          </p>
          <p className="text-gray-300 mt-2">
            <strong>To opt out:</strong> Reply STOP to any message. You will receive a confirmation and no further SMS messages.
          </p>
          <p className="text-gray-300 mt-2">
            <strong>For help:</strong> Reply HELP or contact info@ooustick.com.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Acceptable Use</h2>
          <p className="text-gray-300">You agree NOT to:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Share your account credentials with others</li>
            <li>Resell or redistribute the service without authorization</li>
            <li>Attempt to bypass security measures</li>
            <li>Use the service for any illegal purpose</li>
            <li>Interfere with the operation of our services</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Service Availability</h2>
          <p className="text-gray-300">
            We strive to provide reliable service but do not guarantee uninterrupted access.
            Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
            We are not liable for any interruptions or downtime.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Refund Policy</h2>
          <p className="text-gray-300">
            Refunds are handled on a case-by-case basis. Contact support within 7 days of payment
            if you experience issues. We reserve the right to deny refunds for service already rendered
            or violation of these terms.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Account Termination</h2>
          <p className="text-gray-300">
            We reserve the right to suspend or terminate your account at any time for:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Violation of these Terms of Service</li>
            <li>Non-payment</li>
            <li>Fraudulent activity</li>
            <li>Abuse of the service</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">9. Limitation of Liability</h2>
          <p className="text-gray-300">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, OOUSTREAM SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA,
            OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">10. Disclaimer of Warranties</h2>
          <p className="text-gray-300">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">11. Changes to Terms</h2>
          <p className="text-gray-300">
            We may modify these Terms at any time. We will notify you of material changes via email
            or through the customer portal. Continued use of the service after changes constitutes acceptance.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">12. Governing Law</h2>
          <p className="text-gray-300">
            These Terms shall be governed by and construed in accordance with the laws of the United States,
            without regard to conflict of law principles.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">13. Contact Us</h2>
          <p className="text-gray-300">
            If you have questions about these Terms of Service, please contact us:
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
