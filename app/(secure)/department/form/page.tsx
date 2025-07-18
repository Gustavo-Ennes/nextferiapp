"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DepartmentForm } from "../components/DepartmentForm";
import { DepartmentFormData } from "../types";
import { Container, Typography } from "@mui/material";

export default function DepartmentFormPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DepartmentFormData>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const id = searchParams.get("id");

  const onSubmit = async (form: DepartmentFormData) => {
    const body = JSON.stringify(form);
    const method = data ? "PUT" : "POST";
    const url = data
      ? `${process.env.NEXT_PUBLIC_URL}/api/department/${id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/department`;

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
    router.push("/department/");
  };

  useEffect(() => {
    setLoading(true);
    const url = `${process.env.NEXT_PUBLIC_URL}/api/department/${id}`;
    fetch(url, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then(({ data }) => {
        setLoading(false);
        setData(data);
      })
      .catch(() => {
        router.push("/not-found");
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
