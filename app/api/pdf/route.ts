import dbConnect from "@/lib/database/database";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import type { PdfOptions, PdfRouteBody } from "../types";
import {
  materialRequisitionRender,
  vacationRender,
  relationRender,
  vehicleUsageRender,
  cancellationRender,
} from "@/lib/pdf";
import Vacation from "@/models/Vacation";
import { buildOptions, headers, optionsResponse } from "../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  await dbConnect();
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
    return NextResponse.json({ error });
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
      const options = buildOptions({ period, type: relationType });
      const instances = await Vacation.find(options).populate("worker boss");
      return relationRender({ document, instances, period, type });
    case "vacation":
      instance = await Vacation.findOne({
        _id: id,
        $or: [{ cancelled: false }, { cancelled: undefined }],
      }).populate("worker boss");
      return vacationRender({ document, instance });
    case "cancellation":
      instance = await Vacation.findOne({
        _id: id,
      }).populate("worker boss");
      return cancellationRender({ document, instance });
    case "vehicleUsage":
      return vehicleUsageRender({ document });
    default:
      throw new Error("Invalid render type.");
  }
};
