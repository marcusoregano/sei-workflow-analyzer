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
