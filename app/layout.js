export const metadata = {
  title: "FlytBase Live CRM",
  description: "Evidence-based live account CRM"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}
