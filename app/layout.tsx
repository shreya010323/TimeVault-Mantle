import "./globals.css";
import { Rubik } from "next/font/google";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // full range
  variable: "--font-rubik", // create a CSS variable
});

export const metadata = { title: "Timelock Piggy Bank" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rubik.variable}>
      <body className="font-rubik">{children}</body>
    </html>
  );
}
