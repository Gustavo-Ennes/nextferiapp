import { FuelPriceVersionValidator } from "@/app/(secure)/fuel/validator";
import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { NextRequest, NextResponse } from "next/server";
import { optionsResponse } from "../../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  try {
    const { url } = req;
    const id = url?.split("/").pop();

    if (!id) throw new Error("No id provided.");

    const order = await FuelPriceVersionRepository.findOne({ id });

    if (!order) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch fuel version: ${error}` },
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

    const validatedData = FuelPriceVersionValidator.partial().parse(payload);

    const updatedFuel = await FuelPriceVersionRepository.update({
      id,
      payload: validatedData,
    });

    if (!updatedFuel) {
      return NextResponse.json(
        { error: "Fuel version not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedFuel);
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

    const success = await FuelPriceVersionRepository.delete(id);

    if (!success) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}
