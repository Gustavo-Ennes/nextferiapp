import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import type { PdfOptions, PdfRouteBody } from "../types";
import {
  materialRequisitionRender,
  vacationRender,
  relationRender,
  vehicleUsageRender,
  cancellationRender,
  purchaseOrderRender,
} from "@/lib/pdf";
import { headers, optionsResponse } from "../utils";
import { VacationRepository } from "@/lib/repository/vacation/vacation";
import type { VacationType } from "@/lib/repository/vacation/types";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { FuelRepository } from "@/lib/repository/fuel/fuel";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const { items }: PdfRouteBody = await req.json();

  try {
    const document = await PDFDocument.create();

    for (let i = 0; i < items.length; i++) {
      checkPdfBodyProps(items[i]);
      await render({ body: items[i], document });
    }

    const pdfBytes = await document.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="generated.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

const checkPdfBodyProps = (body: PdfOptions) => {
  const { id, type, relationType, period } = body;
  switch (type) {
    case "vacation":
      if (!id) throw new Error("Id is needed to print a vacation");
      break;
    case "relation":
      if (!relationType)
        throw new Error("relationType is needed to print a relation");
      if (!period) throw new Error("period is needed to print a relation");
      break;
    case "materialRequisition":
      break;
    case "vehicleUsage":
      break;
    case "cancellation":
      if (!id) throw new Error("Id is needed to print a vacation cancellation");
      break;
    case "purchaseOrder":
      break;
    default:
      throw new Error("Property type is invalid.");
  }
};

const render = async ({
  body,
  document,
}: {
  body: PdfOptions;
  document: PDFDocument;
}) => {
  const { id, type, relationType, period, data } = body;
  let instance;
  switch (type) {
    case "materialRequisition":
      return materialRequisitionRender({
        document,
        data,
      });

    case "relation":
      const instances = await VacationRepository.findWithoutPagination!({
        timePeriod: period,
        type: relationType as VacationType,
      });
      return relationRender({ document, instances, period, type });

    case "vacation":
      instance = await VacationRepository.findOne({
        id: id as string,
        cancelled: false,
      });
      return vacationRender({ document, instance });

    case "cancellation":
      instance = await VacationRepository.findOne({
        id: id as string,
      });
      return cancellationRender({ document, instance });

    case "vehicleUsage":
      return vehicleUsageRender({ document });

    case "purchaseOrder":
      const { data: orders } = await PurchaseOrderRepository.find({});
      const { data: fuels } = await FuelRepository.find({});

      return purchaseOrderRender({
        document,
        instances: orders,
        fuels,
      });

    default:
      throw new Error("Invalid render type.");
  }
};
