"use client";

import { useState, useEffect } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { Container, Typography } from "@mui/material";
import { BossForm } from "../components/BossForm";
import { BossFormData } from "../types";

export default function BossFormPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BossFormData>();
  const [loading, setLoading] = useState(false);

  const id = searchParams.get("id");

  const onSubmit = async (formData: BossFormData) => {
    const method = data ? "PUT" : "POST";
    const url = data
      ? `${process.env.NEXT_PUBLIC_URL}/api/boss/${id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/boss`;

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

    redirect("/boss");
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss/${id}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((res) => {
        setData(res.boss);
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
            {id ? "Editar Chefe" : "Criar Chefe"}
          </Typography>

          <BossForm
            defaultValues={data}
            onSubmit={onSubmit}
            isSubmitting={loading}
          />
        </>
      )}
    </Container>
  );
}
