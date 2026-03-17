/**
 * Dictionary mapping provider IDs to their actual external affiliate URLs.
 * Provider IDs should be slugified (lowercase, no spaces).
 */
export const AFFILIATE_LINKS: Record<string, string> = {
  wise: 'https://wise.com/?ref=remitai',
  remitly: 'https://remitly.com/?ref=remitai',
  worldremit: 'https://worldremit.com/?ref=remitai',
  lemfi: 'https://lemfi.com/?ref=remitai',
  taptapsend: 'https://taptapsend.com/?ref=remitai',
};

/**
 * Fallback URL if a provider is not found.
 */
export const FALLBACK_URL = 'https://remitaiapp.com';
