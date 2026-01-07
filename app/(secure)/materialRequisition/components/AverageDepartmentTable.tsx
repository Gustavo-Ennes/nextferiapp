import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { format, toDate } from "date-fns";
import type { AverageDepartmentTableParam } from "./types";

export const AverageDepartmentTable = ({
  rows,
}: {
  rows: AverageDepartmentTableParam[];
}) => {
  return (
    <TableContainer sx={{ maxHeight: 420 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Semana</TableCell>
            <TableCell>Gasolina</TableCell>
            <TableCell>S-10</TableCell>
            <TableCell>S-500</TableCell>
            <TableCell>Arla</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${toDate(r.weekStart).toISOString()}-${i}`}>
              <TableCell>{format(toDate(r.weekStart), "dd/MM/yy")}</TableCell>
              <TableCell>{r.gas ?? 0}</TableCell>
              <TableCell>{r.s10 ?? 0}</TableCell>
              <TableCell>{r.s500 ?? 0}</TableCell>
              <TableCell>{r.arla ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
