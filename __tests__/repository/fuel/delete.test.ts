import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { CombinedFuelFormData } from "@/app/(secure)/fuel/types";
import type { FuelDTO } from "@/dto/FuelDTO";
import { Types } from "mongoose";
import type { SupplierDTO } from "@/dto";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";

describe("FuelRepository.delete", () => {
  const basePayload: CombinedFuelFormData = {
    name: "Gasolina C.",
    price: 7,
    unit: "L",
    supplier: "",
  };
  let fuel: FuelDTO | null = null;
  let supplier: SupplierDTO;

  beforeEach(async () => {
    supplier = await SupplierRepository.create({
      name: "Posto",
    });
    basePayload.supplier = supplier._id;
    fuel = await FuelRepository.create(basePayload);
  });

  it("should do nothing if fuel doesn't exists", async () => {
    const deleted = await FuelRepository.delete(
      new Types.ObjectId().toString(),
    );

    expect(deleted).toBeNull();
  });

  it("should delete a fuel", async () => {
    const deleted = await FuelRepository.delete(fuel!._id);

    expect(deleted).toHaveProperty("_id", fuel!._id);
  });
});
