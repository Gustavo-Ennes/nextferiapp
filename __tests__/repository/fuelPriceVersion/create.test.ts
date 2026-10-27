import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { FuelPriceVersionFormData } from "@/app/(secure)/fuel/types";
import { assoc, dissoc } from "ramda";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import type { SupplierDTO } from "@/dto";

describe("FuelPriceVersionRepository.create", () => {
  let fuel: FuelDTO | null = null;
  let fuelPriceVersion: FuelPriceVersionDTO | null = null;
  let supplier: SupplierDTO | null = null;
  const fuelPriceVersionPayload: FuelPriceVersionFormData = {
    price: 8,
    supplier: "",
    fuel: "",
  };

  beforeEach(async () => {
    supplier = await SupplierRepository.create({
      name: "Posto",
    });
    fuel = await FuelRepository.create({
      name: "Gasolina",
      price: 6.46,
      unit: "L",
      supplier: supplier._id,
    });
    fuelPriceVersion = fuel.currentPriceVersion! as FuelPriceVersionDTO;
    fuelPriceVersionPayload.fuel = fuel._id;
    fuelPriceVersionPayload.supplier = supplier._id;
  });

  it("should not create a version without fuel prop", async () => {
    const payload = dissoc("fuel", fuelPriceVersionPayload!);

    await expect(
      FuelPriceVersionRepository.create(payload as any),
    ).rejects.toThrow("Fuel field is required to create a price version.");
  });

  it("should not create a version with an invalid fuel id", async () => {
    await expect(
      FuelPriceVersionRepository.create(
        assoc("fuel", "000000000000000000000000", fuelPriceVersionPayload!),
      ),
    ).rejects.toThrow("No fuel found with provided id.");
  });

  it("should not create a version without price prop", async () => {
    const payload = dissoc("price", fuelPriceVersionPayload);

    await expect(
      FuelPriceVersionRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create a version without a supplier", async () => {
    const payload = dissoc("supplier", fuelPriceVersionPayload);

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
    const first = (await FuelPriceVersionRepository.findOne({
      id: fuelPriceVersion!._id,
    })) as FuelPriceVersionDTO;
    const second = await FuelPriceVersionRepository.create(
      fuelPriceVersionPayload,
    );
    const thirdPayload = { ...fuelPriceVersionPayload, price: 10.76 };
    const third = await FuelPriceVersionRepository.create(thirdPayload);

    const updatedFuel = await FuelRepository.findOne({ id: fuel!._id });

    expect(second.version).toBe(first.version + 1);
    expect(third.version).toBe(second.version + 1);
    expect((first.supplier as SupplierDTO)._id).toEqual(
      (second.supplier as SupplierDTO)._id,
    );
    expect((second.supplier as SupplierDTO)._id).toEqual(
      (third.supplier as SupplierDTO)._id,
    );
    expect((first.fuel as FuelDTO)._id).toEqual((second.fuel as FuelDTO)._id);
    expect((second.fuel as FuelDTO)._id).toEqual((third.fuel as FuelDTO)._id);
    expect(updatedFuel).toHaveProperty("currentPriceVersion");
    expect(updatedFuel).toHaveProperty("priceVersions");
    expect(updatedFuel?.currentPriceVersion).toHaveProperty(
      "version",
      third.version,
    );
    expect(updatedFuel?.priceVersions).toHaveLength(3);
  });

  it("should create a version and return the correct shape", async () => {
    const created = await FuelPriceVersionRepository.create(
      fuelPriceVersionPayload,
    );
    const updatedFuel = await FuelRepository.findOne({ id: fuel!._id });

    expect(created).toHaveProperty("_id");
    expect(created).toHaveProperty("price", fuelPriceVersionPayload.price);
    expect(created.supplier).toHaveProperty(
      "_id",
      fuelPriceVersionPayload.supplier,
    );
    expect(created.fuel).toHaveProperty("_id", fuel!._id);
    expect(created).toHaveProperty(
      "version",
      (updatedFuel!.currentPriceVersion as FuelPriceVersionDTO)!.version,
    );
    expect(typeof created.version).toBe("number");
    expect(created.version).toBeGreaterThanOrEqual(1);
  });
});
