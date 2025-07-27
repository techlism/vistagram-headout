import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "./globals.css";

const geistSans = Gabarito({
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Vistagram",
  description: "Welcome to Vistagram!",
  authors: [{ name: "Kundan", url: 'https://techlism.com' }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
