import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { CombinedFuelFormData } from "@/app/(secure)/fuel/types";
import { dissoc } from "ramda";

describe("FuelRepository.create", () => {
  const basePayload: CombinedFuelFormData = {
    name: "Gasolina C.",
    price: 7,
    unit: "L",
    version: 1,
  };

  it("should not create a fuel without price prop", async () => {
    const payloadWithoutPrice = dissoc("price", basePayload);

    await expect(
      FuelRepository.create(payloadWithoutPrice as any),
    ).rejects.toThrow("A versão de preço deve ter um preço.");
  });

  it("should not create a fuel with a negative price", async () => {
    const payloadWithNegativePrice = { ...basePayload, price: -1 };

    await expect(
      FuelRepository.create(payloadWithNegativePrice as any),
    ).rejects.toThrow("O preço deve ser maior que zero.");
  });

  it("should not create a fuel without version prop", async () => {
    const payloadWithoutVersion = dissoc("version", basePayload);

    await expect(
      FuelRepository.create(payloadWithoutVersion as any),
    ).rejects.toThrow("A versão de preço deve ter um número.");
  });

  it("should not create a fuel with a less than 1 version", async () => {
    const payloadWithLessThan1Version = { ...basePayload, version: 0 };

    await expect(
      FuelRepository.create(payloadWithLessThan1Version as any),
    ).rejects.toThrow(
      "O número da versão de preço deve ser maior ou igual a 1.",
    );
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
