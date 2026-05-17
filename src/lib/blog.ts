import type { ComponentType } from "react";

import * as bestIptv from "@/content/blog/best-iptv-service-2026";
import * as fireStick from "@/content/blog/how-to-set-up-iptv-fire-stick";
import * as iptvVsCable from "@/content/blog/iptv-vs-cable-tv";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  author?: string;
  image?: string;
  tags?: string[];
};

export type BlogPost = {
  meta: BlogPostMeta;
  Content: ComponentType;
};

const POSTS: BlogPost[] = [
  { meta: bestIptv.meta, Content: bestIptv.default },
  { meta: fireStick.meta, Content: fireStick.default },
  { meta: iptvVsCable.meta, Content: iptvVsCable.default },
];

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort(
    (a, b) =>
      new Date(b.meta.publishedAt).getTime() -
      new Date(a.meta.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.meta.slug === slug);
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.meta.slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
