import type { StructureResolver } from 'sanity/structure';

// Singleton types have one document per site — show them directly (no list)
const singletonTypes = ['homePage', 'technologyPage', 'contactPage', 'siteSettings'];

// Collection types have multiple documents — show as lists
const collectionTypes = [
  { type: 'agent', title: 'Agents' },
  { type: 'solution', title: 'Solutions' },
  { type: 'useCase', title: 'Use Cases' },
  { type: 'stakeholder', title: 'Stakeholders' },
  { type: 'technologyPartner', title: 'Technology Partners' },
  { type: 'teamMember', title: 'Team Members' },
  { type: 'page', title: 'Generic Pages' },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Pages group
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('Home Page')
                .child(
                  S.documentTypeList('homePage').title('Home Page'),
                ),
              S.listItem()
                .title('Technology Page')
                .child(
                  S.documentTypeList('technologyPage').title('Technology Page'),
                ),
              S.listItem()
                .title('Contact Page')
                .child(
                  S.documentTypeList('contactPage').title('Contact Page'),
                ),
            ]),
        ),

      S.divider(),

      // Content group
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items(
              collectionTypes.map(({ type, title }) =>
                S.listItem()
                  .title(title)
                  .child(S.documentTypeList(type).title(title)),
              ),
            ),
        ),

      S.divider(),

      // Settings
      S.listItem()
        .title('Settings')
        .child(
          S.documentTypeList('siteSettings').title('Site Settings'),
        ),
    ]);
