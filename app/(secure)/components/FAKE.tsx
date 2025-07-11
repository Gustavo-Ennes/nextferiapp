import { Department, Worker } from "@/app/types";

export const departments: Department[] = [
  {
    _id: "1",
    name: "Recursos Humanos",
    createdAt: new Date(),
    updatedAt: new Date(),
    responsible: "João Silva",
  },
  {
    _id: "2",
    name: "Tecnologia da Informação",
    createdAt: new Date(),
    updatedAt: new Date(),
    responsible: "Maria Oliveira",
  },
  {
    _id: "3",
    name: "Financeiro",
    createdAt: new Date(),
    updatedAt: new Date(),
    responsible: "Carlos Pereira",
  },
  {
    _id: "4",
    name: "Marketing",
    createdAt: new Date(),
    updatedAt: new Date(),
    responsible: "Ana Costa",
  },
];

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

export const bosses = [
  {
    _id: "1",
    name: "Roberto Souza",
    role: "Diretor de TI",
    isDirector: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
];

export const vacations = [
  {
    _id: "1",
    daysQtd: 30,
    startDate: new Date("2023-07-01"),
    endDate: new Date("2023-07-10"),
    deferred: false,
    worker: workers[0]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
    boss: bosses[0],
    observation: "Férias de verão",
  },
  {
    _id: "2",
    daysQtd:15,
    startDate: new Date("2023-08-15"),
    endDate: new Date("2023-08-20"),
    deferred: true,
    worker: workers[1]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
    boss: bosses[0],
  },
  {
    _id: "3",
    daysQtd: 15,
    startDate: new Date("2023-09-01"),
    endDate: new Date("2023-09-15"),
    deferred: false,
    worker: workers[2]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
    boss: bosses[0],
  }
];
