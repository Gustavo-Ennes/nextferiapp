import { Container } from "@mui/material";
import { BossForm } from "../components/BossForm";
import { TitleTypography } from "../../components/TitleTypography";

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
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && boss)) && (
        <>
          <TitleTypography>
            {id ? "Editar Chefe" : "Criar Chefe"}
          </TitleTypography>

          <BossForm defaultValues={boss} workers={workers} />
        </>
      )}
    </Container>
  );
}
