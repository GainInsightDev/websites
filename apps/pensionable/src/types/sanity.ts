export interface HomePage {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLink?: string;
  heroCtaText?: string;
  problemTitle: string;
  problemDescription?: string;
  problemItems?: string[];
  solutionTitle: string;
  solutionCards?: Array<{ title: string; description: string }>;
  featuredUseCases?: Array<{ _ref: string }>;
  ctaTitle: string;
  ctaDescription: string;
}

export interface UseCase {
  _id: string;
  title: string;
  subtitle: string;
  slug: { current: string };
  challenge?: string;
  approach?: string;
  solutionArchitecture?: Array<{ title: string; items: Array<{ title: string; description: string }> }>;
  benefits?: Array<{ title: string; description: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  whoBenefits?: Array<{ title: string; description: string }>;
  ctaTitle: string;
  ctaDescription: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: { asset: { _ref: string } };
  linkedinUrl?: string;
  expertise?: string[];
}

export interface Solution {
  title: string;
  description: string;
  slug: { current: string };
  features?: string[];
  detailHeader: string;
  detailContent: string;
  diagramDefinition?: string;
}

export interface Agent {
  name: string;
  abbreviation?: string;
  description: string;
  slug?: { current: string };
  capabilities?: string[];
  diagramDefinition?: string;
}

export interface TechnologyPartner {
  name: string;
  description: string;
  url: string;
}

export interface TechnologyPage {
  heroTitle: string;
  heroSubtitle: string;
  approachTitle: string;
  approachContent?: string;
  aiCapabilities?: Array<{
    title: string;
    description: string;
    items?: Array<{ title: string; description: string }>;
  }>;
  securityContent: string;
  dataProtectionItems?: string[];
  complianceItems?: string[];
}

export interface ContactPage {
  heroTitle: string;
  heroSubtitle: string;
  formEmbedUrl: string;
  email: string;
  phone: string;
  location: string;
}

export interface Stakeholder {
  title: string;
  challenges?: string[];
  howWeHelp?: Array<{ title: string; description: string }>;
  benefits?: string[];
  relatedIssues?: string[];
  overview: string;
}
