// Object types
import { benefitCard } from './objects/benefitCard';
import { faq } from './objects/faq';
import { featureList } from './objects/featureList';

// Collection document types
import { agent } from './agent';
import { page } from './page';
import { solution } from './solution';
import { stakeholder } from './stakeholder';
import { teamMember } from './teamMember';
import { technologyPartner } from './technologyPartner';
import { useCase } from './useCase';

// Singleton document types
import { contactPage } from './contactPage';
import { homePage } from './homePage';
import { siteSettings } from './siteSettings';
import { technologyPage } from './technologyPage';

export const schemaTypes = [
  // Objects
  benefitCard,
  faq,
  featureList,
  // Collections
  agent,
  page,
  solution,
  stakeholder,
  teamMember,
  technologyPartner,
  useCase,
  // Singletons
  contactPage,
  homePage,
  siteSettings,
  technologyPage,
];
