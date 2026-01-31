"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

interface TutorialContent {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  videoUrl?: string;
  steps?: { title: string; content: string }[];
  relatedTutorials?: string[];
}

const tutorialData: Record<string, TutorialContent> = {
  "ooustream-tutorial-pt1": {
    id: "ooustream-tutorial-pt1",
    title: "Ooustream Setup Tutorial - Part 1",
    description: "Complete guide to getting started with Ooustream. Learn everything you need to know to set up your service.",
    category: "Setup",
    duration: "Video",
    videoUrl: "https://www.youtube.com/embed/NiG6f0aTptQ",
    steps: [
      {
        title: "Watch the Full Tutorial",
        content: "This video covers everything you need to get started with Ooustream.",
      },
      {
        title: "Continue to Part 2",
        content: "After watching this video, proceed to Part 2 for advanced setup options.",
      },
    ],
    relatedTutorials: ["ooustream-tutorial-pt2", "firestick-setup", "apps"],
  },
  "ooustream-tutorial-pt2": {
    id: "ooustream-tutorial-pt2",
    title: "Ooustream Setup Tutorial - Part 2",
    description: "Continue your setup with advanced features and tips for the best streaming experience.",
    category: "Setup",
    duration: "Video",
    videoUrl: "https://www.youtube.com/embed/3qa4cgaLdIg",
    steps: [
      {
        title: "Advanced Configuration",
        content: "This video covers advanced settings and optimization tips.",
      },
      {
        title: "Get the Best Experience",
        content: "Learn how to get the most out of your Ooustream subscription.",
      },
    ],
    relatedTutorials: ["ooustream-tutorial-pt1", "troubleshooting", "buffering-fix"],
  },
  "getting-started": {
    id: "getting-started",
    title: "Getting Started with Ooustream",
    description: "Learn how to set up your IPTV service on any device in just a few minutes.",
    category: "Setup",
    duration: "5:30",
    videoUrl: "", // Add YouTube embed URL when available
    steps: [
      {
        title: "Step 1: Get Your Credentials",
        content: "Go to the Credentials page in your portal to find your username and password.",
      },
      {
        title: "Step 2: Download an IPTV App",
        content: "Install TiviMate, IPTV Smarters, or another compatible app on your device.",
      },
      {
        title: "Step 3: Enter Your Details",
        content: "Open the app and enter your M3U URL or Xtream Codes credentials.",
      },
      {
        title: "Step 4: Start Streaming",
        content: "Browse channels and enjoy your content!",
      },
    ],
    relatedTutorials: ["firestick-setup", "apps", "troubleshooting"],
  },
  "firestick-setup": {
    id: "firestick-setup",
    title: "Firestick Setup Guide",
    description: "Step-by-step guide to installing and configuring on Amazon Firestick.",
    category: "Setup",
    duration: "8:15",
    steps: [
      {
        title: "Step 1: Enable Apps from Unknown Sources",
        content: "Go to Settings > My Fire TV > Developer Options > Apps from Unknown Sources > Turn On",
      },
      {
        title: "Step 2: Install Downloader App",
        content: "Search for 'Downloader' in the Amazon App Store and install it.",
      },
      {
        title: "Step 3: Download Your IPTV App",
        content: "Open Downloader and enter the URL for your preferred IPTV app.",
      },
      {
        title: "Step 4: Configure the App",
        content: "Enter your Ooustream credentials and start streaming.",
      },
    ],
    relatedTutorials: ["getting-started", "tivimate-setup", "buffering-fix"],
  },
  apps: {
    id: "apps",
    title: "Recommended IPTV Apps",
    description: "The best apps for streaming on different devices.",
    category: "Apps",
    duration: "4:20",
    steps: [
      {
        title: "TiviMate (Recommended)",
        content: "Best for Firestick and Android TV. Premium features with a clean interface.",
      },
      {
        title: "IPTV Smarters Pro",
        content: "Works on all platforms. User-friendly with parental controls.",
      },
      {
        title: "OTT Navigator",
        content: "Great alternative with extensive customization options.",
      },
      {
        title: "GSE IPTV (iOS)",
        content: "Best option for iPhone and iPad users.",
      },
    ],
    relatedTutorials: ["tivimate-setup", "smarters-setup", "getting-started"],
  },
  troubleshooting: {
    id: "troubleshooting",
    title: "Troubleshooting Common Issues",
    description: "Fix buffering, freezing, and other common streaming problems.",
    category: "Support",
    duration: "6:30",
    steps: [
      {
        title: "Buffering Issues",
        content: "Try lowering video quality, using a wired connection, or restarting your router.",
      },
      {
        title: "Channels Not Loading",
        content: "Check your internet connection and verify your subscription is active.",
      },
      {
        title: "App Crashing",
        content: "Clear app cache, update the app, or try reinstalling.",
      },
      {
        title: "Audio/Video Out of Sync",
        content: "Restart the stream or try a different player within the app.",
      },
    ],
    relatedTutorials: ["buffering-fix", "vpn-guide", "getting-started"],
  },
};

// Default content for tutorials not yet added
const defaultTutorial: TutorialContent = {
  id: "coming-soon",
  title: "Tutorial Coming Soon",
  description: "This tutorial is being prepared and will be available shortly.",
  category: "General",
  duration: "0:00",
  steps: [
    {
      title: "Check Back Soon",
      content: "We're working on creating helpful content for this topic.",
    },
  ],
};

export default function TutorialPage() {
  const params = useParams();
  const tutorialId = params.id as string;
  const tutorial = tutorialData[tutorialId] || { ...defaultTutorial, id: tutorialId };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Setup":
        return "text-[#00d4ff] bg-[#00d4ff]/20";
      case "Apps":
        return "text-[#22c55e] bg-[#22c55e]/20";
      case "Support":
        return "text-[#f59e0b] bg-[#f59e0b]/20";
      default:
        return "text-[#00d4ff] bg-[#00d4ff]/20";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/tutorials" className="text-[#94a3b8] hover:text-[#f1f5f9]">
          Tutorials
        </Link>
        <span className="text-[#475569]">/</span>
        <span className="text-[#f1f5f9]">{tutorial.title}</span>
      </nav>

      {/* Header */}
      <div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tutorial.category)}`}>
          {tutorial.category}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-[#f1f5f9] mt-3">
          {tutorial.title}
        </h1>
        <p className="text-[#94a3b8] mt-2">{tutorial.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tutorial.duration}
          </span>
        </div>
      </div>

      {/* Video Player Placeholder */}
      <div className="card p-0 overflow-hidden">
        <div className="aspect-video bg-[#12121a] flex items-center justify-center">
          {tutorial.videoUrl ? (
            <iframe
              src={tutorial.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center">
              <svg className="w-20 h-20 text-[#475569] mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <p className="text-[#94a3b8] mt-4">Video coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      {tutorial.steps && tutorial.steps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#f1f5f9]">Instructions</h2>
          <div className="space-y-4">
            {tutorial.steps.map((step, index) => (
              <div key={index} className="card">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#00d4ff]">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#f1f5f9]">{step.title}</h3>
                    <p className="text-[#94a3b8] mt-1">{step.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Tutorials */}
      {tutorial.relatedTutorials && tutorial.relatedTutorials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#f1f5f9]">Related Tutorials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tutorial.relatedTutorials.map((relatedId) => {
              const related = tutorialData[relatedId];
              if (!related) return null;
              return (
                <Link key={relatedId} href={`/tutorials/${relatedId}`} className="card card-hover">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getCategoryColor(related.category)}`}>
                    {related.category}
                  </span>
                  <h3 className="font-medium text-[#f1f5f9] mt-2">{related.title}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Help CTA */}
      <div className="card bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 border-[#00d4ff]/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#f1f5f9]">Still need help?</h3>
            <p className="text-sm text-[#94a3b8] mt-1">
              Our support team is available 24/7
            </p>
          </div>
          <Link href="/support/new" className="btn btn-primary whitespace-nowrap">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
