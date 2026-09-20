"use client";

import { useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { FuelingBatchDTOInvoice } from "@/dto/FuelingBatchDTO";
import { resolveName, toMonetary } from "../../utils";

export const FuelingBatchDetailInvoices = ({
  invoices,
}: {
  invoices: FuelingBatchDTOInvoice[];
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (invoices.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Nenhuma nota fiscal neste lote.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      <List dense disablePadding>
        {invoices.map((invoice, index) => {
          const isOpen = expanded === index;
          return (
            <Box key={`${invoice.number}-${invoice.series ?? ""}`}>
              {index > 0 && <Divider component="li" />}
              <ListItemButton
                onClick={() => setExpanded(isOpen ? null : index)}
                sx={{ py: 1 }}
              >
                <ListItemText
                  primary={`NF ${invoice.number}${invoice.series ? `/${invoice.series}` : ""}`}
                  secondary={resolveName(invoice.department)}
                  slotProps={{
                    primary: { fontWeight: 600, variant: "body2" },
                    secondary: { variant: "caption" },
                  }}
                />
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {toMonetary(invoice.total)}
                  </Typography>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </Stack>
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pb: 1.5, bgcolor: "action.hover" }}>
                  <Table size="small">
                    <TableBody>
                      {invoice.items.map((item, itemIndex) => (
                        <TableRow
                          key={itemIndex}
                          sx={{ "&:last-child td": { border: 0 } }}
                        >
                          <TableCell sx={{ pl: 0 }}>
                            {resolveName(item.fuel)}
                          </TableCell>
                          <TableCell align="right">
                            {item.quantity.toFixed(3)} L
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 0 }}>
                            {toMonetary(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Paper>
  );
};
