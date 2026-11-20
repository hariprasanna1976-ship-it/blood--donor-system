import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const inventories = await prisma.bloodBankInventory.findMany({
            include: { bank: true },
            orderBy: { bloodGroup: "asc" },
        });

        return NextResponse.json({ inventories });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, delta } = await req.json();

        if (!id || delta == null) {
            return NextResponse.json({ error: "Inventory id and delta are required." }, { status: 400 });
        }

        const current = await prisma.bloodBankInventory.findUnique({ where: { id } });
        if (!current) {
            return NextResponse.json({ error: "Inventory record not found." }, { status: 404 });
        }

        const newUnits = Math.max(0, current.unitsAvailable + parseInt(delta.toString(), 10));

        const updated = await prisma.bloodBankInventory.update({
            where: { id },
            data: { unitsAvailable: newUnits },
            include: { bank: true },
        });

        return NextResponse.json({ success: true, inventory: updated });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { bankId, bloodGroup, unitsAvailable = 10 } = await req.json();

        let targetBankId = bankId;
        if (!targetBankId) {
            const bank = await prisma.user.findFirst({ where: { role: "BLOOD_BANK" } });
            if (!bank) return NextResponse.json({ error: "No Blood Bank found." }, { status: 400 });
            targetBankId = bank.id;
        }

        // Check if item already exists for bank
        const existing = await prisma.bloodBankInventory.findFirst({
            where: { bankId: targetBankId, bloodGroup },
        });

        if (existing) {
            const updated = await prisma.bloodBankInventory.update({
                where: { id: existing.id },
                data: { unitsAvailable: existing.unitsAvailable + parseInt(unitsAvailable.toString(), 10) },
                include: { bank: true },
            });
            return NextResponse.json({ success: true, inventory: updated });
        }

        const created = await prisma.bloodBankInventory.create({
            data: {
                bankId: targetBankId,
                bloodGroup,
                unitsAvailable: parseInt(unitsAvailable.toString(), 10),
            },
            include: { bank: true },
        });

        return NextResponse.json({ success: true, inventory: created });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
