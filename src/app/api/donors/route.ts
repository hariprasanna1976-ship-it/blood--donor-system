import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_PASSWORD_HASH = "$2b$10$XNTlsfPS/rqpw3MWDOoME.172x.Yp0BADO2.sSLnmpwywON5eZzU6"; // precomputed hash for 'password123'

export async function GET() {
    try {
        const donors = await prisma.user.findMany({
            where: { role: "DONOR" },
            include: { donorProfile: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ donors });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            email,
            bloodGroup,
            lat = 40.72,
            lng = -74.005,
            reliabilityScore = 9.0,
            isAvailable = true,
            isVerified = true,
        } = body;

        if (!name || !email || !bloodGroup) {
            return NextResponse.json(
                { error: "Name, email, and bloodGroup are required." },
                { status: 400 }
            );
        }

        const newDonor = await prisma.user.upsert({
            where: { email: email.toLowerCase().trim() },
            update: {
                name,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                donorProfile: {
                    update: {
                        bloodGroup,
                        isAvailable,
                        isVerified,
                        reliabilityScore: parseFloat(reliabilityScore),
                    },
                },
            },
            create: {
                name,
                email: email.toLowerCase().trim(),
                passwordHash: DEFAULT_PASSWORD_HASH,
                role: "DONOR",
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                donorProfile: {
                    create: {
                        bloodGroup,
                        isAvailable,
                        isVerified,
                        reliabilityScore: parseFloat(reliabilityScore),
                        lastDonationDate: new Date("2025-01-15"),
                    },
                },
            },
            include: { donorProfile: true },
        });

        return NextResponse.json({ success: true, donor: newDonor });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { donorProfileId, isAvailable } = await req.json();
        if (!donorProfileId) {
            return NextResponse.json({ error: "donorProfileId required" }, { status: 400 });
        }

        const updated = await prisma.donorProfile.update({
            where: { id: donorProfileId },
            data: { isAvailable: Boolean(isAvailable) },
        });

        return NextResponse.json({ success: true, profile: updated });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
