"use client";

import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
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
        name="position"
        label="Cargo"
        value={form.role}
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
