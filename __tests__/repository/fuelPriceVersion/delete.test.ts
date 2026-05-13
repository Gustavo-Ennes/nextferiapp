import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { FuelPriceVersionFormData } from "@/app/(secure)/fuel/types";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

describe("FuelPriceVersionRepository.delete", () => {
  let fuel: FuelDTO | null = null;
  let fuelPriceVersion: FuelPriceVersionDTO | null = null;
  const fuelPriceVersionPayload: FuelPriceVersionFormData = {
    price: 8,
    version: 2,
  };

  beforeEach(async () => {
    fuel = await FuelRepository.create({
      name: "Gasolina",
      price: 6.46,
      unit: "L",
      version: 1,
    });
    fuelPriceVersion = fuel.currentPriceVersion! as FuelPriceVersionDTO;
    fuelPriceVersionPayload.fuel = fuel._id;
  });

  it("should return null when version is not found", async () => {
    const result = await FuelPriceVersionRepository.delete(
      "000000000000000000000000",
    );
    expect(result).toBeNull();
  });

  it("should delete the version and return the deleted document", async () => {
    const deleted = await FuelPriceVersionRepository.delete(
      fuelPriceVersion!._id,
    );

    expect(deleted).not.toBeNull();
    expect(String(deleted!._id)).toBe(fuelPriceVersion!._id);
  });

  it("should not find the version after deletion", async () => {
    const createdId = fuelPriceVersion!._id;
    await FuelPriceVersionRepository.delete(createdId);

    const result = await FuelPriceVersionRepository.findOne({ id: createdId });
    expect(result).toBeNull();
  });

  it("should not delete the same version twice", async () => {
    const createdId = fuelPriceVersion!._id;
    await FuelPriceVersionRepository.delete(createdId);

    const secondDelete = await FuelPriceVersionRepository.delete(createdId);
    expect(secondDelete).toBeNull();
  });
});
