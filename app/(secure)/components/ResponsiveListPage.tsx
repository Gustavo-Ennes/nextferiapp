"use client";

import { useTheme } from "@mui/material/styles";
import { Typography, useMediaQuery, Button, Grid } from "@mui/material";
import { Add } from "@mui/icons-material";
import { redirect } from "next/navigation";
import { Entity } from "@/app/types";
import { ListPageDesktop } from "./ListPageDesktop";
import { ListPageMobile } from "./ListPageMobile";
import { sumarizeVacation } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import { useModal } from "@/context/ModalContext";
import { Vacation, Worker } from "@/app/types";
import { useRouter } from "next/navigation";
import { ResponsiveListPageParam } from "./types";

const ResponsiveListPage = <T extends Entity>({
  paginatedResponse,
  routePrefix,
  pageTitle,
  vacationType,
}: ResponsiveListPageParam<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { open, close } = useModal();
  const router = useRouter();

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

  const titleFromRoutePrefix = translateEntityKey({
    entity: routePrefix,
    key: "translatedPlural",
  });

  return (
    <Grid container>
      <Grid size={12}>
        <Typography
          variant="h4"
          gutterBottom
          mb={4}
          textAlign={isMobile ? "center" : "left"}
        >
          {pageTitle ?? titleFromRoutePrefix}{" "}
          <Button
            variant="contained"
            onClick={() =>
              router.push(
                `/${routePrefix}/form${
                  vacationType ? `?type=${vacationType}` : ""
                }`
              )
            }
          >
            <Add />
          </Button>
        </Typography>
      </Grid>

      <Grid size={12}>
        {isMobile ? (
          <ListPageMobile<T>
            pagination={paginatedResponse}
            routePrefix={routePrefix}
            onDelete={(entity) => handleConfirmDelete(entity)}
            vacationType={vacationType}
          />
        ) : (
          <ListPageDesktop<T>
            pagination={paginatedResponse}
            routePrefix={routePrefix}
            onDelete={(entity) => handleConfirmDelete(entity)}
            vacationType={vacationType}
          />
        )}
      </Grid>
    </Grid>
  );
};

export { ResponsiveListPage };
