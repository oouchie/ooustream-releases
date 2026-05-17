import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSlugs,
  getPostBySlug,
  getAllPosts,
  formatDate,
} from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://ooustream.com/blog/${post.meta.slug}`;
  const title = `OOUStream | ${post.meta.title}`;

  return {
    title,
    description: post.meta.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: post.meta.description,
      url,
      siteName: "OOUStream",
      images: [{ url: post.meta.image ?? "/og-image.png", width: 1200, height: 630 }],
      type: "article",
      publishedTime: post.meta.publishedAt,
      modifiedTime: post.meta.updatedAt ?? post.meta.publishedAt,
      authors: post.meta.author ? [post.meta.author] : undefined,
      tags: post.meta.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.meta.description,
      images: [post.meta.image ?? "/og-image.png"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { meta, Content } = post;
  const url = `https://ooustream.com/blog/${meta.slug}`;

  const related = getAllPosts()
    .filter((p) => p.meta.slug !== meta.slug)
    .slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
    author: {
      "@type": "Organization",
      name: meta.author ?? "OOUStream",
      url: "https://ooustream.com",
    },
    publisher: {
      "@type": "Organization",
      name: "OOUStream",
      logo: {
        "@type": "ImageObject",
        url: "https://ooustream.com/logo-full-on-dark.png",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: meta.image
      ? `https://ooustream.com${meta.image}`
      : "https://ooustream.com/og-image.png",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-cyan-400 transition-colors">
            ← All posts
          </Link>
        </nav>

        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
              <time dateTime={meta.publishedAt}>{formatDate(meta.publishedAt)}</time>
              <span className="text-gray-700">·</span>
              <span>{meta.readingTime} min read</span>
              {meta.tags && meta.tags.length > 0 && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="text-cyan-400/80">{meta.tags[0]}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              {meta.title}
            </h1>
            <p className="mt-4 text-lg text-gray-400 leading-relaxed">
              {meta.description}
            </p>
          </header>

          <div className="blog-content space-y-5 text-gray-300 leading-relaxed">
            <Content />
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#1e293b]">
            <h2 className="text-xl font-semibold text-white mb-6">Keep reading</h2>
            <ul className="space-y-4">
              {related.map(({ meta: m }) => (
                <li key={m.slug}>
                  <Link
                    href={`/blog/${m.slug}`}
                    className="group block rounded-xl border border-[#1e293b] bg-[#12121a] p-4 transition-colors hover:border-cyan-500/40 hover:bg-[#1a1a24]"
                  >
                    <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {m.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-[#1e293b] flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link href="/blog" className="hover:text-cyan-400 transition-colors">
            Blog
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
