"use client";

import { useTheme } from "@mui/material/styles";
import {
  Typography,
  useMediaQuery,
  Button,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { redirect } from "next/navigation";
import type { Entity } from "@/app/types";
import { ListPageDesktop } from "./ListPageDesktop";
import { ListPageMobile } from "./ListPageMobile";
import { sumarizeVacation } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import { useModal } from "@/context/ModalContext";
import type { Vacation, Worker } from "@/app/types";
import { useRouter } from "next/navigation";
import type { ResponsiveListPageParam } from "./types";
import { useSnackbar } from "@/context/SnackbarContext";
import type { SnackbarData } from "@/context/types";
import { useState } from "react";

const ResponsiveListPage = <T extends Entity>({
  paginatedResponse,
  routePrefix,
  pageTitle,
  vacationType,
  contains,
}: ResponsiveListPageParam<T>) => {
  const theme = useTheme();
  const { addSnack } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { open, close } = useModal();
  const router = useRouter();
  const [search, setSearch] = useState(contains);

  const traslatedEntityName = translateEntityKey({
    entity: routePrefix,
    key: "translated",
  }).toLowerCase();

  const onConfirmDelete = async (entity: Entity) => {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/${routePrefix}/${entity._id}`;
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

    close();
    addSnack(snackbarData);
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
        redirect(
          `/${routePrefix}${
            vacationType && vacationType !== "normal" ? `/${vacationType}` : ""
          }`
        );
      },
    });
  };

  const handleSearch = (term: string) => {
    setSearch(term);
    router.replace(
      `/${routePrefix}${
        vacationType && vacationType !== "normal" ? `/${vacationType}` : ""
      }?page=1${term ? `&contains=${encodeURIComponent(term)}` : ""}`
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
            router.push(
              `/${routePrefix}/form${
                vacationType ? `?type=${vacationType}` : ""
              }`
            )
          }
        >
          <Add />
        </Button>
      </Grid>

      <Grid size={5} offset={7}>
        <TextField
          size="small"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ pb: 2, alignSelf: "right" }}
          placeholder={`Buscar um(a) ${translateEntityKey({
            entity: routePrefix,
            key: "translated",
          })}`}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
            },
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
