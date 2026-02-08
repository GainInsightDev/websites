/**
 * Shared utilities and configuration for GainInsight websites.
 */

/** Site configuration for each website in the monorepo. */
export const sites = {
  recon1: {
    name: 'Recon1',
    domain: 'recon1.co.uk',
    s3Bucket: 'recon1.co.uk',
    cloudfrontId: 'E3JNPZRCHMTZGD',
  },
  pensionable: {
    name: 'Pensionable.ai',
    domain: 'pensionable.ai',
    s3Bucket: 'pensionable.ai',
    cloudfrontId: 'E1NJGGB30XPJ7W',
  },
  senti: {
    name: 'Senti',
    domain: 'senti-website',
    s3Bucket: '', // TODO: Determine S3 bucket for senti
    cloudfrontId: '', // TODO: Determine CloudFront distribution for senti
  },
} as const;

export type SiteName = keyof typeof sites;
