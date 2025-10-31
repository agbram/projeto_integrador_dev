import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRouter from "@/components/PrivateRouter";
import PagesWallpaper from "@/components/PagesWallpaper";
import Header from "@/components/Navigation/Header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sant'Sapore • Central",
  description: "Sistema Central de Gestão da confeitaria Sant'Sapore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        
        <Header />
        <PagesWallpaper />
        <AuthProvider>
        {children}
        </AuthProvider>
        
      </body>
    </html>
  );
}
