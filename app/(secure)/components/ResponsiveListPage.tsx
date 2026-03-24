"use client";

import { useTheme } from "@mui/material/styles";
import { Typography, useMediaQuery, Button, Grid } from "@mui/material";
import { Add } from "@mui/icons-material";
import { ListPageDesktop } from "./ListPageDesktop";
import { ListPageMobile } from "./ListPageMobile";
import { capitalizeName, sumarizeVacation } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import { useDialog } from "@/context/DialogContext";
import type { Entity } from "@/app/types";
import { useRouter as useInternalRouter } from "@/context/RouterContext";
import { useRouter } from "next/navigation";
import type { ResponsiveListPageParam } from "./types";
import { useSnackbar } from "@/context/SnackbarContext";
import type { SnackbarData } from "@/context/types";
import { useState } from "react";
import { Search } from "./Search";
import type { BossDTO, VacationDTO, WorkerDTO } from "@/dto";
import { useLoading } from "@/context/LoadingContext";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";

const ResponsiveListPage = <T extends Entity>({
  paginatedResponse,
  routePrefix,
  pageTitle,
  vacationType,
  contains,
  isExternal,
}: ResponsiveListPageParam<T>) => {
  const theme = useTheme();
  const { addSnack } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { openConfirmationDialog, closeConfirmationDialog } = useDialog();
  const internalRouter = useInternalRouter();
  const router = useRouter();
  const [search, setSearch] = useState(contains);
  const useExternalFilter = routePrefix === "boss" || routePrefix === "worker";
  const { setLoading } = useLoading();

  const traslatedEntityName = translateEntityKey({
    entity: routePrefix,
    key: "translated",
  }).toLowerCase();

  const onConfirmDelete = async (entity: Entity) => {
    const url = `/api/${routePrefix}/${entity._id as string}`;
    const snackbarData: SnackbarData = { message: "" };

    const res = await fetch(url, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`Erro ao deletar ${traslatedEntityName}.`);
      snackbarData.message = `Eita, houve um erro pra delete um(a) ${traslatedEntityName}.`;
      snackbarData.severity = "error";
    } else {
      snackbarData.message = `Você deletou um(a) ${traslatedEntityName}.`;
      snackbarData.severity = "success";
    }

    closeConfirmationDialog();
    addSnack(snackbarData);
  };

  const handleConfirmDelete = (entity: Entity) => {
    const key = translateEntityKey({
      entity: routePrefix,
      key: "translated",
    }).toLowerCase();
    const isNotDepartmentOrBoss = key !== "departamento" && key !== "chefe";
    const name = capitalizeName(
      (entity as WorkerDTO)?.name ??
        ((entity as BossDTO)?.worker as WorkerDTO)?.name ??
        (entity as PurchaseOrderDTO)?.reference,
    );
    const modalDescription = (entity as VacationDTO).type
      ? `Deseja excluir ${sumarizeVacation(entity as VacationDTO)}?`
      : `Deseja excluir o(a) ${key}${
          isNotDepartmentOrBoss ? "(a)" : ""
        } ${name}( #${entity._id as string} )?`;

    openConfirmationDialog({
      title: "Confirme a exclusão",
      description: modalDescription,
      onConfirm: async () => {
        setLoading(true);
        await onConfirmDelete(entity);
        internalRouter.redirectWithLoading(
          `/${routePrefix}${
            vacationType && vacationType !== "normal" ? `/${vacationType}` : ""
          }?page=${paginatedResponse.currentPage || "1"}${
            isExternal !== null || isExternal !== undefined
              ? `&isExternal=${isExternal}`
              : ""
          }`,
        );
      },
    });
  };

  const handleSearch = (term: string, isExternal?: boolean) => {
    setSearch(term);
    const isExternalString = String(isExternal);

    router.replace(
      `/${routePrefix}${
        vacationType && vacationType !== "normal" ? `/${vacationType}` : ""
      }?page=1${term ? `&contains=${encodeURIComponent(term)}` : ""}${
        isExternal !== undefined ? `&isExternal=${isExternalString}` : ""
      }`,
    );
  };

  const titleFromRoutePrefix = translateEntityKey({
    entity: routePrefix,
    key: "translatedPlural",
  });

  return (
    <Grid container maxWidth={"md"} m="auto" p={2}>
      <Grid size={10}>
        <Typography
          variant="h4"
          gutterBottom
          mb={2}
          textAlign={isMobile ? "center" : "left"}
          color="primary"
        >
          {pageTitle ?? titleFromRoutePrefix}{" "}
        </Typography>
      </Grid>

      <Grid size={2} alignItems={"stretch"} justifyContent={"end"}>
        <Button
          variant="contained"
          sx={{ float: "right", mt: "3px" }}
          onClick={() =>
            internalRouter.redirectWithLoading(
              `/${routePrefix}/form${
                vacationType ? `?type=${vacationType}` : ""
              }`,
            )
          }
        >
          <Add />
        </Button>
      </Grid>

      <Grid size={12}>
        <Search
          handleSearch={handleSearch}
          routePrefix={routePrefix}
          isExternal={isExternal}
          enabledProps={{
            active: true,
            external: useExternalFilter,
            internal: useExternalFilter,
          }}
        />
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
            contains={search}
          />
        )}
      </Grid>
    </Grid>
  );
};

export { ResponsiveListPage };
