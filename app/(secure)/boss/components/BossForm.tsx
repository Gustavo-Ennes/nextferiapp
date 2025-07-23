"use client";

import {
  TextField,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";
import { SubmitButton } from "@/app/(secure)/components/FormSubmitButton";
import { BossFormData, BossProps } from "../types";
import { useRouter } from "next/navigation";

export function BossForm({ defaultValues, workers }: BossProps) {
  const router = useRouter();
  const [form, setForm] = useState<BossFormData>({
    worker: defaultValues?.worker?._id ?? null,
    role: defaultValues?.role ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (formData: BossFormData) => {
    const method = defaultValues ? "PUT" : "POST";
    const url = defaultValues
      ? `${process.env.NEXT_PUBLIC_URL}/api/boss/${defaultValues._id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/boss`;

    setIsSubmitting(true);
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("Erro ao salvar chefe");
    }
    setIsSubmitting(false);
    router.push("/boss");
  };

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
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm((prev) => ({
      ...prev,
      worker: e.target.value ?? null,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Servidor</InputLabel>
        <Select
          name="worker"
          value={form.worker ?? ""}
          label="Departamento"
          onChange={handleSelectChange}
        >
          {workers.map((worker) => (
            <MenuItem key={worker._id} value={worker._id}>
              {worker.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
