"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { TICKET_CATEGORIES, TicketCategory } from "@/types";

const deviceTypes = [
  "Firestick",
  "Android Box",
  "Android Phone/Tablet",
  "iPhone/iPad",
  "Other",
];

const appNames = [
  "TiviMate",
  "IPTV Smarters",
  "GSE Smart IPTV",
  "iPlayTV",
  "OTT Navigator",
  "Perfect Player",
  "Smart IPTV",
  "VLC Media Player",
  "Aurora",
  "Other",
];

const troubleshootingSteps = [
  "Restarted my device",
  "Restarted my router",
  "Cleared app cache",
  "Reinstalled the app",
  "Tried a different channel",
  "Checked my internet speed",
  "Tried a different app",
];

// Categories where device type is required
const technicalCategories: TicketCategory[] = [
  "connection_issue",
  "buffering",
  "login_problem",
  "app_help",
];

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "" as TicketCategory | "",
    device_type: "",
    description: "",
  });
  const [appName, setAppName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [stepsTried, setStepsTried] = useState<string[]>([]);

  // Load AI chat context if coming from the chat widget
  useEffect(() => {
    const chatContext = sessionStorage.getItem("ai_chat_context");
    if (chatContext) {
      setFormData((prev) => ({
        ...prev,
        description: "--- Previous AI Chat ---\n" + chatContext,
      }));
      sessionStorage.removeItem("ai_chat_context");
    }
  }, []);

  const isTechnical =
    formData.category !== "" &&
    technicalCategories.includes(formData.category as TicketCategory);

  const deviceRequired = isTechnical;

  const buildFullDescription = () => {
    const parts: string[] = [];

    if (formData.description.trim()) {
      parts.push(formData.description.trim());
    }

    const details: string[] = [];
    if (appName) details.push(`App: ${appName}`);
    if (errorMessage.trim())
      details.push(`Error Message: ${errorMessage.trim()}`);
    if (stepsTried.length > 0)
      details.push(`Steps Already Tried:\n${stepsTried.map((s) => `- ${s}`).join("\n")}`);

    if (details.length > 0) {
      parts.push("--- Additional Details ---");
      parts.push(details.join("\n\n"));
    }

    return parts.join("\n\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deviceRequired && !formData.device_type) {
      toast.error("Please select your device type");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: buildFullDescription(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create ticket");
        return;
      }

      toast.success("Ticket created successfully!");
      router.push(`/support/${data.ticket.id}`);
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (step: string) => {
    setStepsTried((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">
          Create New Ticket
        </h1>
        <p className="text-[#94a3b8] mt-1">
          Describe your issue and we&apos;ll get back to you as soon as possible
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as TicketCategory,
              })
            }
            className="input"
            required
          >
            <option value="">Select a category</option>
            {Object.entries(TICKET_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="label">Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="Brief description of your issue"
            className="input"
            required
            maxLength={100}
          />
        </div>

        {/* Device & App row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Device Type */}
          <div>
            <label className="label">
              Device Type {deviceRequired ? "*" : ""}
            </label>
            <select
              value={formData.device_type}
              onChange={(e) =>
                setFormData({ ...formData, device_type: e.target.value })
              }
              className="input"
              required={deviceRequired}
            >
              <option value="">
                Select device{deviceRequired ? "" : " (optional)"}
              </option>
              {deviceTypes.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>
          </div>

          {/* App Name */}
          <div>
            <label className="label">App Name</label>
            <select
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="input"
            >
              <option value="">Select app (optional)</option>
              {appNames.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message — shown for technical categories */}
        {isTechnical && (
          <div>
            <label className="label">Error Message</label>
            <input
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Paste any error message you see (optional)"
              className="input"
            />
          </div>
        )}

        {/* Steps Already Tried — shown for technical categories */}
        {isTechnical && (
          <div>
            <label className="label">Steps Already Tried</label>
            <p className="text-xs text-[#64748b] mb-2">
              Select any troubleshooting steps you&apos;ve already attempted
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {troubleshootingSteps.map((step) => (
                <label
                  key={step}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    stepsTried.includes(step)
                      ? "border-[#00d4ff]/50 bg-[#00d4ff]/10 text-[#f1f5f9]"
                      : "border-[#334155] bg-[#0f172a] text-[#94a3b8] hover:border-[#475569]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={stepsTried.includes(step)}
                    onChange={() => toggleStep(step)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      stepsTried.includes(step)
                        ? "border-[#00d4ff] bg-[#00d4ff]"
                        : "border-[#475569]"
                    }`}
                  >
                    {stepsTried.includes(step) && (
                      <svg
                        className="w-3 h-3 text-[#0a0a0f]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{step}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="label">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Please describe your issue in detail. What happened? When did it start?"
            className="input min-h-[150px] resize-y"
            required
            rows={6}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? <span className="spinner" /> : "Submit Ticket"}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="card bg-[#6366f1]/10 border-[#6366f1]/30">
        <h3 className="font-medium text-[#f1f5f9] mb-2">
          Tips for faster help
        </h3>
        <ul className="text-sm text-[#94a3b8] space-y-1 list-disc list-inside">
          <li>Include the exact error message if you see one</li>
          <li>Mention when the issue started</li>
          <li>List what you&apos;ve already tried to fix it</li>
          <li>Include your device type and app name</li>
        </ul>
      </div>
    </div>
  );
}
