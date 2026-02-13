import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, background: "#0b0b0f" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}