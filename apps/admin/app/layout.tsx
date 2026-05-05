import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Georgia, serif",
          background: "#f7f3e8",
          color: "#16324f"
        }}
      >
        {children}
      </body>
    </html>
  );
}
