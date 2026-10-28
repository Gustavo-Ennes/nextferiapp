import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import type { SupplierFormData } from "@/app/(secure)/supplier/types";

describe("SupplierRepository.create", () => {
  const basePayload: SupplierFormData = {
    name: "Posto",
  };

  it("should not create a supplier without name", async () => {
    const payloadWithoutName = {};
    await expect(
      SupplierRepository.create(payloadWithoutName as any),
    ).rejects.toThrow("Um nome precisa ser fornecido");
  });

  it("should not create a supplier with less then 5 letters name", async () => {
    const payloadWithSmallName = { name: "cu" };
    await expect(
      SupplierRepository.create(payloadWithSmallName),
    ).rejects.toThrow("O nome precisa ter mais de 5 caracteres");
  });

  it("should not create a supplier with more then 60 letters name", async () => {
    const payloadWithBigName = {
      name: "cuasdoiaoiashdoahsohaohaoiasoidhaosdhoashdoaishdaoishdoiashdoashdoashdoashdoiashdoiashdoashdoashdoashdoahsdohasdohasodhasodhasohaosdhoashdoashoashdohasdohasod",
    };
    await expect(
      SupplierRepository.create(payloadWithBigName),
    ).rejects.toThrow("O nome precisa ter menos de 60 caracteres");
  });

  it("should create a supplier", async () => {
    const supplier = await SupplierRepository.create(basePayload);

    expect(supplier).toHaveProperty("name", basePayload.name);
    expect(supplier).toHaveProperty("createdAt");
  });
});
