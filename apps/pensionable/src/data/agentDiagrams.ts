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
    'fontSize': '14px',
    'background': '#1E1E2F'
  },
  'flowchart': {
    'htmlLabels': true,
    'curve': 'basis'
  }
}}%%`;

export const rcaDiagram = `
${baseConfig}
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

export const raaDiagram = `
${baseConfig}
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

export const reaDiagram = `
${baseConfig}
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

export const dtaDiagram = `
${baseConfig}
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
