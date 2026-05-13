import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { PurchaseOrderFormData } from "@/app/(secure)/purchaseOrder/types";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { createBaseEntities } from "../vacation/utils";

describe("PurchaseOrderRepository.find", () => {
  let department: DepartmentDTO | null = null;
  let fuel: FuelDTO | null = null;
  let fuelPriceVersion: FuelPriceVersionDTO | null = null;

  const getPurchaseOrderPayload = (): PurchaseOrderFormData => ({
    reference: `1/26`,
    department: department!._id,
    items: [
      {
        fuel: fuel!._id,
        fuelPriceVersion: fuelPriceVersion!._id,
        quantity: 100,
        price: 7.88,
      },
    ],
  });

  beforeEach(async () => {
    const { baseDepartment } = await createBaseEntities();

    department = baseDepartment;
    fuel = await FuelRepository.create({
      name: "Gasolina",
      price: 7.54,
      unit: "L",
      version: 1,
    });
    fuelPriceVersion = fuel.currentPriceVersion! as FuelPriceVersionDTO;
  });
  it("should return a paginated response", async () => {
    const result = await PurchaseOrderRepository.find({ page: 1 });

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("totalItems");
    expect(result).toHaveProperty("totalPages");
    expect(result).toHaveProperty("currentPage", 1);
    expect(result).toHaveProperty("hasNextPage");
    expect(result).toHaveProperty("hasPrevPage");
    expect(result).toHaveProperty("limit");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should return hasPrevPage as false on first page", async () => {
    const result = await PurchaseOrderRepository.find({ page: 1 });
    expect(result.hasPrevPage).toBe(false);
  });

  it("should return currentPage matching the requested page", async () => {
    const result = await PurchaseOrderRepository.find({ page: 2 });
    expect(result.currentPage).toBe(2);
  });

  it("should populate department field in returned orders", async () => {
    const payload = getPurchaseOrderPayload();
    await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.find({ page: 1 });
    const order = result.data[0];

    expect(order).toHaveProperty("department");
    expect(order.department).toHaveProperty("_id");
  });

  it("should populate items.fuel in returned orders", async () => {
    const payload = getPurchaseOrderPayload();
    await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.find({ page: 1 });
    const order = result.data[0];

    expect(order.items[0]).toHaveProperty("fuel");
    expect(order.items[0].fuel).toHaveProperty("_id");
  });

  it("should populate items.fuelPriceVersion in returned orders", async () => {
    const payload = getPurchaseOrderPayload();
    await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.find({ page: 1 });
    const order = result.data[0];

    expect(order.items[0]).toHaveProperty("fuelPriceVersion");
    expect(order.items[0].fuelPriceVersion).toHaveProperty("_id");
  });

  // ─── findOne ──────────────────────────────────────────────────────────────────

  it("should return null when order is not found", async () => {
    const result = await PurchaseOrderRepository.findOne({
      id: "000000000000000000000000",
    });
    expect(result).toBeNull();
  });

  it("should return the order by id", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.findOne({
      id: String(created._id),
    });

    expect(result).not.toBeNull();
    expect(String(result!._id)).toBe(String(created._id));
  });

  it("should return the order with department populated", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.findOne({
      id: String(created._id),
    });

    expect(result!.department).toHaveProperty("_id");
  });

  it("should return the order with items.fuel populated", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.findOne({
      id: String(created._id),
    });

    expect(result!.items[0].fuel).toHaveProperty("_id");
  });

  it("should return the order with items.fuelPriceVersion populated", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.findOne({
      id: String(created._id),
    });

    expect(result!.items[0].fuelPriceVersion).toHaveProperty("_id");
  });

  // ─── findByReference ─────────────────────────────────────────────────────────

  it("should return null when reference is not found", async () => {
    const result =
      await PurchaseOrderRepository.findByReference!("NON-EXISTENT-REF");
    expect(result).toBeNull();
  });

  it("should return the order by reference", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.findByReference!(
      created.reference,
    );

    expect(result).not.toBeNull();
    expect(result!.reference).toBe(created.reference);
  });

  it("should return populated fields when found by reference", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    const result = await PurchaseOrderRepository.findByReference!(
      created.reference,
    );

    expect(result!.department).toHaveProperty("_id");
    expect(result!.items[0].fuel).toHaveProperty("_id");
    expect(result!.items[0].fuelPriceVersion).toHaveProperty("_id");
  });
});
