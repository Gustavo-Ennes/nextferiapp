"use client";

import {
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Divider,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { ItemListProps } from "./types";
import { defaultEntityTableFields, formatCellContent } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import { Entity, Vacation, Worker } from "@/app/types";

export function ListPageMobile<T extends Entity>({
  items,
  routePrefix,
  onDelete,
}: ItemListProps<T>) {
  const router = useRouter();
  const getDefaultEntries = (obj: Entity) =>
    Object.entries(obj).filter(
      ([k]) =>
        defaultEntityTableFields[routePrefix].includes(k) &&
        !["name", "type"].includes(k)
    );

  return (
    <List sx={{ width: "100%" }}>
      {items.map((item) => {
        const label = (item as Vacation).type
          ? translateEntityKey({
              entity: "vacation",
              key: (item as Vacation).type,
            })
          : (item as Worker).name;
        const subtitles = getDefaultEntries(item).map(
          ([k, v]) =>
            `${translateEntityKey({
              entity: routePrefix,
              key: k,
            })}: ${formatCellContent<T>(v)}`
        );

        return (
          <ListItem
            key={item._id}
            onClick={() => router.push(`/${routePrefix}/${item._id}`)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <Grid container width={1}>
              <Grid size={{ xs: 12, sm: 10 }}>
                <Typography variant="h6">
                  {label?.toUpperCase() || `Item ${item._id}`}
                </Typography>

                <Divider />

                {subtitles.length && (
                  <Grid
                    container
                    gap={1}
                    m={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {subtitles.map((subtitle, i) => (
                      <Typography key={`subtitle-${i}`} fontSize={12}>
                        {subtitle}
                      </Typography>
                    ))}
                  </Grid>
                )}
              </Grid>
              <Grid
                container
                size={{ xs: 12, sm: 2 }}
                alignItems="start"
                textAlign="center"
              >
                <Grid size={{ xs: 6, sm: 12 }}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${routePrefix}/form?id=${item._id}`);
                    }}
                  >
                    <EditIcon fontSize="large" />
                  </IconButton>
                </Grid>

                {onDelete && (
                  <Grid size={{ xs: 6, sm: 12 }}>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      <DeleteIcon fontSize="large" />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </ListItem>
        );
      })}
    </List>
  );
}

// TERMINE DE RETIRAR O MOCK DE BOSS
// TIRE TODOS OS MOCKS
