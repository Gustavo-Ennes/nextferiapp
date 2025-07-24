"use client";

import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
} from "@mui/material";
import { useState } from "react";
import { ListItemMenuItem } from "./types";

export const ListItemMenu = ({ props }: { props: ListItemMenuItem }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleDropdownClick = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <>
      <ListItemButton onClick={handleDropdownClick} sx={{ my: 1 }}>
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText primary={props.label} />
        {isDropdownOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {props.items.map(({ itemLabel, itemIcon, href }) => (
            <ListItemButton
              sx={{ pl: 4 }}
              component="a"
              href={href}
              key={`drawer-${props.label}-${itemLabel}`}
            >
              <ListItemIcon>{itemIcon}</ListItemIcon>
              <ListItemText
                primary={itemLabel}
                slotProps={{
                  primary: { fontSize: 13 },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  );
};
