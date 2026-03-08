"use client";

import React, { useState } from "react";
import { useStore } from "./StoreProvider";

export default function AuthModal({ theme }: { theme: any }) {
    const store = useStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (!store || !store.authOpen) return null;

    const isLogin = store.authTab === "login";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            store.login(email, password);
        } else {
            store.register(name, email, password);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "14px 18px", borderRadius: "12px",
        border: `1px solid ${theme.primaryColor}12`, fontSize: "14px",
        fontFamily: "inherit", outline: "none", background: `${theme.primaryColor}03`,
        transition: "border-color 0.3s, box-shadow 0.3s",
    };

    return (
        <>
            <div onClick={() => store.setAuthOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 9998, animation: "fadeIn 0.2s ease" }} />

            <div style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: "420px", maxWidth: "90vw", background: "#fff", borderRadius: "24px",
                zIndex: 9999, overflow: "hidden", animation: "scaleIn 0.3s ease",
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}>
                {/* Close */}
                <button onClick={() => store.setAuthOpen(false)} style={{
                    position: "absolute", top: "16px", right: "16px", width: "32px", height: "32px",
                    borderRadius: "8px", background: `${theme.primaryColor}08`, border: "none",
                    cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                }}>×</button>

                {/* Header gradient */}
                <div style={{ padding: "40px 36px 24px", background: `linear-gradient(135deg, ${theme.primaryColor}08, ${theme.secondaryColor}05)` }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, color: theme.textColor, marginBottom: "8px" }}>
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                        {isLogin ? "Sign in to access your account and orders" : "Join us for exclusive offers and faster checkout"}
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", padding: "0 36px", gap: "0", borderBottom: `1px solid ${theme.primaryColor}08` }}>
                    {(["login", "register"] as const).map((tab) => (
                        <button key={tab} onClick={() => store.setAuthTab(tab)} style={{
                            flex: 1, padding: "14px 0", background: "none", border: "none",
                            borderBottom: store.authTab === tab ? `2px solid ${theme.primaryColor}` : "2px solid transparent",
                            color: store.authTab === tab ? theme.primaryColor : "#94a3b8",
                            fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
                            textTransform: "capitalize",
                        }}>
                            {tab === "login" ? "Sign In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: "28px 36px 36px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Full Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={inputStyle}
                                onFocus={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}40`; e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.primaryColor}08`; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}12`; e.currentTarget.style.boxShadow = "none"; }}
                            />
                        </div>
                    )}
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                            onFocus={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}40`; e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.primaryColor}08`; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}12`; e.currentTarget.style.boxShadow = "none"; }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
                            onFocus={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}40`; e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.primaryColor}08`; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}12`; e.currentTarget.style.boxShadow = "none"; }}
                        />
                    </div>
                    {isLogin && (
                        <div style={{ textAlign: "right" }}>
                            <a href="#" style={{ fontSize: "13px", color: theme.secondaryColor, textDecoration: "none", fontWeight: 600 }}>Forgot password?</a>
                        </div>
                    )}
                    <button type="submit" style={{
                        padding: "16px", borderRadius: "14px",
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                        color: "#fff", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                        boxShadow: `0 8px 24px ${theme.primaryColor}25`, transition: "all 0.3s", marginTop: "4px",
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        {isLogin ? "Sign In" : "Create Account"}
                    </button>

                    {/* Social divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "4px 0" }}>
                        <div style={{ flex: 1, height: "1px", background: `${theme.primaryColor}10` }} />
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>or continue with</span>
                        <div style={{ flex: 1, height: "1px", background: `${theme.primaryColor}10` }} />
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        {["Google", "Apple", "Facebook"].map((provider) => (
                            <button key={provider} type="button" style={{
                                flex: 1, padding: "12px", borderRadius: "12px",
                                border: `1px solid ${theme.primaryColor}12`, background: "#fff",
                                fontSize: "13px", fontWeight: 600, cursor: "pointer", color: theme.textColor,
                                transition: "all 0.2s",
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}25`; e.currentTarget.style.background = `${theme.primaryColor}04`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}12`; e.currentTarget.style.background = "#fff"; }}
                            >
                                {provider}
                            </button>
                        ))}
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
            `}</style>
        </>
    );
}
