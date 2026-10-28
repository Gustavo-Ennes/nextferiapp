import { SupplierRepository } from "@/lib/repository/supplier/supplier";
import type { SupplierFormData } from "@/app/(secure)/supplier/types";
import type { SupplierDTO } from "@/dto";

describe("SupplierRepository.update", () => {
  const basePayload: SupplierFormData = {
    name: "Posto",
  };
  let supplier: SupplierDTO | null = null;

  beforeEach(async () => {
    supplier = await SupplierRepository.create(basePayload);
  });

  it("should not update a supplier without name", async () => {
    const payloadWithoutName = {id: supplier!._id, payload: {name: null}};
    await expect(
      SupplierRepository.update(payloadWithoutName as any),
    ).rejects.toThrow("Um nome precisa ser fornecido");
  });

  it("should not update a supplier with less then 5 letters name", async () => {
    const payloadWithSmallName = { id: supplier!._id, payload: { name: "cu" } };
    await expect(
      SupplierRepository.update(payloadWithSmallName as any),
    ).rejects.toThrow("O nome precisa ter mais de 5 caracteres");
  });

  it("should not update a supplier with more then 60 letters name", async () => {
    const payloadWithBigName = {
      id: supplier!._id,
      payload: {
        name: "cuasdoiaoiashdoahsohaohaoiasoidhaosdhoashdoaishdaoishdoiashdoashdoashdoashdoiashdoiashdoashdoashdoashdoahsdohasdohasodhasodhasohaosdhoashdoashoashdohasdohasod",
      },
    };
    await expect(
      SupplierRepository.update(payloadWithBigName as any),
    ).rejects.toThrow("O nome precisa ter menos de 60 caracteres");
  });

  it("should update a supplier", async () => {
    const updatePayload = { id: supplier!._id, payload: { name: "novonome" } };
    const created = await SupplierRepository.update(updatePayload);

    expect(created).toHaveProperty("name", updatePayload.payload.name);
    expect(created).toHaveProperty("createdAt");
  });
});
