import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const [
            totalDonors,
            availableDonors,
            totalRequests,
            pendingRequests,
            reservedRequests,
            fulfilledRequests,
            failedRequests,
            totalInventoryUnits,
            totalAuditDecisions,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "DONOR" } }),
            prisma.donorProfile.count({ where: { isAvailable: true } }),
            prisma.emergencyRequest.count(),
            prisma.emergencyRequest.count({ where: { status: "PENDING" } }),
            prisma.emergencyRequest.count({ where: { status: "RESERVED" } }),
            prisma.emergencyRequest.count({ where: { status: "FULFILLED" } }),
            prisma.emergencyRequest.count({ where: { status: "FAILED" } }),
            prisma.bloodBankInventory.aggregate({ _sum: { unitsAvailable: true } }),
            prisma.aI_AuditLog.count(),
        ]);

        return NextResponse.json({
            totalDonors,
            availableDonors,
            totalRequests,
            pendingRequests,
            reservedRequests,
            fulfilledRequests,
            failedRequests,
            totalInventoryUnits: totalInventoryUnits._sum.unitsAvailable || 0,
            totalAuditDecisions,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
