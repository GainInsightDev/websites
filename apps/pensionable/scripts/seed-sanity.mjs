#!/usr/bin/env node
/**
 * Seed pensionable.ai content into Sanity CMS.
 * Usage: SANITY_API_TOKEN=xxx node apps/pensionable/scripts/seed-sanity.mjs
 *
 * Idempotent: uses createOrReplace so it's safe to run multiple times.
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'qt7mj7sy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

if (!process.env.SANITY_API_TOKEN) {
  console.error('SANITY_API_TOKEN is required. Get it from Doppler: doppler secrets get SANITY_API_TOKEN --project websites --config prd --plain');
  process.exit(1);
}

const SITE = 'pensionable';
let keyCounter = 0;
function k() { return `k${++keyCounter}`; }

// ─── Mermaid diagram base configs ───────────────────────────────────

const solutionBaseConfig = `%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'primaryColor': '#051966',
    'primaryTextColor': '#FFFFFF',
    'primaryBorderColor': '#BF2FCF',
    'lineColor': '#3FBAD4',
    'secondaryColor': '#2E2D42',
    'tertiaryColor': '#2E2D42',
    'clusterBkg': 'transparent',
    'clusterBorder': 'transparent',
    'fontSize': '14px'
  },
  'flowchart': {
    'htmlLabels': true,
    'curve': 'basis'
  }
}}%%`;

const agentBaseConfig = `%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'primaryColor': '#051966',
    'primaryTextColor': '#FFFFFF',
    'primaryBorderColor': '#BF2FCF',
    'lineColor': '#3FBAD4',
    'secondaryColor': '#2E2D42',
    'tertiaryColor': '#2E2D42',
    'clusterBkg': 'transparent',
    'clusterBorder': 'transparent',
    'fontSize': '14px',
    'background': '#1E1E2F'
  },
  'flowchart': {
    'htmlLabels': true,
    'curve': 'basis'
  }
}}%%`;

// ─── Solution diagrams (resolved) ───────────────────────────────────

const logicETLDiagram = `
%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'primaryColor': '#051966',
    'primaryTextColor': '#FFFFFF',
    'primaryBorderColor': '#BF2FCF',
    'lineColor': '#3FBAD4',
    'secondaryColor': '#2E2D42',
    'tertiaryColor': '#2E2D42',
    'clusterBkg': 'transparent',
    'clusterBorder': 'transparent'
  },
  'layout': 'fixed'
}}%%
flowchart TD
    A1["Scheme<br>Documentation"] --> B1["Natural Language<br>Processing"]
    B1 --> C1["Rule<br>Extraction"]
    C1 --> D1["Ambiguity<br>Detection"]
    D1 --> E1["Machine Executable<br>Rules"]
    E1 --> F1["Rule<br>Formalization"]
    F1 -..-> G1["Test Case<br>Generation"]
    G1 --> H1["Synthetic<br>Test Data"]
    H1 --> I1["Coverage<br>Verification"]
    I1 --> J1["Validation<br>Report"]
    style A1 stroke:#BF2FCF,stroke-width:2px
    style B1 stroke:#3FBAD4,stroke-width:2px
    style C1 stroke:#3FBAD4,stroke-width:2px
    style D1 stroke:#3FBAD4,stroke-width:2px
    style E1 stroke:#BF2FCF,stroke-width:2px
    style F1 stroke:#BF2FCF,stroke-width:2px
    style G1 stroke:#BF2FCF,stroke-width:2px
    style H1 stroke:#BF2FCF,stroke-width:2px
    style I1 stroke:#3FBAD4,stroke-width:2px
    style J1 stroke:#BF2FCF,stroke-width:2px
    linkStyle 4 stroke:#3FBAD4,stroke-width:2px,stroke-dasharray: 5 5,fill:none
`;

const dataETLDiagram = `
${solutionBaseConfig}
flowchart TD
    A1[("Legacy<br>Data")] --> B1
    A2[("Admin<br>Systems")] --> B1
    A3[("Manual<br>Records")] --> B1

    B1["Data<br>Collection"] --> C1["Data<br>Validation"]
    C1 --> D1{"Quality<br>Check"}
    D1 -->|"Pass"| E1["Data<br>Transformation"]
    D1 -->|"Fail"| F1["Error<br>Handling"]
    F1 --> C1
    E1 --> G1["Secure Data<br>Lake"]

    G1 --> H1["Available for<br>Calculations"]

    style A1 stroke:#BF2FCF,stroke-width:1.6px
    style A2 stroke:#BF2FCF,stroke-width:1.6px
    style A3 stroke:#BF2FCF,stroke-width:1.6px
    style G1 stroke:#BF2FCF,stroke-width:1.6px
    style H1 stroke:#BF2FCF,stroke-width:1.6px

    style B1 stroke:#3FBAD4,stroke-width:1.6px
    style C1 stroke:#3FBAD4,stroke-width:1.6px
    style D1 stroke:#3FBAD4,stroke-width:1.6px
    style E1 stroke:#3FBAD4,stroke-width:1.6px
    style F1 stroke:#3FBAD4,stroke-width:1.6px

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

const analyticsDiagram = `
${solutionBaseConfig}
flowchart TD
    A1["Scheme<br>Data"] --> B1
    A2["Market<br>Data"] --> B1
    A3["Benchmark<br>Data"] --> B1

    B1["Data<br>Integration"] --> C1
    C1["Advanced<br>Analytics"] --> D1
    C1 --> D2
    C1 --> D3
    C1 --> D4

    D1["Real-time<br>Analytics"]
    D2["Trend<br>Analysis"]
    D3["Risk<br>Assessment"]
    D4["Predictive<br>Modeling"]

    D1 --> E1
    D2 --> E1
    D3 --> E1
    D4 --> E1

    E1["Actionable<br>Insights"] --> F1
    E1 --> F2
    E1 --> F3

    F1["Executive<br>Dashboards"]
    F2["Compliance<br>Reports"]
    F3["Decision<br>Support"]

    style A1 stroke:#BF2FCF,stroke-width:1.6px
    style A2 stroke:#BF2FCF,stroke-width:1.6px
    style A3 stroke:#BF2FCF,stroke-width:1.6px
    style E1 stroke:#BF2FCF,stroke-width:1.6px
    style F1 stroke:#BF2FCF,stroke-width:1.6px
    style F2 stroke:#BF2FCF,stroke-width:1.6px
    style F3 stroke:#BF2FCF,stroke-width:1.6px

    style B1 stroke:#3FBAD4,stroke-width:1.6px
    style C1 stroke:#3FBAD4,stroke-width:1.6px
    style D1 stroke:#3FBAD4,stroke-width:1.6px
    style D2 stroke:#3FBAD4,stroke-width:1.6px
    style D3 stroke:#3FBAD4,stroke-width:1.6px
    style D4 stroke:#3FBAD4,stroke-width:1.6px

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

const integrationDiagram = `
${solutionBaseConfig}
flowchart TD
    A1["Actuarial<br>Systems"] <--> B1
    A2["Admin<br>Systems"] <--> B1
    A3["Third-party<br>Services"] <--> B1

    B1["RESTful<br>API"] --> C1
    C1["Security<br>Layer"] --> D1
    D1["Transformation<br>Layer"] --> E1
    E1["Real-time<br>Sync"]

    E1 <--> F1

    F1["API<br>Gateway"] --> G1
    G1["Rule Execution<br>Agent"] --> H1["Machine Executable<br>Rules"]
    G1 --> H2["Secure Data<br>Lake"]

    I1["Client<br>Applications"] <--> B1

    style A1 stroke:#BF2FCF,stroke-width:1.6px
    style A2 stroke:#BF2FCF,stroke-width:1.6px
    style A3 stroke:#BF2FCF,stroke-width:1.6px
    style I1 stroke:#BF2FCF,stroke-width:1.6px
    style H1 stroke:#BF2FCF,stroke-width:1.6px
    style H2 stroke:#BF2FCF,stroke-width:1.6px

    style B1 stroke:#3FBAD4,stroke-width:1.6px
    style C1 stroke:#3FBAD4,stroke-width:1.6px
    style D1 stroke:#3FBAD4,stroke-width:1.6px
    style E1 stroke:#3FBAD4,stroke-width:1.6px
    style F1 stroke:#3FBAD4,stroke-width:1.6px
    style G1 stroke:#3FBAD4,stroke-width:1.6px

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

const consultingDiagram = `
${solutionBaseConfig}
flowchart TD
    A1["Rule<br>Complexity"] --> B1
    A2["Data<br>Quality"] --> B1
    A3["Regulatory<br>Pressure"] --> B1
    A4["Resource<br>Constraints"] --> B1

    B1["Assessment &<br>Planning"] --> C1
    C1["Custom Solution<br>Design"] --> D1
    D1["Implementation<br>Support"] --> E1
    E1["Training &<br>Knowledge Transfer"] --> F1
    F1["Ongoing<br>Maintenance"]

    F1 --> G1
    F1 --> G2
    F1 --> G3
    F1 --> G4

    G1["Operational<br>Efficiency"]
    G2["Compliance<br>Assurance"]
    G3["Cost<br>Reduction"]
    G4["Mathematical<br>Certainty"]

    style A1 stroke:#BF2FCF,stroke-width:1.6px
    style A2 stroke:#BF2FCF,stroke-width:1.6px
    style A3 stroke:#BF2FCF,stroke-width:1.6px
    style A4 stroke:#BF2FCF,stroke-width:1.6px
    style G1 stroke:#BF2FCF,stroke-width:1.6px
    style G2 stroke:#BF2FCF,stroke-width:1.6px
    style G3 stroke:#BF2FCF,stroke-width:1.6px
    style G4 stroke:#BF2FCF,stroke-width:1.6px

    style B1 stroke:#3FBAD4,stroke-width:1.6px
    style C1 stroke:#3FBAD4,stroke-width:1.6px
    style D1 stroke:#3FBAD4,stroke-width:1.6px
    style E1 stroke:#3FBAD4,stroke-width:1.6px
    style F1 stroke:#3FBAD4,stroke-width:1.6px

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

// ─── Agent diagrams (resolved) ──────────────────────────────────────

const rcaDiagram = `
${agentBaseConfig}
flowchart TD
    I1["Scheme<br>Rules"] --> RCA
    I2["Scheme<br>Documentation"] --> RCA
    I3["Rule<br>Templates"] --> RCA

    RCA["Scheme Rule<br>Encoding Agent<br>(RCA)"]

    RCA --> O1["Machine-Executable<br>Rules"]
    RCA --> O2["Rule<br>Metadata"]
    RCA --> O3["Ambiguity<br>Reports"]

    style RCA fill:transparent,stroke:#FAB515,stroke-width:2px,color:#FFFFFF
    style I1 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I2 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I3 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style O1 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O2 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O3 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

const raaDiagram = `
${agentBaseConfig}
flowchart TD
    I1["Machine-Executable<br>Rules"] --> RAA
    I2["Test<br>Data"] --> RAA
    I3["Compliance<br>Requirements"] --> RAA

    RAA["Scheme Rule<br>Assurance Agent<br>(RAA)"]

    RAA --> O1["Verification<br>Reports"]
    RAA --> O2["Test<br>Cases"]
    RAA --> O3["Compliance<br>Validation"]

    style RAA fill:transparent,stroke:#FAB515,stroke-width:2px,color:#FFFFFF
    style I1 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I2 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I3 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style O1 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O2 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O3 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

const reaDiagram = `
${agentBaseConfig}
flowchart TD
    I1["Machine-Executable<br>Rules"] --> REA
    I2["Member<br>Data"] --> REA
    I3["Calculation<br>Requests"] --> REA

    REA["Scheme Rule<br>Execution Agent<br>(REA)"]

    REA --> O1["Calculation<br>Results"]
    REA --> O2["Audit<br>Trail"]
    REA --> O3["Performance<br>Metrics"]

    style REA fill:transparent,stroke:#FAB515,stroke-width:2px,color:#FFFFFF
    style I1 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I2 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I3 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style O1 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O2 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O3 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

const dtaDiagram = `
${agentBaseConfig}
flowchart TD
    I1["Source<br>Systems"] --> DTA
    I2["Data<br>Standards"] --> DTA
    I3["Security<br>Policies"] --> DTA

    DTA["Scheme Data<br>Transport Agent<br>(DTA)"]

    DTA --> O1["Validated<br>Data"]
    DTA --> O2["Data Quality<br>Reports"]
    DTA --> O3["Integration<br>Logs"]

    style DTA fill:transparent,stroke:#FAB515,stroke-width:2px,color:#FFFFFF
    style I1 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I2 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style I3 fill:transparent,stroke:#BF2FCF,stroke-width:1.6px,color:#FFFFFF
    style O1 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O2 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF
    style O3 fill:transparent,stroke:#3FBAD4,stroke-width:1.6px,color:#FFFFFF

    linkStyle default stroke:#3FBAD4,stroke-width:1.6px
`;

// ─── Documents ──────────────────────────────────────────────────────

const documents = [
  // ── Site Settings ─────────────────────────────────────────────────
  {
    _id: 'siteSettings-pensionable',
    _type: 'siteSettings',
    siteName: 'pensionable.ai',
    domain: 'pensionable.ai',
    defaultTitle: 'pensionable.ai - Mathematical certainty for pension management',
    description: 'Transform complex pension scheme rules and data into actionable intelligence with our advanced AI tool stack',
    site: SITE,
    navLinks: [
      { _key: k(), label: 'Solutions', href: '/solutions' },
      { _key: k(), label: 'Technology', href: '/technology' },
      { _key: k(), label: 'Use Cases', href: '/defined-benefit-prt' },
      { _key: k(), label: 'Stakeholders', href: '/stakeholder-perspective' },
      { _key: k(), label: 'Team', href: '/team' },
      { _key: k(), label: 'Contact', href: '/contact' },
    ],
  },

  // ── Home Page ─────────────────────────────────────────────────────
  {
    _id: 'homePage-pensionable',
    _type: 'homePage',
    heroTitle: 'Bringing mathematical certainty to pension management',
    heroSubtitle: 'Transform complex pension schemes rules and data into actionable intelligence with our advanced AI tool stack',
    heroCtaText: 'Start a conversation today!',
    heroCtaLink: '/contact',
    problemTitle: '1 in 3 benefit calculations provided by the industry to members are likely incorrect.',
    problemDescription: `The same approach that caused these problems will not fix them.

We understand these problems: Capacity within the industry is at its limit. Many teams have so much Business As Usual work they cannot contemplate fixing these problems, and whilst AI is exploding many organisations are lacking a positive strategy that can exploit this revolution in technology.

Perhaps it's time for a sensible conversation with a team of pension industry veterans and AI experts who can help you understand how your organisation can take advantage of what can only be described as a paradigm shift in how we work.`,
    problemItems: [
      'Not enough capacity in your team',
      'Complex scheme rules interpretation requires your most experienced people',
      'Legacy systems and data are difficult to work with',
      'Many existing processes are non-repeatable leading to incorrect results and missed SLAs',
      'Risk of calculation errors',
    ],
    solutionTitle: 'How pensionable.ai Addresses These Challenges',
    solutionCards: [
      { _type: 'benefitCard', _key: k(), title: 'Automated Reasoning', description: 'Our AI interprets complex pension rules with mathematical precision' },
      { _type: 'benefitCard', _key: k(), title: 'Intelligent Processing', description: 'Streamlined data handling with advanced ETL capabilities' },
      { _type: 'benefitCard', _key: k(), title: 'Enterprise Security', description: 'Bank-grade security and compliance built into every process' },
    ],
    featuredUseCases: [
      { _type: 'reference', _ref: 'useCase-pensionable-defined-benefit-prt', _key: k() },
      { _type: 'reference', _ref: 'useCase-pensionable-isp-value-data', _key: k() },
      { _type: 'reference', _ref: 'useCase-pensionable-gmp-rectification', _key: k() },
    ],
    ctaTitle: 'Ready to transform your pension management?',
    ctaDescription: 'Get in touch to schedule a demo and see pensionable.ai in action',
    site: SITE,
  },

  // ── Contact Page ──────────────────────────────────────────────────
  {
    _id: 'contactPage-pensionable',
    _type: 'contactPage',
    heroTitle: 'Get in Touch',
    heroSubtitle: 'Schedule a demo or reach out to learn more about pensionable.ai',
    formEmbedUrl: 'https://webforms.pipedrive.com/f/bXq31X5u1xB3xV9MpNAihL7HARreb37266tPUGpuYdx0s8KfeOXBDkp3VgJ4oOnnSr',
    email: 'info@pensionable.ai',
    phone: '+44 (0) 770 631 9468',
    location: 'Liverpool, United Kingdom',
    site: SITE,
  },

  // ── Technology Page ───────────────────────────────────────────────
  {
    _id: 'technologyPage-pensionable',
    _type: 'technologyPage',
    heroTitle: 'Our Technology',
    heroSubtitle: 'Advanced AI and agent-based architecture delivering precision and reliability in pension management',
    approachTitle: 'Our Approach',
    approachContent: `At pensionable.ai, we've pioneered an agent-based approach to pension scheme management that brings mathematical certainty to traditionally ambiguous and complex calculations. Our system is built on a fleet of specialised AI agents that work together in a coordinated ecosystem to solve the industry's most pressing challenges.

Each agent in our system is designed with a specific area of expertise and responsibility. Unlike generalised AI systems, our specialised agents are purpose-built to tackle the unique complexities of pension schemes. They operate both autonomously and collaboratively, creating a powerful network that can encode scheme rules, validate data, execute calculations, and ensure compliance with unparalleled precision.

What sets our technology apart is its ability to translate ambiguous pension scheme documentation into mathematically precise, machine-executable code. This transformative approach eliminates interpretation errors, ensures consistent application of rules, and provides an auditable trail for every calculation\u2014delivering the mathematical certainty that stakeholders need for confident decision-making.`,
    aiCapabilities: [
      {
        _type: 'featureList', _key: k(), title: 'Automated Reasoning',
        items: [
          { _key: k(), title: 'Formal verification of calculations', description: '' },
          { _key: k(), title: 'Logical consistency checking', description: '' },
          { _key: k(), title: 'Automated problem solving', description: '' },
          { _key: k(), title: 'Decision support systems', description: '' },
        ],
      },
      {
        _type: 'featureList', _key: k(), title: 'Machine Learning',
        items: [
          { _key: k(), title: 'Pattern recognition in scheme rules', description: '' },
          { _key: k(), title: 'Anomaly detection', description: '' },
          { _key: k(), title: 'Predictive analytics', description: '' },
          { _key: k(), title: 'Continuous learning and improvement', description: '' },
        ],
      },
      {
        _type: 'featureList', _key: k(), title: 'Natural Language Processing',
        items: [
          { _key: k(), title: 'Document understanding', description: '' },
          { _key: k(), title: 'Context-aware interpretation', description: '' },
          { _key: k(), title: 'Semantic analysis', description: '' },
          { _key: k(), title: 'Multi-document correlation', description: '' },
        ],
      },
      {
        _type: 'featureList', _key: k(), title: 'Data Extraction',
        items: [
          { _key: k(), title: 'Automated document processing', description: '' },
          { _key: k(), title: 'Structured data extraction', description: '' },
          { _key: k(), title: 'Format recognition', description: '' },
          { _key: k(), title: 'Quality assurance', description: '' },
        ],
      },
    ],
    securityContent: 'At pensionable.ai, we understand that pension data is highly sensitive and requires the highest levels of security and compliance. Our technology infrastructure is built with enterprise-grade security measures to protect your data while ensuring regulatory compliance.',
    dataProtectionItems: [
      'End-to-end encryption for all data in transit and at rest',
      'Secure data storage with multi-level access controls',
      'Role-based permissions system with detailed audit trails',
    ],
    complianceItems: [
      'GDPR compliance for all personal data processing',
      'ISO 27001 aligned security protocols and procedures',
      'Regular security audits and penetration testing',
    ],
    site: SITE,
  },

  // ── Solutions ─────────────────────────────────────────────────────
  {
    _id: 'solution-pensionable-logic-etl',
    _type: 'solution',
    title: 'Logic ETL',
    slug: { _type: 'slug', current: 'logic-etl' },
    description: 'Intelligent interpretation and processing of scheme rules',
    features: ['Automated rule extraction', 'Natural language processing', 'Rule validation and verification', 'Version control and audit trail'],
    detailHeader: 'Scheme Rule Interpretation',
    detailContent: `The Logic ETL component transforms complex pension scheme rules into precise, machine-executable code through advanced natural language processing. This automated rule extraction process identifies and resolves ambiguities in scheme documentation, ensuring mathematical certainty in all calculations.

By creating a digital twin of scheme rules with complete version control and audit capabilities, Logic ETL eliminates the inconsistencies that plague manual interpretation methods.

What sets our Logic ETL apart is its integrated testing framework. After rule formalization, our Scheme Rule Assurance Agent automatically generates comprehensive test cases covering all possible execution paths. This ensures 100% coverage of rule variations and edge cases that would be missed in manual testing.

The system creates synthetic test data designed to exercise each rule variation, providing a complete validation suite without requiring actual member data. Our coverage verification process mathematically proves all scenarios are tested, eliminating the uncertainty of traditional sampling methods.

For pension schemes with complex benefit structures, our Logic ETL can handle intricate rule dependencies and conditional calculations that challenge conventional systems. The component can process both current and historical rule versions, enabling accurate back-calculations and rectification exercises.

When regulatory changes occur, the impact on calculations can be quickly assessed by comparing rule versions and identifying affected member segments. This capability is particularly valuable for GMP equalization projects and scheme rule amendments.

This robust testing framework enables pension schemes to achieve unprecedented accuracy while maintaining complete transparency. By resolving ambiguities before they affect calculations, the Logic ETL component provides the mathematical certainty essential for critical pension operations like GMP rectification and pension risk transfers.`,
    diagramDefinition: logicETLDiagram,
    order: 1,
    site: SITE,
  },
  {
    _id: 'solution-pensionable-data-etl',
    _type: 'solution',
    title: 'Data ETL',
    slug: { _type: 'slug', current: 'data-etl' },
    description: 'Efficient data extraction, transformation, and loading',
    features: ['Automated data extraction', 'Smart data transformation', 'Quality validation', 'Secure data loading'],
    detailHeader: 'Data Processing Pipeline',
    detailContent: `Our Data ETL component bridges the gap between fragmented legacy data sources and modern calculation requirements. By implementing intelligent extraction processes that understand pension data structures, we transform inconsistent records into a unified, validated dataset.

The system automatically identifies data quality issues, applies appropriate transformations, and maintains lineage tracking for complete auditability. This comprehensive approach ensures that all downstream calculations are based on accurate, complete data.

Legacy pension systems often store critical information in formats that are difficult to access and integrate. Our Data ETL component uses specialized connectors to extract this information without disrupting existing operations.

Once extracted, the data undergoes rigorous validation against scheme rules and industry standards. Anomalies are flagged for review, while valid data continues through the transformation pipeline.

The result is a secure, reliable data foundation that addresses one of the most fundamental challenges in pension management while supporting all analytical and operational needs across the organization.`,
    diagramDefinition: dataETLDiagram,
    order: 2,
    site: SITE,
  },
  {
    _id: 'solution-pensionable-analytics',
    _type: 'solution',
    title: 'Analytics',
    slug: { _type: 'slug', current: 'analytics' },
    description: 'Comprehensive insights and reporting capabilities',
    features: ['Real-time analytics', 'Custom report generation', 'Trend analysis', 'Predictive modeling'],
    detailHeader: 'Advanced Reporting Solutions',
    detailContent: `The Analytics component converts raw pension data into actionable intelligence through sophisticated modeling and visualization capabilities. By integrating scheme data with market benchmarks and regulatory requirements, our system generates insights that support strategic decision-making.

Real-time dashboards provide immediate visibility into key metrics, while predictive models help anticipate future scenarios and their potential impacts. Custom reporting capabilities ensure that stakeholders at all levels receive precisely the information they need in the format that best supports their role.

For pension trustees, our analytics provide clear visibility into funding levels, liability profiles, and investment performance. For administrators, operational metrics highlight process efficiencies and member service levels.

Actuaries benefit from sophisticated modeling tools that simplify complex calculations and scenario testing. Risk managers gain early warning indicators of potential compliance issues or financial exposures.

This comprehensive approach transforms pension data from a passive record into a strategic asset that drives better outcomes for schemes, sponsors, and ultimately, members.`,
    diagramDefinition: analyticsDiagram,
    order: 3,
    site: SITE,
  },
  {
    _id: 'solution-pensionable-integration',
    _type: 'solution',
    title: 'Integration',
    slug: { _type: 'slug', current: 'integration' },
    description: 'Seamless API and system connections',
    features: ['RESTful API support', 'Legacy system integration', 'Real-time synchronization', 'Secure data exchange'],
    detailHeader: 'System Connectivity',
    detailContent: `Our Integration component ensures seamless communication between pensionable.ai and your existing technology ecosystem. Through secure, standardized APIs, we connect with legacy administration systems, actuarial modeling tools, and third-party services without disrupting established workflows.

Real-time synchronization capabilities maintain data consistency across platforms, while comprehensive security protocols protect sensitive information throughout the exchange process. This flexible architecture adapts to your specific system landscape, eliminating data silos.

For legacy systems with limited connectivity options, we provide specialized adapters that can extract and transform data without requiring modifications to the source systems. This approach minimizes implementation risk and accelerates time-to-value.

Our integration layer includes robust error handling and reconciliation processes to ensure data integrity across all connected systems. Detailed audit logs track all data movements for compliance and troubleshooting purposes.

The result is a cohesive technology ecosystem that creates a unified environment where information flows securely between systems, maximizing the value of all your pension management tools.`,
    diagramDefinition: integrationDiagram,
    order: 4,
    site: SITE,
  },
  {
    _id: 'solution-pensionable-consulting',
    _type: 'solution',
    title: 'Consulting',
    slug: { _type: 'slug', current: 'consulting' },
    description: 'Expert professional services and guidance',
    features: ['Implementation support', 'Custom solution design', 'Training and workshops', 'Ongoing maintenance'],
    detailHeader: 'Professional Services',
    detailContent: `The Consulting component provides expert guidance throughout your implementation journey and beyond. Our team combines deep pension domain knowledge with technical expertise to design solutions that address your specific challenges.

From initial assessment and planning through implementation, training, and ongoing support, we ensure that you maximize the value of your pensionable.ai investment. Our consultants help identify optimization opportunities and develop custom solutions for unique requirements.

We begin with a comprehensive assessment of your current processes, systems, and challenges. This diagnostic phase identifies specific areas where our technology can deliver the greatest impact, creating a roadmap for implementation.

During implementation, our consultants work alongside your team to ensure smooth deployment and knowledge transfer. We provide specialized training tailored to different user roles, from administrators to actuaries.

This collaborative approach ensures that technology implementation aligns with your strategic objectives and delivers measurable improvements in operational efficiency, compliance assurance, and mathematical certainty.`,
    diagramDefinition: consultingDiagram,
    order: 5,
    site: SITE,
  },

  // ── Agents ────────────────────────────────────────────────────────
  {
    _id: 'agent-pensionable-rca',
    _type: 'agent',
    name: 'Scheme Rule Encoding Agents (RCA)',
    slug: { _type: 'slug', current: 'rca' },
    abbreviation: 'RCA',
    description: 'Specialised agents that interpret and encode pension scheme rules into a mathematically precise format',
    capabilities: [
      'Natural language processing of scheme documentation',
      'Rule pattern recognition and classification',
      'Mathematical rule formalization',
      'Consistency checking and validation',
    ],
    diagramDefinition: rcaDiagram,
    order: 1,
    site: SITE,
  },
  {
    _id: 'agent-pensionable-raa',
    _type: 'agent',
    name: 'Scheme Rule Assurance Agent (RAA)',
    slug: { _type: 'slug', current: 'raa' },
    abbreviation: 'RAA',
    description: 'Verification agents that ensure the accuracy and completeness of encoded rules',
    capabilities: [
      'Automated rule testing and verification',
      'Edge case detection',
      'Compliance validation',
      'Rule conflict detection',
    ],
    diagramDefinition: raaDiagram,
    order: 2,
    site: SITE,
  },
  {
    _id: 'agent-pensionable-rea',
    _type: 'agent',
    name: 'Scheme Rule Execution Agent (REA)',
    slug: { _type: 'slug', current: 'rea' },
    abbreviation: 'REA',
    description: 'Execution agents that apply encoded rules to pension calculations and processing',
    capabilities: [
      'High-performance rule execution',
      'Real-time calculation processing',
      'Audit trail generation',
      'Result validation and verification',
    ],
    diagramDefinition: reaDiagram,
    order: 3,
    site: SITE,
  },
  {
    _id: 'agent-pensionable-dta',
    _type: 'agent',
    name: 'Scheme Data Transport Agent (DTA)',
    slug: { _type: 'slug', current: 'dta' },
    abbreviation: 'DTA',
    description: 'Data handling agents that manage secure information flow between system components',
    capabilities: [
      'Secure data transmission',
      'Format transformation and validation',
      'Data integrity checking',
      'Audit logging',
    ],
    diagramDefinition: dtaDiagram,
    order: 4,
    site: SITE,
  },

  // ── Team Members ──────────────────────────────────────────────────
  {
    _id: 'teamMember-pensionable-mark-crump',
    _type: 'teamMember',
    name: 'Mark Crump',
    role: 'Chief Executive Officer',
    bio: "With over 20 years of experience as either CEO or CTO at Pensions Administration Software companies, Mark specialises in product design and development, while fostering lasting client relationships. His expertise lies in transforming complex problems and ideas into enterprise-grade solutions for the pensions industry.",
    linkedinUrl: 'https://www.linkedin.com/in/mark-crump-5551171a/',
    expertise: ['Artificial Intelligence', 'Pension Systems', 'Enterprise Strategy'],
    order: 1,
    site: SITE,
  },
  {
    _id: 'teamMember-pensionable-spencer-lynch',
    _type: 'teamMember',
    name: 'Spencer Lynch',
    role: 'Commercial Director',
    bio: "Spencer is a senior technology leader in the pensions industry, specialising in creating, developing and taking to market innovative data and technology solutions. He has a proven track record of streamlining pension administration processes to simplify the de-risking journey. Spencer is passionate about delivering solutions that make pension management more accessible, efficient and stress-free for administrators, employers, and scheme members.",
    linkedinUrl: 'https://www.linkedin.com/in/spencelynch/',
    expertise: ['Business Development', 'Pension Systems', 'Product Strategy'],
    order: 2,
    site: SITE,
  },
  {
    _id: 'teamMember-pensionable-jason-rogers',
    _type: 'teamMember',
    name: 'Jason Rogers',
    role: 'Chief Technology Officer',
    bio: "With 25 years in financial services and technology, Jason brings a unique blend of operational and technical expertise gained in senior leadership roles (including COO) at multiple multi-billion dollar hedge funds. He has architected enterprise-grade reconciliation solutions, transforming complex financial workflows through innovative technological implementations.",
    linkedinUrl: 'https://www.linkedin.com/in/jasonrogers27/',
    expertise: ['Machine Learning', 'Automated Reasoning', 'Data Security'],
    order: 3,
    site: SITE,
  },
  {
    _id: 'teamMember-pensionable-andrew-davidson',
    _type: 'teamMember',
    name: 'Andrew Davidson',
    role: 'Board Advisor',
    bio: "Over 25 years experience as a technology entrepreneur. Andy has founded and co-founded multiple seed-stage tech companies. He has led and built teams of over 200 people, raised over \u00a320M in finance, scaled business to over \u00a310M in revenue and enjoyed two large 8 figure exits within his portfolio.",
    linkedinUrl: 'https://www.linkedin.com/in/andydavidson1974/',
    expertise: ['Enterprise Strategy', 'Product Strategy', 'System Architecture'],
    order: 4,
    site: SITE,
  },
  {
    _id: 'teamMember-pensionable-david-rich',
    _type: 'teamMember',
    name: 'David Rich',
    role: 'Chief Data Officer',
    bio: "Over 25 years experience as a technology and data entrepreneur. Whether undertaking de-risking programmes, improving member engagement, or delivering data to the Pensions Dashboard, good data is vital to the efficient administration of pensions. David's expertise lies in the combination of his pensions experience and deep understanding of how to improve and unlock the power of data.",
    linkedinUrl: 'https://www.linkedin.com/in/david-rich-epmi-4465021/',
    expertise: ['Pensions Data', 'Data Quality', 'Regulatory Engagement'],
    order: 5,
    site: SITE,
  },

  // ── Use Cases ─────────────────────────────────────────────────────
  {
    _id: 'useCase-pensionable-defined-benefit-prt',
    _type: 'useCase',
    title: 'Defined Benefit PRT',
    slug: { _type: 'slug', current: 'defined-benefit-prt' },
    subtitle: 'Mathematical certainty for Pension Risk Transfer transactions',
    challenge: `Pension Risk Transfer (PRT) for Defined Benefit schemes involves significant challenges including data quality issues, complex scheme rule interpretation, and valuation uncertainties. These hurdles can significantly impact transaction success.

Insurers require precise calculations for accurate pricing, while pension schemes need certainty that all member benefits are correctly valued. If calculations are incorrect, the transaction may be mispriced, delayed, or even fail.

Traditional manual approaches are time-consuming, prone to errors, and create bottlenecks that delay transactions and potentially impact pricing. This affects all stakeholders in the transaction.`,
    approach: `pensionable.ai transforms the PRT process through our intelligent agent architecture. We convert complex scheme rules into mathematically precise executable code, identifying and resolving ambiguities upfront.

Our system generates comprehensive test data covering all potential scenarios and validates calculations against existing methods, ensuring 100% confidence in benefit valuations before proceeding with the transfer.

By automating rule interpretation, data validation, and calculations, we eliminate manual errors, accelerate the process, and provide complete transparency and auditability for all parties involved.`,
    solutionArchitecture: [
      {
        _type: 'featureList', _key: k(), title: 'Rule Interpretation & Data Preparation',
        items: [
          { _key: k(), title: 'Scheme Rule Encoding', description: 'Converts natural language scheme rules into precise executable code, identifying ambiguities' },
          { _key: k(), title: 'Data Integration', description: 'Securely integrates and cleanses member data from multiple sources' },
          { _key: k(), title: 'Validation Framework', description: 'Establishes a comprehensive testing regime for all benefit calculations' },
        ],
      },
      {
        _type: 'featureList', _key: k(), title: 'Calculation & Verification',
        items: [
          { _key: k(), title: 'Comprehensive Testing', description: 'Generates test data covering all potential scenarios' },
          { _key: k(), title: 'Benefit Calculations', description: 'Performs high-performance, accurate calculations at scale' },
          { _key: k(), title: 'Audit & Documentation', description: 'Creates complete audit trails for all calculations and decisions' },
        ],
      },
    ],
    benefits: [
      { _type: 'benefitCard', _key: k(), title: 'Enhanced Accuracy', description: 'Eliminate calculation errors with mathematical precision in benefit valuations', icon: 'check-circle' },
      { _type: 'benefitCard', _key: k(), title: 'Accelerated Timeline', description: 'Complete transactions faster by eliminating manual bottlenecks in the process', icon: 'clock' },
      { _type: 'benefitCard', _key: k(), title: 'Complete Transparency', description: 'Gain full visibility into all calculations with comprehensive audit trails', icon: 'hand' },
    ],
    faqs: [
      { _type: 'faq', _key: k(), question: 'What is Defined Benefit PRT?', answer: 'Pension Risk Transfer (PRT) for Defined Benefit schemes involves transferring pension liabilities from the original sponsor to an insurer. This complex process requires precise calculation of all member benefits, accurate valuation of liabilities, and careful data cleansing to ensure appropriate pricing and successful transactions.' },
      { _type: 'faq', _key: k(), question: 'What challenges are involved in PRT transactions?', answer: 'PRT transactions face numerous challenges, including data quality issues, complex scheme rule interpretation, valuation uncertainties, and administrative bottlenecks. These challenges can lead to pricing inefficiencies, delays, and potential disputes, which can significantly impact transaction outcomes.' },
      { _type: 'faq', _key: k(), question: 'How does pensionable.ai improve the PRT process?', answer: 'Our solution transforms the PRT process by converting complex scheme rules into mathematically precise executable code, identifying and resolving ambiguities upfront. We generate comprehensive test data covering all scenarios, validate calculations, and ensure 100% confidence in benefit valuations before proceeding with the transfer.' },
    ],
    whoBenefits: [
      { _type: 'benefitCard', _key: k(), title: 'Chief Risk Officers', description: 'Ensure accurate valuation of pension liabilities and minimize transaction risks', icon: 'chart' },
      { _type: 'benefitCard', _key: k(), title: 'Chief Technology Officers', description: 'Integrate with legacy systems and automate complex calculation processes', icon: 'cpu' },
      { _type: 'benefitCard', _key: k(), title: 'Chief Actuaries', description: 'Access precise benefit valuations for accurate pricing of bulk annuity deals', icon: 'dollar' },
    ],
    ctaTitle: 'Ready to transform your Pension Risk Transfer process?',
    ctaDescription: 'Contact us today to discuss how our solution can help you achieve mathematical certainty in your transactions',
    site: SITE,
  },
  {
    _id: 'useCase-pensionable-isp-value-data',
    _type: 'useCase',
    title: 'ISP Value Data',
    slug: { _type: 'slug', current: 'isp-value-data' },
    subtitle: 'Ensuring member certainty with accurate pension benefit statements',
    challenge: `Pensions Dashboard Value Data is about to present significant challenges for pension administrators and their advisors. Members require accurate information about their benefits and projected values, but calculation inconsistencies, legacy system limitations, and data fragmentation lead to varying results. Many schemes do not revalue deferred benefits on an annual basis.

Different interpretations of complex scheme rules create ambiguity, while evolving regulatory requirements demand constant updates to statement production processes. Technical pension information is also difficult to present in an understandable format for members.

These issues not only undermine member confidence but also create significant administrative burdens and potential legal liabilities for trustees and administrators who provide incorrect benefit information.`,
    approach: `pensionable.ai transforms the ISP Value Data process through our intelligent agent architecture. Our system ensures consistent calculation of all benefit calculations using the same interpretation of scheme rules, eliminating variations.

We convert complex rules into precise, machine-executable code, integrate fragmented data from multiple sources, and automatically incorporate regulatory changes. Our comprehensive testing ensures accuracy across all member calculations.

This approach delivers accurate, timely, and compliant benefit statements to members while reducing administrative burden and providing a complete audit trail for regulatory compliance.`,
    solutionArchitecture: [
      {
        _type: 'featureList', _key: k(), title: 'Data Integration & Rule Encoding',
        items: [
          { _key: k(), title: 'Scheme Rule Encoding', description: 'Converts scheme rules into precise, machine-executable code, removing ambiguity' },
          { _key: k(), title: 'Data Integration', description: 'Connects to multiple legacy systems to create a unified data model' },
          { _key: k(), title: 'Data Cleansing', description: 'Identifies and resolves inconsistencies across member records' },
        ],
      },
      {
        _type: 'featureList', _key: k(), title: 'Calculation & Validation',
        items: [
          { _key: k(), title: 'Comprehensive Testing', description: 'Generates test cases to ensure calculations are accurate across all scenarios' },
          { _key: k(), title: 'Automated Calculations', description: 'Performs calculations consistently for all members using the same rule interpretations' },
          { _key: k(), title: 'Statement Generation', description: 'Creates clear, accurate statements with automated regulatory disclosures' },
        ],
      },
    ],
    benefits: [
      { _type: 'benefitCard', _key: k(), title: 'Calculation Consistency', description: 'Ensure all members receive benefit statements based on the same scheme rule interpretations', icon: 'check' },
      { _type: 'benefitCard', _key: k(), title: 'Efficiency Gains', description: 'Dramatically reduce the time and resources required to produce accurate benefit statements', icon: 'clock' },
      { _type: 'benefitCard', _key: k(), title: 'Reduced Risk', description: 'Minimise legal and reputational risks associated with incorrect benefit statements', icon: 'shield' },
    ],
    faqs: [
      { _type: 'faq', _key: k(), question: 'What is ISP Value Data?', answer: 'Individual Statement of Pension (ISP) Value Data refers to the information provided to pension scheme members about their benefits, entitlements, and projected values. This includes accrued benefit statements, projected retirement values, transfer value calculations, and illustrations of different retirement scenarios.' },
      { _type: 'faq', _key: k(), question: 'Why is accurate ISP Value Data important?', answer: 'Accurate ISP Value Data is essential for member confidence, regulatory compliance, and trustee governance. Members rely on this information for retirement planning, while inaccurate statements can create legal liabilities for trustees and administrators and undermine trust in the pension system.' },
      { _type: 'faq', _key: k(), question: 'How does pensionable.ai improve ISP Value Data?', answer: 'Our solution ensures consistent calculation of all benefit statements using the same interpretation of scheme rules, eliminating variations. Our AI-driven approach integrates fragmented data, automates calculations, and incorporates regulatory changes to deliver accurate, timely, and compliant benefit statements while reducing administrative burden.' },
    ],
    whoBenefits: [
      { _type: 'benefitCard', _key: k(), title: 'Pension Administrators', description: 'Streamline operations and reduce resources needed for statement production', icon: 'user' },
      { _type: 'benefitCard', _key: k(), title: 'Trustees', description: 'Ensure governance obligations are met with accurate, consistent member communications', icon: 'building' },
      { _type: 'benefitCard', _key: k(), title: 'Member Communication Teams', description: 'Focus on presenting information clearly, backed by accurate underlying calculations', icon: 'mail' },
    ],
    ctaTitle: 'Ready to transform your member benefit statements?',
    ctaDescription: 'Contact us today to discuss how we can help you provide accurate, consistent information to your members',
    site: SITE,
  },
  {
    _id: 'useCase-pensionable-gmp-rectification',
    _type: 'useCase',
    title: 'GMP Rectification',
    slug: { _type: 'slug', current: 'gmp-rectification' },
    subtitle: 'Automated compliance and accuracy for complex historical pension calculations',
    challenge: `Guaranteed Minimum Pension (GMP) Rectification is a critical compliance challenge for pension schemes. GMPs were accrued between 1978 and 1997, and schemes must now correct historical errors in calculations and records.

This process involves reconciling scheme data with HMRC records, identifying discrepancies, and making complex adjustments. Challenges include poor data quality, intricate calculation rules that vary by time period, legacy system limitations, and resource constraints.

Additionally, discovering historical payment errors creates difficult decisions about recovery or compensation, and explaining these technical changes to members adds further complexity.`,
    approach: `pensionable.ai transforms GMP Rectification with our integrated agent-based solution. We automate the interpretation of complex GMP legislation and scheme rules into precise, executable code.

Our technology extracts and structures data from legacy formats, identifies patterns in incomplete data, and cross-references multiple sources to validate information.

We generate comprehensive test cases covering all calculation scenarios, automatically compare scheme records with HMRC data, and provide detailed financial impact analysis. This approach converts a resource-intensive compliance exercise into a manageable, accurate, and efficient process.`,
    solutionArchitecture: [
      {
        _type: 'featureList', _key: k(), title: 'Data Analysis Phase',
        items: [
          { _key: k(), title: 'Scheme Rule Encoding', description: 'Converts complex GMP legislation and scheme rules into precise, executable code' },
          { _key: k(), title: 'Legacy Data Extraction', description: 'Advanced data archaeology to recover and reconstruct historical records' },
          { _key: k(), title: 'HMRC Data Integration', description: 'Secure import and normalisation of HMRC GMP data' },
        ],
      },
      {
        _type: 'featureList', _key: k(), title: 'Processing & Resolution Phase',
        items: [
          { _key: k(), title: 'Automated Reconciliation', description: 'AI-driven comparison and categorisation of discrepancies' },
          { _key: k(), title: 'Impact Assessment', description: 'Detailed analysis of financial implications at scheme and member levels' },
          { _key: k(), title: 'Implementation Support', description: 'Generation of correction instructions and member communications' },
        ],
      },
    ],
    benefits: [
      { _type: 'benefitCard', _key: k(), title: 'Accelerated Compliance', description: 'Complete GMP reconciliation projects in a fraction of the time required by traditional methods', icon: 'lightning' },
      { _type: 'benefitCard', _key: k(), title: 'Enhanced Accuracy', description: 'Mathematical certainty in calculations with comprehensive validation and testing', icon: 'check-circle' },
      { _type: 'benefitCard', _key: k(), title: 'Comprehensive Reporting', description: 'Detailed impact assessments and audit trails for trustee and regulatory reporting', icon: 'chart' },
    ],
    faqs: [
      { _type: 'faq', _key: k(), question: 'What is GMP Rectification?', answer: 'Guaranteed Minimum Pension (GMP) Rectification is the process of correcting historical errors in GMP calculations and records to ensure compliance with legislative requirements. GMPs were accrued between 1978 and 1997 when schemes were contracted out of the State Earnings-Related Pension Scheme.' },
      { _type: 'faq', _key: k(), question: 'Why is GMP Rectification necessary?', answer: 'GMP Rectification is necessary to comply with legal obligations, ensure members receive the correct benefits, and to avoid potential regulatory penalties. Following the end of contracting out in 2016, schemes must reconcile their GMP data with HMRC records and make necessary corrections.' },
      { _type: 'faq', _key: k(), question: 'How does pensionable.ai approach GMP Rectification differently?', answer: 'While traditional approaches rely on manual checking and limited automation, pensionable.ai uses AI to interpret complex GMP legislation, extract data from legacy systems, and automate the reconciliation process. Our agent-based architecture ensures accuracy, consistency, and significant time savings.' },
    ],
    whoBenefits: [
      { _type: 'benefitCard', _key: k(), title: 'Trustee Boards', description: 'Gain confidence in compliance and transparency in decision-making for complex GMP issues', icon: 'users' },
      { _type: 'benefitCard', _key: k(), title: 'Compliance Managers', description: 'Complete regulatory requirements efficiently with robust audit trails and documentation', icon: 'shield' },
      { _type: 'benefitCard', _key: k(), title: 'Finance Directors', description: 'Reduce costs and resource requirements while improving financial accuracy and planning', icon: 'dollar' },
    ],
    ctaTitle: 'Ready to transform your GMP Rectification process?',
    ctaDescription: 'Contact us today to discuss your specific GMP challenges and see how our solution can help',
    site: SITE,
  },

  // ── Stakeholders ──────────────────────────────────────────────────
  {
    _id: 'stakeholder-pensionable-pension-scheme-trustees',
    _type: 'stakeholder',
    title: 'Pension Scheme Trustees',
    slug: { _type: 'slug', current: 'pension-scheme-trustees' },
    challenges: [
      'Ensuring proper management of scheme funds and member interests',
      'Monitoring compliance with increasingly complex regulations',
      'Ensuring data accuracy without having direct control over administration',
      'Managing the risk of incorrect benefit calculations',
      'Balancing member interests with practicalities of scheme management',
    ],
    howWeHelp: [
      { _type: 'benefitCard', _key: k(), title: 'Enhanced Governance', description: 'AI-powered verification of scheme rule interpretation and application, providing mathematical certainty and clear audit trails for trustee decision-making.' },
      { _type: 'benefitCard', _key: k(), title: 'Risk Reduction', description: 'Comprehensive verification of benefit calculations and data quality, significantly reducing the risk of errors and regulatory non-compliance.' },
      { _type: 'benefitCard', _key: k(), title: 'Improved Oversight', description: 'Better visibility into scheme administration and calculations with detailed impact analysis for different approaches to scheme management.' },
    ],
    benefits: [
      'Greater confidence in benefit calculations',
      'Enhanced data quality and completeness',
      'Improved regulatory compliance',
      'Cost efficiency through reduced actuarial reviews',
      'Better-informed decision making',
    ],
    relatedIssues: ['GMP Rectification', 'Pension Risk Transfer'],
    overview: 'Pension Scheme Trustees are responsible for ensuring proper governance of pension schemes, separated from the company that established the scheme. They include both internal trustees (company employees) and professional trustees from specialised firms. Their key responsibilities include managing scheme funds, monitoring regulatory compliance, safeguarding member interests, and appointing administrators and other service providers.',
    order: 1,
    site: SITE,
  },
  {
    _id: 'stakeholder-pensionable-pension-scheme-administrators',
    _type: 'stakeholder',
    title: 'Pension Scheme Administrators',
    slug: { _type: 'slug', current: 'pension-scheme-administrators' },
    challenges: [
      'Maintaining and operating legacy administration systems',
      'Managing increasingly complex regulatory compliance',
      'Dealing with historical data quality issues',
      'Addressing the shortage of specialized pension expertise',
      'Implementing complex scheme rules consistently and accurately',
    ],
    howWeHelp: [
      { _type: 'benefitCard', _key: k(), title: 'Modern Architecture Integration', description: 'Our API-first approach allows integration without replacing legacy systems, using microservices architecture for flexibility and gradual migration paths.' },
      { _type: 'benefitCard', _key: k(), title: 'Automated Rule Interpretation', description: 'The Scheme Rule Encoding Agent (RCA) eliminates ambiguity in scheme rules with machine-executable code ensuring consistent application across all calculations.' },
      { _type: 'benefitCard', _key: k(), title: 'Efficient Data Management', description: 'The Scheme Data Transport Agent (DTA) handles complex data integration with automated cleansing and validation to improve quality across systems.' },
    ],
    benefits: [
      'Significant reduction in calculation errors',
      'Improved data quality and consistency',
      'Enhanced processing efficiency',
      'Faster implementation of regulatory changes',
      'Reduced dependency on scarce specialist resources',
    ],
    relatedIssues: ['ISP Value Data', 'GMP Rectification'],
    overview: 'Pension Scheme Administrators handle the day-to-day operations of pension schemes, including calculations, benefit statements, and member communications. This includes both in-house administration teams (approximately 20% of schemes) and third-party administrators (TPAs) and employee benefit consultancies (EBCs) that manage the remaining 80%. The market includes several major providers along with numerous boutique administrators serving different segments of the market.',
    order: 2,
    site: SITE,
  },
  {
    _id: 'stakeholder-pensionable-insurance-companies',
    _type: 'stakeholder',
    title: 'Insurance Companies',
    slug: { _type: 'slug', current: 'insurance-companies' },
    challenges: [
      'Ensuring data accuracy during pension risk transfer due diligence',
      'Interpreting complex scheme rules for benefit valuation',
      'Verifying historical benefit calculations',
      'Managing transaction timelines and efficiency',
      'Balancing competitive pricing with prudent risk margins',
    ],
    howWeHelp: [
      { _type: 'benefitCard', _key: k(), title: 'Enhanced Due Diligence', description: 'AI-powered verification of scheme rule interpretation and application, ensuring comprehensive understanding of all liability components.' },
      { _type: 'benefitCard', _key: k(), title: 'Data Validation', description: 'Advanced data cleansing and validation capabilities to ensure accurate member information and identify potential issues early in the transaction process.' },
      { _type: 'benefitCard', _key: k(), title: 'Calculation Accuracy', description: 'The Scheme Rule Execution Agent (REA) ensures consistent and accurate application of scheme rules, with comprehensive test case coverage for all benefit scenarios.' },
    ],
    benefits: [
      'More accurate pricing and risk assessment',
      'Reduced transaction timelines',
      'Comprehensive identification of edge cases',
      'Better quantification of data quality issues',
      'Enhanced competitive position through efficiency',
    ],
    relatedIssues: ['Pension Risk Transfer', 'Data Quality'],
    overview: 'Insurance companies play a crucial role in pension risk transfer (PRT), where they take on pension liabilities from corporate schemes. The UK PRT market has grown substantially since 2022 due to improved scheme funding levels. Insurance companies perform comprehensive due diligence on scheme data, rules, and benefit structures before pricing and accepting pension liabilities.',
    order: 3,
    site: SITE,
  },
  {
    _id: 'stakeholder-pensionable-pension-system-providers',
    _type: 'stakeholder',
    title: 'Pension System Providers',
    slug: { _type: 'slug', current: 'pension-system-providers' },
    challenges: [
      'Maintaining legacy systems with significant technical debt',
      'Implementing constant regulatory updates',
      'Addressing the shortage of developers familiar with older technologies',
      'Supporting complex scheme rule implementation',
      'Meeting modern integration requirements',
    ],
    howWeHelp: [
      { _type: 'benefitCard', _key: k(), title: 'Enhanced Capabilities', description: 'Our AI-powered solution complements existing systems by adding advanced rule interpretation and validation capabilities without replacement.' },
      { _type: 'benefitCard', _key: k(), title: 'Regulatory Support', description: 'Automated implementation of regulatory changes through flexible rule engines that adapt to new requirements without extensive reprogramming.' },
      { _type: 'benefitCard', _key: k(), title: 'Simplified Integration', description: 'Modern API-first architecture that easily connects with existing systems to enhance specific high-value functions while preserving core functionality.' },
    ],
    benefits: [
      'Extended lifespan of existing systems',
      'Reduced development burden for complex features',
      'More efficient response to regulatory changes',
      'Improved client satisfaction and retention',
      'New value-added capabilities without full replacement',
    ],
    relatedIssues: ['ISP Value Data', 'System Integration'],
    overview: 'Pension System Providers develop and maintain the software platforms used by pension administrators. This market has high concentration with few major players and significant consolidation through M&A activity. Most systems originated 20+ years ago with ongoing updates and face challenges with technical debt, regulatory changes, and diminishing technical expertise.',
    order: 4,
    site: SITE,
  },

  // ── Technology Partners ───────────────────────────────────────────
  {
    _id: 'technologyPartner-pensionable-anthropic',
    _type: 'technologyPartner',
    name: 'Anthropic',
    url: 'https://www.anthropic.com/',
    description: 'Anthropic is an AI safety company building reliable, interpretable, and steerable AI systems. Their Claude model powers our most advanced natural language processing capabilities.',
    order: 1,
    site: SITE,
  },
  {
    _id: 'technologyPartner-pensionable-openai',
    _type: 'technologyPartner',
    name: 'OpenAI',
    url: 'https://openai.com/about/',
    description: 'OpenAI is a leading AI research laboratory developing advanced models like GPT-4. We leverage their technology for sophisticated pattern recognition and data analysis in our pension rule processing.',
    order: 2,
    site: SITE,
  },
  {
    _id: 'technologyPartner-pensionable-aws-guardrails',
    _type: 'technologyPartner',
    name: 'AWS Bedrock Guardrails',
    url: 'https://aws.amazon.com/bedrock/guardrails/',
    description: 'AWS Bedrock Guardrails provides enterprise-grade safety measures for our AI systems. This technology ensures our AI operations maintain compliance with regulatory requirements and security standards.',
    order: 3,
    site: SITE,
  },
];

// ─── Seed function ──────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding ${documents.length} documents for pensionable.ai...`);

  const transaction = client.transaction();
  for (const doc of documents) {
    transaction.createOrReplace(doc);
  }

  const result = await transaction.commit();
  console.log(`Successfully seeded ${documents.length} documents.`);
  console.log(`Transaction ID: ${result.transactionId}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
