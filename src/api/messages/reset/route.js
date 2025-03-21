async function handler() {
  const rooms = await sql`
    SELECT id FROM rooms 
    WHERE type = 'permanent' 
    LIMIT 1
  `;

  if (!rooms.length) {
    return { error: "Room not found" };
  }

  await sql`
    DELETE FROM messages 
    WHERE room_id = ${rooms[0].id}
  `;

  return { success: true };
}