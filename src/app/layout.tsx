import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeVern Studio | Smart Social Media Automation",
  description: "A premium, AI-driven social media management platform.",
  verification: {
    google: "i1ivHik1PnN2SVXr0s_f0r2tX8cJSPaKYs6qbo822XA"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
