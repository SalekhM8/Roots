/**
 * IPv4 allowlist with CIDR support.
 *
 * Used to authenticate inbound provider webhooks (currently Viva, which does
 * not sign webhook bodies — IP allowlist is the documented source-of-trust
 * for authenticating the POST sender).
 *
 * Scope: IPv4 only. Viva publishes IPv4-only ranges. If a future provider
 * ships IPv6 we'll add a separate `isIpV6InAllowlist` rather than overloading
 * this one.
 */

/** Parse a dotted-quad IPv4 string into a uint32, or null if malformed. */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    // >>> 0 keeps the result as an unsigned 32-bit integer.
    acc = ((acc << 8) | n) >>> 0;
  }
  return acc >>> 0;
}

interface CidrRange {
  network: number;
  mask: number;
}

/** Parse "1.2.3.0/24" or "1.2.3.4" — bare IPs are treated as /32. */
function parseCidr(entry: string): CidrRange | null {
  const [addr, bitsStr] = entry.split("/");
  const ip = ipv4ToInt(addr);
  if (ip === null) return null;
  const bits = bitsStr === undefined ? 32 : Number(bitsStr);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  // A /0 mask is `0`, /32 is `0xffffffff`. Avoid (1<<32) which is 0 on JS ints.
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  const network = (ip & mask) >>> 0;
  return { network, mask };
}

/**
 * Returns true if `candidateIp` falls inside any of the allowlisted entries.
 * Entries may be bare IPs ("1.2.3.4") or CIDR ranges ("1.2.3.0/24").
 *
 * Malformed entries in the allowlist are silently skipped — this is a
 * boundary helper and we'd rather fail closed (deny) on a typo than let it
 * crash the webhook handler. Callers should log when no match is found so
 * misconfiguration is visible.
 */
export function isIpAllowed(
  candidateIp: string,
  allowlist: readonly string[],
): boolean {
  const candidate = ipv4ToInt(candidateIp);
  if (candidate === null) return false;

  for (const entry of allowlist) {
    const range = parseCidr(entry);
    if (range === null) continue;
    if ((candidate & range.mask) >>> 0 === range.network) return true;
  }
  return false;
}

/**
 * Extract the originating client IP from a Next.js request.
 *
 * On Vercel (and most proxies) the connecting socket IP is the proxy itself,
 * so we trust the leftmost entry in `x-forwarded-for`. Falls back to
 * `x-real-ip` and finally to the raw header bag.
 *
 * NOTE: This trusts the forwarding header. That's safe behind Vercel's edge
 * (which strips/normalises XFF) — but if you ever expose this directly to
 * the public internet without a trusted proxy, an attacker can spoof XFF and
 * bypass the allowlist. The Viva webhook route is always behind Vercel.
 */
export function clientIpFromHeaders(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    // XFF is a comma-separated list — leftmost is the originating client.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}
