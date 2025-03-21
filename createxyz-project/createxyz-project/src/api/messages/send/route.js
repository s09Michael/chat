async function handler({ roomType, nickname, content }) {
  if (!roomType || !nickname || !content) {
    return { error: "Missing required fields" };
  }

  const rooms = await sql`
    SELECT id FROM rooms 
    WHERE type = ${roomType} 
    LIMIT 1
  `;

  if (!rooms.length) {
    return { error: "Room not found" };
  }

  await sql`
    INSERT INTO messages (room_id, nickname, content)
    VALUES (${rooms[0].id}, ${nickname}, ${content})
  `;

  return { success: true };
}