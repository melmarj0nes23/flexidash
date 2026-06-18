export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Generate a random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import the password as key material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  // Derive 256 bits (32 bytes) of key using PBKDF2 with 100000 iterations of SHA-256
  const iterations = 100000;
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const saltArray = Array.from(salt);
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format: pbkdf2:sha256:iterations:saltHex:hashHex
  return `pbkdf2:sha256:${iterations}:${saltHex}:${hashHex}`;
}

// Legacy SHA-256 for backward compatibility checks
async function legacyHashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const pepper = process.env.AUTH_SECRET || "default_secret";
  const data = encoder.encode(password + pepper);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string comparison to mitigate timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // To prevent early exit timing attacks on length mismatch,
    // we still do a comparison of 'a' against itself
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyPassword(password: string, hash: string): Promise<{ isValid: boolean, needsUpgrade: boolean }> {
  // If it's a legacy SHA-256 hash (64 chars hex string with no colons)
  if (!hash.includes(':') && hash.length === 64) {
    const computedLegacyHash = await legacyHashPassword(password);
    const isValid = constantTimeEqual(computedLegacyHash, hash);
    return { isValid, needsUpgrade: isValid }; // if valid, it needs upgrade
  }
  
  // New PBKDF2 hash parsing: pbkdf2:sha256:100000:saltHex:hashHex
  const parts = hash.split(':');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2') {
    return { isValid: false, needsUpgrade: false };
  }
  
  const iterations = parseInt(parts[2], 10);
  const saltHex = parts[3];
  const storedHashHex = parts[4];
  
  // Convert saltHex to Uint8Array
  const saltBytes = saltHex.match(/.{1,2}/g);
  if (!saltBytes) return { isValid: false, needsUpgrade: false };
  const salt = new Uint8Array(saltBytes.map(byte => parseInt(byte, 16)));
  
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const isValid = constantTimeEqual(computedHashHex, storedHashHex);
  
  return { isValid, needsUpgrade: false };
}
