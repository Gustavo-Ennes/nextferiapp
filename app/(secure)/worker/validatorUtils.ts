import type { MinMaxStringMessageParam } from "./types";

const translatedProps = {
  name: "nome",
  role: "cargo",
  registry: "registro",
  matriculation: "matrícula",
  justification: "justificativa",
};

const nameAndRoleLimits = {
  max: 60,
  min: 5,
};
const registryAndMatriculationLimits = {
  max: 6,
  min: 4,
};

const minMaxByProp = {
  name: nameAndRoleLimits,
  role: nameAndRoleLimits,
  registry: registryAndMatriculationLimits,
  matriculation: registryAndMatriculationLimits,
  justification: { ...nameAndRoleLimits, max: 100 },
};

export const minMaxStringMessage = ({
  prop,
  condition,
}: MinMaxStringMessageParam) => {
  const propString = translatedProps[prop];
  const conditionString = condition === "max" ? "ter menos" : "ter mais";
  const charQtd = minMaxByProp[prop][condition];

  return `O ${propString} precisa ${conditionString} ${charQtd} caracteres.`;
};
