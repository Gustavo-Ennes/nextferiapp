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
import type { FuelingBatchFueling, FuelingBatchTotals } from "@/models/types";
import { startOfYesterday } from "date-fns";
import { sum, pluck } from "ramda";

describe("FuelingBatch.update", () => {
  let department: DepartmentDTO;
  let purchaseOrder: PurchaseOrderDTO;
  let fuel: FuelDTO;
  let fuelPriceVersion: FuelPriceVersionDTO;
  let supplier: SupplierDTO;
  let fuelingBatch: FuelingBatchDTO;
  const baseTotals = getBaseTotals();

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

  it("shoudn't update a fueling batch if some items.fuel doesn't exist", async () => {
    const payload = {
      ...getFuelingBatchBasePayload({
        missingItemFuel: true,
        department,
        fuel,
        purchaseOrder,
        baseTotals,
      }),
      _id: fuelingBatch._id,
      createdAt: new Date().toISOString(),
    };

    await expect(FuelingBatchRepository.update(payload)).rejects.toThrow(
      "One or more fuels in the payload do not exist.",
    );
  });

  it("shoudn't update a fueling batch if some items.department doesn't exist", async () => {
    const payloadMissingItemDepartments = {
      ...getFuelingBatchBasePayload({
        missingDepartment: true,
        department,
        fuel,
        purchaseOrder,
        baseTotals,
      }),
      _id: fuelingBatch._id,
      createdAt: new Date().toISOString(),
    };

    await expect(
      FuelingBatchRepository.update(payloadMissingItemDepartments),
    ).rejects.toThrow("One or more departments in the payload do not exist.");
  });

  it("shouldn't update a fueling batch with no departments", async () => {
    const payloadWithoutDepartments = {
      ...getFuelingBatchBasePayload({
        noDepartments: true,
        department,
        fuel,
        purchaseOrder,
        baseTotals,
      }),
      _id: fuelingBatch._id,
      createdAt: new Date().toISOString(),
    };
    await expect(
      FuelingBatchRepository.update(payloadWithoutDepartments),
    ).rejects.toThrow("Payload must contain at least one department.");
  });

  it("shouldn't update a fueling batch with no invoices", async () => {
    const payloadWithoutInvoices = {
      ...getFuelingBatchBasePayload({
        noInvoices: true,
        department,
        fuel,
        purchaseOrder,
        baseTotals,
      }),
      _id: fuelingBatch._id,
      createdAt: new Date().toISOString(),
    };
    await expect(
      FuelingBatchRepository.update(payloadWithoutInvoices),
    ).rejects.toThrow("Every department must contain at least one invoice");
  });

  it("should update a fuelingBatch without vehicles and fuelings", async () => {
    const payload = {
      ...getFuelingBatchBasePayload({
        department,
        fuel,
        purchaseOrder,
        baseTotals,
      }),
      _id: fuelingBatch._id,
      createdAt: new Date().toISOString(),
    };

    const created = await FuelingBatchRepository.update(payload);

    expect(created).toHaveProperty("totals");
    expect(created).toHaveProperty("createdAt");
    expect(created).toHaveProperty("departments");
    expect(created?.departments).toHaveLength(1);
    expect(created?.departments[0]).toHaveProperty("totals");
    expect(created?.departments[0]).toHaveProperty("invoices");
    expect(created?.departments[0]?.invoices).toHaveLength(1);
    expect(created?.departments[0]?.vehicles).toHaveLength(1);
    expect(created?.departments[0]).toHaveProperty("name", department!.name);
    expect(created?.departments[0]?.totals).toMatchObject(baseTotals);
    expect(created?.totals).toMatchObject(baseTotals);
  });

  it("should create a fuelingBatch with fuelings", async () => {
    const fuelings: FuelingBatchFueling[] = [
      {
        date: new Date().toISOString(),
        kmHr: 333,
        quantity: 11,
      },
      {
        date: startOfYesterday().toISOString(),
        kmHr: 222,
        quantity: 11,
      },
    ];
    const payload = {
      ...getFuelingBatchBasePayload({
        fuelings,
        department,
        fuel,
        purchaseOrder,
        baseTotals,
      }),
      _id: fuelingBatch._id,
      createdAt: new Date().toISOString(),
    };
    const calculatedTotals: FuelingBatchTotals = {
      totalFuelings: 2,
      totalFuels: {
        Gasolina: { liters: 22, value: 22 * fuelPriceVersion.price },
      },
      totalKmHrs: fuelings[0].kmHr! - fuelings[1].kmHr!,
      totalValue: sum(pluck("quantity", fuelings)) * fuelPriceVersion.price,
      totalVehicles: 1,
    };

    const created = await FuelingBatchRepository.update(payload);

    expect(created).toHaveProperty("totals");
    expect(created).toHaveProperty("createdAt");
    expect(created).toHaveProperty("departments");
    expect(created?.departments).toHaveLength(1);
    expect(created?.departments[0]).toHaveProperty("totals");
    expect(created?.departments[0]).toHaveProperty("invoices");
    expect(created?.departments[0]?.invoices).toHaveLength(1);
    expect(created?.departments[0]?.vehicles).toHaveLength(1);
    expect(created?.departments[0]?.vehicles[0]?.fuelings).toHaveLength(2);
    expect(created?.departments[0]).toHaveProperty("name", department!.name);
    expect(created?.departments[0]?.totals).toMatchObject(calculatedTotals);
    expect(created?.totals).toMatchObject(calculatedTotals);
  });
});
