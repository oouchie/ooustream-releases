import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OOUStream | Customer Login — Access Your IPTV Account",
  description:
    "Log in to your OOUStream IPTV account to view credentials, manage billing, open support tickets, and access setup tutorials. Magic link or username sign-in.",
  alternates: {
    canonical: "https://ooustream.com/login",
  },
  openGraph: {
    title: "OOUStream | Customer Login — Access Your IPTV Account",
    description:
      "Log in to your OOUStream IPTV account to view credentials, manage billing, open support tickets, and access setup tutorials.",
    url: "https://ooustream.com/login",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OOUStream | Customer Login — Access Your IPTV Account",
    description:
      "Log in to your OOUStream IPTV account to view credentials, manage billing, open support tickets, and access setup tutorials.",
    images: ["/og-image.png"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
