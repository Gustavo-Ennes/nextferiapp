import { Container, Typography } from "@mui/material";
import { BossForm } from "../components/BossForm";

export default async function BossFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: boss } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss/${id}`)
  ).json();
  const { data: workers } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker`)
  ).json();

  return (
    <Container maxWidth={"xl"} sx={{ mt: 1 }}>
      {(!id || (id && boss)) && (
        <>
          <Typography variant="h5" gutterBottom mb={2}>
            {id ? "Editar Chefe" : "Criar Chefe"}
          </Typography>

          <BossForm defaultValues={boss} workers={workers} />
        </>
      )}
    </Container>
  );
}
