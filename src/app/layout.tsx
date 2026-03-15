import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Ventryx — Startup Idea Validation",
    description:
        "A structured decision system that helps founders validate startup ideas before investing time and money. Get a Viability Index, risk flags, and a 14-day validation plan.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                {children}
            </body>
        </html>
    );
}
