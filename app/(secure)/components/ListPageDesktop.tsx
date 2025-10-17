"use client";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PictureAsPdf } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { StyledRow } from "./styled";
import { defaultEntityTableFields, formatCellContent } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import type { ItemListProps } from "./types";
import type { Entity, Vacation } from "@/app/types";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { parseBool } from "./utils";

export const ListPageDesktop = <T extends Entity>({
  pagination: { data: items, currentPage, totalPages },
  routePrefix,
  onDelete,
  vacationType,
  contains,
}: ItemListProps<T>) => {
  const router = useRouter();
  const { setPdf } = usePdfPreview();
  const searchParams = useSearchParams();
  const headers: string[] = [];
  const isExternal = parseBool(searchParams.get("isExternal"));

  if (items.length > 0)
    defaultEntityTableFields[routePrefix].forEach((key) => headers.push(key));

  const handleView = (_id: string) => {
    router.push(`/${routePrefix}/${_id}`);
  };

  const handleEdit = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation();
    router.push(
      `/${routePrefix}/form?id=${_id}${
        vacationType !== "normal" ? `&type=${vacationType}` : ""
      }`
    );
  };

  const handleDelete = (e: React.MouseEvent, entity: Entity) => {
    e.stopPropagation();
    onDelete(entity);
  };

  const onPageChange = (page: number) => {
    const url = `/${routePrefix}${
      vacationType ? `/${vacationType}?` : "?"
    }page=${page}${
      contains ? `&contains=${encodeURIComponent(contains)}` : ""
    }${isExternal !== undefined ? `&isExternal=${isExternal}` : ""}`;

    return router.push(url);
  };

  const isDate = (key: string): boolean => {
    return [
      "startDate",
      "admissionDate",
      "endDate",
      "returnDate",
      "createdAt",
      "updatedAt",
    ].includes(key);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#EEF" }}>
              {headers.map((key) => (
                <TableCell key={key}>
                  {translateEntityKey({
                    entity: routePrefix as any,
                    key,
                  }).toUpperCase()}
                </TableCell>
              ))}
              <TableCell align="center">AÇÕES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <StyledRow key={item._id} onClick={() => handleView(item._id)}>
                {headers.map((key) => (
                  <TableCell key={key}>
                    {key === "type"
                      ? translateEntityKey({
                          entity: routePrefix,
                          key: (item as Vacation)["type"],
                        })
                      : formatCellContent({
                          value: item[key as keyof T],
                          isName: key === "name",
                          isDate: isDate(key),
                          capitalize: key === "role",
                        })}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleEdit(e, item._id)}
                    disabled={
                      vacationType !== null &&
                      vacationType !== undefined &&
                      !(item as Vacation).worker
                    }
                    sx={{ color: "#8f8c5dff" }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => handleDelete(e, item)}
                    sx={{ color: "#915252ff" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    style={{
                      display:
                        routePrefix === "vacation" ? "inline-block" : "none",
                    }}
                    sx={{ color: "#526891ff" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (vacationType)
                        setPdf({ items: [{ type: "vacation", id: item._id }] });
                      else
                        console.warn(
                          "Only vacation, material requisitions and vehicle usage have pdf templates to render."
                        );
                    }}
                  >
                    <PictureAsPdf />
                  </IconButton>
                </TableCell>
              </StyledRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {items && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
          px={1}
        >
          <Button
            variant="outlined"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <Typography>
            Página {currentPage} de {totalPages}
          </Typography>

          <Button
            variant="outlined"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </Stack>
      )}
    </Box>
  );
};
