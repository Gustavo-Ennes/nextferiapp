import { NextRequest, NextResponse } from "next/server";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { optionsResponse } from "../../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  try {
    const { url } = req;
    const id = url?.split("/").pop();

    if (!id) throw new Error("No id provided.");

    const order = await PurchaseOrderRepository.findOne({ id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch purchase order: ${error}` },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { url } = req;
    const payload = await req.json();
    const id = url?.split("/").pop();

    if (!id) throw new Error("No id provided.");

    const updatedOrder = await PurchaseOrderRepository.update({
      id,
      payload,
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = req;
    const id = url?.split("/").pop();

    if (!id) throw new Error("No id provided.");

    const success = await PurchaseOrderRepository.delete(id);

    if (!success) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}
