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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { StyledRow } from "./styled";
import { translateEntityKey, formatCellContent } from "@/app/utils";
import { ItemListProps } from "./types";

export const ListPageDesktop = <T extends { _id: string }>({
  items,
  routePrefix,
  onDelete,
}: ItemListProps<T>) => {
  const router = useRouter();
  const headers = items.length > 0 ? Object.keys(items[0]) : [];

  const handleView = (_id: string) => {
    router.push(`/${routePrefix}/${_id}`);
  };

  const handleEdit = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation();
    router.push(`/${routePrefix}/form?id=${_id}`);
  };

  const handleDelete = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation();
    onDelete(_id);
  };


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
                    {formatCellContent(item[key as keyof T])}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <IconButton onClick={(e) => handleEdit(e, item._id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => handleDelete(e, item._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
