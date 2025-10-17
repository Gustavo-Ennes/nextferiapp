import "./global.css";
import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Feriapp",
  description: "Gerenciamento de férias.",
  openGraph: {
    title: "Feriapp",
    description: "Gerenciamento de férias.",
    url: "https://feriapp.ennes.dev",
    siteName: "Feriapp",

    locale: "pt_BR",
    type: "website",
  },
  // Tags para Twitter
  twitter: {
    card: "summary_large_image",
    title: "Feriapp",
    description: "Gerenciamento de férias.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
