"use client";

import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { Button, Menu, MenuItem as MuiMenuItem, Tooltip } from "@mui/material";
import { useState } from "react";
import type { MenuItem } from "./types";
import type { Vacation } from "@/app/types";

export const ButtonMenu = ({
  items,
  vacation,
}: {
  items: MenuItem[];
  vacation: Vacation;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const dropdownIcon = isMenuOpen ? <ArrowDropUp /> : <ArrowDropDown />;
  const handleAction = (action: () => void) => {
    action();
    setAnchorEl(null);
  };

  const button = (
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
  );

  const isWorkerInactive =
    vacation.worker?.isActive === false || !vacation.worker;

  return (
    <>
      {isWorkerInactive ? (
        <Tooltip title="Não será possivel remarcar: trabalhador inativo">
          {button}
        </Tooltip>
      ) : (
        button
      )}
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
        {items.map(({ label, action, disabled }) => (
          <MuiMenuItem
            key={`button-menu-${label}`}
            onClick={() => handleAction(action)}
            disabled={disabled}
          >
            {label}
          </MuiMenuItem>
        ))}
      </Menu>
    </>
  );
};
