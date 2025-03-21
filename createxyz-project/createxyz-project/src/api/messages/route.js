async function handler({ roomType }) {
  if (!roomType) {
    return { messages: [] };
  }

  const room = await sql`
    SELECT id FROM rooms 
    WHERE type = ${roomType} 
    LIMIT 1
  `;

  if (!room.length) {
    return { messages: [] };
  }

  const messages = await sql`
    SELECT nickname, content, created_at 
    FROM messages 
    WHERE room_id = ${room[0].id} 
    ORDER BY created_at ASC
  `;

  return { messages };
}