import { EntityType } from "./types";
import { capitalizeFirstLetter } from "./utils";

export const translateEntityKey = ({
  entity,
  key,
}: {
  entity: EntityType | null;
  key: string;
}): string => {
  const dictionary = {
    department: {
      _id: "id",
      name: "Nome",
      createdAt: "Criação",
      updatedAt: "Atualização",
      responsible: "Responsável",
      translated: "Departamento",
      translatedPlural: "Departamentos",
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
      translated: "Servidor",
      translatedPlural: "Servidores",
    },
    vacation: {
      _id: "id",
      duration: "Duração",
      type: "Tipo",
      startDate: "Início",
      endDate: "Fim",
      deferred: "Adiada",
      worker: "Servidor",
      createdAt: "Criação",
      updatedAt: "Atualização",
      period: "Período",
      cancelled: "cancelada",
      boss: "Chefe",
      observation: "Observação",
      translated: "Folga",
      translatedPlural: "Folgas",
      dayOff: "abonada",
      license: "licença-prêmio",
      normal: "férias",
      returnDate: "Retorno"
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
      translatedPlural: "Chefes",
    },
  };
  return entity
    ? capitalizeFirstLetter(dictionary[entity][key as keyof (typeof dictionary)[EntityType]])
    : "Informações";
};
