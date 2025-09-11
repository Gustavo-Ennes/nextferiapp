import {
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import type { CardParam } from "../types";
import { capitalizeName } from "@/app/utils";
import { limitText } from "../../utils";

const TextCard = ({ label, lines , icon}: CardParam) =>
  lines?.length ? (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6">{label} {icon}</Typography>
      <Divider sx={{ my: 1 }} />
      <List dense>
        {lines.map(({ primary, secondary }, idx) => (
          <ListItem key={idx}>
            <ListItemText primary={limitText(capitalizeName(primary))} secondary={secondary} />
          </ListItem>
        ))}
      </List>
    </Paper>
  ) : (
    <></>
  );

export default TextCard;
