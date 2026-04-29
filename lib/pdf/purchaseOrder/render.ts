import { StandardFonts } from "pdf-lib";
import {
  createHeader,
  createFooter,
  createTitle,
  createParagraph,
  getFont,
  drawLine,
  drawPurchaseOrderSectionHeader,
  drawPurchaseOrderFuelSubtitle,
  drawPurchaseOrderItem,
} from "../factory"; // caminho para sua factory existente
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { GroupedByDept, RenderParam } from "../types";
import {
  addPage,
  defineOrderItemNote,
  getDepartmentName,
  getFuelName,
  getHeightObject,
} from "../utils";
import { SAFE_TOP, MARGIN_X, PAGE_WIDTH } from "./constants";
import { format } from "date-fns";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { FuelDTO } from "@/dto/FuelDTO";

export async function render({
  document,
  instances,
  fuels,
}: RenderParam): Promise<void> {
  if (!document || !instances || instances.length === 0)
    throw new Error("No document or instances to render Purchase Order PDF.");

  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);

  // ── Agrupa pedidos por departamento ──────────────────────────────────────

  const grouped: GroupedByDept = {};

  for (const order of instances as PurchaseOrderDTO[]) {
    const deptName = getDepartmentName(order);
    if (!grouped[deptName]) grouped[deptName] = {};
    const deptMap = grouped[deptName];

    for (const item of order.items) {
      const fuelName = getFuelName(item);
      const fuel = fuels!.find((f) => f._id === (item.fuel as FuelDTO)._id);

      if (!fuel) {
        console.info(`Fuel ${fuelName} doesn't exists.`);
        continue;
      }

      const itemFuelPriceVersion = (
        item.fuelPriceVersion as FuelPriceVersionDTO
      ).version;
      const currentFuelPriceVersion = (
        fuel.currentPriceVersion as FuelPriceVersionDTO
      ).version;

      // don't include item with old price versions in PurchaseOrder pdf
      if (itemFuelPriceVersion !== currentFuelPriceVersion) {
        const warning = `
        Order item ${fuelName} v${itemFuelPriceVersion} isn't the current price version. 
        Price version for ${fuelName} is v${currentFuelPriceVersion}. 
        Skiping.`;
        console.info(warning);
        continue;
      }

      if (!deptMap[fuelName]) deptMap[fuelName] = [];
      deptMap[fuelName].push({
        items: [item],
        reference: order.reference,
      });
    }
  }

  // ── Primeira página ───────────────────────────────────────────────────────
  let page = await addPage(document);
  await createHeader(document);
  await createFooter(document);
  const height = getHeightObject(page);
  height.actual = SAFE_TOP;

  // ── Título principal ──────────────────────────────────────────────────────
  await createTitle({
    document,
    height,
    title: "Orientação para a Emissão de Notas",
    size: 16,
  });

  height.stepHugeLine();

  // Subtítulo: data de processamento
  const processFormatedDate = format(new Date(), "dd/MM/yyyy");
  const processedLabel = `Processado em ${processFormatedDate}`;

  await createTitle({
    document,
    height,
    size: 10,
    title: processedLabel,
  });
  height.stepHugeLine();

  // Aviso
  const warningText =
    "ATENÇÃO: Emitir as notas seguindo a lista numerada por pedido, do mais antigo para o mais recente.";
  const warnWidth = boldFont.widthOfTextAtSize(warningText, 9);
  const warnX = PAGE_WIDTH / 2 - warnWidth / 2;

  createParagraph({
    document,
    text: warningText,
    x: Math.max(MARGIN_X, warnX),
    y: height.actual,
    font: await getFont(document),
    fontSize: 10,
    height,
  });
  height.stepHugeLine();

  drawLine({
    y: height.actual,
    x1: MARGIN_X,
    x2: PAGE_WIDTH - MARGIN_X,
    document,
  });
  height.stepLine();

  // ── Renderiza cada departamento ───────────────────────────────────────────
  for (const deptName of Object.keys(grouped)) {
    await drawPurchaseOrderSectionHeader({ label: deptName, document, height });
    height.stepSmallLine();

    const fuelMap = grouped[deptName];
    for (const fuelName of Object.keys(fuelMap)) {
      await drawPurchaseOrderFuelSubtitle({ fuelName, document, height });
      height.stepLine();

      let seq = 1;
      for (const entry of fuelMap[fuelName]) {
        for (const item of entry.items) {
          await drawPurchaseOrderItem({
            sequence: seq++,
            reference: entry.reference,
            quantity: item.quantity,
            price: item.price,
            note: defineOrderItemNote({ deptName }),
            document,
            height,
          });
        }
        height.stepSmallLine();
      }
      height.stepSmallLine();
    }
  }
}
