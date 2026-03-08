"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import type { DNSRecord } from "@/types/editor";

interface PublishModalProps {
  onClose: () => void;
}

const DNS_RECORDS: DNSRecord[] = [
  { type: "CNAME", name: "www", value: "sites.yourapp.com", ttl: 3600 },
  { type: "A", name: "@", value: "76.76.21.21", ttl: 3600 },
];

export default function PublishModal({ onClose }: PublishModalProps) {
  const {
    projectId,
    subdomain,
    setSubdomain,
    customDomain,
    setCustomDomain,
    isPublished,
    publishedAt,
    setPublished,
    setPublishedAt,
    components,
  } = useEditorStore();

  const [tab, setTab] = useState<"subdomain" | "custom" | "share">("subdomain");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePublish = async () => {
    if (!subdomain.trim()) {
      setError("Please enter a name");
      return;
    }
    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          subdomain: subdomain.trim().toLowerCase(),
          components,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPublished(true);
        setPublishedAt(new Date().toISOString());
        setSubdomain(data.subdomain);
        setSuccess(`Published successfully!`);
      } else {
        const data = await res.json();
        setError(data.error || "Publish failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setPublishing(false);
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const siteUrl = subdomain ? `${baseUrl}/preview/${subdomain}` : "";

  return (
    <div className="editor-modal-overlay" onClick={onClose}>
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editor-modal-header">
          <h2>🚀 Publish Your Site</h2>
          <button className="editor-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="editor-modal-tabs">
          <button
            className={`editor-modal-tab ${tab === "subdomain" ? "active" : ""}`}
            onClick={() => setTab("subdomain")}
          >
            Subdomain
          </button>
          <button
            className={`editor-modal-tab ${tab === "custom" ? "active" : ""}`}
            onClick={() => setTab("custom")}
          >
            Custom Domain
          </button>
          <button
            className={`editor-modal-tab ${tab === "share" ? "active" : ""}`}
            onClick={() => setTab("share")}
          >
            Share
          </button>
        </div>

        <div className="editor-modal-body">
          {/* ── Subdomain Tab ── */}
          {tab === "subdomain" && (
            <div>
              <label className="editor-modal-label">Choose your site name</label>
              <div className="editor-modal-subdomain-row">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
                  placeholder="my-site"
                  className="editor-modal-input"
                />
                <span className="editor-modal-domain-suffix">/preview/{subdomain || "..."}</span>
              </div>

              {isPublished && publishedAt && (
                <>
                  <div className="editor-modal-status">
                    <span className="editor-status-dot live" />
                    Live since {new Date(publishedAt).toLocaleDateString()}
                    <div className="editor-modal-indicators">
                      <span title="SSL Certificate">🔒 SSL</span>
                      <span title="CDN Enabled">⚡ CDN</span>
                    </div>
                  </div>
                  {siteUrl && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "8px 12px", borderRadius: 8 }}>
                        <span style={{ flex: 1, fontSize: 13, wordBreak: "break-all", color: "#c7d2fe" }}>{siteUrl}</span>
                        <button
                          style={{ background: "rgba(99,102,241,0.3)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}
                          onClick={() => navigator.clipboard.writeText(siteUrl)}
                        >📋 Copy</button>
                      </div>
                      <a href={siteUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: "#818cf8", fontSize: 13, fontWeight: 600 }}
                      >🔗 Open published site →</a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Custom Domain Tab ── */}
          {tab === "custom" && (
            <div>
              <label className="editor-modal-label">Custom Domain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="www.yourdomain.com"
                className="editor-modal-input full"
              />
              <div className="editor-modal-dns-wizard">
                <h4>DNS Setup Instructions</h4>
                <p>Add these records in your domain registrar&apos;s DNS settings:</p>
                <table className="editor-dns-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Value</th>
                      <th>TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DNS_RECORDS.map((r, i) => (
                      <tr key={i}>
                        <td><code>{r.type}</code></td>
                        <td><code>{r.name}</code></td>
                        <td><code>{r.value}</code></td>
                        <td>{r.ttl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="editor-modal-indicators" style={{ marginTop: 16 }}>
                  <span title="SSL auto-provisioned via Let's Encrypt">🔒 Auto SSL (Let&apos;s Encrypt)</span>
                  <span title="Global CDN">⚡ Global CDN</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Share Tab ── */}
          {tab === "share" && (
            <div>
              {isPublished && siteUrl ? (
                <>
                  <label className="editor-modal-label">Your published site</label>
                  <div className="editor-modal-share-url">
                    <input type="text" readOnly value={siteUrl} className="editor-modal-input full" />
                    <button
                      className="editor-modal-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(siteUrl);
                        setSuccess("URL copied!");
                        setTimeout(() => setSuccess(""), 2000);
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="editor-modal-link">
                      Open in new tab →
                    </a>
                  </div>
                </>
              ) : (
                <p style={{ color: "#64748b" }}>
                  Publish your site first to get a shareable link.
                </p>
              )}
            </div>
          )}

          {error && <div className="editor-modal-error">{error}</div>}
          {success && (
            <div className="editor-modal-success">
              <div>{success}</div>
              {siteUrl && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 8 }}>
                    <span style={{ flex: 1, fontSize: 13, wordBreak: "break-all", color: "#a7f3d0" }}>{siteUrl}</span>
                    <button
                      style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                      onClick={() => { navigator.clipboard.writeText(siteUrl); }}
                    >📋 Copy</button>
                  </div>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#6ee7b7", fontSize: 13, fontWeight: 600, textDecoration: "underline" }}
                  >Open site in new tab →</a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="editor-modal-footer">
          <button className="editor-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="editor-modal-publish-btn" onClick={handlePublish} disabled={publishing}>
            {publishing ? "Publishing…" : isPublished ? "Update & Publish" : "Publish Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
