"use client";

import { Box, Button, Grid, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { DepartmentFormData, DepartmentProps } from "../types";
import { useRouter } from "next/navigation";

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
    <Grid container component="form" spacing={2} onSubmit={handleSubmit}>
      <Grid size={12}>
        <TextField
          fullWidth
          size="small"
          required
          name="name"
          label="Nome"
          value={form.name}
          onChange={handleChange}
        />
      </Grid>

      <Grid size={12}>
        <TextField
          fullWidth
          size="small"
          name="responsible"
          label="Responsável"
          value={form.responsible}
          onChange={handleChange}
        />
      </Grid>

      <Grid
        component={Box}
        size={2}
        offset={10}
        alignItems={"center"}
        justifyContent={"right"}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ width: 1 }}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Grid>
    </Grid>
  );
}
