/**
 * Linkify utility - converts URLs in text to clickable links
 * Similar to WhatsApp's link detection with URL preview
 */

import { ExternalLink, Link2 } from 'lucide-react';

// URL regex pattern - matches http, https, and www URLs
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|www\.[^\s<]+[^<.,:;"')\]\s])/gi;

/**
 * Extract domain from URL for display
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.substring(0, 30);
  }
};

/**
 * Parse text and return array of React elements with clickable links
 * @param {string} text - The message text to parse
 * @param {string} linkClassName - Additional classes for link styling
 * @returns {Array} Array of text and link elements
 */
const parseLinks = (text, linkClassName = '') => {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Extract URL and ensure it has protocol
    let url = match[0];
    const fullUrl = url.startsWith('http') ? url : 'https://' + url;
    const domain = extractDomain(url);

    // Add the styled link element - WhatsApp style
    parts.push(
      <a
        key={`link-${match.index}`}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`text-blue-600 hover:text-blue-800 underline underline-offset-2 hover:no-underline inline-flex items-center gap-1 ${linkClassName}`}
        title={url}
      >
        <Link2 className="w-3.5 h-3.5 inline-block flex-shrink-0" />
        <span className="break-all">{domain}</span>
        <ExternalLink className="w-3 h-3 inline-block flex-shrink-0 opacity-60" />
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no URLs found, return original text
  if (parts.length === 0) {
    return text;
  }

  return parts;
};

/**
 * Check if text contains only URL(s) and no other text
 * @param {string} text - Text to check
 * @returns {boolean}
 */
const isOnlyUrl = (text) => {
  if (!text) return false;
  const cleanText = text.trim();
  URL_REGEX.lastIndex = 0;
  const match = URL_REGEX.exec(cleanText);
  return match && match[0].length === cleanText.length;
};

/**
 * Component to render text with clickable links
 * When the message is only a URL, shows a rich link card like WhatsApp
 */
export function LinkifiedText({ text, className = '', linkClassName = '' }) {
  const trimmedText = text?.trim();
  
  // If message is ONLY a URL, show as a rich link card
  if (isOnlyUrl(trimmedText)) {
    const url = trimmedText.startsWith('http') ? trimmedText : `https://${trimmedText}`;
    const domain = extractDomain(trimmedText);
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`block p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all group ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {domain}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {trimmedText.length > 60 ? trimmedText.substring(0, 60) + '...' : trimmedText}
            </p>
            <div className="flex items-center gap-1 mt-1.5 text-blue-600">
              <span className="text-xs font-medium">Open link</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </a>
    );
  }

  // Otherwise parse links within text
  const content = parseLinks(text, linkClassName);
  
  return (
    <span className={`${className}`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
      {content}
    </span>
  );
}
