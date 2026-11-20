"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RequestItem {
    id: string;
    bloodGroup: string;
    unitsRequired: number;
    urgency: string;
    status: string;
    createdAt: string;
    hospital: {
        id: string;
        name: string;
        email: string;
        lat?: number | null;
        lng?: number | null;
    };
    assignedDonor?: {
        id: string;
        name: string;
        email: string;
    } | null;
    auditLogs: {
        id: string;
        decisionAction: string;
        reasoningText: string;
        timestamp: string;
    }[];
}

interface DonorItem {
    id: string;
    name: string;
    email: string;
    lat: number | null;
    lng: number | null;
    donorProfile: {
        id: string;
        bloodGroup: string;
        isAvailable: boolean;
        isVerified: boolean;
        reliabilityScore: number;
        lastDonationDate: string | null;
    } | null;
}

interface InventoryItem {
    id: string;
    bloodGroup: string;
    unitsAvailable: number;
    bank: {
        id: string;
        name: string;
    };
}

interface AuditLogItem {
    id: string;
    decisionAction: string;
    reasoningText: string;
    timestamp: string;
    request?: {
        id: string;
        bloodGroup: string;
        unitsRequired: number;
        urgency: string;
        hospital?: { name: string };
    };
}

interface StatsData {
    totalDonors: number;
    availableDonors: number;
    totalRequests: number;
    pendingRequests: number;
    reservedRequests: number;
    fulfilledRequests: number;
    totalInventoryUnits: number;
    totalAuditDecisions: number;
}

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"requests" | "radar" | "inventory" | "logs">("requests");

    const [stats, setStats] = useState<StatsData | null>(null);
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [donors, setDonors] = useState<DonorItem[]>([]);
    const [inventories, setInventories] = useState<InventoryItem[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [agentExecutingId, setAgentExecutingId] = useState<string | null>(null);
    const [agentModalResult, setAgentModalResult] = useState<any | null>(null);

    // New Request Modal state
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [newBloodGroup, setNewBloodGroup] = useState("O+");
    const [newUnits, setNewUnits] = useState(1);
    const [newUrgency, setNewUrgency] = useState("HIGH");
    const [newAutoCoordinate, setNewAutoCoordinate] = useState(true);
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // New Donor Modal state
    const [showNewDonorModal, setShowNewDonorModal] = useState(false);
    const [donorName, setDonorName] = useState("");
    const [donorEmail, setDonorEmail] = useState("");
    const [donorBloodGroup, setDonorBloodGroup] = useState("O-");
    const [donorScore, setDonorScore] = useState(9.5);
    const [submittingDonor, setSubmittingDonor] = useState(false);

    // Check localStorage user session
    useEffect(() => {
        try {
            const rawUser = localStorage.getItem("blood_sys_user");
            if (rawUser) {
                setUser(JSON.parse(rawUser));
            } else {
                setUser({
                    name: "Dr. Jonathan Crane (City Hospital)",
                    email: "cityhospital@bloodsys.com",
                    role: "HOSPITAL",
                });
            }
        } catch {
            setUser({
                name: "System Coordinator",
                email: "admin@bloodsys.com",
                role: "ADMIN",
            });
        }
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [statsRes, reqsRes, donorsRes, invRes, logsRes] = await Promise.all([
                fetch("/api/stats").then((r) => r.json()),
                fetch("/api/requests").then((r) => r.json()),
                fetch("/api/donors").then((r) => r.json()),
                fetch("/api/inventory").then((r) => r.json()),
                fetch("/api/audit-logs").then((r) => r.json()),
            ]);

            if (statsRes) setStats(statsRes);
            if (reqsRes.requests) setRequests(reqsRes.requests);
            if (donorsRes.donors) setDonors(donorsRes.donors);
            if (invRes.inventories) setInventories(invRes.inventories);
            if (logsRes.logs) setAuditLogs(logsRes.logs);
        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRunAIAgent = async (requestId: string) => {
        setAgentExecutingId(requestId);
        try {
            const res = await fetch(`/api/requests/${requestId}/coordinate`, {
                method: "POST",
            });
            const data = await res.json();
            setAgentModalResult(data);
            fetchAllData();
        } catch (err) {
            console.error("AI Agent dispatch failed:", err);
        } finally {
            setAgentExecutingId(null);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingRequest(true);
        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bloodGroup: newBloodGroup,
                    unitsRequired: newUnits,
                    urgency: newUrgency,
                    autoCoordinate: newAutoCoordinate,
                }),
            });
            const data = await res.json();
            if (data.agentResult) {
                setAgentModalResult(data.agentResult);
            }
            setShowNewRequestModal(false);
            fetchAllData();
        } catch (err) {
            console.error("Failed to create request:", err);
        } finally {
            setSubmittingRequest(false);
        }
    };

    const handleCreateDonor = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingDonor(true);
        try {
            await fetch("/api/donors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: donorName,
                    email: donorEmail,
                    bloodGroup: donorBloodGroup,
                    reliabilityScore: donorScore,
                    isAvailable: true,
                    isVerified: true,
                }),
            });
            setShowNewDonorModal(false);
            setDonorName("");
            setDonorEmail("");
            fetchAllData();
        } catch (err) {
            console.error("Failed to register donor:", err);
        } finally {
            setSubmittingDonor(false);
        }
    };

    const handleToggleDonorAvailability = async (donorProfileId: string, currentStatus: boolean) => {
        try {
            await fetch("/api/donors", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    donorProfileId,
                    isAvailable: !currentStatus,
                }),
            });
            fetchAllData();
        } catch (err) {
            console.error("Failed to toggle availability:", err);
        }
    };

    const handleAdjustInventory = async (id: string, delta: number) => {
        try {
            await fetch("/api/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, delta }),
            });
            fetchAllData();
        } catch (err) {
            console.error("Failed to update inventory:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("blood_sys_user");
        router.push("/login");
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Top Navigation Bar */}
            <header className="header-nav">
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <Link href="/" className="logo-badge">
                        <div className="droplet-icon">
                            <span style={{ transform: "rotate(45deg)", color: "#fff", fontSize: "16px" }}>✚</span>
                        </div>
                        <span>Agentic AI Blood System</span>
                    </Link>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.8rem",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "var(--emerald)",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "9999px",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                    >
                        <span className="pulse-indicator" style={{ backgroundColor: "var(--emerald)" }}></span>
                        Autonomous Engine Active
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {user && (
                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{user.name}</div>
                            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                <span className="badge badge-pending" style={{ fontSize: "0.65rem" }}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        Switch / Logout
                    </button>
                </div>
            </header>

            {/* Main App Container */}
            <main className="app-container" style={{ flex: 1 }}>
                {/* Metrics / KPI Row */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">
                            <span>Pending / Critical Requests</span>
                            <span style={{ fontSize: "1.2rem" }}>🚨</span>
                        </div>
                        <div className="stat-value" style={{ color: "var(--crimson)" }}>
                            {stats?.pendingRequests ?? 0}
                        </div>
                        <div className="stat-sub">
                            Total historical requests: <strong>{stats?.totalRequests ?? 0}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">
                            <span>Standby Verified Donors</span>
                            <span style={{ fontSize: "1.2rem" }}>🩸</span>
                        </div>
                        <div className="stat-value" style={{ color: "var(--emerald)" }}>
                            {stats?.availableDonors ?? 0}
                        </div>
                        <div className="stat-sub">
                            Registered donors: <strong>{stats?.totalDonors ?? 0}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">
                            <span>Blood Bank Units In Stock</span>
                            <span style={{ fontSize: "1.2rem" }}>🏦</span>
                        </div>
                        <div className="stat-value" style={{ color: "var(--sky)" }}>
                            {stats?.totalInventoryUnits ?? 0}
                        </div>
                        <div className="stat-sub">Across 8 blood groups in network</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">
                            <span>AI Decisions Logged</span>
                            <span style={{ fontSize: "1.2rem" }}>🤖</span>
                        </div>
                        <div className="stat-value" style={{ color: "var(--purple)" }}>
                            {stats?.totalAuditDecisions ?? 0}
                        </div>
                        <div className="stat-sub">Transparent autonomous audit trail</div>
                    </div>
                </div>

                {/* Dashboard Tabs Header */}
                <div className="tabs-nav">
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
                    >
                        <span>🚨</span> Emergency Request Hub
                    </button>
                    <button
                        onClick={() => setActiveTab("radar")}
                        className={`tab-btn ${activeTab === "radar" ? "active" : ""}`}
                    >
                        <span>📡</span> Donor Radar & Network
                    </button>
                    <button
                        onClick={() => setActiveTab("inventory")}
                        className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
                    >
                        <span>📦</span> Blood Bank Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab("logs")}
                        className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
                    >
                        <span>🧠</span> AI Decision Audit Trail
                    </button>
                </div>

                {/* TAB 1: EMERGENCY REQUESTS & COORDINATION */}
                {activeTab === "requests" && (
                    <div className="content-card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">
                                    <span>🚨</span> Emergency Blood Requests
                                </div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                                    Urgent hospital broadcasts. Trigger the autonomous agent to match bank stock or assign the nearest donor.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button onClick={fetchAllData} className="btn btn-secondary btn-sm">
                                    ↻ Refresh
                                </button>
                                <button
                                    onClick={() => setShowNewRequestModal(true)}
                                    className="btn btn-primary btn-sm"
                                >
                                    + Post Emergency Request
                                </button>
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Blood Type</th>
                                        <th>Units</th>
                                        <th>Urgency</th>
                                        <th>Hospital</th>
                                        <th>Status</th>
                                        <th>Assigned Resource</th>
                                        <th>Date</th>
                                        <th>AI Agent Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-dim)" }}>
                                                No requests currently registered. Click "+ Post Emergency Request" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => {
                                            const isPending = req.status === "PENDING" || req.status === "SEARCHING";
                                            const isFailed = req.status === "FAILED";
                                            return (
                                                <tr key={req.id}>
                                                    <td>
                                                        <span className="blood-tag">{req.bloodGroup}</span>
                                                    </td>
                                                    <td style={{ fontWeight: 700 }}>{req.unitsRequired}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                req.urgency === "CRITICAL" ? "badge-critical" : "badge-high"
                                                            }`}
                                                        >
                                                            {req.urgency === "CRITICAL" && (
                                                                <span className="pulse-indicator"></span>
                                                            )}
                                                            {req.urgency}
                                                        </span>
                                                    </td>
                                                    <td>{req.hospital?.name || "City Hospital"}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                req.status === "RESERVED"
                                                                    ? "badge-reserved"
                                                                    : req.status === "FAILED"
                                                                    ? "badge-failed"
                                                                    : "badge-pending"
                                                            }`}
                                                        >
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {req.assignedDonor ? (
                                                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                                <span>👤</span>
                                                                <span style={{ fontWeight: 600 }}>{req.assignedDonor.name}</span>
                                                            </div>
                                                        ) : req.status === "RESERVED" ? (
                                                            <span style={{ color: "var(--emerald)" }}>🏦 Bank Units Reserved</span>
                                                        ) : (
                                                            <span style={{ color: "var(--text-dim)" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                                                        {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleRunAIAgent(req.id)}
                                                            disabled={agentExecutingId === req.id}
                                                            className={`btn btn-sm ${isPending || isFailed ? "btn-agent" : "btn-secondary"}`}
                                                        >
                                                            {agentExecutingId === req.id ? (
                                                                <span>⚡ Thinking...</span>
                                                            ) : isPending || isFailed ? (
                                                                <span>⚡ Run AI Match</span>
                                                            ) : (
                                                                <span>View Trace</span>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: DONOR RADAR & REGISTRY */}
                {activeTab === "radar" && (
                    <div>
                        {/* Interactive Visual Radar */}
                        <div className="content-card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">
                                        <span>📡</span> Real-time Donor Radar
                                    </div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        Dynamic proximity tracking. Central coordinate: City Hospital (40.7128° N, 74.0060° W).
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowNewDonorModal(true)}
                                    className="btn btn-primary btn-sm"
                                >
                                    + Register Volunteer Donor
                                </button>
                            </div>

                            <div className="radar-box">
                                {/* Orbital Range Rings */}
                                <div className="radar-circle" style={{ width: "120px", height: "120px" }}></div>
                                <div className="radar-circle" style={{ width: "220px", height: "220px" }}></div>
                                <div className="radar-circle" style={{ width: "320px", height: "320px" }}></div>
                                <div className="radar-sweep-line"></div>

                                {/* Hospital Core */}
                                <div
                                    className="radar-entity"
                                    style={{
                                        top: "calc(50% - 18px)",
                                        left: "calc(50% - 18px)",
                                        zIndex: 30,
                                    }}
                                    title="City Central Hospital"
                                >
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #e11d48, #9f1239)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: "0 0 20px rgba(225, 29, 72, 0.8)",
                                            border: "2px solid #fff",
                                        }}
                                    >
                                        🏥
                                    </div>
                                    <span style={{ fontSize: "0.7rem", fontWeight: 700, marginTop: "2px", color: "#fecdd3" }}>
                                        Hospital
                                    </span>
                                </div>

                                {/* Plot Donors on Radar */}
                                {donors.map((d, idx) => {
                                    // Pseudo-polar placement relative to index for radar visual
                                    const angle = (idx * (360 / Math.max(1, donors.length))) * (Math.PI / 180);
                                    const radius = 60 + (idx % 3) * 55;
                                    const topPercent = `calc(50% + ${Math.sin(angle) * radius}px)`;
                                    const leftPercent = `calc(50% + ${Math.cos(angle) * radius}px)`;
                                    const isAvail = d.donorProfile?.isAvailable;

                                    return (
                                        <div
                                            key={d.id}
                                            className="radar-entity"
                                            style={{
                                                top: topPercent,
                                                left: leftPercent,
                                            }}
                                            title={`${d.name} (${d.donorProfile?.bloodGroup}) - Score: ${d.donorProfile?.reliabilityScore}/10`}
                                        >
                                            <div
                                                style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    borderRadius: "50%",
                                                    background: isAvail ? "#10b981" : "#64748b",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "2px solid #fff",
                                                    boxShadow: isAvail ? "0 0 12px rgba(16, 185, 129, 0.6)" : "none",
                                                }}
                                            >
                                                🩸
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "0.68rem",
                                                    fontWeight: 800,
                                                    background: "rgba(0, 0, 0, 0.7)",
                                                    padding: "1px 4px",
                                                    borderRadius: "4px",
                                                    marginTop: "2px",
                                                    color: isAvail ? "#a7f3d0" : "#94a3b8",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {d.donorProfile?.bloodGroup || "O+"} • {d.name.split(" ")[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Donor Registry Table */}
                        <div className="content-card">
                            <div className="card-header">
                                <div className="card-title">
                                    <span>👥</span> Registered Donor Standby Network
                                </div>
                            </div>

                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Donor Name</th>
                                            <th>Blood Group</th>
                                            <th>Reliability Score</th>
                                            <th>Verification</th>
                                            <th>Current Status</th>
                                            <th>Availability Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donors.map((d) => {
                                            const isAvail = d.donorProfile?.isAvailable ?? false;
                                            return (
                                                <tr key={d.id}>
                                                    <td style={{ fontWeight: 600 }}>
                                                        {d.name}
                                                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                                                            {d.email}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="blood-tag">{d.donorProfile?.bloodGroup || "O+"}</span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                            <div
                                                                style={{
                                                                    flex: 1,
                                                                    height: "6px",
                                                                    background: "#334155",
                                                                    borderRadius: "3px",
                                                                    overflow: "hidden",
                                                                    maxWidth: "80px",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: `${((d.donorProfile?.reliabilityScore ?? 5) / 10) * 100}%`,
                                                                        height: "100%",
                                                                        background: "var(--emerald)",
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                                                                {d.donorProfile?.reliabilityScore ?? 5.0}/10
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {d.donorProfile?.isVerified ? (
                                                            <span className="badge badge-reserved">✓ Verified</span>
                                                        ) : (
                                                            <span className="badge badge-failed">Unverified</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${isAvail ? "badge-reserved" : "badge-failed"}`}
                                                        >
                                                            {isAvail ? "● Standby Available" : "○ Dispatched / Busy"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {d.donorProfile && (
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleDonorAvailability(
                                                                        d.donorProfile!.id,
                                                                        isAvail
                                                                    )
                                                                }
                                                                className="btn btn-secondary btn-sm"
                                                            >
                                                                {isAvail ? "Mark Offline" : "Set Available"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: BLOOD BANK INVENTORY */}
                {activeTab === "inventory" && (
                    <div className="content-card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">
                                    <span>🏦</span> Blood Bank Inventory Reserves
                                </div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                    Central Blood Bank stock. AI prioritizes reserving bank inventory before calling out volunteer donors.
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: "1.25rem",
                            }}
                        >
                            {inventories.map((inv) => {
                                const isLow = inv.unitsAvailable < 3;
                                const isHealthy = inv.unitsAvailable >= 8;
                                return (
                                    <div
                                        key={inv.id}
                                        style={{
                                            background: "rgba(15, 23, 42, 0.7)",
                                            border: `1px solid ${
                                                isLow ? "rgba(225, 29, 72, 0.4)" : "rgba(255, 255, 255, 0.08)"
                                            }`,
                                            borderRadius: "12px",
                                            padding: "1.25rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <span className="blood-tag" style={{ fontSize: "1.1rem" }}>
                                                {inv.bloodGroup}
                                            </span>
                                            <span
                                                className={`badge ${
                                                    isLow
                                                        ? "badge-critical"
                                                        : isHealthy
                                                        ? "badge-reserved"
                                                        : "badge-high"
                                                }`}
                                            >
                                                {isLow ? "Low Stock" : isHealthy ? "Healthy" : "Moderate"}
                                            </span>
                                        </div>

                                        <div style={{ margin: "1.25rem 0" }}>
                                            <div style={{ fontSize: "2rem", fontWeight: 800 }}>
                                                {inv.unitsAvailable}{" "}
                                                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 400 }}>
                                                    units ready
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    height: "6px",
                                                    background: "#1e293b",
                                                    borderRadius: "3px",
                                                    overflow: "hidden",
                                                    marginTop: "0.5rem",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${Math.min(100, (inv.unitsAvailable / 15) * 100)}%`,
                                                        height: "100%",
                                                        background: isLow ? "var(--crimson)" : "var(--emerald)",
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => handleAdjustInventory(inv.id, -1)}
                                                disabled={inv.unitsAvailable <= 0}
                                                className="btn btn-secondary btn-sm"
                                                style={{ flex: 1 }}
                                            >
                                                -1 Unit
                                            </button>
                                            <button
                                                onClick={() => handleAdjustInventory(inv.id, 1)}
                                                className="btn btn-secondary btn-sm"
                                                style={{ flex: 1 }}
                                            >
                                                +1 Unit
                                            </button>
                                            <button
                                                onClick={() => handleAdjustInventory(inv.id, 5)}
                                                className="btn btn-primary btn-sm"
                                                style={{ flex: 1 }}
                                            >
                                                +5 Restock
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 4: AI AUDIT TRAIL */}
                {activeTab === "logs" && (
                    <div className="content-card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">
                                    <span>🧠</span> Autonomous AI Decision Audit Trail
                                </div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                    Full algorithmic transparency. Every coordination action, inventory check, and donor match is recorded.
                                </p>
                            </div>
                            <button onClick={fetchAllData} className="btn btn-secondary btn-sm">
                                ↻ Refresh Trace
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {auditLogs.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-dim)" }}>
                                    No audit entries found. Run an AI match to generate decision traces.
                                </div>
                            ) : (
                                auditLogs.map((log) => {
                                    const isSuccess =
                                        log.decisionAction === "INVENTORY_RESERVED" ||
                                        log.decisionAction === "DONOR_ASSIGNED";
                                    const isFail = log.decisionAction === "NO_DONORS_FOUND";

                                    return (
                                        <div
                                            key={log.id}
                                            style={{
                                                padding: "1rem 1.25rem",
                                                background: "rgba(15, 23, 42, 0.6)",
                                                borderLeft: `4px solid ${
                                                    isSuccess
                                                        ? "var(--emerald)"
                                                        : isFail
                                                        ? "var(--crimson)"
                                                        : "var(--sky)"
                                                }`,
                                                borderRadius: "4px 8px 8px 4px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "0.4rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    flexWrap: "wrap",
                                                    gap: "0.5rem",
                                                }}
                                            >
                                                <span
                                                    className={`badge ${
                                                        isSuccess
                                                            ? "badge-reserved"
                                                            : isFail
                                                            ? "badge-critical"
                                                            : "badge-pending"
                                                    }`}
                                                >
                                                    {log.decisionAction}
                                                </span>
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.4 }}>
                                                {log.reasoningText}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL: POST EMERGENCY REQUEST */}
            {showNewRequestModal && (
                <div className="modal-overlay" onClick={() => setShowNewRequestModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Post Emergency Blood Request</h2>
                            <button
                                onClick={() => setShowNewRequestModal(false)}
                                style={{ background: "none", border: "none", color: "#fff", fontSize: "1.25rem" }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateRequest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Required Blood Group</label>
                                <select
                                    className="form-select"
                                    value={newBloodGroup}
                                    onChange={(e) => setNewBloodGroup(e.target.value)}
                                >
                                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                                        <option key={bg} value={bg}>
                                            {bg}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Units Required</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    required
                                    className="form-input"
                                    value={newUnits}
                                    onChange={(e) => setNewUnits(parseInt(e.target.value, 10))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Urgency Classification</label>
                                <select
                                    className="form-select"
                                    value={newUrgency}
                                    onChange={(e) => setNewUrgency(e.target.value)}
                                >
                                    <option value="CRITICAL">CRITICAL (Immediate Trauma / Surgery)</option>
                                    <option value="HIGH">HIGH (Urgent within 2-4 Hours)</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" }}>
                                <input
                                    type="checkbox"
                                    id="autoCoord"
                                    checked={newAutoCoordinate}
                                    onChange={(e) => setNewAutoCoordinate(e.target.checked)}
                                />
                                <label htmlFor="autoCoord" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
                                    ⚡ <strong>Auto-Dispatch AI Agent</strong> immediately upon submission
                                </label>
                            </div>

                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowNewRequestModal(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingRequest}
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    {submittingRequest ? "Submitting..." : "Broadcast Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: REGISTER DONOR */}
            {showNewDonorModal && (
                <div className="modal-overlay" onClick={() => setShowNewDonorModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Register Volunteer Blood Donor</h2>
                            <button
                                onClick={() => setShowNewDonorModal(false)}
                                style={{ background: "none", border: "none", color: "#fff", fontSize: "1.25rem" }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateDonor} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="e.g. Dr. Robert Chen"
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="form-input"
                                    placeholder="e.g. rchen@example.com"
                                    value={donorEmail}
                                    onChange={(e) => setDonorEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Blood Group</label>
                                <select
                                    className="form-select"
                                    value={donorBloodGroup}
                                    onChange={(e) => setDonorBloodGroup(e.target.value)}
                                >
                                    {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((bg) => (
                                        <option key={bg} value={bg}>
                                            {bg}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reliability Score (1.0 - 10.0)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={1.0}
                                    max={10.0}
                                    className="form-input"
                                    value={donorScore}
                                    onChange={(e) => setDonorScore(parseFloat(e.target.value))}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowNewDonorModal(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingDonor}
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    {submittingDonor ? "Registering..." : "Add to Radar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: AI AGENT EXECUTION TRACE */}
            {agentModalResult && (
                <div className="modal-overlay" onClick={() => setAgentModalResult(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontSize: "1.5rem" }}>🤖</span>
                                <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>AI Agent Execution Decision</h2>
                            </div>
                            <button
                                onClick={() => setAgentModalResult(null)}
                                style={{ background: "none", border: "none", color: "#fff", fontSize: "1.25rem" }}
                            >
                                ✕
                            </button>
                        </div>

                        <div
                            style={{
                                padding: "1rem",
                                borderRadius: "8px",
                                background: agentModalResult.success
                                    ? "rgba(16, 185, 129, 0.15)"
                                    : "rgba(225, 29, 72, 0.15)",
                                border: `1px solid ${
                                    agentModalResult.success ? "var(--emerald)" : "var(--crimson)"
                                }`,
                                marginBottom: "1.25rem",
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                                {agentModalResult.success ? "✓ Coordination Successful" : "⚠️ Coordination Alert"}
                            </div>
                            <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                {agentModalResult.details}
                            </div>
                        </div>

                        <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                            Autonomous Algorithmic Steps:
                        </h4>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "250px", overflowY: "auto" }}>
                            {agentModalResult.auditLogs?.map((log: any, idx: number) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: "0.75rem",
                                        background: "rgba(255, 255, 255, 0.03)",
                                        borderRadius: "6px",
                                        borderLeft: "3px solid var(--purple)",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: "var(--purple)", marginRight: "0.5rem" }}>
                                        [{log.decisionAction}]
                                    </span>
                                    {log.reasoningText}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setAgentModalResult(null)}
                            className="btn btn-primary"
                            style={{ width: "100%", marginTop: "1.25rem" }}
                        >
                            Acknowledge Decision & Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
