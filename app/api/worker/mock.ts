import { Worker } from "@/app/types";
import { departments } from "../department/mock";

export const workers: Worker[] = [
  {
    _id: "1",
    name: "João da Silva",
    role: "Analista de Sistemas",
    registry: "123456",
    matriculation: "654321",
    admissionDate: new Date("2020-01-15"),
    department: departments[1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    name: "Maria Oliveira",
    role: "Gerente de Projetos",
    registry: "789012",
    matriculation: "210987",
    admissionDate: new Date("2019-03-20"),
    department: departments[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    name: "Carlos Pereira",
    role: "Especialista em Finanças",
    registry: "345678",
    matriculation: "876543",
    admissionDate: new Date("2018-07-10"),
    department: departments[2],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "4",
    name: "Ana Costa",
    role: "Coordenadora de Marketing",
    registry: "901234",
    matriculation: "432109",
    admissionDate: new Date("2021-05-25"),
    department: departments[3],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
