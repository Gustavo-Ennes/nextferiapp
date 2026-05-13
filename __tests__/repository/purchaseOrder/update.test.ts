import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { PurchaseOrderFormData } from "@/app/(secure)/purchaseOrder/types";
import { dissoc, pluck, sum } from "ramda";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { createBaseEntities } from "../vacation/utils";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { format } from "date-fns";
import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";

describe("PurchaseOrderRepository.update", () => {
  let department: DepartmentDTO | null = null;
  let fuel: FuelDTO | null = null;
  let fuelPriceVersion: FuelPriceVersionDTO | null = null;
  let purchaseOrder: PurchaseOrderDTO | null = null;
  let orderCounter = 1;
  const formatedYear = format(new Date(), "yy");

  const getPurchaseOrderPayload = (): PurchaseOrderFormData => ({
    reference: `${orderCounter++}/${formatedYear}`,
    department: department!._id,
    items: [
      {
        fuel: fuel!._id,
        fuelPriceVersion: fuelPriceVersion!._id,
        quantity: Math.round(10 + Math.random() * 250),
        price: parseInt((5 + Math.random() * 5).toFixed(2)),
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
    purchaseOrder = await PurchaseOrderRepository.create(
      getPurchaseOrderPayload(),
    );
  });

  it("should not update with an invalid ObjectId", async () => {
    await expect(
      PurchaseOrderRepository.update({
        id: "invalid-id",
        payload: getPurchaseOrderPayload(),
      }),
    ).rejects.toThrow("Id prop needs to be a valid ObjectId.");
  });

  it("should not update when order is not found", async () => {
    await expect(
      PurchaseOrderRepository.update({
        id: "000000000000000000000000",
        payload: getPurchaseOrderPayload(),
      }),
    ).rejects.toThrow("No purchase order found with provided id.");
  });

  it("should not update with an empty items array", async () => {
    await expect(
      PurchaseOrderRepository.update({
        id: purchaseOrder!._id,
        payload: { ...getPurchaseOrderPayload(), items: [] } as any,
      }),
    ).rejects.toThrow();
  });

  it("should not update with item missing quantity", async () => {
    const rawPayload = getPurchaseOrderPayload();
    const payload = {
      ...rawPayload,
      items: [dissoc("quantity", rawPayload.items[0])],
    };

    await expect(
      PurchaseOrderRepository.update({
        id: purchaseOrder!._id,
        payload: payload as any,
      }),
    ).rejects.toThrow();
  });

  it("should not update with a negative quantity item", async () => {
    const rawPayload = getPurchaseOrderPayload();
    const payload = {
      ...rawPayload,
      items: [{ ...rawPayload.items[0], quantity: -1 }],
    };

    await expect(
      PurchaseOrderRepository.update({
        id: purchaseOrder!._id,
        payload: payload as any,
      }),
    ).rejects.toThrow();
  });

  it("should update the order and return the updated document", async () => {
    const rawPayload = getPurchaseOrderPayload();
    const newQuantity = 200;
    const payload = {
      ...rawPayload,
      items: [{ ...rawPayload.items[0], quantity: newQuantity }],
    };

    const updated = await PurchaseOrderRepository.update({
      id: purchaseOrder!._id,
      payload: payload as any,
    });

    expect(updated).toHaveProperty("_id");
    expect(updated!.items[0].quantity).toBe(newQuantity);
  });

  it("should return the updated document, not the old one", async () => {
    const rawPayload = getPurchaseOrderPayload();
    const originalQuantity = rawPayload.items[0].quantity as number;
    const newQuantity = originalQuantity * 2;

    const updated = await PurchaseOrderRepository.update({
      id: purchaseOrder!._id,
      payload: {
        ...rawPayload,
        items: [{ ...rawPayload.items[0], quantity: newQuantity }],
      } as any,
    });

    expect(updated!.items[0].quantity).not.toBe(originalQuantity);
    expect(updated!.items[0].quantity).toBe(newQuantity);
  });

  it("should recalculate prices on update", async () => {
    const rawPayload = getPurchaseOrderPayload();
    const newQuantity = 500;
    const updated = await PurchaseOrderRepository.update({
      id: purchaseOrder!._id,
      payload: {
        ...rawPayload,
        items: [{ ...rawPayload.items[0], quantity: newQuantity }],
      } as any,
    });

    const priceVersion = await FuelPriceVersionRepository.findOne({id: rawPayload.items[0].fuelPriceVersion})

    expect(updated!.total).toEqual(sum(pluck("price", updated!.items)));
    expect(updated!.items[0].price).toEqual(newQuantity * priceVersion!.price);
  });

  it("should populate department after update", async () => {
    const updated = await PurchaseOrderRepository.update({
      id: purchaseOrder!._id,
      payload: getPurchaseOrderPayload(),
    });

    expect(updated!.department).toHaveProperty("_id");
    expect(updated!.department).toHaveProperty("name");
  });

  it("should populate items.fuel after update", async () => {
    const updated = await PurchaseOrderRepository.update({
      id: purchaseOrder!._id,
      payload: getPurchaseOrderPayload(),
    });

    expect(updated!.items[0].fuel).toHaveProperty("_id");
  });

  it("should populate items.fuelPriceVersion after update", async () => {
    const updated = await PurchaseOrderRepository.update({
      id: purchaseOrder!._id,
      payload: getPurchaseOrderPayload(),
    });

    expect(updated!.items[0].fuelPriceVersion).toHaveProperty("_id");
  });
});
