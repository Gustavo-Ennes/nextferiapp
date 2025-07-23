"use client";

import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { Button, Menu, MenuItem as MuiMenuItem } from "@mui/material";
import { useState } from "react";
import { MenuItem } from "./types";

export const ButtonMenu = ({ items }: { items: MenuItem[] }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const dropdownIcon = isMenuOpen ? <ArrowDropUp /> : <ArrowDropDown />;

  return (
    <>
      <Button
        id="vacation-cancel-menu"
        aria-controls={isMenuOpen ? "vacation-cancel-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isMenuOpen ? "true" : undefined}
        onClick={handleClick}
        endIcon={dropdownIcon}
      >
        Cancelar
      </Button>
      <Menu
        id="vacation-cancel-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "vacation-cancel-menu",
          },
        }}
      >
        {items.map(({ label, action }) => (
          <MuiMenuItem key={`button-menu-${label}`} onClick={action}>
            {label}
          </MuiMenuItem>
        ))}
      </Menu>
    </>
  );
};
