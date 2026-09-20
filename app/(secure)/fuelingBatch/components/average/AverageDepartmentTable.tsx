import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { format, toDate } from "date-fns";
import type { AverageDepartmentTableParam } from "../types";
import { getFuelsUsedInBatches } from "../../utils";
import type { FuelingBatchDTO } from "@/dto";

export const AverageDepartmentTable = ({
  rows,
  fuelingBatches,
}: {
  rows: AverageDepartmentTableParam[];
  fuelingBatches: FuelingBatchDTO[];
}) => {
  const fuels = getFuelsUsedInBatches(fuelingBatches);

  return (
    <TableContainer sx={{ maxHeight: 420 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Semana</TableCell>
            {fuels.map((fuel) => (
              <TableCell key={fuel._id}>{fuel.name}</TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${toDate(r.weekStart).toISOString()}-${i}`}>
              <TableCell>{format(toDate(r.weekStart), "dd/MM/yy")}</TableCell>
              {fuels.map((fuel) => (
                <TableCell key={`${r.weekStart}-${fuel._id}`}>
                  {r[fuel.name] ?? 0}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
