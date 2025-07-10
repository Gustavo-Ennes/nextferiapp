import { auth } from "@/auth";
import { Container } from "@mui/material";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const redirectTo = "/login";

  if (!session) {
    redirect(redirectTo);
  }
  return (
    <html lang="en">
      <body>
        <Container> {children} </Container>
      </body>
    </html>
  );
}
