/**
 * HappyGen Studio — Intelligent Error Handler
 * Formats errors for production (concise + actionable + report link)
 * while preserving full technical stack traces for development.
 */

import { Capacitor } from '@capacitor/core';

export function isDevEnvironment() {
  // If explicitly flagged in localStorage (e.g. for testing)
  if (typeof window !== 'undefined' && localStorage.getItem('happygen_dev_mode') === 'true') {
    return true;
  }

  // Native mobile app (Android / iOS APK) is NEVER the laptop dev environment
  try {
    if (Capacitor && typeof Capacitor.isNativePlatform === 'function' && Capacitor.isNativePlatform()) {
      return false;
    }
  } catch {
    // ignore
  }

  // Production build bundle (vite build output)
  if (import.meta.env && import.meta.env.PROD) {
    return false;
  }

  // Active Vite development server on desktop (npm run dev / vite)
  if (import.meta.env && import.meta.env.DEV) {
    return true;
  }

  // Laptop local development server checks (desktop web only)
  if (typeof window !== 'undefined') {
    const hostname = window.location?.hostname || '';
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') || 
      hostname.endsWith('.local')
    ) {
      return true;
    }
  }
  return false;
}

export function parseAppError(rawError) {
  if (!rawError) return null;

  let rawMessage = '';
  if (typeof rawError === 'string') {
    rawMessage = rawError;
  } else if (typeof rawError?.message === 'string') {
    rawMessage = rawError.message;
  } else if (typeof rawError?.error === 'string') {
    rawMessage = rawError.error;
  } else if (typeof rawError?.detail === 'string') {
    rawMessage = rawError.detail;
  } else {
    try {
      rawMessage = JSON.stringify(rawError) || String(rawError);
    } catch {
      rawMessage = String(rawError);
    }
  }

  if (!rawMessage || rawMessage.trim() === '' || rawMessage === '{}') {
    rawMessage = 'Inference or connection error. Please verify backend server and settings.';
  }
    
  const rawStack = typeof rawError?.stack === 'string' ? rawError.stack : '';
  const isDev = isDevEnvironment();
  const lowerMsg = rawMessage.toLowerCase();

  // 1. GPU Out of Memory (OOM)
  if (
    lowerMsg.includes('out of memory') || 
    lowerMsg.includes('cuda out of memory') || 
    lowerMsg.includes('cuda oom') || 
    lowerMsg.includes('allocation on device') ||
    lowerMsg.includes('torch.cuda.outofmemoryerror')
  ) {
    return {
      type: 'gpu_oom',
      title: 'GPU Memory Limit Reached',
      message: 'The graphics processor ran out of memory while rendering this image.',
      solution: 'Lower the resolution (e.g., 512×768), reduce Batch Count to 1, or lower Steps to 15–20.',
      canUserFix: true,
      actionType: 'none',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 2. Backend Server Disconnected / Unreachable
  if (
    lowerMsg.includes('failed to fetch') || 
    lowerMsg.includes('networkerror') || 
    lowerMsg.includes('connection refused') || 
    lowerMsg.includes('err_connection_refused') ||
    lowerMsg.includes('econnrefused') ||
    (lowerMsg.includes('backend error') && (lowerMsg.includes('connection') || lowerMsg.includes('dropped') || lowerMsg.includes('failed')))
  ) {
    return {
      type: 'backend_offline',
      title: 'AI Server Disconnected',
      message: 'Could not communicate with your inference backend server.',
      solution: 'Make sure your Google Colab notebook or local GPU backend is running, and verify the backend URL in Settings.',
      canUserFix: true,
      actionType: 'backend',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 3. Timeout / Cloudflare 524 / 504
  if (
    lowerMsg.includes('524') || 
    lowerMsg.includes('504') || 
    lowerMsg.includes('gateway timeout') || 
    lowerMsg.includes('timed out') || 
    lowerMsg.includes('timeout after 100s')
  ) {
    return {
      type: 'timeout',
      title: 'Generation Timed Out',
      message: 'The AI server took longer than expected to process your request.',
      solution: 'If you just selected a new model, the server may still be caching it. Please wait 1–2 minutes and try again.',
      canUserFix: true,
      actionType: 'none',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 4. CivitAI Rate Limit (429)
  if (lowerMsg.includes('429') || lowerMsg.includes('too many requests') || lowerMsg.includes('rate limit')) {
    return {
      type: 'rate_limit',
      title: 'CivitAI Busy (Rate Limit)',
      message: 'CivitAI servers are receiving too many requests right now.',
      solution: 'Please pause for 30–60 seconds before searching or downloading more models.',
      canUserFix: true,
      actionType: 'none',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 5. CivitAI Authentication Required (401 / 403)
  if (
    lowerMsg.includes('civitai api error: 401') || 
    lowerMsg.includes('civitai api error: 403') || 
    lowerMsg.includes('civitai_api_key') ||
    (lowerMsg.includes('unauthorized') && lowerMsg.includes('civitai'))
  ) {
    return {
      type: 'auth_required',
      title: 'CivitAI Key Required',
      message: 'This checkpoint or LoRA requires an authenticated CivitAI account.',
      solution: 'Add your free CivitAI API Key in Settings > API Keys to download members-only models.',
      canUserFix: true,
      actionType: 'settings',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 6. Content Safety / Adult Mode Blocked
  if (
    lowerMsg.includes('adult mode is disabled') || 
    lowerMsg.includes('+18 switch') || 
    lowerMsg.includes('nsfw') ||
    lowerMsg.includes('restricted term')
  ) {
    return {
      type: 'content_safety',
      title: 'Content Filter Warning',
      message: 'Your prompt contains restricted or adult terms while 18+ mode is disabled.',
      solution: 'Enable 18+ Mode in Settings (Vault PIN required) or remove explicit keywords.',
      canUserFix: true,
      actionType: 'settings',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 7. Missing Input (Prompt, Image, or Mask)
  if (
    lowerMsg.includes('prompt') && (lowerMsg.includes('enter') || lowerMsg.includes('empty') || lowerMsg.includes('provide') || lowerMsg.includes('describe') || lowerMsg.includes('missing') || lowerMsg.includes('required')) ||
    lowerMsg.includes('please upload a source image') || 
    lowerMsg.includes('please draw a mask') || 
    lowerMsg.includes('upload a base image') ||
    lowerMsg.includes('no image selected')
  ) {
    const isPrompt = lowerMsg.includes('prompt');
    const isMask = lowerMsg.includes('mask');
    return {
      type: 'missing_input',
      title: isPrompt ? 'Prompt Required' : (isMask ? 'Mask Required' : 'Image Required'),
      message: rawMessage,
      solution: isPrompt 
        ? 'Type a description of the image you want to generate in the prompt box above, or choose from the quick tag suggestions.'
        : (isMask 
          ? 'Use the brush tool to highlight the area you want to edit or replace.' 
          : 'Upload a source image from your device before continuing.'),
      canUserFix: true,
      actionType: 'none',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 8. Quality warning (e.g. corrupted flat image)
  if (lowerMsg.includes('quality warning') || lowerMsg.includes('suspiciously small')) {
    return {
      type: 'quality_warning',
      title: 'Render Quality Alert',
      message: rawMessage.replace('⚠️ Quality Warning: ', ''),
      solution: 'If using SDXL Lightning, use Steps=4 and CFG=1.5. Check that your LoRAs match your base model architecture.',
      canUserFix: true,
      actionType: 'none',
      rawError: rawMessage,
      rawStack,
      isDev
    };
  }

  // 9. UNKNOWN / BEYOND USER CAPABILITY (Internal Server Crash, Syntax Error, Unhandled Exception)
  return {
    type: 'unknown',
    title: 'Unexpected Application Error',
    message: isDev ? rawMessage : 'An unexpected internal issue prevented this task from completing.',
    solution: 'This problem is beyond your device settings. Please report it so our developer can investigate and resolve it.',
    canUserFix: false,
    actionType: 'report',
    rawError: rawMessage,
    rawStack,
    isDev
  };
}
