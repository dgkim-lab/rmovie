import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "rmovie",
  description: "A random destination selected from Google Sheets",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
