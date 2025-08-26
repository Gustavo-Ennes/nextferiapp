"use client";

import { MouseEvent } from "react";
import {
  List,
  ListItem,
  IconButton,
  Typography,
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
import { PictureAsPdf } from "@mui/icons-material";
import { usePdfPreview } from "@/context/PdfPreviewContext";

export function ListPageMobile<T extends Entity>({
  pagination: { data: items },
  routePrefix,
  onDelete,
  vacationType,
}: ItemListProps<T>) {
  const router = useRouter();
  const { setPdf } = usePdfPreview();
  const getDefaultEntries = (obj: Entity) =>
    Object.entries(obj).filter(
      ([k]) =>
        defaultEntityTableFields[routePrefix].includes(k) &&
        !["name", "type"].includes(k)
    );

  const getItemLabel = (item: T) =>
    (item as Vacation).type
      ? (item as Vacation)?.worker?.name
      : (item as Worker)?.name;

  const handleEdit = (e: MouseEvent, item: Entity) => {
    e.stopPropagation();
    router.push(
      `/${routePrefix}/form?id=${item._id}${
        vacationType !== "normal" ? `&type=${vacationType}` : ""
      }`
    );
  };

  const handlePdf = (e: MouseEvent, item: Entity) => {
    e.stopPropagation();
    if (vacationType) setPdf([{ type: "vacation", id: item._id }]);
    else
      console.warn(
        "Only vacation, material requisitions and vehicle usage have pdf templates to render."
      );
  };

  const handleDelete = (e: MouseEvent, item: Entity) => {
    e.stopPropagation();
    onDelete(item);
  };

  return (
    <List sx={{ width: "100%" }}>
      {items.map((item) => {
        const label = getItemLabel(item);
        const subtitles = getDefaultEntries(item).map(([k, v]) =>
          v
            ? `${translateEntityKey({
                entity: routePrefix,
                key: k,
              })}: ${formatCellContent<T>({ value: v, isName: k === "name" })}`
            : ""
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
              <Grid size={{ xs: 10, sm: 11 }}>
                <Typography variant="h6">
                  {label?.toUpperCase() || item._id}
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
                size={{ xs: 2, sm: 1 }}
                alignItems="start"
                textAlign="center"
              >
                <Grid size={12}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleEdit(e, item)}
                    disabled={vacationType && !(item as Vacation).worker}
                  >
                    <EditIcon fontSize="large" />
                  </IconButton>
                </Grid>

                <Grid size={12}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handlePdf(e, item)}
                  >
                    <PictureAsPdf fontSize="large" />
                  </IconButton>
                </Grid>

                <Grid size={12}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleDelete(e, item)}
                  >
                    <DeleteIcon fontSize="large" />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </ListItem>
        );
      })}
    </List>
  );
}
