import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database";
import Worker from "@/models/Worker";
import { revalidatePath } from "next/cache";

export async function GET() {
  await dbConnect();

  try {
    const workers = await Worker.find().populate("department");
    return NextResponse.json({ success: true, data: workers });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const worker = await Worker.create(body);

    revalidatePath("/worker");
    return NextResponse.json({ data: worker });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

// colocar admissionDate no form do worker
