export type WorkerFormProp =
  | "name"
  | "role"
  | "registry"
  | "matriculation"
  | "justification";

export type MinMaxStringMessageParam = {
  prop: WorkerFormProp;
  condition: "min" | "max";
};
