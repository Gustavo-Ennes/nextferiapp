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
describe("FuelingBatch.find", () => {
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

  it("should return a paginated response", async () => {
    const result = await FuelingBatchRepository.find({ page: 1 });

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
    const result = await FuelingBatchRepository.find({ page: 1 });
    expect(result.hasPrevPage).toBe(false);
  });

  it("should return currentPage matching requested page", async () => {
    const result = await FuelingBatchRepository.find({ page: 2 });
    expect(result.currentPage).toBe(2);
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  it("should return null when batch is not found", async () => {
    const result = await FuelingBatchRepository.findById(
      "000000000000000000000000",
    );
    expect(result).toBeNull();
  });

  it("should return a fuelingBatch by id", async () => {
    const result = await FuelingBatchRepository.findById(fuelingBatch!._id);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("_id");
    expect(result!._id).toBe(fuelingBatch!._id);
  });
});
