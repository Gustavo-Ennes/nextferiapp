import { PdfRouteBody } from "@/app/api/types";

const PdfPage = async ({
  searchParams,
}: {
  searchParams: Promise<PdfRouteBody>;
}) => {
  const body = await searchParams;
  const data = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/pdf`, {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  return (
    <iframe
      style={{ height: "90vh", width: "100%", padding: "0 !important" }}
      src={`data:application/pdf;base64,${data}`}
    />
  );
};

export default PdfPage;
