#!/usr/bin/env node

import { readFileSync } from "node:fs";

const contractPath = new URL("../integration/standardflow/contract.json", import.meta.url);
const fixturePath = new URL(
  "../integration/standardflow/fixtures/text-pattern-evidence.json",
  import.meta.url,
);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const hex40 = /^[a-f0-9]{40}$/u;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const key of [
  "automatic_revision_updates",
  "default_network",
  "default_external_writes",
  "default_telemetry",
  "raw_text_export_default",
]) {
  assert(contract[key] === false, `${key} must be false`);
}

for (const key of ["producer_revision", "consumer_revision"]) {
  assert(hex40.test(contract[key]), `${key} must be an exact 40-character revision`);
}

assert(
  contract.producer_revision === fixture.producer_revision,
  "producer revision differs between contract and fixture",
);
assert(
  fixture.schema_version === "dev.standardflow.ecosystem-evidence.v1",
  "unexpected ecosystem evidence schema version",
);
assert(
  fixture.producer === "authentext" && fixture.evidence_type === "text_pattern_finding",
  "fixture producer or evidence type is incorrect",
);
assert(fixture.authority === "advisory", "Authentext findings must remain advisory");
assert(fixture.payload?.raw_text_included === false, "raw text must be excluded by default");
assert(
  fixture.payload?.canonical_write_performed === false,
  "the fixture must prove that no canonical write occurred",
);
assert(Array.isArray(contract.prohibited_inferences), "prohibited inferences are required");
assert(contract.rollback?.length > 0 && contract.claim_boundary, "rollback and claim boundary are required");

console.log("Authentext StandardFlow integration validation passed");
