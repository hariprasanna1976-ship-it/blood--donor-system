import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: {
                donorProfile: true,
                bloodBankInventory: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials. User not found." }, { status: 401 });
        }

        // Demo credential authentication
        const isValidPassword =
            password === "password123" ||
            !password ||
            password === user.passwordHash;

        if (!isValidPassword) {
            return NextResponse.json({ error: "Invalid password. Default demo password is: password123" }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                lat: user.lat,
                lng: user.lng,
                donorProfile: user.donorProfile,
            },
        });
    } catch (err: any) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Internal server error during authentication." }, { status: 500 });
    }
}
