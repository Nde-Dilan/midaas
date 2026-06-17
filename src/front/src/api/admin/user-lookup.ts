import { adminProvider, type AdminUserItem } from ".";

/**
 * In-memory cache: userId → AdminUserItem
 * Populated once on first call, then reused.
 */
let userCache: Map<string, AdminUserItem> | null = null;
let loadingPromise: Promise<void> | null = null;

/**
 * Fetch all users once and build a lookup map.
 * Subsequent calls return the cached map immediately.
 */
async function ensureCache(): Promise<Map<string, AdminUserItem>> {
  if (userCache) return userCache;

  if (!loadingPromise) {
    loadingPromise = (async () => {
      const { data } = await adminProvider.getUsers();
      const map = new Map<string, AdminUserItem>();
      if (data) {
        data.forEach((u) => map.set(u.id, u));
      }
      userCache = map;
    })();
  }

  await loadingPromise;
  return userCache!;
}

/**
 * Look up user info by user ID.
 * Returns email, full_name, phone_number (or fallbacks).
 */
export async function getUserInfo(userId: string): Promise<{
  email: string;
  full_name: string;
  phone_number: string;
}> {
  try {
    const cache = await ensureCache();
    const user = cache.get(userId);
    if (user) {
      return {
        email: user.email || "",
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
      };
    }
  } catch {
    // Cache failure — return empty
  }
  return { email: "", full_name: "", phone_number: "" };
}

/**
 * Get display label for a user ID — returns email if available, else truncated ID.
 * Used for quick inline display in tables.
 */
export function formatUserId(userId: string, email?: string): string {
  if (email) return email;
  return `${userId.slice(0, 8)}...`;
}
