"use client";

import { useState, useEffect } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { WorkerForm } from "../components/WorkerForm";
import { Container, Typography } from "@mui/material";
import { WorkerFormData } from "../types";

export default function WorkerFormPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<WorkerFormData>();
  const [loading, setLoading] = useState(false);

  const id = searchParams.get("id");

  const onSubmit = async (formData: WorkerFormData) => {
    const method = data ? "PUT" : "POST";
    const url = data
      ? `${process.env.API_BASE_URL}/api/worker/${id}`
      : `${process.env.API_BASE_URL}/api/worker`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("Erro ao salvar trabalhador");
    }

    redirect("/worker");
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`${process.env.API_BASE_URL}/api/worker/${id}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        redirect("/not-found");
      });
  }, [id]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {(!id || (id && data)) && (
        <>
          <Typography variant="h5" gutterBottom mb={2}>
            {id ? "Editar Trabalhador" : "Criar Trabalhador"}
          </Typography>

          <WorkerForm
            defaultValues={data}
            onSubmit={onSubmit}
            isSubmitting={loading}
          />
        </>
      )}
    </Container>
  );
}
