import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { CombinedFuelFormData } from "@/app/(secure)/fuel/types";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { Types } from "mongoose";
import type { SupplierDTO } from "@/dto";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";

describe("FuelRepository.find", () => {
  const basePayload: CombinedFuelFormData = {
    name: "Gasolina C.",
    price: 7,
    unit: "L",
    supplier: "",
  };

  let supplier: SupplierDTO;

  beforeEach(async () => {
    supplier = await SupplierRepository.create({
      name: "Posto",
    });

    basePayload.supplier = supplier._id;
  });

  it("should return a list of Fuels in find()", async () => {
    const fuel = await FuelRepository.create(basePayload);

    const result = await FuelRepository.find({});

    expect(result).toHaveProperty("data");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toEqual(basePayload.name);
    expect(result.data[0].priceVersions).toHaveLength(1);
    expect(result.data[0].currentPriceVersion).toHaveProperty(
      "_id",
      (fuel.currentPriceVersion as FuelPriceVersionDTO)._id,
    );
  });

  it("should return an empty array if no fuel found", async () => {
    const result = await FuelRepository.find({});

    expect(result).toHaveProperty("data");
    expect(result.data).toHaveLength(0);
  });

  it("should find all without pagination", async () => {
    const fuel = await FuelRepository.create(basePayload);

    const result = await FuelRepository.findWithoutPagination!({});

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual(basePayload.name);
    expect(result[0].priceVersions).toHaveLength(1);
    expect(result[0].currentPriceVersion).toHaveProperty(
      "_id",
      (fuel.currentPriceVersion as FuelPriceVersionDTO)._id,
    );
  });

  it("should find one fuel", async () => {
    const fuel = await FuelRepository.create(basePayload);

    const result = await FuelRepository.findOne({ id: fuel._id });

    expect(result).toHaveProperty("_id", fuel._id);
    expect(result?.name).toEqual(basePayload.name);
    expect(result?.priceVersions).toHaveLength(1);
    expect(result?.currentPriceVersion).toHaveProperty(
      "_id",
      (fuel.currentPriceVersion as FuelPriceVersionDTO)._id,
    );
    expect(result?.currentPriceVersion).toHaveProperty(
      "supplier",
      (fuel.currentPriceVersion as FuelPriceVersionDTO).supplier,
    );
  });

  it("should return undefined if no fuel found in findOne()", async () => {
    const result = await FuelRepository.findOne({
      id: new Types.ObjectId().toString(),
    });

    expect(result).toBeNull();
  });
});
