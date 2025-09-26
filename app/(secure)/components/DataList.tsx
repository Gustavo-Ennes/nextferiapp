import * as React from "react";
import {
  Box,
  List,
  Typography,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import type { DataListItem } from "./types";

const DataList = ({
  data,
  title,
  maxHeight = "50vh",
}: {
  data: DataListItem[];
  title: string;
  maxHeight?: string;
}) => {
  return (
    <Box
      sx={{
        maxHeight,
        overflowY: "auto",
        width: "100%",
      }}
    >
      {title && (
        <Typography variant="subtitle1" component="div" sx={{ p: 1, pb: 0 }}>
          {data.length ? title : `Não há ${title.toLowerCase()}.`}
        </Typography>
      )}

      <List disablePadding dense>
        {data.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem>
              <ListItemIcon>
                <InsertDriveFileIcon color="primary" sx={{ fontSize: 12 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.primaryText}
                secondary={item.secondaryText}
                slotProps={{
                  primary: { fontSize: 10 },
                  secondary: { fontSize: 9 },
                }}
              />
            </ListItem>

            {index < data.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export { DataList };
