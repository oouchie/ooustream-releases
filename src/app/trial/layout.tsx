import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OOUStream | Start Your 24-Hour Free Trial",
  description:
    "Try OOUStream free for 24 hours — 10,000+ live channels on Firestick, Android, and more. Add a card to verify (no charge during your trial), then stream instantly.",
  alternates: {
    canonical: "https://ooustream.com/trial",
  },
  openGraph: {
    title: "OOUStream | Start Your 24-Hour Free Trial",
    description:
      "Try OOUStream free for 24 hours — 10,000+ live channels on every device. Card verification only, no charge during your trial.",
    url: "https://ooustream.com/trial",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OOUStream | Start Your 24-Hour Free Trial",
    description:
      "Try OOUStream free for 24 hours — 10,000+ live channels on every device. Card verification only, no charge during your trial.",
    images: ["/og-image.png"],
  },
};

export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
