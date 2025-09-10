import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "5/3/1 Tracker - Strength Training Made Simple",
  description: "Track your 5/3/1 Wendler program with automatic calculations and progress monitoring",
  keywords: "5/3/1, Wendler, strength training, powerlifting, workout tracker",
  authors: [{ name: "5/3/1 Tracker" }],
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#ff6b35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons" 
          rel="stylesheet" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ff6b35" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
      </body>
    </html>
  );
}