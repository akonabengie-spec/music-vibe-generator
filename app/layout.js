export const metadata = {
  title: 'ZEE STOCK CORE',
  description: 'Enterprise Resource Management Console',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* The production-grade way to load a universal design framework link on Vercel */}
        <link rel="stylesheet" href="https://jsdelivr.net" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
