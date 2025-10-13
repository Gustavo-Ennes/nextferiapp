import { Box, Collapse, Icon, Paper, Typography } from "@mui/material";
import type { CardParam } from "../types";
import { useState } from "react";
import { capitalizeFirstLetter } from "@/app/utils";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

const NumberCard = ({ label, quantity = 0, icon, details }: CardParam) => {
  const [open, setOpen] = useState(false);
  const onClick = details ? () => setOpen((prev) => !prev) : undefined;
  const openCloseIcon = !open ? <ArrowDropUp /> : <ArrowDropDown />;

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      {details?.length && <Icon sx={{ float: "right" }}>{openCloseIcon}</Icon>}

      <Box onClick={onClick} sx={{ cursor: details ? "pointer" : "default" }}>
        <Typography variant="h6">
          {label} {icon}
        </Typography>

        <Typography variant="h4">{quantity}</Typography>
      </Box>

      {details?.length && (
        <Collapse in={open}>
          {details?.map((detail, idx) => (
            <Typography key={idx} variant="body2" sx={{ mt: 1 }}>
              {capitalizeFirstLetter(detail)}
            </Typography>
          ))}
        </Collapse>
      )}
    </Paper>
  );
};

export default NumberCard;
