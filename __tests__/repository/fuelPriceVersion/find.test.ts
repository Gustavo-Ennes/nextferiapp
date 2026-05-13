import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { FuelPriceVersionFormData } from "@/app/(secure)/fuel/types";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

describe("FuelPriceVersionRepository.find", () => {
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

  it("should return a paginated response", async () => {
    const result = await FuelPriceVersionRepository.find({ page: 1 });

    expect(result).toHaveProperty("data");
    expect(result.data).toHaveLength(1);
    expect(result).toHaveProperty("totalItems");
    expect(result).toHaveProperty("totalPages");
    expect(result).toHaveProperty("currentPage", 1);
    expect(result).toHaveProperty("hasNextPage");
    expect(result).toHaveProperty("hasPrevPage");
    expect(result).toHaveProperty("limit");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should return hasPrevPage as false on first page", async () => {
    const result = await FuelPriceVersionRepository.find({ page: 1 });
    expect(result.hasPrevPage).toBe(false);
  });

  it("should return currentPage matching requested page", async () => {
    const result = await FuelPriceVersionRepository.find({ page: 2 });
    expect(result.currentPage).toBe(2);
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  it("should return null when version is not found", async () => {
    const result = await FuelPriceVersionRepository.findOne({
      id: "000000000000000000000000",
    });
    expect(result).toBeNull();
  });

  it("should return a version by id", async () => {
    const result = await FuelPriceVersionRepository.findOne({
      id: fuelPriceVersion!._id,
    });

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("_id");
    expect(result!._id).toBe(fuelPriceVersion!._id);
  });

  // ─── findByFilter ─────────────────────────────────────────────────────────────

  it("should return null when no version matches the filter", async () => {
    const result = await FuelPriceVersionRepository.findByFilter!({
      version: 999999,
    } as any);
    expect(result).toBeNull();
  });

  it("should return the version that matches the filter", async () => {
    const created = await FuelPriceVersionRepository.create({
      fuel: fuel!._id,
      price: 4.99,
      unit: "L",
      version: 10,
    } as FuelPriceVersionFormData);

    const result = await FuelPriceVersionRepository.findByFilter!({
      version: created.version,
      fuel: fuel!._id,
    } as any);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("version", created.version);
  });

  // ─── findByFuel ───────────────────────────────────────────────────────────────

  it("should return an empty array when fuel has no versions", async () => {
    const result = await FuelPriceVersionRepository.findByFuel!(
      "000000000000000000000000",
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("should return all versions belonging to the fuel", async () => {
    const fuelId = fuel!._id;

    await FuelPriceVersionRepository.create({
      fuel: fuelId,
      price: 5,
      unit: "L",
      version: 1,
    } as FuelPriceVersionFormData);

    await FuelPriceVersionRepository.create({
      fuel: fuelId,
      price: 6,
      unit: "L",
      version: 2,
    } as FuelPriceVersionFormData);

    const result = await FuelPriceVersionRepository.findByFuel!(fuelId);

    expect(result.length).toBeGreaterThanOrEqual(2);
    result.forEach((v) => expect(String(v.fuel)).toBe(fuelId));
  });
});
