import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { PurchaseOrderFormData } from "@/app/(secure)/purchaseOrder/types";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { createBaseEntities } from "../vacation/utils";

describe("PurchaseOrderRepository.delete", () => {
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
      version: 1
    });
    fuelPriceVersion = fuel.currentPriceVersion! as FuelPriceVersionDTO;
  });

  it("should return null when order is not found", async () => {
    const result = await PurchaseOrderRepository.delete(
      "000000000000000000000000",
    );
    expect(result).toBeNull();
  });

  it("should delete the order and return the deleted document", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    const deleted = await PurchaseOrderRepository.delete(String(created._id));

    expect(deleted).not.toBeNull();
    expect(String(deleted!._id)).toBe(String(created._id));
  });

  it("should not find the order after deletion", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);
    const createdId = String(created._id);

    await PurchaseOrderRepository.delete(createdId);

    const result = await PurchaseOrderRepository.findOne({ id: createdId });
    expect(result).toBeNull();
  });

  it("should not delete the same order twice", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);
    const createdId = String(created._id);

    await PurchaseOrderRepository.delete(createdId);

    const secondDelete = await PurchaseOrderRepository.delete(createdId);
    expect(secondDelete).toBeNull();
  });

  it("should not find the order by reference after deletion", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    await PurchaseOrderRepository.delete(String(created._id));

    const result = await PurchaseOrderRepository.findByReference!(
      created.reference,
    );
    expect(result).toBeNull();
  });
});
