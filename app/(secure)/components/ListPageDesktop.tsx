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
import { useRouter } from "next/navigation";
import { StyledRow } from "./styled";
import { defaultEntityTableFields, formatCellContent } from "@/app/utils";
import { translateEntityKey } from "../../translate";
import { ItemListProps } from "./types";
import { Entity, Vacation } from "@/app/types";

export const ListPageDesktop = <T extends Entity>({
  pagination: { data: items, currentPage, totalPages },
  routePrefix,
  onDelete,
  vacationType,
}: ItemListProps<T>) => {
  const router = useRouter();
  const headers: string[] = [];

  if (items.length > 0)
    defaultEntityTableFields[routePrefix].forEach((key) => headers.push(key));

  const handleView = (_id: string) => {
    router.push(`/${routePrefix}/${_id}`);
  };

  const handleEdit = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation();
    router.push(`/${routePrefix}/form?id=${_id}`);
  };

  const handleDelete = (e: React.MouseEvent, entity: Entity) => {
    e.stopPropagation();
    onDelete(entity);
  };

  const onPageChange = (page: number) =>
    router.push(
      `/vacation${vacationType ? `/${vacationType}` : ""}?page=${page}`
    );

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((key) => (
                <TableCell key={key}>
                  {translateEntityKey({ entity: routePrefix as any, key })}
                </TableCell>
              ))}
              <TableCell align="center">Ações</TableCell>
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
                        })}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <IconButton onClick={(e) => handleEdit(e, item._id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => handleDelete(e, item)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/pdf/${routePrefix}/${item._id}`);
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
