import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tirta Siaga Bantul",
  description: "Website GIS untuk WMK Pemadam Kebakaran Bantul",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://mt0.google.com" />
        <link rel="dns-prefetch" href="https://mt0.google.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

