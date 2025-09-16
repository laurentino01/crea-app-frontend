export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      {" "}
      <body>{children}</body>
    </html>
  );
}
