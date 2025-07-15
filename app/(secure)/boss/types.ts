export interface BossFormData {
  name: string;
  role: string;
}

export interface BossProps {
  defaultValues?: BossFormData;
  onSubmit: (data: BossFormData) => void;
  isSubmitting?: boolean;
}
