import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { CombinedFuelFormData } from "@/app/(secure)/fuel/types";
import type { FuelDTO } from "@/dto/FuelDTO";
import { Types } from "mongoose";

describe("FuelRepository.delete", () => {
  const basePayload: CombinedFuelFormData = {
    name: "Gasolina C.",
    price: 7,
    unit: "L",
    version: 1,
  };
  let fuel: FuelDTO | null = null;

  beforeEach(async () => {
    fuel = await FuelRepository.create(basePayload);
  });

  it("should do nothing if fuel doesn't exists", async() => {
    const deleted = await FuelRepository.delete(new Types.ObjectId().toString());

    expect(deleted).toBeNull();
  });

  it("should delete a fuel", async () => {
    const deleted = await FuelRepository.delete(fuel!._id);

    expect(deleted).toHaveProperty("_id", fuel!._id);
  });
});
