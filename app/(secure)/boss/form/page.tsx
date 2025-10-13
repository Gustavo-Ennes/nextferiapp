import { Container } from "@mui/material";
import { BossForm } from "../components/BossForm";
import { TitleTypography } from "../../components/TitleTypography";
import { fetchAllPaginated, fetchOne } from "../../utils";
import { type Boss, type Worker } from "@/app/types";

export default async function BossFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string; type: string }>;
}) {
  const { id } = await searchParams;

  const boss = await fetchOne<Boss>({ type: "boss", id });
  const workers = await fetchAllPaginated<Worker>({
    type: "worker",
    params: { isActive: true, isExternal: false },
  });

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
