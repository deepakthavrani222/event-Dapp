export const metadata = {
  title: 'TicketChain API',
  description: 'Web3 Ticketing Platform Backend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
