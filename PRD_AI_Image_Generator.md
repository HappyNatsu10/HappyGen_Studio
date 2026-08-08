# Product Requirements Document
## AI Image Generator with Multi-Style & Adult (18+) Content Capabilities

**Document Status:** Draft v1.0
**Owner:** HappyNatsu
**Last Updated:** August 4, 2026

---

## 1. Executive Summary

This PRD defines requirements for an AI-powered image generation platform that allows users to create images from text prompts across a range of art styles (photorealistic, anime, watercolor, oil painting, 3D render, pixel art, etc.), with an optional, strictly gated adult (18+) content mode for verified adult users.

Because adult content generation carries significant legal, safety, and reputational risk, this PRD treats **Trust & Safety as a core product pillar**, not a bolt-on feature. No monetization, growth, or style-variety goal overrides the safety requirements in Section 6.

---

## 2. Problem Statement & Goals

### 2.1 Problem
Users want a single tool that can generate high-quality images in a wide variety of artistic styles, including a segregated adult-content experience for verified adults, without having to use multiple disconnected tools of varying quality and trustworthiness.

### 2.2 Goals
- Deliver high-quality, stylistically diverse image generation (G-rated by default).
- Offer an explicitly opt-in, age-verified, legally compliant adult content mode.
- Build a platform that regulators, payment processors, and app stores will not shut down.
- Establish defensible trust & safety infrastructure as a competitive moat.

### 2.3 Non-Goals
- This product will **not** generate content depicting minors in any sexualized context, real identifiable people without consent, non-consensual intimate imagery, or content promoting sexual violence, under any circumstance, mode, or user tier.
- This is not a moderation-free "anything goes" platform.

---

## 3. Target Users & Use Cases

| Segment | Use Case |
|---|---|
| Hobbyist creators | Concept art, personal avatars, social media content |
| Illustrators/designers | Style exploration, mood boards, rapid prototyping |
| Adult content creators (verified 18+) | Original fictional adult artwork for personal use or licensed platforms |
| Game/comic studios | Character design across consistent style guides |

---

## 4. Core Product Features

### 4.1 Base Image Generation
- Text-to-image generation via prompt input
- Image-to-image (style transfer, variations, inpainting/outpainting)
- Negative prompts, seed control, aspect ratio/resolution controls
- Batch generation (e.g., 4 variations per prompt)

### 4.2 Art Style Engine
- Curated style presets (photorealistic, anime/manga, watercolor, oil painting, pencil sketch, 3D render, pixel art, cyberpunk, impressionist, etc.)
- Style strength slider (blend between prompt fidelity and style intensity)
- Custom style reference upload (image-based style matching), subject to IP screening (see 6.4)
- Style consistency mode for multi-image projects (e.g., character sheets)

### 4.3 Editing & Workflow Tools
- Inpainting/outpainting, background removal, upscaling
- Prompt history, favorites, and project folders
- Version history per image/project

### 4.4 Video Generation Suite
- **Text-to-video**: Generate short video clips directly from text prompts, with controls for duration, resolution, frame rate, and camera motion (pan, zoom, tracking).
- **Image-to-video**: Animate a static generated or uploaded image into a video clip (e.g., adding motion, camera movement, or scene extension from a single frame).
- **Video-to-video**: Restyle, edit, or transform an existing video — apply an art style to footage, swap backgrounds, extend/trim clips, or modify specific elements while preserving motion and composition.
- Shared style engine: the same style presets from Section 4.2 apply to video outputs for visual consistency across image and video content within a project.
- Output controls: resolution/aspect ratio presets, clip length limits (tiered by plan), watermarking/content-credential metadata (per Section 6.6) embedded in all video exports.
- Adult (18+) mode extends to video generation under the identical restrictions, verification, and moderation pipeline defined in Section 6 — video introduces additional risk (e.g., higher realism, motion-based deepfake potential) and requires its own classifier tuning, not a reused image classifier applied frame-by-frame.

### 4.5 Adult (18+) Content Mode
- Fully separate, opt-in mode — off by default for all accounts
- Only accessible after passing age & identity verification (Section 6.2)
- Separate model/pipeline or clearly partitioned inference path from the general-audience mode
- Content restricted to fictional, adult (18+), consensual scenarios only — enforced by input and output filtering (Section 6)
- Isolated storage, isolated gallery, no crossover into general-audience feeds, search, or sharing surfaces

---

## 5. User Flows (Summary)

1. **Sign-up / Onboarding** → Standard account creation → General mode only.
2. **Opt-in to Adult Mode** → Explicit request → Identity/age verification flow → Legal acknowledgments → Mode unlocked.
3. **Prompted Generation** → Prompt entered → Real-time input classifier screens prompt → If flagged, blocked with explanation → If clear, image generated → Output classifier screens result → If flagged, blocked/regenerated → Delivered to user.
4. **Reporting/Appeals** → User or automated system flags content → Human review queue → Action (removal, account action, law enforcement referral if required).

---

## 6. Trust & Safety Requirements (Non-Negotiable)

This section is load-bearing for the entire product. Legal, Safety, and Policy teams must sign off before any adult-content feature ships.

### 6.1 Absolute Prohibitions (No Exceptions, No Override)
- **Zero tolerance for CSAM**: No generation of sexual or suggestive content involving minors, or content that could be construed as depicting minors in sexual contexts (including stylized/anime depictions where art style is used to obscure apparent age). This requires age-inference classifiers on both prompts and outputs, tuned conservatively.
- **No non-consensual real-person content**: No generation of sexual/intimate imagery of real, identifiable individuals (no "face swap onto adult content," no real names/likenesses in adult prompts).
- **No sexual violence, incest-themed, or bestiality content.**
- These prohibitions apply platform-wide and cannot be disabled by any user tier, admin override, or enterprise contract.
- **Video carries elevated risk and gets no exceptions**: the same prohibitions apply per-frame and to full motion sequences. Image-to-video and video-to-video are additionally screened on the *input* media itself (not just the prompt) before any processing begins, since uploaded source footage could contain real identifiable people or prohibited content independent of the text prompt.

### 6.2 Age & Identity Verification
- Government ID verification + liveness check (via third-party KYC vendor) required before adult mode unlock.
- Re-verification triggers (e.g., periodic, or on suspicious activity).
- Verification data handled by a compliant third-party processor; platform stores only verification status, not raw ID documents.

### 6.3 Content Moderation Pipeline
- **Input classifier**: screens prompts pre-generation for prohibited categories.
- **Output classifier**: screens generated images post-generation (multi-modal classifier, not just prompt-based).
- **Human review team**: trained specifically on CSAM/exploitation detection protocols, with mandatory legal reporting workflows (e.g., NCMEC CyberTipline reporting in the U.S., equivalent bodies elsewhere) built into the escalation path.
- **Hash-matching**: integrate PhotoDNA or equivalent to detect known CSAM hashes in any uploaded reference images.
- Continuous red-teaming and adversarial testing of classifiers, with logged evasion attempts feeding back into model/classifier improvements.
- **Video-specific moderation**: sampled-frame + temporal analysis (not single-frame checks alone, which can miss motion-based violations); source-footage screening for image-to-video and video-to-video before generation begins; face-matching against known-person databases to catch real-identifiable-person uploads intended for adult video-to-video transformation.

### 6.4 IP & Consent Safeguards
- Style-reference uploads screened to prevent direct reproduction of copyrighted characters/artists' work as a way to launder infringement.
- Terms of Service require users to attest they have rights to any likenesses used as reference input.
- Clear DMCA/takedown process.

### 6.5 Compliance & Legal
- Legal review per jurisdiction of operation — adult content laws, age-of-majority definitions, and record-keeping requirements (e.g., US 18 U.S.C. § 2257-style considerations) vary significantly and must be assessed by counsel before launch in each market.
- Payment processor and app store policies reviewed (most major app stores prohibit adult content entirely — this likely requires a web-only distribution strategy for the adult mode).
- Data retention and law-enforcement request handling policy defined in advance.

### 6.6 Transparency & User Controls
- Clear, unambiguous labeling of AI-generated content (metadata/watermarking, e.g., C2PA content credentials).
- Easy-to-use reporting tool on every generated image.
- Account-level opt-out/deletion of adult mode and associated data at any time.

---

## 7. Success Metrics

| Category | Metric |
|---|---|
| Quality | User satisfaction score per generation; style-fidelity rating |
| Safety | Classifier precision/recall on red-team test sets; time-to-action on reports; zero critical safety incidents |
| Growth | Weekly active generators; retention by cohort |
| Compliance | 100% of adult-mode users verified before access; audit pass rate |

---

## 8. Risks & Open Questions

- **Regulatory risk**: Adult AI-generated content regulation is evolving rapidly across jurisdictions (EU AI Act, various US state laws on synthetic media) — requires ongoing legal monitoring, not a one-time review.
- **Video deepfake risk**: video-to-video and image-to-video features are the most likely surface for non-consensual deepfake misuse (e.g., animating a real person's photo). This is a materially higher-severity risk than static images and may warrant launching video features without adult mode initially, adding it only after the video-specific moderation pipeline is proven.
- **Classifier reliability**: No classifier is perfect; what's the acceptable false-negative rate, and what human-review capacity is needed to backstop it?
- **App store distribution**: Confirm go-to-market as web-only vs. seeking alternative distribution for the adult tier.
- **Vendor selection**: Which KYC/age-verification and hash-matching vendors will be used?
- **Model sourcing**: Will the adult-mode model be trained/fine-tuned in-house or licensed? This materially changes the safety review scope.

---

## 9. Open Decisions for Stakeholder Sign-off

- [ ] Legal sign-off on jurisdictional launch list
- [ ] Trust & Safety sign-off on classifier thresholds and human review staffing plan
- [ ] Executive sign-off on distribution strategy (web-only vs. app stores)
- [ ] Finalize KYC vendor selection

---

*This document should be treated as a living draft. Section 6 (Trust & Safety) should be reviewed and re-approved by Legal and Policy stakeholders before each major release.*
