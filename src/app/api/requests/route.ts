import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { executeAICoordination } from "@/lib/ai-coordinator";

export async function GET() {
    try {
        const requests = await prisma.emergencyRequest.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                hospital: {
                    select: { id: true, name: true, email: true, lat: true, lng: true },
                },
                auditLogs: {
                    orderBy: { timestamp: "desc" },
                },
            },
        });

        // Enrich with assigned donor name if available
        const donorIds = requests.map((r) => r.assignedDonorId).filter(Boolean) as string[];
        const donors = await prisma.user.findMany({
            where: { id: { in: donorIds } },
            select: { id: true, name: true, email: true, lat: true, lng: true },
        });
        const donorMap = new Map(donors.map((d) => [d.id, d]));

        const enrichedRequests = requests.map((r) => ({
            ...r,
            assignedDonor: r.assignedDonorId ? donorMap.get(r.assignedDonorId) || null : null,
        }));

        return NextResponse.json({ requests: enrichedRequests });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            bloodGroup,
            unitsRequired,
            urgency = "HIGH",
            lat = 40.7128,
            lng = -74.006,
            hospitalId,
            autoCoordinate = true,
        } = body;

        if (!bloodGroup || !unitsRequired) {
            return NextResponse.json(
                { error: "bloodGroup and unitsRequired are required." },
                { status: 400 }
            );
        }

        // Get or fallback to default hospital
        let targetHospitalId = hospitalId;
        if (!targetHospitalId) {
            const hospital = await prisma.user.findFirst({
                where: { role: "HOSPITAL" },
            });
            if (!hospital) {
                return NextResponse.json({ error: "No hospital found in system." }, { status: 400 });
            }
            targetHospitalId = hospital.id;
        }

        const newRequest = await prisma.emergencyRequest.create({
            data: {
                hospitalId: targetHospitalId,
                bloodGroup,
                unitsRequired: parseInt(unitsRequired.toString(), 10),
                urgency,
                status: "PENDING",
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            },
        });

        // If autoCoordination is enabled, execute AI agent immediately
        let agentResult = null;
        if (autoCoordinate) {
            agentResult = await executeAICoordination(newRequest.id);
        }

        return NextResponse.json({
            success: true,
            request: newRequest,
            agentResult,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
