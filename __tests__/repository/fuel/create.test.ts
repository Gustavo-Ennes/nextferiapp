import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { CombinedFuelFormData } from "@/app/(secure)/fuel/types";
import { assoc, dissoc } from "ramda";
import type { SupplierDTO } from "@/dto";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import { Types } from "mongoose";

describe("FuelRepository.create", () => {
  const basePayload: CombinedFuelFormData = {
    name: "Gasolina C.",
    price: 7,
    unit: "L",
    supplier: "",
  };
  let supplier: SupplierDTO;

  beforeEach(async () => {
    supplier = await SupplierRepository.create({
      name: "Posto",
    });

    basePayload.supplier = supplier._id;
  });

  it("should not create a fuel without price prop", async () => {
    const payloadWithoutPrice = dissoc("price", basePayload);

    await expect(
      FuelRepository.create(payloadWithoutPrice as any),
    ).rejects.toThrow("A versão de preço deve ter um preço.");
  });

  it("should not create a fuel without supplier prop", async () => {
    const payloadWithoutSupplier = dissoc("supplier", basePayload);

    await expect(
      FuelRepository.create(payloadWithoutSupplier as any),
    ).rejects.toThrow("Uma string é esperada para supplier.");
  });

  it("should not create a fuel with a negative price", async () => {
    const payloadWithNegativePrice = { ...basePayload, price: -1 };

    await expect(
      FuelRepository.create(payloadWithNegativePrice as any),
    ).rejects.toThrow("O preço deve ser maior que zero.");
  });

  it("should not create a fuel if supplier doesn't exists", async () => {
    const payloadWithoutSupplier = assoc(
      "supplier",
      new Types.ObjectId().toString(),
      basePayload,
    );

    await expect(
      FuelRepository.create(payloadWithoutSupplier as any),
    ).rejects.toThrow("Supplier not found with provided id.");
  });

  it("should not create a fuel without a name prop", async () => {
    const payloadWithoutAName = dissoc("name", basePayload);

    await expect(
      FuelRepository.create(payloadWithoutAName as any),
    ).rejects.toThrow("O combustível precisa de um nome.");
  });

  it("should not create a fuel with a less than 3 characters name", async () => {
    const payloadWithoutAName = { ...basePayload, name: "Ur" };

    await expect(
      FuelRepository.create(payloadWithoutAName as any),
    ).rejects.toThrow("Mínino de 3 caracteres para nome do combustível.");
  });

  it("should not create a fuel without a unit prop", async () => {
    const payloadWithoutUnit = dissoc("unit", basePayload);

    await expect(
      FuelRepository.create(payloadWithoutUnit as any),
    ).rejects.toThrow("Uma unidade de medida é esperada.");
  });

  it("should create a fuel", async () => {
    const fuel = await FuelRepository.create(basePayload);

    expect(fuel).toHaveProperty("_id");
    expect(fuel).toHaveProperty("name", basePayload.name);
    expect(fuel).toHaveProperty("unit", basePayload.unit);
    expect(fuel).toHaveProperty("priceVersions");
    expect(fuel.priceVersions).toHaveLength(1);
    expect(fuel).toHaveProperty("currentPriceVersion");
    expect(fuel.currentPriceVersion).toHaveProperty("_id");
    expect(fuel.currentPriceVersion).toHaveProperty("fuel", fuel._id);
    expect(fuel.currentPriceVersion).toHaveProperty("version", 1);
  });
});
