"use client";

import { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { useEffect, useState } from "react";

const BossList = () => {
  const [bosses, setBosses] = useState([]);

  const onConfirmBossDelete = async (id: string) => {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/boss/${id}`;

    const res = await fetch(url, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Erro ao deletar chefe");
    }
  };
  const fetchBosses = async () =>
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss`)
      .then((res) => res.json())
      .then(({ data }) => setBosses(data));

  useEffect(() => {
    fetchBosses();
  }, []);

  return (
    <ResponsiveListPage<Boss>
      items={bosses ?? []}
      routePrefix="boss"
      refetch={fetchBosses}
      onConfirmDelete={onConfirmBossDelete}
    />
  );
};

export default BossList;
