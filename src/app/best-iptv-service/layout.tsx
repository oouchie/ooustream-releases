import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best IPTV Service 2026 | OOUStream — 10,000+ Channels in HD & 4K",
  description:
    "Compare the best IPTV services in 2026. OOUStream delivers 10,000+ live channels, movies, sports & PPV in HD/4K with no buffering. Try free today.",
  alternates: {
    canonical: "https://ooustream.com/best-iptv-service",
  },
  openGraph: {
    title: "Best IPTV Service 2026 | OOUStream — 10,000+ Channels in HD & 4K",
    description:
      "Compare the best IPTV services in 2026. OOUStream delivers 10,000+ live channels, movies, sports & PPV in HD/4K with no buffering. Try free today.",
    url: "https://ooustream.com/best-iptv-service",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best IPTV Service 2026 | OOUStream — 10,000+ Channels in HD & 4K",
    description:
      "Compare the best IPTV services in 2026. OOUStream delivers 10,000+ live channels, movies, sports & PPV in HD/4K with no buffering. Try free today.",
    images: ["/og-image.png"],
  },
};

export default function BestIPTVLayout({ children }: { children: React.ReactNode }) {
  return children;
}
