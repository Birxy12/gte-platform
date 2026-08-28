/**
 * Format timestamp to friendly readable date/time
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

/**
 * Truncate long text strings
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || "";
  return text.substring(0, maxLength) + "...";
};

/**
 * Format numbers with compact suffixes (e.g. 1.2K, 3.4M)
 */
export const formatNumberCompact = (num) => {
  if (!num || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num);
};

/**
 * Generate a safe unique ID
 */
export const generateId = (prefix = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
};

/**
 * Safely sanitize avatar URL, intercepting dead/unresolvable domains
 */
export const getValidAvatarUrl = (url, name = "User") => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0D8ABC&color=fff`;
  if (!url || typeof url !== 'string' || !url.startsWith("http")) return fallback;
  if (url.includes("njhbnqyamkwlsobqplvm.supabase.co") || url.includes("undefined") || url.includes("null")) {
    return fallback;
  }
  return url;
};

