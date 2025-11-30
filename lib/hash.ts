
export async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(message)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashIpUa(ip: string, ua: string): Promise<string> {
    const data = `${ip}|${ua}`;
    // In a real app, use process.env.SALT
    const salt = 'production_salt_value_12345'; 
    return hmacSha256(data, salt);
}
