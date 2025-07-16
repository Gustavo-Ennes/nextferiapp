"use client";

import { useTheme } from "@mui/material/styles";
import { Container, Typography, useMediaQuery } from "@mui/material";
import { Entity, EntityType } from "@/app/types";
import { ListPageDesktop } from "./ListPageDesktop";
import { ListPageMobile } from "./ListPageMobile";
import { sumarizeVacation } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import { useModal } from "@/context/ModalContext";
import { Vacation, Worker } from "@/app/types";

const ResponsiveListPage = <T extends Entity>({
  items,
  routePrefix,
}: {
  items: T[];
  routePrefix: EntityType;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { open } = useModal();

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
      onConfirm: (obs) => {
        console.log(
          `Você excluiu um(a) ${translateEntityKey({
            entity: routePrefix,
            key: "translated",
          }).toLowerCase()} id: ${entity._id}.`,
          obs
        );
      },
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
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
      ;
    </Container>
  );
};

export { ResponsiveListPage };
