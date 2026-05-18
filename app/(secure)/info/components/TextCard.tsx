import {
  Paper,
  Typography,
  ListItemText,
  Box,
  Collapse,
  Icon,
} from "@mui/material";
import type { CardParam } from "../types";
import { capitalizeName } from "@/app/utils";
import { limitText } from "../../utils";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { useState } from "react";

const TextCard = ({ label, lines, icon }: CardParam) => {
  const [open, setOpen] = useState(false);
  const onClick = lines ? () => setOpen((prev) => !prev) : undefined;
  const openCloseIcon = !open ? <ArrowDropUp /> : <ArrowDropDown />;

  return lines?.length ? (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Icon sx={{ float: "right" }}>{openCloseIcon}</Icon>

      <Box onClick={onClick} sx={{ cursor: "pointer" }}>
        <Typography variant="h6">
          {label} {icon}
        </Typography>
      </Box>

      <Collapse in={open}>
        {lines.map(({ primary, secondary }, idx) => (
          <ListItemText
            key={`textCard-${label}-${idx}`}
            primary={limitText(capitalizeName(primary))}
            secondary={secondary}
          />
        ))}
      </Collapse>
    </Paper>
  ) : (
    <></>
  );
};

export default TextCard;
