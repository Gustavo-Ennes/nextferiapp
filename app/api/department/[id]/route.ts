import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Department } from "@/app/types";
import { optionsResponse, responseWithHeaders } from "../../utils";
import { DepartmentRepository } from "@/lib/repository/department";
import { parseBool } from "@/app/(secure)/components/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();
  const { searchParams } = new URL(url);
  const isActive = parseBool(searchParams.get("isActive"));

  try {
    if (!id) throw new Error("No id provided.");

    const department = await DepartmentRepository.findOne({ id, isActive });

    if (!department) throw new Error("Department not found.");

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    console.error("DEPARTMENT GET[id] ~ error:", error);
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const payload = await req.json();
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided.");

    const department = await DepartmentRepository.update({ id, payload });

    if (!department) throw new Error("Department not found.");

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    console.error("DEPARTMENT PUT ~ error:", error);
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided.");

    const department = await DepartmentRepository.delete(id);

    if (!department) throw new Error("Department not found.");

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    console.error("DEPARTMENT DELETE ~ error:", error);
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}
