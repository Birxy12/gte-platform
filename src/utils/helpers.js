// =============================================================================
// Constants & Configuration
// =============================================================================

/** @type {Readonly<{ locale: string; avatarBaseUrl: string; deadPatterns: readonly string[]; sampleVideos: readonly string[] }>} */
const CONFIG = Object.freeze({
  locale: "en-US",
  avatarBaseUrl: "https://ui-avatars.com/api/",
  deadPatterns: Object.freeze([
    "njhbnqyamkwlsobqplvm.supabase.co",
    "undefined",
    "null"
  ]),
  sampleVideos: Object.freeze([
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  ])
});

// =============================================================================
// Internal Validation Utilities
// =============================================================================

/**
 * Determines whether a value is a non-empty string.
 * @param {*} value
 * @returns {value is string}
 */
const isNonEmptyString = (value) => typeof value === "string" && value.length > 0;

/**
 * Determines whether a value is a valid, finite number.
 * @param {*} value
 * @returns {value is number}
 */
const isValidNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Validates that a string is a well-formed HTTP(S) URL and not from a known dead domain.
 * @param {string} url
 * @returns {boolean}
 */
const isValidHttpUrl = (url) => {
  if (!isNonEmptyString(url) || !url.startsWith("http")) return false;

  try {
    new URL(url);
  } catch {
    return false;
  }

  return !CONFIG.deadPatterns.some((pattern) => url.includes(pattern));
};

// =============================================================================
// Date & Time
// =============================================================================

/**
 * Formats a timestamp into a human-readable localized date string.
 * Supports Firestore Timestamps, native Date objects, ISO strings, and epoch numbers.
 *
 * @param {Date | import("firebase/firestore").Timestamp | string | number | null | undefined} timestamp
 * @returns {string} Formatted date (e.g., "Aug 30, 2026") or an empty string if invalid.
 *
 * @example
 * formatDate(new Date("2026-08-30")); // "Aug 30, 2026"
 * formatDate({ toDate: () => new Date() }); // "Aug 30, 2026"
 * formatDate(null); // ""
 */
export const formatDate = (timestamp) => {
  if (timestamp == null) return "";

  const date =
    typeof timestamp?.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(CONFIG.locale, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

// =============================================================================
// Text
// =============================================================================

/**
 * Truncates a string to a specified maximum length, appending an ellipsis when truncated.
 *
 * @param {string | null | undefined} text
 * @param {number} [maxLength=100] Maximum character length before truncation.
 * @returns {string} The original or truncated string. Returns an empty string for nullish input.
 *
 * @example
 * truncateText("Hello world", 5); // "Hello..."
 * truncateText("Short text", 100); // "Short text"
 * truncateText(null); // ""
 */
export const truncateText = (text, maxLength = 100) => {
  if (!isNonEmptyString(text) || text.length <= maxLength) {
    return text ?? "";
  }
  return `${text.slice(0, maxLength)}...`;
};

// =============================================================================
// Numbers
// =============================================================================

/**
 * Formats a number using compact notation (e.g., 1.2K, 3.4M, 1B).
 *
 * @param {number | null | undefined} num
 * @returns {string}
 *
 * @example
 * formatNumberCompact(1234);      // "1.2K"
 * formatNumberCompact(3500000);   // "3.5M"
 * formatNumberCompact(null);      // "0"
 */
export const formatNumberCompact = (num) => {
  if (!isValidNumber(num)) return "0";

  return new Intl.NumberFormat(CONFIG.locale, {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num);
};

// =============================================================================
// Identifiers
// =============================================================================

/**
 * Generates a collision-resistant unique identifier.
 * Combines a custom prefix, epoch timestamp, and random base-36 entropy.
 *
 * @param {string} [prefix="id"] - Prefix prepended to the identifier.
 * @returns {string}
 *
 * @example
 * generateId("user"); // "user_1693459200000_a1b2c3d"
 */
export const generateId = (prefix = "id") => {
  const time = Date.now();
  const entropy = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${time}_${entropy}`;
};

// =============================================================================
// Clipboard
// =============================================================================

/**
 * Copies text to the system clipboard.
 * Prefers the modern Clipboard API and falls back to a legacy DOM approach.
 *
 * @param {string} text - The text to copy.
 * @returns {Promise<boolean>} Resolves to `true` on success, `false` on failure.
 *
 * @example
 * const didCopy = await copyToClipboard("Hello world");
 * if (!didCopy) showToast("Copy failed");
 */
export const copyToClipboard = async (text) => {
  if (!isNonEmptyString(text)) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Legacy fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.cssText =
      "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textArea);

    return success;
  } catch (error) {
    console.error("[copyToClipboard] Failed:", error);
    return false;
  }
};

// =============================================================================
// URL Sanitization
// =============================================================================

/**
 * Builds a UI Avatars fallback URL with query parameters.
 * @param {string} [name="User"]
 * @returns {string}
 */
const buildAvatarFallback = (name = "User") => {
  const params = new URLSearchParams({
    name: name || "User",
    background: "0D8ABC",
    color: "fff"
  });
  return `${CONFIG.avatarBaseUrl}?${params}`;
};

/**
 * Sanitizes an avatar URL. Returns a generated initials avatar if the URL is missing,
 * malformed, or points to a known dead domain.
 *
 * @param {string | null | undefined} url
 * @param {string} [name="User"] - Display name used for fallback avatar initials.
 * @returns {string} A valid, reachable avatar URL.
 *
 * @example
 * getValidAvatarUrl(null, "Jane Doe");
 * // "https://ui-avatars.com/api/?name=Jane+Doe&background=0D8ABC&color=fff"
 */
export const getValidAvatarUrl = (url, name = "User") => {
  const fallback = buildAvatarFallback(name);
  return isValidHttpUrl(url) ? url : fallback;
};

/**
 * Sanitizes a video URL. Returns a rotating sample video if the URL is missing,
 * malformed, or points to a known dead domain.
 *
 * @param {string | null | undefined} url
 * @param {number} [index=0] - Determines which sample video to use (modulo rotation).
 * @returns {string} A valid video URL.
 *
 * @example
 * getValidVideoUrl("bad-url", 1);
 * // "https://commondatastorage.googleapis.com/.../ForBiggerEscapes.mp4"
 */
export const getValidVideoUrl = (url, index = 0) => {
  const safeIndex = Math.abs(Math.floor(index));
  const fallback = CONFIG.sampleVideos[safeIndex % CONFIG.sampleVideos.length];
  return isValidHttpUrl(url) ? url : fallback;
};