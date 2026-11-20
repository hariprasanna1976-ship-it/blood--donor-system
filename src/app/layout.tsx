import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Agentic AI Blood Coordination System",
    description: "Autonomous Emergency Blood Matching, Radar Tracking, and Inventory Network",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-rose-500 selection:text-white">
                {children}
            </body>
        </html>
    );
}
