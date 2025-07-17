import { Box, Button } from "@mui/material";

const SubmitButton = ({
  defaultValues,
  isSubmitting,
}: {
  defaultValues: any;
  isSubmitting: boolean;
}) => {
  const buttonLabel = defaultValues ? "Salvar" : "Criar";
  const buttonLoadingLabel = defaultValues ? "Salvando" : "Criando";

  return (
    <Box display="flex" justifyContent="flex-end">
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? buttonLoadingLabel : buttonLabel}
      </Button>
    </Box>
  );
};

export { SubmitButton };
