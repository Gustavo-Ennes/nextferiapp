import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  alpha,
  Tooltip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { format, toDate } from "date-fns";
import { useEffect, useState } from "react";

export const FuelingFormList = () => {
  const { fuelings, setFuelings } = useMaterialRequisitionForm();
  const [problematicFuelingId, setProblematicFuelingId] = useState<
    number | null
  >(null);
  const [fuelingKmOrderWarning, setFuelingKmOrderWarning] = useState<
    string | null
  >(null);
  const [errorBorder, setErrorBorder] = useState(false);

  const onRemove = (idx: number) => {
    setFuelings(fuelings.filter((_, i) => i !== idx));
  };

  const getSecondaryListItemText = ({
    kmHr,
    isoDate,
  }: {
    kmHr: number | null;
    isoDate: string;
  }) => {
    const date = toDate(isoDate);
    const dateText = `${format(date, "dd/MM/yy")}`;
    const kmHrText = kmHr ? ` - km:${kmHr}` : "";

    return `${dateText}${kmHrText}`;
  };

  useEffect(() => {
    for (let i = 0; i < fuelings.length; i++) {
      const actualFueling = fuelings[i];
      const lastFueling = i > 0 ? fuelings[i - 1] : null;

      if (
        lastFueling &&
        lastFueling.kmHr &&
        actualFueling.kmHr &&
        actualFueling.kmHr <= lastFueling.kmHr
      ) {
        setProblematicFuelingId(i);
        setFuelingKmOrderWarning(
          `Verificar quilometragens e datas: #${i - 1} tem km maior que seu antecessor #${i}`,
        );
        setErrorBorder(true);

        return;
      } else {
        setProblematicFuelingId(null);
        setFuelingKmOrderWarning(null);
        setErrorBorder(false);
      }
    }
  }, [fuelings]);

  return (
    <Box
      sx={{
        width: 1,
        maxHeight: 1,
      }}
    >
      {fuelings.length > 0 ? (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.5,
              lineHeight: 1.2,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Abastecimentos
          </Typography>
          <List
            sx={{
              width: 1,
              height: "100%",
            }}
            dense
          >
            {fuelings.map(({ date, kmHr, quantity }, idx) => {
              const color = idx === problematicFuelingId ? "error" : "primary";

              return (
                <ListItem
                  key={`$ListItem${idx}`}
                  sx={{
                    border:
                      errorBorder && idx === problematicFuelingId
                        ? "1px solid #DDcccc"
                        : null,
                    borderRadius:
                      errorBorder && idx === problematicFuelingId ? 1.5 : null,
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="comments"
                      onClick={() => onRemove(idx)}
                    >
                      <Close />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Tooltip
                      title={color === "error" ? fuelingKmOrderWarning : ""}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: (theme) =>
                            alpha(theme.palette[color].main, 0.1),
                          color: (theme) => theme.palette[color].main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography fontSize={10}>
                          {color === "error" ? "!" : ""}{" "}
                          {parseFloat(quantity.toFixed(3))}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ pl: 2 }}
                    primary={`#${idx}`}
                    secondary={getSecondaryListItemText({
                      isoDate: date,
                      kmHr,
                    })}
                  />
                </ListItem>
              );
            })}
          </List>
        </>
      ) : (
        <Typography p={1}>
          Selecione um carro e veja os abastecimentos aqui.
        </Typography>
      )}
    </Box>
  );
};
