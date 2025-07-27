import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "./globals.css";

const geistSans = Gabarito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Vistagram",
  description: "Welcome to Vistagram!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
