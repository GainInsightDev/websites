const baseConfig = `%%{init: {
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

export const logicETLDiagram = `
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

export const dataETLDiagram = `
${baseConfig}
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

export const analyticsDiagram = `
${baseConfig}
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

export const integrationDiagram = `
${baseConfig}
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

export const consultingDiagram = `
${baseConfig}
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
