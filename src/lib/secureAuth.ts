// Secure Cryptographic User Credential & Session Management
// Utilizes Web Crypto API (SubtleCrypto) with PBKDF2-HMAC-SHA256 (100,000 iterations) and 16-byte random salt

export interface SecureUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface StoredUserCredential {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  algo?: "pbkdf2-sha256-100k" | "sha256-salted";
  displayName: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface SecureSession {
  token: string;
  user: SecureUser;
  expiresAt: number;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Fair" | "Good" | "Strong";
  hasMinLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const USERS_STORAGE_KEY = "knowdeep_secure_users";
const SESSION_STORAGE_KEY = "knowdeep_secure_session";
const PBKDF2_ITERATIONS = 100000;

// Converts ArrayBuffer to hexadecimal string
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// Generates a cryptographically random 16-byte salt
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  let salt = "";
  for (let i = 0; i < array.length; i++) {
    salt += array[i].toString(16).padStart(2, "0");
  }
  return salt;
}

// Industry standard PBKDF2-HMAC-SHA256 key derivation with 100,000 rounds
export async function hashPasswordPBKDF2(
  password: string,
  salt: string,
  iterations = PBKDF2_ITERATIONS
): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256 // 32 bytes (256 bits)
  );
  return bufferToHex(derivedBits);
}

// Legacy fallback for backward compatibility
export async function legacyHashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}:knowdeep_secure_salt_v1`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

// Primary password hashing function (defaults to modern PBKDF2)
export async function hashPassword(password: string, salt: string): Promise<string> {
  return hashPasswordPBKDF2(password, salt, PBKDF2_ITERATIONS);
}

// Evaluates password complexity for user feedback
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 6;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if ((hasLower && hasUpper) || (hasLower && hasNumber) || (hasUpper && hasNumber)) score++;
  if ((hasLower || hasUpper) && hasNumber && hasSpecial) score++;

  if (score > 4) score = 4;
  if (!hasMinLength) score = 0;

  const labels: Array<PasswordStrength["label"]> = [
    "Too Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  return {
    score,
    label: labels[score] || "Weak",
    hasMinLength,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
  };
}

// Safely retrieves stored user credentials
export function getStoredUsers(): StoredUserCredential[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read user credentials store:", err);
    return [];
  }
}

// Saves updated list of credentials to secure storage
function saveStoredUsers(users: StoredUserCredential[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save user credentials store:", err);
  }
}

// Registers a new user with PBKDF2 password derivation
export async function registerSecureUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: SecureUser | null; error: Error | null }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { user: null, error: new Error("Please provide a valid email address.") };
  }
  if (!password || password.length < 6) {
    return { user: null, error: new Error("Password must be at least 6 characters.") };
  }

  const existing = getStoredUsers();
  const duplicate = existing.find((u) => u.email.toLowerCase() === cleanEmail);
  if (duplicate) {
    return { user: null, error: new Error("An account with this email already exists. Please sign in.") };
  }

  const salt = generateSalt();
  const passwordHash = await hashPasswordPBKDF2(password, salt);
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const name = displayName?.trim() || cleanEmail.split("@")[0] || "User";

  const newRecord: StoredUserCredential = {
    id: userId,
    email: cleanEmail,
    passwordHash,
    salt,
    algo: "pbkdf2-sha256-100k",
    displayName: name,
    createdAt: now,
    lastLoginAt: now,
  };

  existing.push(newRecord);
  saveStoredUsers(existing);

  const safeUser: SecureUser = {
    id: userId,
    email: cleanEmail,
    displayName: name,
    createdAt: now,
    lastLoginAt: now,
  };

  return { user: safeUser, error: null };
}

// Authenticates user against stored credential with auto-upgrade to PBKDF2
export async function authenticateSecureUser(
  email: string,
  password: string
): Promise<{ user: SecureUser | null; error: Error | null }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { user: null, error: new Error("Please enter your email.") };
  }
  if (!password) {
    return { user: null, error: new Error("Please enter your password.") };
  }

  const existing = getStoredUsers();
  const recordIndex = existing.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (recordIndex === -1) {
    return { user: null, error: new Error("Invalid email or password. Please try again.") };
  }

  const record = existing[recordIndex];

  // 1. Check with PBKDF2 if record has pbkdf2 algo or default
  let isMatch = false;
  if (record.algo === "pbkdf2-sha256-100k") {
    const inputHash = await hashPasswordPBKDF2(password, record.salt);
    isMatch = inputHash === record.passwordHash;
  } else {
    // Check PBKDF2 first
    const pbkdf2Hash = await hashPasswordPBKDF2(password, record.salt);
    if (pbkdf2Hash === record.passwordHash) {
      isMatch = true;
      record.algo = "pbkdf2-sha256-100k";
    } else {
      // Check legacy SHA-256 hash
      const legacyHash = await legacyHashPassword(password, record.salt);
      if (legacyHash === record.passwordHash) {
        isMatch = true;
        // Seamlessly upgrade to PBKDF2 with fresh salt
        record.salt = generateSalt();
        record.passwordHash = await hashPasswordPBKDF2(password, record.salt);
        record.algo = "pbkdf2-sha256-100k";
      }
    }
  }

  if (!isMatch) {
    return { user: null, error: new Error("Invalid email or password. Please try again.") };
  }

  // Update last login
  record.lastLoginAt = new Date().toISOString();
  existing[recordIndex] = record;
  saveStoredUsers(existing);

  const safeUser: SecureUser = {
    id: record.id,
    email: record.email,
    displayName: record.displayName,
    createdAt: record.createdAt,
    lastLoginAt: record.lastLoginAt,
  };

  return { user: safeUser, error: null };
}

// Allows authenticated user to update their password securely
export async function updateSecureUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error: Error | null }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!currentPassword) {
    return { success: false, error: new Error("Current password is required.") };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: new Error("New password must be at least 6 characters.") };
  }

  const existing = getStoredUsers();
  const recordIndex = existing.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (recordIndex === -1) {
    return { success: false, error: new Error("Account not found.") };
  }

  const record = existing[recordIndex];

  // Verify current password
  let currentValid = false;
  if (record.algo === "pbkdf2-sha256-100k") {
    const hash = await hashPasswordPBKDF2(currentPassword, record.salt);
    currentValid = hash === record.passwordHash;
  } else {
    const legacy = await legacyHashPassword(currentPassword, record.salt);
    const modern = await hashPasswordPBKDF2(currentPassword, record.salt);
    currentValid = legacy === record.passwordHash || modern === record.passwordHash;
  }

  if (!currentValid) {
    return { success: false, error: new Error("Current password is incorrect.") };
  }

  // Generate new salt and new PBKDF2 hash
  const newSalt = generateSalt();
  const newHash = await hashPasswordPBKDF2(newPassword, newSalt);

  record.salt = newSalt;
  record.passwordHash = newHash;
  record.algo = "pbkdf2-sha256-100k";
  existing[recordIndex] = record;
  saveStoredUsers(existing);

  return { success: true, error: null };
}

// Session Management
export function saveActiveSession(user: SecureUser, rememberMe = true): SecureSession {
  const token = crypto.randomUUID();
  // Session duration: 30 days if rememberMe, otherwise 24 hours
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const session: SecureSession = {
    token,
    user,
    expiresAt: Date.now() + durationMs,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.removeItem("guest_mode");
    } catch (e) {
      console.warn("Could not persist session:", e);
    }
  }

  return session;
}

export function getActiveSession(): SecureSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: SecureSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (err) {
    console.warn("Failed to retrieve active session:", err);
    return null;
  }
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem("guest_mode");
  } catch (err) {
    console.warn("Failed to clear session:", err);
  }
}
