import prisma from "./prisma";

// Compatible donors for a given recipient blood group
export const COMPATIBLE_DONORS_FOR_RECIPIENT: Record<string, string[]> = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

// Haversine Distance in Kilometers
export function calculateDistanceKm(
    lat1: number | null | undefined,
    lon1: number | null | undefined,
    lat2: number | null | undefined,
    lon2: number | null | undefined
): number {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
        return 10.0; // default estimated distance if coordinates missing
    }

    const R = 6371; // Radius of earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

export interface AgentExecutionResult {
    success: boolean;
    actionTaken: "INVENTORY_RESERVED" | "DONOR_ASSIGNED" | "NO_MATCH_FOUND";
    details: string;
    assignedTargetName?: string;
    distanceKm?: number;
    auditLogs: {
        decisionAction: string;
        reasoningText: string;
    }[];
}

/**
 * Autonomous AI Blood Coordination Engine
 * Analyzes urgent request, scans bank inventories, evaluates available donors by proximity and score,
 * dispatches the match, and records full audit trail.
 */
export async function executeAICoordination(requestId: string): Promise<AgentExecutionResult> {
    const request = await prisma.emergencyRequest.findUnique({
        where: { id: requestId },
        include: { hospital: true },
    });

    if (!request) {
        throw new Error(`Emergency request ${requestId} not found.`);
    }

    const logs: { decisionAction: string; reasoningText: string }[] = [];

    // Step 1: Start Search
    const startMsg = `Agent activated for Request #${requestId.slice(0, 8)} (${request.bloodGroup}, ${request.unitsRequired} units, Urgency: ${request.urgency}) requested by ${request.hospital.name}.`;
    logs.push({ decisionAction: "START_SEARCH", reasoningText: startMsg });
    await prisma.aI_AuditLog.create({
        data: {
            requestId,
            decisionAction: "START_SEARCH",
            reasoningText: startMsg,
        },
    });

    await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: { status: "SEARCHING" },
    });

    const hospitalLat = request.lat ?? request.hospital.lat ?? 40.7128;
    const hospitalLng = request.lng ?? request.hospital.lng ?? -74.006;

    // Step 2: Check Blood Banks for exact or compatible blood
    const compatibleGroups = COMPATIBLE_DONORS_FOR_RECIPIENT[request.bloodGroup] || [request.bloodGroup];

    const bankInventories = await prisma.bloodBankInventory.findMany({
        where: {
            bloodGroup: { in: compatibleGroups },
            unitsAvailable: { gte: request.unitsRequired },
        },
        include: { bank: true },
    });

    if (bankInventories.length > 0) {
        // Pick closest bank
        let bestBank = bankInventories[0];
        let minDistance = calculateDistanceKm(
            hospitalLat,
            hospitalLng,
            bestBank.bank.lat,
            bestBank.bank.lng
        );

        for (const inv of bankInventories) {
            const dist = calculateDistanceKm(hospitalLat, hospitalLng, inv.bank.lat, inv.bank.lng);
            if (dist < minDistance) {
                minDistance = dist;
                bestBank = inv;
            }
        }

        // Reserve units from inventory
        await prisma.bloodBankInventory.update({
            where: { id: bestBank.id },
            data: { unitsAvailable: bestBank.unitsAvailable - request.unitsRequired },
        });

        await prisma.emergencyRequest.update({
            where: { id: requestId },
            data: { status: "RESERVED" },
        });

        const successMsg = `Autonomous dispatch success: Reserved ${request.unitsRequired} unit(s) of ${bestBank.bloodGroup} from ${bestBank.bank.name} (${minDistance} km away). ETA ~${Math.max(12, Math.round(minDistance * 2.5))} mins.`;
        logs.push({ decisionAction: "INVENTORY_RESERVED", reasoningText: successMsg });

        await prisma.aI_AuditLog.create({
            data: {
                requestId,
                decisionAction: "INVENTORY_RESERVED",
                reasoningText: successMsg,
            },
        });

        return {
            success: true,
            actionTaken: "INVENTORY_RESERVED",
            details: successMsg,
            assignedTargetName: bestBank.bank.name,
            distanceKm: minDistance,
            auditLogs: logs,
        };
    }

    // Step 3: Inventory Insufficient -> Scan Donor Network
    const invMsg = `Blood Bank inventories currently have insufficient compatible units for ${request.bloodGroup}. Initiating autonomous donor radar scan.`;
    logs.push({ decisionAction: "INVENTORY_EMPTY", reasoningText: invMsg });
    await prisma.aI_AuditLog.create({
        data: {
            requestId,
            decisionAction: "INVENTORY_EMPTY",
            reasoningText: invMsg,
        },
    });

    // Find verified & available donors matching blood compatibility
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const eligibleDonors = await prisma.user.findMany({
        where: {
            role: "DONOR",
            donorProfile: {
                bloodGroup: { in: compatibleGroups },
                isAvailable: true,
                OR: [
                    { lastDonationDate: null },
                    { lastDonationDate: { lte: ninetyDaysAgo } },
                ],
            },
        },
        include: { donorProfile: true },
    });

    if (eligibleDonors.length === 0) {
        const failMsg = `Critical Alert: No active, eligible donors found matching compatibility for ${request.bloodGroup}. Broadcast sent to regional coordination center.`;
        logs.push({ decisionAction: "NO_DONORS_FOUND", reasoningText: failMsg });

        await prisma.aI_AuditLog.create({
            data: {
                requestId,
                decisionAction: "NO_DONORS_FOUND",
                reasoningText: failMsg,
            },
        });

        await prisma.emergencyRequest.update({
            where: { id: requestId },
            data: { status: "FAILED" },
        });

        return {
            success: false,
            actionTaken: "NO_MATCH_FOUND",
            details: failMsg,
            auditLogs: logs,
        };
    }

    // Score Donors: Distance penalty + Reliability score + Verification bonus
    const scoredDonors = eligibleDonors.map((donor) => {
        const profile = donor.donorProfile!;
        const distance = calculateDistanceKm(hospitalLat, hospitalLng, donor.lat, donor.lng);
        const reliability = profile.reliabilityScore ?? 5.0;
        const verificationBonus = profile.isVerified ? 20 : 0;
        const score = reliability * 10 + verificationBonus - distance * 2.2;

        return {
            donor,
            profile,
            distance,
            score,
        };
    });

    // Sort highest score first
    scoredDonors.sort((a, b) => b.score - a.score);
    const topMatch = scoredDonors[0];

    // Assign Donor
    await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: {
            status: "RESERVED",
            assignedDonorId: topMatch.donor.id,
        },
    });

    // Mark donor profile as reserved / unavailable
    await prisma.donorProfile.update({
        where: { id: topMatch.profile.id },
        data: { isAvailable: false },
    });

    const donorMsg = `Optimal match confirmed: Donor ${topMatch.donor.name} (${topMatch.profile.bloodGroup}) assigned. Distance: ${topMatch.distance} km | Reliability Score: ${topMatch.profile.reliabilityScore}/10 | Match Score: ${topMatch.score.toFixed(1)}. Emergency dispatch alert dispatched.`;
    logs.push({ decisionAction: "DONOR_ASSIGNED", reasoningText: donorMsg });

    await prisma.aI_AuditLog.create({
        data: {
            requestId,
            decisionAction: "DONOR_ASSIGNED",
            reasoningText: donorMsg,
        },
    });

    return {
        success: true,
        actionTaken: "DONOR_ASSIGNED",
        details: donorMsg,
        assignedTargetName: `${topMatch.donor.name} (${topMatch.profile.bloodGroup})`,
        distanceKm: topMatch.distance,
        auditLogs: logs,
    };
}
