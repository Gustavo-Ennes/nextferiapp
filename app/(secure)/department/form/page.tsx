"use client";

import { useEffect, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { DepartmentForm } from "../components/DepartmentForm";
import { DepartmentFormData } from "../types";
import { Container, Typography } from "@mui/material";

export default function DepartmentFormPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DepartmentFormData>();
  const [loading, setLoading] = useState(false);

  const id = searchParams.get("id");

  const onSubmit = async () => {
    const method = data ? "PUT" : "POST";
    const url = data
      ? `${process.env.API_BASE_URL}/api/department/${id}`
      : `${process.env.API_BASE_URL}/api/department`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to save department");
    }
    redirect("/department");
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.API_BASE_URL}/api/department/${id}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setData(data);
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
            {id ? "Editar Departamento" : "Criar Departamento"}
          </Typography>
          <DepartmentForm
            defaultValues={data}
            onSubmit={onSubmit}
            isSubmitting={loading}
          />
        </>
      )}
    </Container>
  );
}
