
import { sha256 } from './utils';

export async function normalizeUrl(inputUrl: string): Promise<{ url: string; normalized: string; hash: string }> {
  let urlStr = inputUrl.trim();
  
  // Ensure protocol
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = 'https://' + urlStr;
  }

  try {
    const urlObj = new URL(urlStr);

    // Enforce HTTPS
    if (urlObj.protocol === 'http:') {
      urlObj.protocol = 'https:';
    }

    // Lowercase hostname
    let hostname = urlObj.hostname.toLowerCase();

    // Remove www.
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    urlObj.hostname = hostname;

    // Remove trailing slash from pathname
    if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }

    // Sort query params
    const params = new URLSearchParams(urlObj.search);
    const sortedKeys = Array.from(params.keys()).sort();
    const newParams = new URLSearchParams();
    sortedKeys.forEach(key => {
      // Remove UTM params
      if (!key.startsWith('utm_')) {
        const vals = params.getAll(key);
        vals.forEach(v => newParams.append(key, v));
      }
    });
    urlObj.search = newParams.toString();

    // Remove hash
    urlObj.hash = '';

    const normalized = urlObj.toString();
    const hash = await sha256(normalized);

    return {
      url: urlStr, // Original (but with https)
      normalized,
      hash
    };
  } catch (e) {
    throw new Error('Invalid URL provided');
  }
}
