// src/app/layout.tsx (Replace the content entirely)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import MainLayout from '@/components/layout/MainLayout'; // Import the new wrapper

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", 
});

export const metadata: Metadata = {
  title: "Vauria Frontend", 
  description: "Crafted for Queens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {/* Render the client-side MainLayout wrapper */}
        <MainLayout>
            {children}
        </MainLayout>
      </body>
    </html>
  );
}