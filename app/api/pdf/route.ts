import dbConnect from "@/lib/database/database";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { PdfRouteBody } from "../types";
import {
  materialRequisitionRender,
  vacationRender,
  relationRender,
  vehicleUsageRender,
} from "@/lib/pdf";
import Vacation from "@/models/Vacation";
import { buildOptions } from "../utils";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    checkPdfBodyProps(body);

    const document = await PDFDocument.create();

    await render({ body, document });

    const pdfBytes = await document.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="generated.pdf"',
      },
    });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return NextResponse.json({ error });
  }
}

const checkPdfBodyProps = (body: PdfRouteBody) => {
  const { _id, type, relationType, period } = body;
  switch (type) {
    case "vacation":
      if (!_id) throw new Error("Id is needed to print a vacation");
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
    default:
      throw new Error("Property type is invalid.");
  }
};

const render = async ({
  body,
  document,
}: {
  body: PdfRouteBody;
  document: PDFDocument;
}) => {
  const { _id, type, relationType, period, data } = body;
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
      const instance = await Vacation.findOne({
        _id,
        $or: [{ cancelled: false }, { cancelled: undefined }],
      }).populate("worker boss");
      return vacationRender({ document, instance });
    case "vehicleUsage":
      return vehicleUsageRender({ document });
    default:
      throw new Error("Invalid render type.");
  }
};
