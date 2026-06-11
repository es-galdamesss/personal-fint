import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fint — Presupuesto Personal",
  description: "Aplicación de control de presupuesto personal",
};

const themeInitScript = `
(function() {
  try {
    var P = "fint:v1:";
    var t = localStorage.getItem(P + "theme") || "light";
    var f = localStorage.getItem(P + "fontSize") || "normal";
    var c = localStorage.getItem(P + "contrast") || "normal";
    var r = document.documentElement;
    r.classList.add(t);
    if (c === "high") r.classList.add("high-contrast");
    if (f === "large") r.classList.add("large-font");
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col grain">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
