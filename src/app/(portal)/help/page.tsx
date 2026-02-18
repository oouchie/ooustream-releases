"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQSection = {
  title: string;
  icon: string;
  items: FAQItem[];
};

const faqSections: FAQSection[] = [
  {
    title: "Getting Started",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    items: [
      {
        question: "How do I set up Ooustream?",
        answer:
          "Ooustream has its own dedicated app! On Firestick/Android TV: install the Downloader app, enter code 3171512, and install the Ooustream app. Then enter your credentials from the Credentials page in this portal. Watch the full setup video for a step-by-step walkthrough: https://youtu.be/XIsThctDUxI — make sure to watch all the way to the end before entering the code.",
      },
      {
        question: "What devices are supported?",
        answer:
          "Our service works on Amazon Firestick, Android TV boxes, Android phones/tablets, and iPhones/iPads.",
      },
      {
        question: "How do I find my login credentials?",
        answer:
          "Your credentials are available in the 'Credentials' section of this portal. You can view, copy, or send them to your email/phone for easy access.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    items: [
      {
        question: "Channels are buffering or freezing",
        answer:
          "This is usually caused by slow internet. Try: 1) Restart your router and device, 2) Connect via ethernet instead of WiFi if possible, 3) Close other apps using bandwidth, 4) Try a different channel to see if the issue is specific to one channel. Minimum recommended speed is 25 Mbps.",
      },
      {
        question: "App says 'Connection Failed' or 'Server Error'",
        answer:
          "First, verify your credentials are entered correctly (no extra spaces). Check if your subscription is active in the 'Subscription' section. If active, try clearing the app cache or reinstalling. If the problem persists, create a support ticket.",
      },
      {
        question: "Video plays but no sound",
        answer:
          "Go to your app's audio settings and change the audio decoder. Try switching between 'Hardware' and 'Software' decoding. Also check if your device volume is up and not muted.",
      },
      {
        question: "EPG/TV Guide not loading",
        answer:
          "EPG updates may take up to 24 hours after initial setup. If it's been longer, try refreshing the EPG in your app settings. Some apps require you to manually update the EPG URL.",
      },
    ],
  },
  {
    title: "Account & Billing",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    items: [
      {
        question: "How do I renew my subscription?",
        answer:
          "Contact us via support ticket or the same method you used to purchase. We'll send you payment details and activate your renewal within minutes of receiving payment.",
      },
      {
        question: "Can I upgrade my plan?",
        answer:
          "Yes! You can upgrade from Cable to Cable+Plex at any time. Create a support ticket requesting an upgrade and we'll provide pricing based on your remaining subscription time.",
      },
      {
        question: "What happens when my subscription expires?",
        answer:
          "Your service will stop working on the expiration date. Your credentials remain the same, so once you renew, everything will work again without any reconfiguration.",
      },
    ],
  },
];

type DeviceGuide = {
  name: string;
  icon: string;
  steps: string[];
  recommendedApps: string[];
};

const deviceGuides: DeviceGuide[] = [
  {
    name: "Amazon Firestick",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    steps: [
      "Watch the full setup video before starting: https://youtu.be/XIsThctDUxI",
      "From the home screen, go to 'Find' then 'Search'",
      "Search for 'Downloader' and install it",
      "Open Downloader and enable 'Unknown Sources' when prompted (Settings > My Fire TV > Developer Options)",
      "In the Downloader URL bar, enter the code: 3171512",
      "Install the Ooustream app when the download completes",
      "Open Ooustream and enter your credentials from the Credentials page in this portal",
    ],
    recommendedApps: ["Ooustream"],
  },
  {
    name: "Android TV / Box",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    steps: [
      "Watch the full setup video before starting: https://youtu.be/XIsThctDUxI",
      "Install the 'Downloader' app from the Google Play Store",
      "Open Downloader and in the URL bar, enter the code: 3171512",
      "Install the Ooustream app when the download completes",
      "Open Ooustream and enter your credentials from the Credentials page in this portal",
      "Wait for channels to load and start watching",
    ],
    recommendedApps: ["Ooustream"],
  },
  {
    name: "iPhone / iPad",
    icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
    steps: [
      "Open the App Store",
      "Search for 'IPTV Smarters' or 'GSE Smart IPTV'",
      "Download and install the app",
      "Open the app and tap 'Add New User' or '+'",
      "Select 'M3U URL' and enter the playlist URL: https://flarecoral.com",
      "Enter your Username and Password from the Credentials page in this portal",
      "Tap 'Add User' and wait for channels to load",
    ],
    recommendedApps: ["IPTV Smarters", "GSE Smart IPTV", "iPlayTV"],
  },
];

export default function HelpPage() {
  const [openFAQs, setOpenFAQs] = useState<Record<string, boolean>>({});
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenFAQs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Help Center</h1>
        <p className="text-[#94a3b8] mt-1">
          Find answers to common questions and setup guides
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <a
          href="#faq"
          className="card hover:border-[#00d4ff] transition-colors text-center"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-[#00d4ff]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-[#f1f5f9]">FAQ</span>
        </a>
        <a
          href="#guides"
          className="card hover:border-[#00d4ff] transition-colors text-center"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-[#22c55e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-sm font-medium text-[#f1f5f9]">Setup Guides</span>
        </a>
        <a
          href="/tutorials"
          className="card hover:border-[#00d4ff] transition-colors text-center"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-[#ef4444]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-[#f1f5f9]">Video Tutorials</span>
        </a>
        <a
          href="/support/new"
          className="card hover:border-[#00d4ff] transition-colors text-center"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-[#f59e0b]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span className="text-sm font-medium text-[#f1f5f9]">Contact Support</span>
        </a>
        <a
          href="/credentials"
          className="card hover:border-[#00d4ff] transition-colors text-center"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-[#ec4899]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <span className="text-sm font-medium text-[#f1f5f9]">My Credentials</span>
        </a>
      </div>

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-8">
        <h2 className="text-xl font-bold text-[#f1f5f9] mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {faqSections.map((section) => (
            <div key={section.title} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#00d4ff]/20">
                  <svg
                    className="w-5 h-5 text-[#00d4ff]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={section.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#f1f5f9]">{section.title}</h3>
              </div>

              <div className="space-y-2">
                {section.items.map((item, idx) => {
                  const faqId = `${section.title}-${idx}`;
                  const isOpen = openFAQs[faqId];

                  return (
                    <div
                      key={idx}
                      className="border border-[#2a2a3a] rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faqId)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#12121a] transition-colors"
                      >
                        <span className="font-medium text-[#f1f5f9]">
                          {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 text-[#94a3b8] transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-[#94a3b8]">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Device Setup Guides */}
      <section id="guides" className="scroll-mt-8">
        <h2 className="text-xl font-bold text-[#f1f5f9] mb-6">
          Device Setup Guides
        </h2>

        {/* Device Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {deviceGuides.map((guide) => (
            <button
              key={guide.name}
              onClick={() =>
                setActiveGuide(activeGuide === guide.name ? null : guide.name)
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeGuide === guide.name
                  ? "bg-[#00d4ff] text-white"
                  : "bg-[#12121a] text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#2a2a3a]"
              }`}
            >
              {guide.name}
            </button>
          ))}
        </div>

        {/* Active Guide Content */}
        {activeGuide && (
          <div className="card animate-fadeIn">
            {deviceGuides
              .filter((g) => g.name === activeGuide)
              .map((guide) => (
                <div key={guide.name}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-[#22c55e]/20">
                      <svg
                        className="w-6 h-6 text-[#22c55e]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={guide.icon}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#f1f5f9] text-lg">
                        {guide.name} Setup
                      </h3>
                      <p className="text-sm text-[#94a3b8]">
                        Follow these steps to set up IPTV on your {guide.name}
                      </p>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4 mb-6">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#00d4ff]">
                            {idx + 1}
                          </span>
                        </div>
                        <p className="text-[#f1f5f9] pt-1">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Apps */}
                  <div className="pt-4 border-t border-[#2a2a3a]">
                    <h4 className="text-sm font-medium text-[#94a3b8] mb-3">
                      Recommended Apps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.recommendedApps.map((app) => (
                        <span
                          key={app}
                          className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-sm"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {!activeGuide && (
          <div className="card bg-[#2a2a3a] text-center py-8">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-[#94a3b8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-[#94a3b8]">
              Select a device above to view the setup guide
            </p>
          </div>
        )}
      </section>

      {/* Still Need Help */}
      <div className="card bg-gradient-to-r from-[#00d4ff]/20 to-[#22c55e]/20 border-[#00d4ff]/30">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">
            Still need help?
          </h3>
          <p className="text-[#94a3b8] mb-4">
            Our support team is here to assist you with any issues
          </p>
          <a href="/support/new" className="btn btn-primary">
            Create Support Ticket
          </a>
        </div>
      </div>
    </div>
  );
}
