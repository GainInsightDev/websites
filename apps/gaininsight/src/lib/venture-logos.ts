/** Map project slug → white logo path (for dark backgrounds) */
export const ventureLogo: Record<string, string> = {
  recon1: '/images/ventures/recon1-raw.png',
  pensionable: '/images/ventures/pensionable.svg',
  senti: '/images/ventures/senti.png',
  clik: '/images/ventures/clik.svg',
  kaizen: '/images/ventures/kaizen.png',
  indigo: '/images/ventures/indigo.png',
  junkan: '/images/ventures/junkan.png',
  juncta: '/images/ventures/juncta.png',
  helm: '/images/ventures/juncta.png',
};

/** Map project slug → original full-colour logo path (for light backgrounds / white stages) */
export const ventureLogoRaw: Record<string, string> = {
  recon1: '/images/ventures/recon1-raw.png',
  pensionable: '/images/ventures/pensionable-raw.svg',
  senti: '/images/ventures/senti-raw.png',
  clik: '/images/ventures/clik-dark.svg',
  kaizen: '/images/ventures/kaizen-raw.png',
  indigo: '/images/ventures/indigo-clean.svg',
  junkan: '/images/ventures/junkan-raw.png',
  juncta: '/images/ventures/juncta-dark.png',
  helm: '/images/ventures/juncta-dark.png',
};

/** Logos with wide aspect ratios that need extra horizontal space on cards */
export const wideLogoSlugs = new Set(['indigo', 'juncta', 'pensionable', 'recon1']);

/** Projects to hide from listings */
export const hiddenSlugs = new Set(['gcs', 'mind', 'insight']);

/** Remap project data for display (Helm → Juncta) */
export const projectOverrides: Record<string, { name: string; displaySlug: string; tagline: string; domain: string }> = {
  helm: {
    name: 'Juncta',
    displaySlug: 'juncta',
    tagline: 'AI project management — conversational interface for planning, tracking, and delivering software.',
    domain: 'AI / PM',
  },
};
