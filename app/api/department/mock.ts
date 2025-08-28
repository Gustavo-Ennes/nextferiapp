import type { Department } from "@/app/types";
import { bosses } from "../boss/mock";

const now = new Date().toISOString();

export const departments: Department[] = [
  {
    _id: "1",
    name: "Recursos Humanos",
    createdAt: now,
    updatedAt: now,
    responsible: bosses[0],
    isActive: true,
  },
  {
    _id: "2",
    name: "Tecnologia da Informação",
    createdAt: now,
    updatedAt: now,
    responsible: bosses[1],
    isActive: true,
  },
  {
    _id: "3",
    name: "Financeiro",
    createdAt: now,
    updatedAt: now,
    responsible: bosses[1],
    isActive: true,
  },
  {
    _id: "4",
    name: "Marketing",
    createdAt: now,
    updatedAt: now,
    responsible: bosses[0],
    isActive: true,
  },
];
