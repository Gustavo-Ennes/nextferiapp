import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { PurchaseOrderFormData } from "@/app/(secure)/purchaseOrder/types";
import { dissoc, pluck, sum } from "ramda";
import type { DepartmentDTO, SupplierDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { createBaseEntities } from "../vacation/utils";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import { Types } from "mongoose";

describe("PurchaseOrderRepository.create", () => {
  let department: DepartmentDTO | null = null;
  let fuel: FuelDTO | null = null;
  let fuelPriceVersion: FuelPriceVersionDTO | null = null;
  let supplier: SupplierDTO | null = null;

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
    supplier: supplier!._id,
  });

  beforeEach(async () => {
    const { baseDepartment } = await createBaseEntities();
    supplier = await SupplierRepository.create({
      name: "Posto",
    });
    department = baseDepartment;
    fuel = await FuelRepository.create({
      name: "Gasolina",
      price: 7.54,
      unit: "L",
      supplier: supplier._id,
    });
    fuelPriceVersion = fuel.currentPriceVersion! as FuelPriceVersionDTO;
  });

  it("should not create an order without reference prop", async () => {
    const payload = dissoc("reference", getPurchaseOrderPayload());

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order without supplier prop", async () => {
    const payload = dissoc("supplier", getPurchaseOrderPayload());

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order without department prop", async () => {
    const payload = dissoc("department", getPurchaseOrderPayload());

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order without items prop", async () => {
    const payload = dissoc("items", getPurchaseOrderPayload());

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order with an empty items array", async () => {
    const payload = { ...getPurchaseOrderPayload(), items: [] };

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order with missing supplier", async () => {
    const base = {
      ...getPurchaseOrderPayload(),
      supplier: new Types.ObjectId().toString(),
    };
    const payload = {
      ...base,
      items: [dissoc("fuel", base.items[0])],
    };

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });
  it("should not create an order with item missing fuel", async () => {
    const base = getPurchaseOrderPayload();
    const payload = {
      ...base,
      items: [dissoc("fuel", base.items[0])],
    };

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order with item missing fuelPriceVersion", async () => {
    const base = getPurchaseOrderPayload();
    const payload = {
      ...base,
      items: [dissoc("fuelPriceVersion", base.items[0])],
    };

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order with item missing quantity", async () => {
    const base = getPurchaseOrderPayload();
    const payload = {
      ...base,
      items: [dissoc("quantity", base.items[0])],
    };

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order with a zero quantity item", async () => {
    const base = getPurchaseOrderPayload();
    const payload = {
      ...base,
      items: [{ ...base.items[0], quantity: 0 }],
    };

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should not create an order with a negative quantity item", async () => {
    const base = getPurchaseOrderPayload();
    const payload = {
      ...base,
      items: [{ ...base.items[0], quantity: -5 }],
    };

    await expect(
      PurchaseOrderRepository.create(payload as any),
    ).rejects.toThrow();
  });

  it("should create an order and return the correct shape", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    expect(created).toHaveProperty("_id");
    expect(created).toHaveProperty("reference", payload.reference);
    expect(created).toHaveProperty("supplier");
    expect((created.supplier as SupplierDTO)._id).toBe(supplier!._id);
    expect(created).toHaveProperty("department");
    expect(created).toHaveProperty("items");
    expect(created.items).toHaveLength(1);
  });

  it("should populate department after creation", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    expect(created.department).toHaveProperty("_id");
    expect(created.department).toHaveProperty("name");
  });

  it("should populate items.fuel after creation", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    expect(created.items[0].fuel).toHaveProperty("_id");
    expect(created.items[0].fuel).toHaveProperty("name");
  });

  it("should populate items.fuelPriceVersion after creation", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    expect(created.items[0].fuelPriceVersion).toHaveProperty("_id");
  });

  it("should populate supplier after creation", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    expect(created.supplier).toHaveProperty("_id");
    expect(created.supplier).toHaveProperty("name");
  });

  it("should calculate and store prices via calculatePurchaseOrderPrices", async () => {
    const payload = getPurchaseOrderPayload();
    const created = await PurchaseOrderRepository.create(payload);

    // Prices should be computed — not zero/undefined
    expect(created.items[0]).toHaveProperty("price");
    expect(created.items[0].price).toBeGreaterThan(0);
    expect(created).toHaveProperty("total");
    expect(created.total).toBeGreaterThan(0);
  });

  it("should create an order with multiple items", async () => {
    const anotherFuel = await FuelRepository.create({
      name: "Diesel",
      price: 7.52,
      unit: "L",
      supplier: supplier!._id,
    });

    const oneItemPayload = getPurchaseOrderPayload();
    const payload: PurchaseOrderFormData = {
      ...oneItemPayload,
      items: [
        ...oneItemPayload.items,
        {
          fuel: anotherFuel._id,
          fuelPriceVersion:
            (anotherFuel.currentPriceVersion as FuelPriceVersionDTO)!._id,
          quantity: 75,
          price:
            75 *
            (anotherFuel.currentPriceVersion as FuelPriceVersionDTO).price!,
        },
      ],
    };

    const created = await PurchaseOrderRepository.create(payload);

    expect(created.items).toHaveLength(2);
    expect(created.total).toEqual(sum(pluck("price", created.items)));
  });
});
