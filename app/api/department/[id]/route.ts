import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import DepartmentModel from "@/models/Department";
import type { Department } from "@/app/types";
import { optionsResponse, responseWithHeaders } from "../../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const department = await DepartmentModel.findOne({
      _id: id,
      isActive: true,
    }).populate({
      path: "responsible",
      populate: {
        path: "worker",
      },
    });

    if (!department)
      return responseWithHeaders<Department>({
        error: "Department not found.",
      });

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const body = await req.json();
  const id = url?.split("/").pop();

  try {
    const department = await DepartmentModel.findByIdAndUpdate(id, body);
    if (!department)
      return responseWithHeaders<Department>({
        error: "Department not found.",
      });

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const department = await DepartmentModel.findByIdAndUpdate(id, {
      isActive: false,
    });
    if (!department)
      return responseWithHeaders<Department>({
        error: "Department not found.",
      });

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}
