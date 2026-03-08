"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const faqs = [
    { q: "What is SiteForge AI and how does it work?", a: "SiteForge AI is an AI-powered website builder that transforms your ideas into fully functional websites. Simply describe what you want to build in natural language, and our AI handles the design, content writing, and layout. No programming experience required." },
    { q: "What can I build with SiteForge AI?", a: "You can build business websites, portfolios, restaurant sites, e-commerce stores, event pages, and local service websites. Each template category is optimized with industry-specific sections and content." },
    { q: "How does SiteForge AI's pricing work?", a: "We offer a token-based system. You start with free tokens and can purchase more as needed. Each website generation costs a small number of tokens. Premium features like AI rewriting and content improvement are also available." },
    { q: "Do I need coding experience to use SiteForge AI?", a: "Absolutely not. SiteForge AI is designed for everyone — entrepreneurs, small business owners, freelancers, and anyone who wants a professional website without the complexity of traditional web development." },
    { q: "How is SiteForge AI different from other website builders?", a: "Unlike drag-and-drop builders, SiteForge AI generates complete, unique websites from natural language descriptions. Every site is custom-made with professional copy, harmonious color palettes, and conversion-optimized layouts." },
    { q: "Can I customize the generated website?", a: "Yes! After generation, you can use our visual editor to modify text, colors, sections, and layout. You can also ask AI to rewrite specific sections or improve the content further." },
  ];

  return (
    <div className="em-page">
      {/* ══════════════════════════════════════════════
          SECTION 1: Split Hero — dark auth + bright showcase
          ══════════════════════════════════════════════ */}
      <section className="em-split-hero">
        {/* LEFT: Dark auth panel */}
        <div className="em-split-left">
          <canvas ref={canvasRef} className="em-matrix-canvas" />
          <div className="em-split-left-content">
            {/* Logo top-left */}
            <div className="em-top-logo">
              <span>⚡</span> siteforge
            </div>

            {/* Centered auth */}
            <div className="em-auth-center">
              <div className="em-auth-icon">⚡</div>
              <h1 className="em-auth-title">
                Build Stunning<br />
                Websites in Minutes
              </h1>

              <div className="em-auth-buttons">
                <Link href="/register" className="em-btn-google">
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                  Continue with Google
                </Link>

                <div className="em-social-row">
                  <button className="em-social-icon-btn">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  </button>
                  <button className="em-social-icon-btn">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                  </button>
                  <button className="em-social-icon-btn">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </button>
                </div>

                <Link href="/register" className="em-btn-email">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></svg>
                  Continue with Email
                </Link>
              </div>

              <p className="em-terms">
                By continuing, you agree to our<br />
                <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Bright showcase panel */}
        <div className="em-split-right">
          <div className="em-showcase-badge">🚀 Trusted by 10,000+ Creators</div>
          <h2 className="em-showcase-headline">
            AI-Powered Website<br />
            Generation 🎉
          </h2>
          <p className="em-showcase-sub">
            One of the fastest ways to launch a professional website.
          </p>
          <div className="em-showcase-device">
            <div className="em-device-frame">
              <div className="em-device-notch" />
              <div className="em-device-screen">
                <div className="em-device-content">
                  <div className="em-device-stat">⚡ 50+ Templates</div>
                  <div className="em-device-title">Generate websites in seconds</div>
                  <div className="em-device-desc">
                    Describe your business and watch AI create a complete,
                    professional website with compelling copy and stunning design.
                  </div>
                  <div className="em-device-tags">
                    <span>Business</span>
                    <span>Portfolio</span>
                    <span>Restaurant</span>
                    <span>E-Commerce</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2: Pricing — Light background
          ══════════════════════════════════════════════ */}
      <section className="em-pricing-section" id="pricing">
        <nav className="em-pricing-nav">
          <div className="em-pn-logo">⚡ siteforge</div>
          <div className="em-pn-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQs</a>
          </div>
          <Link href="/register" className="em-pn-cta">Get Started →</Link>
        </nav>

        <div className="em-pricing-header">
          <h2>Transparent pricing for every creator</h2>
          <p>Choose the plan that fits your building ambitions.<br />From weekend projects to enterprise websites, we've got you covered.</p>
        </div>

        <div className="em-pricing-grid">
          {/* Free */}
          <div className="em-price-card">
            <div className="em-pc-head">
              <h3>Free ✦</h3>
              <p className="em-pc-desc">Get started with essential features at no cost</p>
            </div>
            <div className="em-pc-price"><span>$0</span> / month</div>
            <ul className="em-pc-features">
              <li>50 free tokens on signup</li>
              <li>Access all template categories</li>
              <li>AI website generation</li>
              <li>Visual content editor</li>
              <li>Live preview sharing</li>
            </ul>
            <Link href="/register" className="em-pc-btn">Try SiteForge</Link>
          </div>

          {/* Standard */}
          <div className="em-price-card">
            <div className="em-pc-head">
              <h3>Standard ⚡</h3>
              <span className="em-pc-annual">Annual <span className="em-toggle-dot">●</span></span>
              <p className="em-pc-desc">Perfect for creators and freelancers</p>
            </div>
            <div className="em-pc-price"><span>$19</span> / month <em className="em-pc-save">Save $48</em></div>
            <p className="em-pc-inherit">Everything in Free, plus:</p>
            <ul className="em-pc-features">
              <li>500 tokens per month</li>
              <li>AI content rewriting</li>
              <li>AI content improvement</li>
              <li>Priority generation</li>
              <li>Custom domain support</li>
              <li>Export HTML/CSS</li>
            </ul>
            <Link href="/register" className="em-pc-btn">Try SiteForge</Link>
          </div>

          {/* Pro */}
          <div className="em-price-card">
            <div className="em-pc-head">
              <h3>Pro ✨</h3>
              <span className="em-pc-annual">Annual <span className="em-toggle-dot">●</span></span>
              <p className="em-pc-desc">Built for agencies and power users</p>
            </div>
            <div className="em-pc-price"><span>$49</span> / month <em className="em-pc-save">Save $120</em></div>
            <p className="em-pc-inherit">Everything in Standard, plus:</p>
            <ul className="em-pc-features">
              <li>Unlimited tokens</li>
              <li>White-label exports</li>
              <li>Batch generation</li>
              <li>Custom AI prompts</li>
              <li>Team collaboration</li>
              <li>Priority support</li>
              <li>API access</li>
            </ul>
            <Link href="/register" className="em-pc-btn">Try SiteForge</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3: FAQ — Dark background
          ══════════════════════════════════════════════ */}
      <section className="em-faq-section" id="faq">
        <div className="em-faq-label">FREQUENTLY ASKED QUESTIONS</div>
        <h2 className="em-faq-title">
          Curious about SiteForge AI?<br />
          We got you covered
        </h2>

        <div className="em-faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`em-faq-item ${openFaq === i ? "open" : ""}`}>
              <button className="em-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="em-faq-chevron">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="em-faq-a">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4: CTA — Bright sky background
          ══════════════════════════════════════════════ */}
      <section className="em-cta-section">
        <div className="em-cta-inner">
          <h2 className="em-cta-title">
            Start building<br />
            on SiteForge AI today.
          </h2>
          <Link href="/register" className="em-cta-btn">
            Get Started →
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5: Footer — Dark
          ══════════════════════════════════════════════ */}
      <footer className="em-footer">
        <div className="em-footer-inner">
          <div className="em-footer-brand">
            <div className="em-footer-logo">⚡ siteforge</div>
            <p className="em-footer-tagline">Build production-ready websites through conversation. AI agents that design, code, and deploy your website from start to finish.</p>
          </div>
          <div className="em-footer-columns">
            <div className="em-footer-col">
              <h4>Product</h4>
              <ul>
                <li><Link href="/templates">Templates</Link></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">How It Works</a></li>
              </ul>
            </div>
            <div className="em-footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><a href="#">Business Sites</a></li>
                <li><a href="#">Portfolios</a></li>
                <li><a href="#">Restaurants</a></li>
                <li><a href="#">E-Commerce</a></li>
              </ul>
            </div>
            <div className="em-footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Tutorials</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="em-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="em-footer-bottom">
          <span>COPYRIGHT</span>
          <span>SITEFORGE AI {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
