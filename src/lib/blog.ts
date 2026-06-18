import type { ComponentType } from "react";

import * as bestIptv from "@/content/blog/best-iptv-service-2026";
import * as fireStick from "@/content/blog/how-to-set-up-iptv-fire-stick";
import * as iptvVsCable from "@/content/blog/iptv-vs-cable-tv";
import * as smartTv from "@/content/blog/how-to-set-up-iptv-on-smart-tv";
import * as appleTv from "@/content/blog/how-to-set-up-iptv-on-apple-tv";
import * as androidPhone from "@/content/blog/how-to-set-up-iptv-on-android-phone-tablet";
import * as iphoneIpad from "@/content/blog/how-to-set-up-iptv-on-iphone-ipad";
import * as windowsMac from "@/content/blog/how-to-set-up-iptv-on-windows-mac";
import * as buffering from "@/content/blog/why-is-my-iptv-buffering";
import * as appWontLoad from "@/content/blog/iptv-app-wont-load-troubleshooting";
import * as epgFix from "@/content/blog/fix-iptv-epg-tv-guide-not-loading";

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
  { meta: smartTv.meta, Content: smartTv.default },
  { meta: appleTv.meta, Content: appleTv.default },
  { meta: androidPhone.meta, Content: androidPhone.default },
  { meta: iphoneIpad.meta, Content: iphoneIpad.default },
  { meta: windowsMac.meta, Content: windowsMac.default },
  { meta: buffering.meta, Content: buffering.default },
  { meta: appWontLoad.meta, Content: appWontLoad.default },
  { meta: epgFix.meta, Content: epgFix.default },
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
