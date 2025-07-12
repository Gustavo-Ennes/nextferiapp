
export type DepartmentFormData = {
  name: string;
  responsible?: string;
};

export type DepartmentProps = {
  defaultValues?: DepartmentFormData;
  onSubmit: (data: DepartmentFormData) => void;
  isSubmitting?: boolean;
};