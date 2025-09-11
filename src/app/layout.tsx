import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "5/3/1 Tracker - Strength Training Made Simple",
  description: "Track your 5/3/1 Wendler program with automatic calculations and progress monitoring",
  keywords: "5/3/1, Wendler, strength training, powerlifting, workout tracker",
  authors: [{ name: "5/3/1 Tracker" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#4CAF50",
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
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ 
        backgroundColor: '#121212',
        color: '#ffffff',
        margin: 0,
        padding: 0,
        fontFamily: 'Roboto, sans-serif'
      }}>
        {children}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
      </body>
    </html>
  );
}