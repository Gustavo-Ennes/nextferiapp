"use client";

import { useTheme } from "@mui/material/styles";
import { Container, Typography, useMediaQuery } from "@mui/material";
import { redirect } from "next/navigation";
import { Entity, EntityType } from "@/app/types";
import { ListPageDesktop } from "./ListPageDesktop";
import { ListPageMobile } from "./ListPageMobile";
import { sumarizeVacation } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import { useModal } from "@/context/ModalContext";
import { Vacation, Worker } from "@/app/types";
import { useState } from "react";

const ResponsiveListPage = <T extends Entity>({
  items: itemsFromServer = [],
  routePrefix,
}: {
  items: T[];
  routePrefix: EntityType;
}) => {
  const [items, setItems] = useState<T[]>(itemsFromServer);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { open, close } = useModal();

  const onConfirmDelete = async (entity: Entity) => {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/${routePrefix}/${entity._id}`;

    const res = await fetch(url, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(
        `Erro ao deletar ${translateEntityKey({
          entity: routePrefix,
          key: "translated",
        })?.toLowerCase()}.`
      );
    }

    setItems((prev) => prev.filter((item) => item._id !== entity._id));
    close();
  };

  const handleConfirmDelete = (entity: Entity) => {
    const key = translateEntityKey({
      entity: routePrefix,
      key: "translated",
    }).toLowerCase();
    const isNotDepartmentOrBoss = key !== "departamento" && key !== "chefe";
    const modalDescription = (entity as Vacation).type
      ? `Deseja excluir ${sumarizeVacation(entity as Vacation)}?`
      : `Deseja excluir o(a) ${key}${isNotDepartmentOrBoss ? "(a)" : ""} ${
          (entity as Worker).name
        }( #${entity._id} )?`;

    open({
      title: "Confirme a exclusão",
      description: modalDescription,
      onConfirm: () => {
        onConfirmDelete(entity);
        redirect(`/${routePrefix}`);
      },
    });
  };

  return (
    <Container sx={{ mb: 4, p: 0, width: 1 }}>
      <Typography variant="h4" gutterBottom mb={4}>
        {translateEntityKey({
          entity: routePrefix,
          key: "translatedPlural",
        })}
      </Typography>
      {isMobile ? (
        <ListPageMobile<T>
          items={items}
          routePrefix={routePrefix}
          onDelete={(entity) => handleConfirmDelete(entity)}
        />
      ) : (
        <ListPageDesktop<T>
          routePrefix={routePrefix}
          onDelete={(entity) => handleConfirmDelete(entity)}
          items={items}
        />
      )}
    </Container>
  );
};

export { ResponsiveListPage };
