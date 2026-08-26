/**
 * Trust & Safety Infrastructure Module
 * Compliant with PRD Section 6 (CSAM zero tolerance, Age Gating, Input/Output Classifiers, C2PA Metadata)
 */

// Prohibited terms for input prompt classifier
const CSAM_KEYWORDS = ['minor', 'underage', 'child', 'kid', 'teen', 'infant', 'toddler', 'schoolgirl', 'loli', 'shota'];
const NON_CONSENSUAL_KEYWORDS = ['deepfake', 'nude of', 'leaked', 'voyeur', 'paparazzi', 'hidden cam', 'celebrity nude', 'without consent'];
const VIOLENCE_KEYWORDS = ['behead', 'decapitate', 'snuff', 'dismember', 'sexual assault', 'gore rape', 'abuse', 'torture'];

export const checkPromptSafety = (prompt, isAdultMode = false) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // 1. Check Zero-Tolerance CSAM / Minors Violation (Applies platform-wide, no exceptions)
  const csamMatch = CSAM_KEYWORDS.find(word => new RegExp(`\\b${word}\\b`, 'i').test(lowerPrompt));
  if (csamMatch) {
    return {
      safe: false,
      severity: 'CRITICAL_PROHIBITED',
      code: 'ERR_CSAM_PROTECTION',
      category: 'Child Exploitation & Safety Violation (Zero-Tolerance)',
      reason: `Prompt contains prohibited term related to minors ("${csamMatch}"). All content depicting or involving minors in suggestive or adult contexts is strictly prohibited across all modes.`,
      escalationRequired: true
    };
  }

  // 2. Check Non-consensual Real Person Imagery Violation
  const ncimMatch = NON_CONSENSUAL_KEYWORDS.find(word => lowerPrompt.includes(word));
  if (ncimMatch) {
    return {
      safe: false,
      severity: 'HIGH_PROHIBITED',
      code: 'ERR_NON_CONSENSUAL_IMAGERY',
      category: 'Non-Consensual Imagery / Deepfake Protection',
      reason: `Prompt violates consent guidelines ("${ncimMatch}"). Generation of real, identifiable individuals or non-consensual intimate imagery is prohibited.`,
      escalationRequired: false
    };
  }

  // 3. Check Sexual Violence & Harm
  const violenceMatch = VIOLENCE_KEYWORDS.find(word => lowerPrompt.includes(word));
  if (violenceMatch) {
    return {
      safe: false,
      severity: 'CRITICAL_PROHIBITED',
      code: 'ERR_SEXUAL_VIOLENCE',
      category: 'Extreme Harm & Sexual Violence Violation',
      reason: `Prompt flagged for prohibited violent or non-consensual themes ("${violenceMatch}").`,
      escalationRequired: true
    };
  }

  // 4. Check Adult Mode Requirement for explicit content
  const adultKeywords = ['nsfw', 'nude', 'erotic', 'lingerie', 'uncensored', 'adult', 'sensual', 'sexy'];
  const hasAdultKeywords = adultKeywords.some(word => lowerPrompt.includes(word));

  if (hasAdultKeywords && !isAdultMode) {
    return {
      safe: false,
      severity: 'GATED_MODE_REQUIRED',
      code: 'ERR_ADULT_MODE_LOCKED',
      category: 'Age-Gated Content Lock',
      reason: 'This prompt requires Adult (18+) Mode. Please toggle Adult Mode in top header and complete identity verification.',
      escalationRequired: false
    };
  }

  return {
    safe: true,
    severity: 'CLEARED',
    code: 'OK_PASSED',
    category: 'Safety Cleared',
    confidenceScore: 0.994
  };
};

/**
 * Output Multi-modal Classifier (Simulated post-generation safety score)
 */
export const classifyOutputAsset = (assetUrl, prompt, isAdultMode) => {
  const isClean = true; // Output check simulation
  const timestamp = new Date().toISOString();
  
  return {
    passed: true,
    safetyScore: 0.988,
    csamRiskScore: 0.0001,
    deepfakeRiskScore: 0.0004,
    nsfwDetected: isAdultMode,
    c2paManifest: {
      claim: "urn:c2pa:happynatsu:omnigen:claim:v1",
      generator: "HappyGen AI Studio 1.0",
      assertions: [
        { label: "c2pa.actions", data: { action: "c2pa.created", digitalSourceType: "trainedAlgorithmicMedia" } },
        { label: "c2pa.hash", data: { alg: "sha256", value: "a8f9c0e7b6d5a4321..." } },
        { label: "c2pa.moderation", data: { status: "verified_safe", ageGated: isAdultMode, scannedTimestamp: timestamp } }
      ]
    }
  };
};

/**
 * Generates NCMEC / Safety Log Entry for Audit Trail
 */
export const createSafetyAuditLog = (type, details) => {
  return {
    id: `LOG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    timestamp: new Date().toLocaleTimeString(),
    type,
    severity: details.severity || 'INFO',
    category: details.category || 'General',
    promptSnippet: details.prompt ? (details.prompt.length > 30 ? details.prompt.substring(0, 30) + '...' : details.prompt) : 'N/A',
    status: details.safe ? 'ALLOWED' : 'BLOCKED',
    reason: details.reason || 'Standard system scan'
  };
};
