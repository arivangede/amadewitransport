import { jwtVerify, SignJWT, type JWTPayload } from "jose";

const secretKey = process.env.JWT_SECRET!;
const secret = new TextEncoder().encode(secretKey);

export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
}
