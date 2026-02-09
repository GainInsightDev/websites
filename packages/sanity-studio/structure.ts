import type { StructureResolver, StructureBuilder } from 'sanity/structure';

const sites = [
  { id: 'pensionable', title: 'Pensionable.ai' },
  { id: 'recon1', title: 'Recon1.co.uk' },
  { id: 'senti', title: 'Senti' },
];

// Singleton page types — one document per site
const pageTypes = [
  { type: 'homePage', title: 'Home Page' },
  { type: 'technologyPage', title: 'Technology Page' },
  { type: 'contactPage', title: 'Contact Page' },
];

// Collection types — multiple documents per site
const collectionTypes = [
  { type: 'agent', title: 'Agents' },
  { type: 'solution', title: 'Solutions' },
  { type: 'useCase', title: 'Use Cases' },
  { type: 'stakeholder', title: 'Stakeholders' },
  { type: 'technologyPartner', title: 'Technology Partners' },
  { type: 'teamMember', title: 'Team Members' },
  { type: 'page', title: 'Generic Pages' },
];

function siteSection(S: StructureBuilder, siteId: string) {
  const filter = `site == "${siteId}"`;

  return S.list()
    .title('Content')
    .items([
      // Pages
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items(
              pageTypes.map(({ type, title }) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentTypeList(type)
                      .title(title)
                      .filter(`_type == "${type}" && ${filter}`),
                  ),
              ),
            ),
        ),

      S.divider(),

      // Content collections
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items(
              collectionTypes.map(({ type, title }) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentTypeList(type)
                      .title(title)
                      .filter(`_type == "${type}" && ${filter}`),
                  ),
              ),
            ),
        ),

      S.divider(),

      // Settings
      S.listItem()
        .title('Settings')
        .child(
          S.documentTypeList('siteSettings')
            .title('Site Settings')
            .filter(`_type == "siteSettings" && ${filter}`),
        ),
    ]);
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Websites')
    .items(
      sites.map(({ id, title }) =>
        S.listItem()
          .title(title)
          .child(siteSection(S, id)),
      ),
    );
