"use client";

import {
  TextField,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { useState } from "react";
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
    <Grid container component="form" spacing={2} onSubmit={handleSubmit}>
      <Grid size={12}>
        <FormControl fullWidth>
          <InputLabel>Servidor</InputLabel>
          <Select
            name="worker"
            value={form.worker ?? ""}
            label="Departamento"
            onChange={handleSelectChange}
            size="small"
            fullWidth
          >
            {workers.map((worker) => (
              <MenuItem key={worker._id} value={worker._id}>
                {worker.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={12}>
        <TextField
          required
          name="role"
          label="Cargo"
          value={form.role}
          onChange={handleChange}
          size="small"
          fullWidth
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
