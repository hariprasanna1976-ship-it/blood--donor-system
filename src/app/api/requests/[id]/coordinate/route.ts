import { NextResponse } from "next/server";
import { executeAICoordination } from "@/lib/ai-coordinator";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await executeAICoordination(id);
        return NextResponse.json({ success: true, ...result });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
