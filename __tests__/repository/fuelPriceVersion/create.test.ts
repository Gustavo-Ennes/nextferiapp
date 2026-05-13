import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { FuelPriceVersionFormData } from "@/app/(secure)/fuel/types";
import { dissoc } from "ramda";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

describe("FuelPriceVersionRepository.create", () => {
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

  it("should not create a version without fuel prop", async () => {
    const payload = dissoc("fuel", fuelPriceVersion!);

    await expect(
      FuelPriceVersionRepository.create(payload as any),
    ).rejects.toThrow("Fuel field is required to create a price version.");
  });

  it("should not create a version with an invalid fuel id", async () => {
    await expect(
      FuelPriceVersionRepository.create({
        ...dissoc("_id", fuelPriceVersion!),
        fuel: "000000000000000000000000",
      } as any),
    ).rejects.toThrow("No fuel found with provided id.");
  });

  it("should not create a version without price prop", async () => {
    const payload = dissoc("price", fuelPriceVersionPayload);

    await expect(
      FuelPriceVersionRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create a version with a negative price", async () => {
    await expect(
      FuelPriceVersionRepository.create({
        ...fuelPriceVersionPayload,
        price: -1,
      } as any),
    ).rejects.toThrow();
  });
  it("should create a version with auto-incremented version number", async () => {
    const first = fuelPriceVersion!;
    const second = await FuelPriceVersionRepository.create(
      fuelPriceVersionPayload,
    );
    const thirdPayload = { ...fuelPriceVersionPayload, price: 10.76 };
    const third = await FuelPriceVersionRepository.create(thirdPayload);

    const updatedFuel = await FuelRepository.findOne({ id: fuel!._id });

    expect(second.version).toBe(first.version + 1);
    expect(third.version).toBe(second.version + 1);
    expect(updatedFuel).toHaveProperty("currentPriceVersion");
    expect(updatedFuel).toHaveProperty("priceVersions");
    expect(updatedFuel?.currentPriceVersion).toMatchObject(third);
    expect(updatedFuel?.priceVersions).toHaveLength(3);
  });

  it("should create a version and return the correct shape", async () => {
    const created = await FuelPriceVersionRepository.create(
      fuelPriceVersionPayload,
    );
    const updatedFuel = await FuelRepository.findOne({ id: fuel!._id });

    expect(created).toHaveProperty("_id");
    expect(created).toHaveProperty("price", fuelPriceVersionPayload.price);
    expect(created).toHaveProperty("fuel", fuel!._id);
    expect(created).toHaveProperty(
      "version",
      (updatedFuel!.currentPriceVersion as FuelPriceVersionDTO)!.version,
    );
    expect(typeof created.version).toBe("number");
    expect(created.version).toBeGreaterThanOrEqual(1);
  });
});
