import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const aeonik = localFont({
  src: [
    {
      path: "../fonts/Aeonik-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Aeonik-Regular.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Aeonik-Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Aeonik-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Algorithm 26 | FUPRE Class of 2026",
  description:
    "The digital yearbook for the FUPRE Algorithm Class of 2026 — graduates, shared photographs, and the class story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${aeonik.variable} h-full antialiased`}>
      <body className={`${aeonik.className} min-h-full bg-white text-foreground`}>
        {children}
      </body>
    </html>
  );
}
