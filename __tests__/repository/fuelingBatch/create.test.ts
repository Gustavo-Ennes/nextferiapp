import { startOfYesterday } from "date-fns";
import { pluck, sum } from "ramda";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { createBaseEntities } from "../vacation/utils";
import type {
  DepartmentDTO,
  FuelDTO,
  FuelPriceVersionDTO,
  PurchaseOrderDTO,
  SupplierDTO,
} from "@/dto";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";
import type { FuelingBatchFueling, FuelingBatchTotals } from "@/models/types";
import { getBaseTotals, getFuelingBatchBasePayload } from "./utils";

let department: DepartmentDTO;
let purchaseOrder: PurchaseOrderDTO;
let fuel: FuelDTO;
let fuelPriceVersion: FuelPriceVersionDTO;
let supplier: SupplierDTO;

describe("FuelingBatchRepository.create", () => {
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
    // criar dois combustíveis com preços diferentes
    await FuelRepository.create({
      name: "Diesel",
      price: 6.83,
      supplier: supplier._id,
      unit: "L",
    });
  });

  it("shoudn't create a fueling batch if some items.fuel doesn't exist", async () => {
    const payloadMissingItemFuel = getFuelingBatchBasePayload({
      missingItemFuel: true,
      department,
      fuel,
      purchaseOrder,
      baseTotals,
    });
    await expect(
      FuelingBatchRepository.create(payloadMissingItemFuel),
    ).rejects.toThrow("One or more fuels in the payload do not exist.");
  });

  it("shoudn't create a fueling batch if some items.department doesn't exist", async () => {
    const payloadMissingItemDepartments = getFuelingBatchBasePayload({
      missingDepartment: true,
      department,
      fuel,
      purchaseOrder,
      baseTotals,
    });
    await expect(
      FuelingBatchRepository.create(payloadMissingItemDepartments),
    ).rejects.toThrow("One or more departments in the payload do not exist.");
  });

  it("shouldn't create a fueling batch with no departments", async () => {
    const payloadWithoutDepartments = getFuelingBatchBasePayload({
      noDepartments: true,
      department,
      fuel,
      purchaseOrder,
      baseTotals,
    });
    await expect(
      FuelingBatchRepository.create(payloadWithoutDepartments),
    ).rejects.toThrow("Payload must contain at least one department.");
  });

  it("shouldn't create a fueling batch with no invoices", async () => {
    const payloadWithoutInvoices = getFuelingBatchBasePayload({
      noInvoices: true,
      department,
      fuel,
      purchaseOrder,
      baseTotals,
    });
    await expect(
      FuelingBatchRepository.create(payloadWithoutInvoices),
    ).rejects.toThrow("Every department must contain at least one invoice");
  });

  it("should create a fuelingBatch without vehicles and fuelings", async () => {
    const payload = getFuelingBatchBasePayload({
      department,
      fuel,
      purchaseOrder,
      baseTotals,
    });

    const created = await FuelingBatchRepository.create(payload);

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
    const payload = getFuelingBatchBasePayload({
      fuelings,
      department,
      fuel,
      purchaseOrder,
      baseTotals,
    });
    const calculatedTotals: FuelingBatchTotals = {
      totalFuelings: 2,
      totalFuels: {
        Gasolina: { liters: 22, value: 22 * fuelPriceVersion.price },
      },
      totalKmHrs: fuelings[0].kmHr! - fuelings[1].kmHr!,
      totalValue: sum(pluck("quantity", fuelings)) * fuelPriceVersion.price,
      totalVehicles: 1,
    };

    const created = await FuelingBatchRepository.create(payload);

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
