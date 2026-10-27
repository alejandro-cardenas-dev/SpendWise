import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "SpendWise",
  description: "Personal finance tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}