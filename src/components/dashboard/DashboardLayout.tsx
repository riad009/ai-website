"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [liveTokens, setLiveTokens] = useState<number | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const user = session?.user as any;
    const isAdmin = user?.role === "ADMIN";

    const refreshTokens = () => {
        fetch("/api/user/tokens")
            .then((r) => r.json())
            .then((data) => { if (data.tokens !== undefined) setLiveTokens(data.tokens); })
            .catch(() => { });
    };

    useEffect(() => {
        refreshTokens();
        // Listen for token updates from admin panel or other components
        const handler = () => refreshTokens();
        window.addEventListener("tokens-updated", handler);
        return () => window.removeEventListener("tokens-updated", handler);
    }, []);

    const navItems = [
        { href: "/dashboard", label: "My Projects", icon: "📁" },
        { href: "/templates", label: "Templates", icon: "🎨" },
        { href: "/billing", label: "Billing", icon: "💳" },
    ];

    if (isAdmin) {
        navItems.push({ href: "/admin", label: "Admin Panel", icon: "⚙️" });
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <Link href="/dashboard" className="sidebar-logo">
                    <span>⚡</span> SiteForge AI
                </Link>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}

                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Account</div>
                        <div className="sidebar-link" style={{ cursor: "default" }}>
                            <span className="icon">🪙</span>
                            <span>Tokens: <strong style={{ color: "var(--primary-light)" }}>{liveTokens ?? user?.tokens ?? 0}</strong></span>
                        </div>
                    </div>
                </nav>

                <div className="sidebar-user">
                    <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name || "User"}</div>
                        <div className="sidebar-user-email">{user?.email || ""}</div>
                    </div>
                    <button
                        className="btn btn-ghost btn-icon sidebar-logout-btn"
                        onClick={(e) => { e.stopPropagation(); setShowLogoutConfirm(true); }}
                        title="Sign Out"
                    >
                        🚪
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>

            {showLogoutConfirm && (
                <div className="logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="logout-modal-icon">🚪</div>
                        <h3>Sign Out</h3>
                        <p>Are you sure you want to sign out?</p>
                        <div className="logout-modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
