"use client";

import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { SubmitButton } from "@/app/(secure)/components/FormSubmitButton";
import { BossFormData, BossProps } from "../types";

export function BossForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: BossProps) {
  const [form, setForm] = useState<BossFormData>({
    name: "",
    role: "",
  });

  useEffect(() => {
    if (defaultValues) {
      setForm(defaultValues);
    }
  }, [defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        required
        name="name"
        label="Nome"
        value={form.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        required
        name="role"
        label="Cargo"
        value={form.role}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <SubmitButton defaultValues={defaultValues} isSubmitting={isSubmitting} />
    </form>
  );
}
