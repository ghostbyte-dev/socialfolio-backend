import { JWTPayload, jwtVerify, SignJWT } from "npm:jose@5.9.6";

const secret = new TextEncoder().encode("secret-that-no-one-knows");

async function createJWT(
  id: string,
  email: string,
  username: string,
): Promise<string> {
  const jwt = await new SignJWT({ id, email, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("100y")
    .sign(secret);

  return jwt;
}

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
}

export const JwtUtils = { createJWT, verifyJWT };
