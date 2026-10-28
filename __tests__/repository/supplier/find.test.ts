import type { SupplierFormData } from "@/app/(secure)/supplier/types";
import type { SupplierDTO } from "@/dto";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import { Types } from "mongoose";

describe("SupplierRepository.delete", () => {
  const basePayload: SupplierFormData = {
    name: "Posto",
  };
  let supplier: SupplierDTO | null = null;

  beforeEach(async () => {
    supplier = await SupplierRepository.create(basePayload);
  });

  it("should return a list of suppliers in find()", async () => {
    const result = await SupplierRepository.find({});

    expect(result).toHaveProperty("data");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toEqual(basePayload.name);
    expect(result.data[0]).toHaveProperty("createdAt");
  });

  it("should return an empty array if no supplier found", async () => {
    await SupplierRepository.delete(supplier!._id);

    const result = await SupplierRepository.find({});

    expect(result).toHaveProperty("data");
    expect(result.data).toHaveLength(0);
  });

  it("should find all without pagination", async () => {
    const result = await SupplierRepository.findWithoutPagination!({});

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual(basePayload.name);
    expect(result[0]).toHaveProperty("createdAt");
  });

  it("should find one supplier", async () => {
    const result = await SupplierRepository.findOne({ id: supplier!._id });

    expect(result).toHaveProperty("_id", supplier!._id);
    expect(result?.name).toEqual(basePayload.name);
  });

  it("should return undefined if no supplier found in findOne()", async () => {
    const result = await SupplierRepository.findOne({
      id: new Types.ObjectId().toString(),
    });

    expect(result).toBeNull();
  });
});
