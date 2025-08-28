import type { Boss } from "@/app/types";

const now = new Date().toISOString();

export const bosses: Boss[] = [
  {
    _id: "1",
    name: "Roberto Souza",
    role: "Diretor de TI",
    isDirector: false,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  },
  {
    _id: "2",
    name: "Fátima Souza",
    role: "Gerente de TI",
    isDirector: true,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  },
];
