"use client";

import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { DepartmentFormData, DepartmentProps } from "../types";
import { useRouter } from "next/navigation";
import { set } from "mongoose";

export function DepartmentForm({ defaultValues }: DepartmentProps) {
  const [form, setForm] = useState<DepartmentFormData>({
    name: "",
    responsible: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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

  const onSubmit = async (form: DepartmentFormData) => {
    const body = JSON.stringify(form);
    const method = defaultValues ? "PUT" : "POST";
    const url = defaultValues
      ? `${process.env.NEXT_PUBLIC_URL}/api/department/${defaultValues._id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/department`;

    setIsSubmitting(true);
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!res.ok) {
      throw new Error("Failed to save department");
    }
    setIsSubmitting(false);
    router.push("/department/");
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
        name="responsible"
        label="Responsável"
        value={form.responsible}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <Box display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </form>
  );
}
