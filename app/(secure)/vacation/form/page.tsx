"use client";

import { useEffect, useState } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { Container, Typography } from "@mui/material";
import { VacationForm } from "../components/VacationForm";
import { VacationFormData } from "../types";

export default function VacationFormPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<VacationFormData>();
  const [loading, setLoading] = useState(false);

  const id = searchParams.get("id");

  const onSubmit = async (formData: VacationFormData) => {
    const method = data ? "PUT" : "POST";
    const url = data
      ? `${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/vacation`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Erro ao salvar folga");

    redirect("/vacation");
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((res) => {
        setData(res.vacation);
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
            {id ? "Editar Folga" : "Criar Folga"}
          </Typography>
          <VacationForm
            defaultValues={data}
            onSubmit={onSubmit}
            isSubmitting={loading}
          />
        </>
      )}
    </Container>
  );
}
