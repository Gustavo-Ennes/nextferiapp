import { NextRequest, NextResponse } from "next/server";
import { optionsResponse } from "../utils";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const suppliers = await SupplierRepository.find({});
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const existing = await SupplierRepository.findOne({
      id: body._id,
    });
    if (existing) {
      return NextResponse.json(
        { error: "supplier already exists" },
        { status: 400 },
      );
    }

    const supplier = await SupplierRepository.create(body);
    return NextResponse.json(supplier);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
