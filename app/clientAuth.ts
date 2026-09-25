"use client";

import { signOut } from "next-auth/react";

export const handleClientSignOut = async () => {
  await signOut({ redirect: false });

  const issuerBaseUrl = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  if (!issuerBaseUrl || !clientId) {
    console.error(
      "Variáveis NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL / NEXT_PUBLIC_AUTH0_CLIENT_ID não configuradas.",
    );
    window.location.href = "/login";
    return;
  }

  const logoutUrl = new URL(`${issuerBaseUrl}/v2/logout`);
  logoutUrl.searchParams.set("client_id", clientId);
  logoutUrl.searchParams.set("returnTo", `${window.location.origin}/login`);

  window.location.href = logoutUrl.toString();
};
