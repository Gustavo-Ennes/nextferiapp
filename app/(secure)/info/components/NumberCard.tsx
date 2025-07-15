import { Box, Collapse, Paper, Typography } from "@mui/material";
import { CardParam } from "../types";
import { useState } from "react";

const NumberCard = ({ label, quantity = 0, icon, details }: CardParam) => {
  const [open, setOpen] = useState(false);
  const onClick = details ? () => setOpen((prev) => !prev) : undefined;

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box onClick={onClick} sx={{ cursor: details ? "pointer" : "default" }}>
        <Typography variant="h6">
          {label} {icon}
        </Typography>

        <Typography variant="h4">{quantity}</Typography>
      </Box>

      {details && (
        <Collapse in={open}>
          {details?.map((detail, idx) => (
            <Typography key={idx} variant="body2" sx={{ mt: 1 }}>
              {detail}
            </Typography>
          ))}
        </Collapse>
      )}
    </Paper>
  );
};

export default NumberCard;
