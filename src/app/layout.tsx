// src/app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.css";
import MainLayout from '@/components/layout/MainLayout';

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
      <body className="antialiased">
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
