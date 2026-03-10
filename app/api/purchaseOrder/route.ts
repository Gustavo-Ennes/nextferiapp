import { NextResponse } from "next/server";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { PurchaseOrderValidator } from "@/app/(secure)/purchaseOrder/validator";

export async function GET() {
  try {
    const orders = await PurchaseOrderRepository.find({});
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = PurchaseOrderValidator.parse(body);

    const existing = await PurchaseOrderRepository.findByReference!(
      validatedData.reference,
    );
    if (existing) {
      return NextResponse.json(
        { error: "Reference already exists" },
        { status: 400 },
      );
    }

    const order = await PurchaseOrderRepository.create(validatedData);
    return NextResponse.json(order);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
