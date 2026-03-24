import { FuelPriceVersionValidator } from "@/app/(secure)/fuel/validator";
import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { NextResponse, NextRequest } from "next/server";
import { optionsResponse } from "../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const fuels = await FuelPriceVersionRepository.find({});
    return NextResponse.json(fuels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fuel versions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = FuelPriceVersionValidator.parse(body);

    const existing = await FuelPriceVersionRepository.findByFilter!({
      fuel: body.fuel,
      price: body.price,
    });
    if (existing) {
      return NextResponse.json(
        { error: "Fuel version already exists with the same price" },
        { status: 400 },
      );
    }

    const fuel = await FuelPriceVersionRepository.create(validatedData);
    return NextResponse.json(fuel);
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
