import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribe to OOUStream Pro | 10,000+ Channels in HD & 4K",
  description:
    "Start your OOUStream Pro subscription. 4 connections, 10,000+ live channels, full VOD library, HD & 4K streaming, and 24/7 AI support. Plans from $27.92/month.",
  alternates: {
    canonical: "https://ooustream.com/subscribe/pro",
  },
  openGraph: {
    title: "Subscribe to OOUStream Pro | 10,000+ Channels in HD & 4K",
    description:
      "Start your OOUStream Pro subscription. 4 connections, 10,000+ live channels, full VOD library, HD & 4K streaming, and 24/7 AI support. Plans from $27.92/month.",
    url: "https://ooustream.com/subscribe/pro",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscribe to OOUStream Pro | 10,000+ Channels in HD & 4K",
    description:
      "Start your OOUStream Pro subscription. 4 connections, 10,000+ live channels, full VOD library, HD & 4K streaming, and 24/7 AI support. Plans from $27.92/month.",
    images: ["/og-image.png"],
  },
};

export default function SubscribeProLayout({ children }: { children: React.ReactNode }) {
  return children;
}
