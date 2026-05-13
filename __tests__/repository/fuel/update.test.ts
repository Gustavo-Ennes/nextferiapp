import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type {
  FuelFormData,
} from "@/app/(secure)/fuel/types";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { FuelDTO } from "@/dto/FuelDTO";

describe("FuelRepository.update", () => {
  const basePayload: Partial<FuelFormData> = {
    name: "Arla",
    unit: "BD2",
  };
  let fuel: FuelDTO;

  beforeEach(async () => {
    fuel = await FuelRepository.create({
      name: "Gasolina C.",
      price: 7,
      unit: "L",
      version: 1,
    });
  });

  it("should not update if fuel prop ins't a valid ObjectId", async () => {
    await expect(
      FuelRepository.update({
        id: "123",
        payload: { name: basePayload.name },
      }),
    ).rejects.toThrow("Id prop needs to be a valid ObjectId.");
  });

  it("should not update fuel if prop name isn't a string", async () => {
    await expect(
      FuelRepository.update({
        id: fuel._id,
        payload: { name: 123 as any },
      }),
    ).rejects.toThrow("O nome só pode conter letras.");
  });

  it("should not update fuel if prop name contains less than 3 lettes", async () => {
    await expect(
      FuelRepository.update({
        id: fuel._id,
        payload: { name: "Ur" },
      }),
    ).rejects.toThrow("Mínino de 3 caracteres para nome do combustível");
  });

  it("should not update fuel if prop unit isn't a string", async () => {
    await expect( 
      FuelRepository.update({
        id: fuel._id,
        payload: { unit: 123 as any },
      }),
    ).rejects.toThrow("Uma unidade de medida é esperada.");
  });

  it("should update a fuel", async () => {
    const updatedFuel = await FuelRepository.update({
      id: fuel._id,
      payload: basePayload,
    });

    expect(updatedFuel).toHaveProperty("_id", fuel._id);
    expect(updatedFuel).toHaveProperty("name", basePayload.name);
    expect(updatedFuel).toHaveProperty("unit", basePayload.unit);
    expect(updatedFuel?.currentPriceVersion).toMatchObject(
      fuel.currentPriceVersion as FuelPriceVersionDTO,
    );
    expect(updatedFuel?.priceVersions?.[0]).toMatchObject(
      fuel.currentPriceVersion as FuelPriceVersionDTO,
    );
  });
});
