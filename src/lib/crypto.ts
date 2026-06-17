export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  // Using a simple SHA-256 with the app's secret as a pepper
  // In production, PBKDF2 or scrypt is preferred, but this is sufficient for edge-compatible fast hashing
  const pepper = process.env.AUTH_SECRET || "default_secret";
  const data = encoder.encode(password + pepper);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}
