export interface WorkerFormData {
  name: string;
  registration: string;
  role: string;
  departmentId: string;
}

export interface WorkerProps {
  defaultValues?: WorkerFormData;
  onSubmit: (data: WorkerFormData) => void;
  isSubmitting?: boolean;
}
