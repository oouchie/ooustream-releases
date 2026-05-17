import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "OOUStream | Blog — IPTV Guides, Setup Help, and Streaming Tips",
  description:
    "Read the latest from OOUStream: IPTV buying guides, step-by-step device setup walkthroughs, comparisons, and streaming tips from our team.",
  alternates: {
    canonical: "https://ooustream.com/blog",
  },
  openGraph: {
    title: "OOUStream | Blog — IPTV Guides, Setup Help, and Streaming Tips",
    description:
      "Read the latest from OOUStream: IPTV buying guides, step-by-step device setup walkthroughs, comparisons, and streaming tips from our team.",
    url: "https://ooustream.com/blog",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OOUStream | Blog — IPTV Guides, Setup Help, and Streaming Tips",
    description:
      "Read the latest from OOUStream: IPTV buying guides, step-by-step device setup walkthroughs, comparisons, and streaming tips from our team.",
    images: ["/og-image.png"],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#1e293b] bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo-full-on-dark.png"
              alt="OOUStream"
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
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            OOUStream Blog
          </h1>
          <p className="text-lg text-gray-400">
            Buying guides, setup walkthroughs, comparisons, and streaming tips
            from the OOUStream team.
          </p>
        </div>

        <ul className="space-y-4">
          {posts.map(({ meta }) => (
            <li key={meta.slug}>
              <Link
                href={`/blog/${meta.slug}`}
                className="group block rounded-2xl border border-[#1e293b] bg-[#12121a] p-6 transition-colors hover:border-cyan-500/40 hover:bg-[#1a1a24]"
              >
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <time dateTime={meta.publishedAt}>
                    {formatDate(meta.publishedAt)}
                  </time>
                  <span className="text-gray-700">·</span>
                  <span>{meta.readingTime} min read</span>
                  {meta.tags && meta.tags.length > 0 && (
                    <>
                      <span className="text-gray-700">·</span>
                      <span className="text-cyan-400/80">{meta.tags[0]}</span>
                    </>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {meta.title}
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  {meta.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 pt-8 border-t border-[#1e293b] flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link
            href="/best-iptv-service"
            className="hover:text-cyan-400 transition-colors"
          >
            About IPTV
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">
            Terms
          </Link>
        </div>
      </main>
    </div>
  );
}
