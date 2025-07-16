import { EntityType } from "./types";

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
      startDate: "Data de Início",
      endDate: "Data de Fim",
      deferred: "Adiada",
      worker: "Servidor",
      createdAt: "Criação",
      updatedAt: "Atualização",
      boss: "Chefe",
      observation: "Observação",
      translated: "Férias",
      translatedPlural: "Férias",
      dayOff: "abonada",
      license: "licença-prêmio",
      normal: "férias",
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
    ? dictionary[entity][key as keyof (typeof dictionary)[EntityType]]
    : "Informações";
};
