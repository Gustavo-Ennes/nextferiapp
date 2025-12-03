import { Types } from "mongoose";
import type { RawBoss } from "./types";

export const getBossMock = (): RawBoss => ({
  _id: new Types.ObjectId(),
  role: "Diretor de TI",
  isDirector: false,
  isActive: true,
  isExternal: false,
  worker: new Types.ObjectId(),
});
