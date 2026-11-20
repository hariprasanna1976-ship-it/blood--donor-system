"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Top Navigation */}
            <header className="header-nav">
                <div className="logo-badge">
                    <div className="droplet-icon">
                        <span style={{ transform: "rotate(45deg)", color: "#fff", fontSize: "16px" }}>✚</span>
                    </div>
                    <span>Agentic AI Blood System</span>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link href="/login" className="btn btn-secondary btn-sm">
                        Access Portal / Login
                    </Link>
                    <Link href="/dashboard" className="btn btn-primary btn-sm">
                        Enter Dashboard →
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="app-container" style={{ flex: 1, paddingTop: "3.5rem", paddingBottom: "4rem" }}>
                <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>
                    <div className="badge badge-critical" style={{ marginBottom: "1.25rem", padding: "0.35rem 0.85rem" }}>
                        <span className="pulse-indicator"></span> Autonomous Emergency Coordination Network
                    </div>

                    <h1
                        style={{
                            fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.15,
                            marginBottom: "1.25rem",
                            background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #f43f5e 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Smart Blood Donation & Autonomous Dispatch System
                    </h1>

                    <p
                        style={{
                            fontSize: "1.15rem",
                            color: "var(--text-muted)",
                            lineHeight: 1.6,
                            marginBottom: "2.5rem",
                            maxWidth: "720px",
                            marginInline: "auto",
                        }}
                    >
                        A next-generation emergency medical platform powered by an autonomous agentic decision
                        engine. Matches critical blood shortages against bank reserves and volunteer donors in real-time
                        using geospatial proximity and clinical compatibility matrices.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link
                            href="/dashboard"
                            className="btn btn-primary"
                            style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}
                        >
                            ⚡ Launch Coordination Dashboard
                        </Link>
                        <Link
                            href="/login"
                            className="btn btn-secondary"
                            style={{ padding: "0.85rem 1.75rem", fontSize: "1.05rem" }}
                        >
                            🔑 Role-Based Sign In
                        </Link>
                    </div>
                </div>

                {/* Core Feature Pillars */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1.5rem",
                        marginTop: "5rem",
                    }}
                >
                    <div className="stat-card" style={{ padding: "1.75rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🤖</div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            Autonomous AI Matcher
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                            Evaluates emergency requests step-by-step. Scans inventory reserves first, then scores
                            nearby donors using Haversine distance, reliability scores, and compatibility matrices.
                        </p>
                    </div>

                    <div className="stat-card" style={{ padding: "1.75rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📡</div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            Live Proximity Radar
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                            Real-time radar scanner pinpointing hospital coordinates, nearby standby donors, and blood
                            bank locations with instantaneous distance computations.
                        </p>
                    </div>

                    <div className="stat-card" style={{ padding: "1.75rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏦</div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            8-Group Inventory Reserves
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                            Granular stock controls across all 8 blood groups (O-, O+, A-, A+, B-, B+, AB-, AB+) with
                            rapid restock and automated inventory reservations.
                        </p>
                    </div>

                    <div className="stat-card" style={{ padding: "1.75rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🧠</div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            Auditable Decision Trail
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                            Zero black-box decisions. Every dispatch, inventory deduction, and donor assignment generates
                            an immutable, transparent algorithmic audit trail.
                        </p>
                    </div>
                </div>

                {/* Architecture & Tech Stack Bar */}
                <div
                    style={{
                        marginTop: "4rem",
                        padding: "1.5rem 2rem",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Built with Modern Full-Stack Technologies</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                            Next.js 16 App Router • Prisma 6 ORM • SQLite Database • Turbopack Optimized
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span className="badge badge-pending">Next.js 16</span>
                        <span className="badge badge-reserved">Prisma ORM</span>
                        <span className="badge badge-high">SQLite Engine</span>
                        <span className="badge badge-critical">AI Coordinator</span>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer
                style={{
                    borderTop: "1px solid var(--border-dim)",
                    padding: "1.5rem",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    color: "var(--text-dim)",
                }}
            >
                Agentic AI Blood Coordination System • Built for high-reliability emergency healthcare response
            </footer>
        </div>
    );
}
