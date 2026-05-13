import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { FuelPriceVersionFormData } from "@/app/(secure)/fuel/types";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

describe("FuelPriceVersionRepository.update", () => {
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

  it("should not update with an invalid ObjectId", async () => {
    await expect(
      FuelPriceVersionRepository.update({
        id: "invalid-id",
        payload: fuelPriceVersionPayload,
      }),
    ).rejects.toThrow("Id prop needs to be a valid ObjectId.");
  });

  it("should not update when version is not found", async () => {
    await expect(
      FuelPriceVersionRepository.update({
        id: "000000000000000000000000",
        payload: fuelPriceVersionPayload,
      }),
    ).rejects.toThrow("No fuel found with provided id.");
  });

  it("should not update with an invalid fuel id", async () => {
    await expect(
      FuelPriceVersionRepository.update({
        id: fuelPriceVersion!._id,
        payload: {
          ...fuelPriceVersionPayload,
          fuel: "000000000000000000000000",
        },
      }),
    ).rejects.toThrow("Fuel not found with provided id.");
  });

  it("should not update with a negative price", async () => {
    await expect(
      FuelPriceVersionRepository.update({
        id: fuelPriceVersion!._id,
        payload: { ...fuelPriceVersionPayload, price: -10 },
      }),
    ).rejects.toThrow();
  });

  it("should update the price and return the updated document", async () => {
    const newPrice = 8.99;
    const updated = await FuelPriceVersionRepository.update({
      id: fuelPriceVersion!._id,
      payload: { price: newPrice },
    });

    expect(updated).toHaveProperty("_id");
    expect(updated).toHaveProperty("price", newPrice);
    expect(updated).toHaveProperty("version", fuelPriceVersion!.version);
  });

  it("should return the updated document, not the old one", async () => {
    const originalPrice = fuelPriceVersion!.price;
    const newPrice = 11.5;

    const updated = await FuelPriceVersionRepository.update({
      id: fuelPriceVersion!._id,
      payload: { price: newPrice },
    });

    expect(updated!.price).not.toBe(originalPrice);
    expect(updated!.price).toBe(newPrice);
  });

  it("should preserve other fields when updating price", async () => {
    const updated = await FuelPriceVersionRepository.update({
      id: fuelPriceVersion!._id,
      payload: { price: 7.0 },
    });

    expect(updated!.fuel).toBe(fuel!._id);
    expect(updated!.version).toBe(fuelPriceVersion!.version);
    expect(updated).toHaveProperty("version");
  });
});
