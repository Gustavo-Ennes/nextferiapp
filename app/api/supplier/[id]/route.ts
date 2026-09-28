import { NextRequest, NextResponse } from "next/server";
import { optionsResponse } from "../../utils";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import { SupplierValidator } from "@/lib/validators/supplier";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  try {
    const { url } = req;
    const id = url?.split("/").pop();

    if (!id) throw new Error("No id provided.");

    const supplier = await SupplierRepository.findOne({ id });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch supplier: ${error}` },
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

    const validatedData = SupplierValidator.partial().parse(payload);

    const updatedSupplier = await SupplierRepository.update({
      id,
      payload: validatedData,
    });

    if (!updatedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedSupplier);
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

    const success = await SupplierRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: "supplier not found" },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}
