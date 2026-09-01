# Architecture

## Overview

The public version is divided conceptually into two layers:

1. Generic workflow-analysis engine
2. Local configuration

The generic engine contains reusable logic for:

- reading SEI process structures;
- interpreting open units;
- measuring elapsed time;
- identifying workflow transitions;
- evaluating rule priorities;
- generating reports;
- exporting results.

The local configuration contains organization-specific information such as:

- target unit;
- internal finance units;
- accounting units;
- treasury units;
- external financial-authority units;
- technical units;
- organization-specific deterministic mappings.

## Design objective

The public engine must not depend directly on the real organizational structure from which the project originated.

Instead of hard-coded comparisons, the engine should work against configuration groups such as:

config.units.finance
config.units.accounting
config.units.technical

## Example

A generic rule may ask whether the current unit is part of the configured technical-unit group.

The engine does not need to know the real name of that unit.

This separation allows the public project to demonstrate and reuse the workflow-analysis architecture without publishing operational identifiers.
