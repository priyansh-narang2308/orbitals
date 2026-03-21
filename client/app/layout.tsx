import type { Metadata } from "next";
import { Anybody } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const poppins = Anybody({
  weight: ["400"],
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Orbital CLI | The Autonomous Coding Agent",
  description: "A high-performance AI coding agent that lives in your command line. Orbital understands your entire codebase, executes complex refactors, and automates the tedious bits of development so you can stay in flow.",
  icons: {
    icon: '/white.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.className} h-full`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          enableColorScheme={false}
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
