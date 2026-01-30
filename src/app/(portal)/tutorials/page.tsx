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
    videoUrl: "https://www.youtube.com/embed/3qa4cgaLdIg",
    thumbnail: "https://img.youtube.com/vi/3qa4cgaLdIg/maxresdefault.jpg",
  },
  {
    id: "ooustream-tutorial-pt2",
    title: "Ooustream Setup Tutorial - Part 2",
    description: "Continue your setup with advanced features and tips for the best streaming experience.",
    category: "Setup",
    duration: "Video",
    videoUrl: "https://www.youtube.com/embed/NiG6f0aTptQ",
    thumbnail: "https://img.youtube.com/vi/NiG6f0aTptQ/maxresdefault.jpg",
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Setup":
        return "from-[#6366f1]/20 to-[#8b5cf6]/20 text-[#6366f1]";
      case "Apps":
        return "from-[#22c55e]/20 to-[#16a34a]/20 text-[#22c55e]";
      case "Support":
        return "from-[#f59e0b]/20 to-[#d97706]/20 text-[#f59e0b]";
      default:
        return "from-[#6366f1]/20 to-[#8b5cf6]/20 text-[#6366f1]";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#f1f5f9]">
          Tutorial Videos
        </h1>
        <p className="text-[#94a3b8] mt-1">
          Learn how to get the most out of your Ooustream service
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === category
                ? "bg-[#6366f1] text-white"
                : "bg-[#1e293b] text-[#94a3b8] hover:text-[#f1f5f9]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial) => (
          <Link
            key={tutorial.id}
            href={`/tutorials/${tutorial.id}`}
            className="card card-hover group"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-[#1e293b] rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              {tutorial.thumbnail ? (
                <>
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  <svg
                    className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </>
              ) : (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(tutorial.category).split(" ")[0]} ${getCategoryColor(tutorial.category).split(" ")[1]}`} />
                  <svg
                    className={`w-16 h-16 ${getCategoryColor(tutorial.category).split(" ")[2]} group-hover:scale-110 transition-transform`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </>
              )}
              {/* Duration Badge */}
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                {tutorial.duration}
              </span>
            </div>

            {/* Content */}
            <div>
              <span className="text-xs font-medium text-[#6366f1] uppercase tracking-wide">
                {tutorial.category}
              </span>
              <h3 className="font-semibold text-[#f1f5f9] mt-1 group-hover:text-[#6366f1] transition-colors">
                {tutorial.title}
              </h3>
              <p className="text-sm text-[#94a3b8] mt-2 line-clamp-2">
                {tutorial.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div className="card bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border-[#6366f1]/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#f1f5f9]">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-sm text-[#94a3b8] mt-1">
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
