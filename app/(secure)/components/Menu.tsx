import * as React from "react";
import { Button, Menu as MuiMenu, MenuItem, Box } from "@mui/material";
import type { MenuParam } from "./types";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

export const Menu = ({ items, label }: MenuParam) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const buttonEndIcon = open ? <ArrowDropUp /> : <ArrowDropDown />;

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        id="button-menu"
        aria-controls={open ? "button-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        variant="contained"
        onClick={handleClick}
        endIcon={buttonEndIcon}
        sx={{ width: "100%" }}
      >
        {label}
      </Button>
      <MuiMenu
        id="button-menu"
        aria-labelledby="button-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {items.map(({ action, label }, i) => (
          <MenuItem
            key={`item-${label.toLowerCase()}-${i}`}
            onClick={() => {
              action();
              handleClose();
            }}
          >
            {label}
          </MenuItem>
        ))}
      </MuiMenu>
    </Box>
  );
};
