import "./globals.css";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import Navbar from "../components/navbar";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={ibmPlexSansThai.className}>
        <Navbar>{children}</Navbar>
      </body>
    </html>
  );
}
