"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRESET_ACCOUNTS = [
    {
        role: "HOSPITAL",
        title: "Hospital Emergency",
        email: "cityhospital@bloodsys.com",
        icon: "🏥",
        description: "Post emergency blood alerts, track dispatched donors & inventory",
    },
    {
        role: "DONOR",
        title: "Active Donor",
        email: "alex.rivera@example.com",
        icon: "🩸",
        description: "O- Universal Donor, standby availability & live dispatch alerts",
    },
    {
        role: "BLOOD_BANK",
        title: "Blood Bank",
        email: "centralbank@bloodsys.com",
        icon: "🏦",
        description: "Manage 8-group inventory units, reserve units & verify incoming supplies",
    },
    {
        role: "ADMIN",
        title: "System Admin",
        email: "admin@bloodsys.com",
        icon: "🛡️",
        description: "Autonomous Agent coordinator oversight & comprehensive audit logs",
    },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("cityhospital@bloodsys.com");
    const [password, setPassword] = useState("password123");
    const [selectedRole, setSelectedRole] = useState("HOSPITAL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectPreset = (account: (typeof PRESET_ACCOUNTS)[0]) => {
        setSelectedRole(account.role);
        setEmail(account.email);
        setPassword("password123");
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed. Please check credentials.");
            }

            // Save user session in localStorage
            localStorage.setItem("blood_sys_user", JSON.stringify(data.user));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Top Minimal Header */}
            <div className="header-nav">
                <Link href="/" className="logo-badge">
                    <div className="droplet-icon">
                        <span style={{ transform: "rotate(45deg)", color: "#fff", fontSize: "16px" }}>✚</span>
                    </div>
                    <span>Agentic AI Blood System</span>
                </Link>
                <Link href="/" className="btn btn-secondary btn-sm">
                    ← Back to Overview
                </Link>
            </div>

            {/* Login Center Body */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem 1.5rem",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "960px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                        gap: "2rem",
                        alignItems: "stretch",
                    }}
                >
                    {/* Left Column: Preset Role Quick-Select */}
                    <div
                        style={{
                            background: "rgba(15, 23, 42, 0.75)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "16px",
                            padding: "2rem",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <div style={{ marginBottom: "1.5rem" }}>
                            <div className="badge badge-critical" style={{ marginBottom: "0.5rem" }}>
                                <span className="pulse-indicator"></span> 1-Click Role Switcher
                            </div>
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Choose a Role to Test</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                                Click any pre-configured identity below to instantly test specific features.
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {PRESET_ACCOUNTS.map((acc) => {
                                const isSelected = selectedRole === acc.role;
                                return (
                                    <div
                                        key={acc.role}
                                        onClick={() => handleSelectPreset(acc)}
                                        style={{
                                            padding: "1rem",
                                            borderRadius: "10px",
                                            border: `1px solid ${
                                                isSelected ? "var(--crimson)" : "rgba(255, 255, 255, 0.06)"
                                            }`,
                                            background: isSelected
                                                ? "rgba(225, 29, 72, 0.12)"
                                                : "rgba(255, 255, 255, 0.02)",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "0.85rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "1.5rem",
                                                background: "rgba(255, 255, 255, 0.05)",
                                                borderRadius: "8px",
                                                width: "40px",
                                                height: "40px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {acc.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                                                    {acc.title}
                                                </span>
                                                {isSelected && (
                                                    <span className="badge badge-reserved" style={{ fontSize: "0.65rem" }}>
                                                        Selected
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "var(--text-muted)",
                                                    marginTop: "0.2rem",
                                                }}
                                            >
                                                {acc.description}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--crimson)",
                                                    marginTop: "0.4rem",
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {acc.email}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Sign In Form */}
                    <div
                        style={{
                            background: "rgba(15, 23, 42, 0.85)",
                            border: "1px solid rgba(225, 29, 72, 0.25)",
                            borderRadius: "16px",
                            padding: "2.25rem",
                            backdropFilter: "blur(12px)",
                            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ marginBottom: "1.75rem" }}>
                            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                                Portal Access
                            </h1>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
                                Sign in to authorize emergency blood coordination operations.
                            </p>
                        </div>

                        {error && (
                            <div
                                style={{
                                    padding: "0.85rem 1rem",
                                    background: "rgba(225, 29, 72, 0.15)",
                                    border: "1px solid rgba(225, 29, 72, 0.4)",
                                    borderRadius: "8px",
                                    color: "#fecdd3",
                                    fontSize: "0.85rem",
                                    marginBottom: "1.25rem",
                                }}
                            >
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div className="form-group">
                                <label className="form-label">Authorized Account Email</label>
                                <input
                                    type="email"
                                    required
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. cityhospital@bloodsys.com"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Secure Access Key / Password</label>
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                />
                                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
                                    Default demo password is: <code style={{ color: "#fff" }}>password123</code>
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    marginTop: "0.5rem",
                                    padding: "0.85rem",
                                    fontSize: "1rem",
                                    width: "100%",
                                }}
                            >
                                {loading ? "Authenticating..." : "Sign In to Coordination Dashboard →"}
                            </button>
                        </form>

                        <div
                            style={{
                                marginTop: "1.75rem",
                                paddingTop: "1.25rem",
                                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: "0.8rem",
                                color: "var(--text-dim)",
                            }}
                        >
                            <span>Protocol: SQLite / Prisma Secure Auth</span>
                            <span style={{ color: "var(--emerald)" }}>● Agent Engine Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
