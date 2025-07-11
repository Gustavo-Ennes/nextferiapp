import { isDate, format } from "date-fns";

export type Entity = "department" | "worker" | "vacation" | "boss";

export const translateEntityKey = ({ entity, key }: { entity: Entity, key: string }): string => {
  const dictionary = {
    department: {
      _id: "id",
      name: "Nome",
      createdAt: "Criação",
      updatedAt: "Atualização",
      responsible: "Responsável",
      translated: "Departamento",
      TranslatedPlural: "Departamentos",
    },
    worker: {
      _id: "id",
      name: "Nome",
      role: "Cargo",
      registry: "Registro",
      matriculation: "Matrícula",
      admissionDate: "Data de Admissão",
      department: "Departamento",
      createdAt: "Criação",
      updatedAt: "Atualização",
      translated: "Trabalhador",
      TranslatedPlural: "Trabalhadores",
    },
    vacation: {
      _id: "id",
      daysQtd: "Quantidade de Dias",
      startDate: "Data de Início",
      endDate: "Data de Fim",
      deferred: "Adiada",
      worker: "Trabalhador",
      createdAt: "Criação",
      updatedAt: "Atualização",
      boss: "Chefe",
      observation: "Observação",
      translated: "Férias",
      TranslatedPlural: "Férias",
    },
    boss: {
      _id: "id",
      name: "Nome",
      role: "Cargo",
      isDirector: "É Diretor?",
      createdAt: "Criação",
      updatedAt: "Atualização",
      isActive: "Ativo",
      translated: "Chefe",
      TranslatedPlural: "Chefes",
    },
  };
  return dictionary[entity][key as keyof typeof dictionary[Entity]] ?? "";
};

export const formatCellContent = <T extends { _id: string }>(
  value: T[keyof T]
) => (isDate(value) ? format(value, "dd/MM/yyyy") : String(value));
