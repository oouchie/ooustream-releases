"use client";

import Link from "next/link";
import { useState } from "react";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  videoUrl?: string;
  thumbnail?: string;
}

const tutorials: Tutorial[] = [
  {
    id: "ooustream-tutorial-pt1",
    title: "Ooustream Setup Tutorial - Part 1",
    description: "Complete guide to getting started with Ooustream. Learn everything you need to know to set up your service.",
    category: "Setup",
    duration: "Video",
    videoUrl: "https://www.youtube.com/embed/NiG6f0aTptQ",
    thumbnail: "https://img.youtube.com/vi/NiG6f0aTptQ/maxresdefault.jpg",
  },
  {
    id: "ooustream-tutorial-pt2",
    title: "Ooustream Setup Tutorial - Part 2",
    description: "Continue your setup with advanced features and tips for the best streaming experience.",
    category: "Setup",
    duration: "Video",
    videoUrl: "https://www.youtube.com/embed/3qa4cgaLdIg",
    thumbnail: "https://img.youtube.com/vi/3qa4cgaLdIg/maxresdefault.jpg",
  },
  {
    id: "getting-started",
    title: "Getting Started with Ooustream",
    description: "Learn how to set up your IPTV service on any device in just a few minutes.",
    category: "Setup",
    duration: "5:30",
  },
  {
    id: "firestick-setup",
    title: "Firestick Setup Guide",
    description: "Step-by-step guide to installing and configuring on Amazon Firestick.",
    category: "Setup",
    duration: "8:15",
  },
  {
    id: "android-setup",
    title: "Android TV Box Setup",
    description: "Complete setup guide for Android TV boxes and smart TVs.",
    category: "Setup",
    duration: "6:45",
  },
  {
    id: "apps",
    title: "Recommended IPTV Apps",
    description: "The best apps for streaming on different devices.",
    category: "Apps",
    duration: "4:20",
  },
  {
    id: "tivimate-setup",
    title: "TiviMate Setup Tutorial",
    description: "How to configure TiviMate for the best streaming experience.",
    category: "Apps",
    duration: "7:00",
  },
  {
    id: "smarters-setup",
    title: "IPTV Smarters Setup",
    description: "Configure IPTV Smarters Pro on your device.",
    category: "Apps",
    duration: "5:45",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting Common Issues",
    description: "Fix buffering, freezing, and other common streaming problems.",
    category: "Support",
    duration: "6:30",
  },
  {
    id: "buffering-fix",
    title: "How to Fix Buffering",
    description: "Tips and tricks to eliminate buffering issues.",
    category: "Support",
    duration: "4:15",
  },
  {
    id: "vpn-guide",
    title: "VPN Setup Guide",
    description: "Why and how to use a VPN with your IPTV service.",
    category: "Support",
    duration: "5:00",
  },
];

const categories = ["All", "Setup", "Apps", "Support"];

export default function TutorialsPage() {
  const [filter, setFilter] = useState("All");

  const filteredTutorials = tutorials.filter(
    (t) => filter === "All" || t.category === filter
  );

  // Separate featured (with videos) from regular tutorials
  const featuredTutorials = filteredTutorials.filter(t => t.videoUrl);
  const regularTutorials = filteredTutorials.filter(t => !t.videoUrl);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Setup":
        return "from-[#00d4ff]/20 to-[#7c3aed]/20 text-[#00d4ff]";
      case "Apps":
        return "from-[#22c55e]/20 to-[#16a34a]/20 text-[#22c55e]";
      case "Support":
        return "from-[#fbbf24]/20 to-[#f59e0b]/20 text-[#fbbf24]";
      default:
        return "from-[#00d4ff]/20 to-[#7c3aed]/20 text-[#00d4ff]";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Setup":
        return "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30";
      case "Apps":
        return "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30";
      case "Support":
        return "bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/30";
      default:
        return "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] tracking-tight">
          Tutorial <span className="gradient-text">Videos</span>
        </h1>
        <p className="text-[#94a3b8] mt-2 text-lg">
          Learn how to get the most out of your Ooustream service
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === category
                ? "bg-[#00d4ff] text-[#0a0a0f] shadow-lg shadow-[#00d4ff]/30"
                : "bg-[#12121a] text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a24] border border-[#2a2a3a]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Featured Tutorials - Large Cards */}
      {featuredTutorials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#f1f5f9] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#00d4ff]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
            Featured Videos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredTutorials.map((tutorial, index) => (
              <Link
                key={tutorial.id}
                href={`/tutorials/${tutorial.id}`}
                className={`group relative overflow-hidden rounded-2xl bg-[#12121a] border border-[#2a2a3a] transition-all duration-300 hover:border-[#00d4ff] hover:shadow-xl hover:shadow-[#00d4ff]/10 animate-slideUp opacity-0`}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {/* Large Thumbnail */}
                <div className="aspect-video relative overflow-hidden">
                  {tutorial.thumbnail && (
                    <>
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-[#00d4ff]/90 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00d4ff] shadow-lg shadow-[#00d4ff]/50">
                          <svg className="w-10 h-10 text-[#0a0a0f] ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <span className="absolute bottom-4 right-4 bg-[#0a0a0f]/90 text-white text-sm px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm">
                        {tutorial.duration}
                      </span>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getCategoryBadgeColor(tutorial.category)}`}>
                    {tutorial.category}
                  </span>
                  <h3 className="font-bold text-xl text-[#f1f5f9] mt-3 group-hover:text-[#00d4ff] transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-[#94a3b8] mt-2 line-clamp-2">
                    {tutorial.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Regular Tutorials Grid */}
      {regularTutorials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#f1f5f9] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Step-by-Step Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularTutorials.map((tutorial, index) => (
              <Link
                key={tutorial.id}
                href={`/tutorials/${tutorial.id}`}
                className={`card card-hover group animate-slideUp opacity-0`}
                style={{ animationDelay: `${(featuredTutorials.length + index) * 0.05}s`, animationFillMode: 'forwards' }}
              >
                {/* Thumbnail Placeholder */}
                <div className="aspect-video bg-[#1a1a24] rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-[#2a2a3a]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(tutorial.category).split(" ")[0]} ${getCategoryColor(tutorial.category).split(" ")[1]}`} />
                  <svg
                    className={`w-12 h-12 ${getCategoryColor(tutorial.category).split(" ")[2]} group-hover:scale-110 transition-transform`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 bg-[#0a0a0f]/80 text-white text-xs px-2 py-1 rounded-lg font-medium">
                    {tutorial.duration}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getCategoryBadgeColor(tutorial.category)}`}>
                    {tutorial.category}
                  </span>
                  <h3 className="font-semibold text-[#f1f5f9] mt-2 group-hover:text-[#00d4ff] transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-[#94a3b8] mt-2 line-clamp-2">
                    {tutorial.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 border-[#00d4ff]/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#f1f5f9] text-lg">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-[#94a3b8] mt-1">
              Our support team is here to help you 24/7
            </p>
          </div>
          <Link
            href="/support/new"
            className="btn btn-primary whitespace-nowrap"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
