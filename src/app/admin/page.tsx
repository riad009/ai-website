"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    tokens: number;
    createdAt: string;
    _count: { projects: number; payments: number };
}

export default function AdminPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [adjustId, setAdjustId] = useState<string | null>(null);
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustAction, setAdjustAction] = useState<"add" | "deduct" | "set">("add");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                setUsers(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAdjust = async () => {
        if (!adjustId || !adjustAmount) return;

        const res = await fetch("/api/admin/tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: adjustId,
                amount: parseInt(adjustAmount),
                action: adjustAction,
            }),
        });

        if (res.ok) {
            const data = await res.json();
            setUsers(users.map((u) => (u.id === adjustId ? { ...u, tokens: data.tokens } : u)));
            setAdjustId(null);
            setAdjustAmount("");
            // Notify sidebar and other components to refresh tokens
            window.dispatchEvent(new Event("tokens-updated"));
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalTokens = users.reduce((sum, u) => sum + (u.tokens || 0), 0);
    const totalProjects = users.reduce((sum, u) => sum + (u._count?.projects || 0), 0);

    return (
        <>
            <DashboardLayout>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Admin Panel</h1>
                        <p className="page-subtitle">Manage users and tokens</p>
                    </div>
                </div>

                <div className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalTokens}</div>
                        <div className="stat-label">Total Tokens</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalProjects}</div>
                        <div className="stat-label">Total Projects</div>
                    </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                    <input
                        className="input"
                        placeholder="🔍 Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: "400px" }}
                    />
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Tokens</th>
                                <th>Projects</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                                        <div className="spinner" style={{ margin: "0 auto" }} />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div>
                                                <strong>{user.name}</strong>
                                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.role === "ADMIN" ? "status-completed" : "status-pending"}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="token-badge" style={{ fontSize: "12px", padding: "4px 10px" }}>
                                                🪙 {user.tokens}
                                            </span>
                                        </td>
                                        <td>{user._count?.projects ?? 0}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                    setAdjustId(user.id);
                                                    setAdjustAmount("");
                                                    setAdjustAction("add");
                                                }}
                                            >
                                                🪙 Adjust
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </DashboardLayout>

            {/* Adjust Tokens Modal — rendered outside DashboardLayout to avoid z-index issues */}
            {adjustId && (
                <div className="modal-overlay" onClick={() => setAdjustId(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Adjust Tokens</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                            User: {users.find((u) => u.id === adjustId)?.email}
                        </p>
                        <div className="auth-form">
                            <div className="input-group">
                                <label>Action</label>
                                <select className="input" value={adjustAction} onChange={(e) => setAdjustAction(e.target.value as any)}>
                                    <option value="add">Add Tokens</option>
                                    <option value="deduct">Deduct Tokens</option>
                                    <option value="set">Set Exact Amount</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Amount</label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setAdjustId(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAdjust} disabled={!adjustAmount}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
