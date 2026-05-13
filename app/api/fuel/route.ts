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

    const existing = await FuelRepository.findByFilter!({
      name: body.name,
    });
    if (existing) {
      return NextResponse.json(
        { error: "Fuel already exists" },
        { status: 400 },
      );
    }

    const fuel = await FuelRepository.create(body);
    return NextResponse.json(fuel);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
