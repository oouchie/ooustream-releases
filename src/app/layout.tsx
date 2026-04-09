import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ooustream.com"),
  title: "OOUStream | Premium IPTV Streaming Service — 10,000+ Channels in HD & 4K",
  description: "Premium IPTV with 10,000+ live channels, movies and shows on demand, live sports and PPV events — all in HD and 4K on any device. Try OOUStream free today.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "OOUStream | Premium IPTV Streaming Service — 10,000+ Channels in HD & 4K",
    description: "Premium IPTV with 10,000+ live channels, movies and shows on demand, live sports and PPV events — all in HD and 4K on any device. Try OOUStream free today.",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OOUStream | Premium IPTV Streaming Service — 10,000+ Channels in HD & 4K",
    description: "Premium IPTV with 10,000+ live channels, movies and shows on demand, live sports and PPV events — all in HD and 4K on any device. Try OOUStream free today.",
    images: ["/og-image.png"],
  },
  other: {
    "application-name": "OOUStream",
  },
  alternates: {
    canonical: "https://ooustream.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "OOUStream",
                  "url": "https://ooustream.com",
                  "logo": "https://ooustream.com/logo-full-on-dark.png",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+1-323-539-7508",
                    "contactType": "customer service",
                    "areaServed": "US",
                    "availableLanguage": "English",
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Atlanta",
                    "addressRegion": "GA",
                    "addressCountry": "US",
                  },
                },
                {
                  "@type": "WebSite",
                  "name": "OOUStream",
                  "alternateName": ["OOUStream IPTV", "Ooustream"],
                  "url": "https://ooustream.com",
                },
              ],
            }),
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=438320842295241&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '438320842295241');
fbq('track', 'PageView');`}
      </Script>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0f] text-[#f1f5f9]`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#f1f5f9",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#f1f5f9",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
