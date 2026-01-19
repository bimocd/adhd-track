import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import "@/styles/main.css";

const mainFont = Quicksand({ variable: "--font-main" });
export const metadata: Metadata = { title: "ADHD Tracker", icons: "/favicon.ico" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${mainFont.className} antialiased
        font-semibold
        select-none
        flex justify-center`}
      >
        <NextThemesProvider
          attribute="class"
        >
          {children}
        </NextThemesProvider>
      </body>
    </html>
  );
}
