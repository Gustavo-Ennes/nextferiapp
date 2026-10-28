import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import type {
  DepartmentDTO,
  FuelingBatchDTO,
  PurchaseOrderDTO,
  SupplierDTO,
} from "@/dto";
import { createBaseEntities } from "../vacation/utils";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { getBaseTotals, getFuelingBatchBasePayload } from "./utils";
import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";

describe("FuelingBatch.delete", () => {
  let department: DepartmentDTO;
  let purchaseOrder: PurchaseOrderDTO;
  let fuel: FuelDTO;
  let fuelPriceVersion: FuelPriceVersionDTO;
  let supplier: SupplierDTO;
  let fuelingBatch: FuelingBatchDTO;

  beforeEach(async () => {
    const { baseDepartment } = await createBaseEntities();
    department = baseDepartment;
    supplier = await SupplierRepository.create({ name: "Posto" });
    fuel = await FuelRepository.create({
      name: "Gasolina",
      price: 6.55,
      supplier: supplier._id,
      unit: "L",
    });
    fuelPriceVersion = fuel.currentPriceVersion as FuelPriceVersionDTO;
    purchaseOrder = await PurchaseOrderRepository.create({
      department: baseDepartment._id,
      reference: "222/26",
      items: [
        {
          fuel: fuel._id,
          fuelPriceVersion: fuelPriceVersion._id,
          price: 6.55,
          quantity: 1000,
        },
      ],
      supplier: supplier._id,
    });

    const fuelingBatchPayload = getFuelingBatchBasePayload({
      department,
      fuel,
      purchaseOrder,
      baseTotals: getBaseTotals(),
    });
    fuelingBatch = (await FuelingBatchRepository.create(
      fuelingBatchPayload,
    )) as FuelingBatchDTO;
  });

  it("should throw when fuelingBatch is not found", async () => {
    await expect(
      FuelingBatchRepository.delete("000000000000000000000000"),
    ).rejects.toThrow("Fueling batch not found");
  });

  it("should delete the fueling batch and return the deleted document", async () => {
    const deleted = await FuelingBatchRepository.delete(fuelingBatch!._id);

    expect(deleted).not.toBeNull();
    expect(String(deleted!._id)).toBe(fuelingBatch!._id);
  });

  it("should not find fuelingBatch after deletion", async () => {
    const createdId = fuelingBatch!._id;
    await FuelPriceVersionRepository.delete(createdId);

    const result = await FuelPriceVersionRepository.findOne({ id: createdId });
    expect(result).toBeNull();
  });

  it("should not delete the same batch twice", async () => {
    const createdId = fuelingBatch!._id;
    await FuelPriceVersionRepository.delete(createdId);

    const secondDelete = await FuelPriceVersionRepository.delete(createdId);
    expect(secondDelete).toBeNull();
  });
});
