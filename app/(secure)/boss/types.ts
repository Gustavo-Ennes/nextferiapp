export interface BossFormData {
  name: string;
  position: string;
}

export interface BossProps {
  defaultValues?: BossFormData;
  onSubmit: (data: BossFormData) => void;
  isSubmitting?: boolean;
}
