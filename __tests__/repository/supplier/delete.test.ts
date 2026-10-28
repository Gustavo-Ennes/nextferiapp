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

  it("should do nothing if supplier doesn't exists", async () => {
    const deleted = await SupplierRepository.delete(
      new Types.ObjectId().toString(),
    );

    expect(deleted).toBeNull();
  });

  it("should delete a fuel", async () => {
    const deleted = await SupplierRepository.delete(supplier!._id);

    expect(deleted).toHaveProperty("_id", supplier!._id);
  });
});
