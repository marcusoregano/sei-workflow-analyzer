# Privacy and Anonymization Policy

This repository contains a public, anonymized version of a workflow-analysis userscript.

## Core principle

The public version must preserve software logic while removing operational, personal, contractual, financial and institutional identifiers derived from real administrative processes.

## Information that must not be published

The following data must be removed, generalized or replaced with synthetic examples:

- Real administrative process numbers
- Real commitment / budget note numbers
- Real funding-source identifiers
- Real contract numbers
- Real procurement or contracting objects
- Real suppliers, creditors or contractors
- CNPJ, CPF or other identification numbers
- Real invoice or payment-document numbers
- Real monetary values when linked to identifiable cases
- Names of employees, public agents or third parties
- Employee IDs, registration numbers or internal identifiers
- Real email addresses
- Internal organizational structures when unnecessarily specific
- Authenticated SEI URLs
- Internal IDs, hashes, tokens or signed parameters
- Verification codes and CRC values
- Real examples embedded in comments, logs or test cases
- Screenshots, PDFs or generated reports containing real operational data

## Public examples

Examples included in this repository must use synthetic data.

Synthetic examples should:

- Preserve the structure needed to demonstrate the software
- Avoid reproducing real combinations of process, contract, creditor, value and funding source
- Clearly state that the data is fictitious
- Use generic organizational names and identifiers
- Never point to a real SEI environment

## Deterministic dictionaries

Operational dictionaries that associate real text patterns with real commitments, funding sources, contracts or creditors must not be published as-is.

The public version should contain only synthetic examples demonstrating the expected data structure.

## Code comments

Comments must be reviewed with the same care as executable code.

Real process numbers, contract numbers, commitment numbers, creditor names, values and other identifiable examples must be removed from comments and regression notes.

## Visual outputs

Screenshots, PDFs, spreadsheets and printable outputs must be generated exclusively from synthetic data before publication.

## Separation of versions

The internal working version and the public version are separate artifacts.

The internal version may contain organization-specific configuration and real operational mappings.

The public version must contain only anonymized logic, synthetic examples and generic configuration.

## Review rule

Before publication, ask:

> Could someone outside the organization use this information, alone or combined with other information, to identify a real process, contract, supplier, expenditure or person?

If the answer is yes or uncertain, the information must be anonymized.

## Anonymization decisions by data category

### Administrative process identifiers

**Public treatment: REMOVE OR REPLACE WITH SYNTHETIC IDENTIFIERS**

Real administrative process identifiers must never appear in:

- executable source code;
- dictionaries;
- comments;
- regression cases;
- documentation;
- screenshots;
- examples;
- logs committed to the repository.

Real identifiers such as organization-specific process numbers must be replaced with clearly synthetic identifiers, for example:

- `PROCESS_EXAMPLE_001`
- `REGRESSION_CASE_001`
- `SYNTHETIC_PROCESS_A`

Synthetic identifiers should preferably not reproduce the exact numbering format used by the real organization, reducing the possibility of accidental collision with a real process.

Organization-specific dictionaries containing real process identifiers will not be anonymized entry by entry. They will be removed from the public source and replaced by a small synthetic demonstration dataset.

Comments describing real regression cases must preserve the technical reasoning while replacing the real case identifier with a synthetic case name.

### Commitments / budget-note identifiers

**Public treatment: REMOVE REAL MAPPINGS AND REPLACE WITH SYNTHETIC DATASETS**

Real commitment or budget-note identifiers must not be published.

The public repository must not preserve real associations between:

- commitment / budget-note number;
- funding source;
- creditor or supplier;
- contract;
- administrative process;
- procurement or expenditure object;
- monetary value;
- distinctive matching terms.

These relationships may allow a real administrative case to be reconstructed even when one individual field has been anonymized.

For this reason, real operational dictionaries must be removed as a whole from the public version.

The public version may preserve:

- the data structure;
- the matching algorithm;
- scoring logic;
- confidence thresholds;
- generic rule-engine behavior.

Demonstration dictionaries must contain entirely synthetic data and must not reproduce real combinations from the internal environment.

Synthetic examples should use explicit identifiers such as:

- `SYNTHETIC_NE_001`
- `SOURCE_EXAMPLE_A`
- `SYNTHETIC_SUPPLIER_A`
- `SYNTHETIC_CONTRACT_001`

The objective is to demonstrate the software architecture, not to reproduce the organization's accounting database.

### Funding-source identifiers

**Public treatment: REMOVE REAL VALUES AND REPLACE WITH SYNTHETIC PLACEHOLDERS**

Real funding-source identifiers must not be published.

The public repository must not contain real source codes used by the organization, especially when they are associated with:

- commitments;
- contracts;
- creditors;
- administrative processes;
- expenditure objects;
- monetary values;
- deterministic workflow rules.

Real funding sources must be replaced with clearly synthetic identifiers, for example:

- `SOURCE_EXAMPLE_A`
- `SOURCE_EXAMPLE_B`
- `SOURCE_INTERNAL_DEMO`

The public code may preserve the logic that compares or classifies funding sources, but not the real source values or their operational associations.

Real combinations such as commitment + funding source + creditor + object must be removed as a unit rather than anonymized field by field.

### Organizational units

**Public treatment: GENERALIZE INTO CONFIGURABLE FUNCTIONAL GROUPS**

Real organizational-unit identifiers must not be published.

The public version must not embed real unit names, acronyms or organizational paths.

Instead, the software should represent units by functional roles, for example:

- finance;
- accounting;
- planning;
- treasury;
- external finance;
- technical units.

The public engine may preserve workflow rules such as:

- process moved from planning to accounting;
- process remains open in a technical unit;
- process was sent to an external financial authority;
- process returned to the internal finance circuit.

However, the actual unit identifiers used by a real organization must reside only in local configuration.

Synthetic examples may use values such as:

- `ORG/FIN`
- `ORG/FIN/ACCOUNTING`
- `ORG/FIN/PLANNING`
- `ORG/FIN/TREASURY`
- `ORG/TECH/UNIT-A`

The public source code should consume configuration groups rather than hard-code organization-specific units.
