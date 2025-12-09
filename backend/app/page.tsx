export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🎫 TicketChain API</h1>
      <p>Web3 Ticketing Platform Backend</p>
      <ul>
        <li>
          <a href="/api/docs">📚 API Documentation (Swagger)</a>
        </li>
        <li>
          <a href="/api/health">🏥 Health Check</a>
        </li>
      </ul>
      <hr />
      <h2>Quick Links</h2>
      <ul>
        <li>POST /api/auth/login - Authentication</li>
        <li>GET /api/buyer/events - Browse Events</li>
        <li>POST /api/buyer/purchase - Buy Tickets</li>
        <li>POST /api/organizer/events - Create Event</li>
      </ul>
    </div>
  );
}
