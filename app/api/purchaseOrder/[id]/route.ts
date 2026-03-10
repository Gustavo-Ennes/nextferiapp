import { NextResponse } from "next/server";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { PurchaseOrderValidator } from "@/app/(secure)/purchaseOrder/validator";

type RouteParams = { params: { id: string } };

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const order = await PurchaseOrderRepository.findOne({ id: params.id });

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

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();

    const validatedData = PurchaseOrderValidator.partial().parse(body);

    const updatedOrder = await PurchaseOrderRepository.update({
      id: params.id,
      payload: validatedData,
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

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const success = await PurchaseOrderRepository.delete(params.id);

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
