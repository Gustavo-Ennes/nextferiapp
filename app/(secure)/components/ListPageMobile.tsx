"use client";

import {
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { ItemListProps } from "./types";
import { formatCellContent, translateEntityKey } from "@/app/utils";

export function ListPageMobile<T extends { _id: string }>({
  items,
  routePrefix,
  onDelete,
}: ItemListProps<T>) {
  const router = useRouter();

  return (
    <List>
      {items.map((item) => {
        const label = Object.values(item).find((val) =>
          typeof val === "string" ? val.length > 3 : false
        );
        const subtitle = Object.entries(item)
          .filter(([k]) => k !== "_id" && k !== "name")
          .map(
            ([k, v]) =>
              `${translateEntityKey({
                entity: routePrefix,
                key: k,
              })}: ${formatCellContent(v)}`
          )
          .join(" · ");

        return (
          <Box key={item._id}>
            <ListItem
              onClick={() => router.push(`/${routePrefix}/${item._id}`)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box
                width="100%"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1">
                  {label || `Item ${item._id}`}
                </Typography>
                <Box>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${routePrefix}/form?id=${item._id}`);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {onDelete && (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item._id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {subtitle}
                </Typography>
              )}
            </ListItem>
            <Divider />
          </Box>
        );
      })}
    </List>
  );
}
