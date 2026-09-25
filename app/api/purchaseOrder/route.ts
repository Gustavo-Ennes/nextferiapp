import { NextRequest, NextResponse } from "next/server";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { optionsResponse } from "../utils";
import { parseBool } from "@/app/(secure)/components/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplier = searchParams.get("supplier");
    const hideLowBalance = parseBool(searchParams.get("hideLowBalance"));
    const hideOutdated = parseBool(searchParams.get("hideOutdated"));

    const orders = await PurchaseOrderRepository.find({
      supplier,
      hideLowBalance,
      hideOutdated,
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const existing = await PurchaseOrderRepository.findByReference!(
      body!.reference,
    );
    if (existing) {
      return NextResponse.json(
        { error: "Reference already exists" },
        { status: 400 },
      );
    }

    const order = await PurchaseOrderRepository.create(body);
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}
