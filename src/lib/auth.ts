import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const CUSTOMER_COOKIE = 'oostream_customer_session';
const ADMIN_COOKIE = 'oostream_admin_auth';
const RESELLER_COOKIE = 'oostream_reseller_auth';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days for customers
const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours for admin
const RESELLER_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours for resellers

// Known resellers and their env var names
const RESELLERS: Record<string, string> = {
  'Shun': 'RESELLER_SHUN_PASSWORD',
  'Prime': 'RESELLER_PRIME_PASSWORD',
};

export interface ResellerSession {
  reseller: string;
  expires: number;
}

export interface CustomerSession {
  customerId: string;
  email: string;
  name: string;
  type: 'customer' | 'admin';
}

// Get JWT secret as Uint8Array
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return new TextEncoder().encode(secret);
}

// Create customer JWT token
export async function createCustomerToken(session: CustomerSession): Promise<string> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());

  return token;
}

// Verify customer JWT token
export async function verifyCustomerToken(token: string): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

// Get current customer session from cookie
export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CUSTOMER_COOKIE);

  if (!sessionCookie) return null;

  return verifyCustomerToken(sessionCookie.value);
}

// Set customer session cookie
export async function setCustomerSession(session: CustomerSession): Promise<void> {
  const token = await createCustomerToken(session);
  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

// Clear customer session
export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

// Admin auth (same pattern as CRM)
export async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(ADMIN_COOKIE);

  if (!authCookie) return false;

  try {
    const { token, expires } = JSON.parse(authCookie.value);
    if (Date.now() > expires) return false;
    return token === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function setAdminCookie(password: string): Promise<boolean> {
  if (password !== process.env.ADMIN_PASSWORD) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, JSON.stringify({
    token: password,
    expires: Date.now() + ADMIN_SESSION_DURATION,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_DURATION / 1000,
  });

  return true;
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

// Check if user is authenticated (customer or admin)
export async function isAuthenticated(): Promise<{ authenticated: boolean; type?: 'customer' | 'admin'; session?: CustomerSession }> {
  // Check customer session first
  const customerSession = await getCustomerSession();
  if (customerSession) {
    return { authenticated: true, type: customerSession.type, session: customerSession };
  }

  // Check admin auth
  const isAdmin = await verifyAdminAuth();
  if (isAdmin) {
    return { authenticated: true, type: 'admin' };
  }

  return { authenticated: false };
}

// Reseller auth
export async function verifyResellerAuth(): Promise<ResellerSession | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(RESELLER_COOKIE);

  if (!authCookie) return null;

  try {
    const session: ResellerSession = JSON.parse(authCookie.value);
    if (Date.now() > session.expires) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getResellerSession(): Promise<ResellerSession | null> {
  return verifyResellerAuth();
}

export async function setResellerCookie(reseller: string, password: string): Promise<boolean> {
  const envVar = RESELLERS[reseller];
  if (!envVar) return false;

  const correctPassword = process.env[envVar];
  if (!correctPassword || password !== correctPassword) {
    return false;
  }

  const cookieStore = await cookies();
  const session: ResellerSession = {
    reseller,
    expires: Date.now() + RESELLER_SESSION_DURATION,
  };

  cookieStore.set(RESELLER_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: RESELLER_SESSION_DURATION / 1000,
  });

  return true;
}

export async function clearResellerCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(RESELLER_COOKIE);
}

export function getAvailableResellers(): string[] {
  return Object.keys(RESELLERS);
}
