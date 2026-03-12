import { FuelValidator } from "@/app/(secure)/fuel/validator";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { NextRequest, NextResponse } from "next/server";
import { optionsResponse } from "../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const fuels = await FuelRepository.find({});
    return NextResponse.json(fuels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fuels" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = FuelValidator.parse(body);

    const existing = await FuelRepository.findByFilter!({
      name: validatedData.name,
    });
    if (existing) {
      return NextResponse.json(
        { error: "Fuel already exists" },
        { status: 400 },
      );
    }

    const fuel = await FuelRepository.create(validatedData);
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
