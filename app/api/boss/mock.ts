import type { Boss } from "@/app/types";
import { workers } from "../worker/mock";

const now = new Date().toISOString();

export const bosses: Boss[] = [
  {
    _id: "1",
    role: "Diretor de TI",
    isDirector: false,
    createdAt: now,
    updatedAt: now,
    isActive: true,
    isExternal: false,
    worker: workers[0],
  },
  {
    _id: "2",
    role: "Gerente de TI",
    isDirector: true,
    createdAt: now,
    updatedAt: now,
    isActive: true,
    isExternal: false,
    worker: workers[1],
  },
];
