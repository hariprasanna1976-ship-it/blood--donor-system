import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const logs = await prisma.aI_AuditLog.findMany({
            orderBy: { timestamp: "desc" },
            take: 50,
            include: {
                request: {
                    select: {
                        id: true,
                        bloodGroup: true,
                        unitsRequired: true,
                        urgency: true,
                        status: true,
                        hospital: { select: { name: true } },
                    },
                },
            },
        });

        return NextResponse.json({ logs });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
