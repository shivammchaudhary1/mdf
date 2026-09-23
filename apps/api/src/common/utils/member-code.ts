const INDIA_OFFSET_MS = 330 * 60_000;

export function memberCodeFor(accountId: string, createdAt = new Date()) {
  if (!/^[a-fA-F0-9]{24}$/.test(accountId)) throw new Error("A valid account id is required to create a member code.");

  const india = new Date(createdAt.getTime() + INDIA_OFFSET_MS);
  const year = india.getUTCFullYear();
  const compactId = BigInt(`0x${accountId}`).toString(36).toUpperCase();

  return `MDF-${year}/${compactId}`;
}
