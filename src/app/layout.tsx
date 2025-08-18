import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/theme/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import NextTopLoader from "nextjs-toploader";
import { getLocale, getMessages } from "next-intl/server";

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bezs",
  description: "Bezs is a all in one platform for all your needs",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const message = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${dmSans.className} antialiased`}>
        <NextIntlClientProvider messages={message}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="zinc-dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <NextTopLoader showSpinner={false} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
