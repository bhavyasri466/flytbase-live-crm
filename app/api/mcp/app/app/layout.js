
export const metadata = {
  title: "FlytBase Live CRM",
  description: "Live account intelligence dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#ffffff" }}>
        {children}
      </body>
    </html>
  );
}
