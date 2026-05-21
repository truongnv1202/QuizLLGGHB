import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quiz GGHB Việt Nam",
  description: "Tìm hiểu về Lực lượng Gìn giữ Hòa bình Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
