#!/usr/bin/env node

import { readFileSync } from "node:fs";

const contractPath = new URL(
  "../conductor/tracks/domain-and-citation_20260811/standardflow-contract.json",
  import.meta.url,
);
const fixturePath = new URL(
  "../conductor/tracks/domain-and-citation_20260811/standardflow-fixture.json",
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

function nonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
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

for (const key of ["producer_baseline_revision", "consumer_revision"]) {
  assert(hex40.test(contract[key]), `${key} must be an exact 40-character revision`);
}

const contractProvenance = contract.artifact_provenance;
assert(contractProvenance?.kind === "pull_request_head", "contract provenance must be pull_request_head");
assert(contractProvenance.repository === "edithatogo/authentext", "contract provenance repository is incorrect");
assert(contractProvenance.pull_request === 307, "contract provenance must identify pull request 307");
assert(contractProvenance.immutable === false, "pull-request provenance must remain explicitly mutable");
assert(
  Array.isArray(contractProvenance.paths) &&
    contractProvenance.paths.length > 0 &&
    contractProvenance.paths.every(nonEmptyString),
  "contract provenance must list retrievable Conductor paths",
);

assert(
  contract.producer_baseline_revision === fixture.producer_revision,
  "producer baseline differs between contract and fixture",
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
assert(nonEmptyString(fixture.subject), "fixture subject is required");

const provenance = fixture.artifact_provenance;
assert(provenance?.kind === "pull_request_head", "fixture provenance must be pull_request_head");
assert(provenance.repository === "edithatogo/authentext", "fixture provenance repository is incorrect");
assert(provenance.pull_request === 307, "fixture provenance must identify pull request 307");
assert(
  provenance.path === "conductor/tracks/domain-and-citation_20260811/standardflow-fixture.json",
  "fixture provenance path is incorrect",
);
assert(provenance.immutable === false, "pull-request fixture provenance must remain mutable");

const payload = fixture.payload;
assert(payload && typeof payload === "object" && !Array.isArray(payload), "fixture payload is required");
for (const key of ["document_id", "pattern_id", "pattern_version", "finding", "suggestion"]) {
  assert(nonEmptyString(payload[key]), `${key} must be a non-empty string`);
}
const span = payload.span;
assert(span && typeof span === "object" && !Array.isArray(span), "span is required");
assert(Number.isSafeInteger(span.start_utf8) && span.start_utf8 >= 0, "span.start_utf8 must be a non-negative safe integer");
assert(Number.isSafeInteger(span.end_utf8) && span.end_utf8 > span.start_utf8, "span.end_utf8 must be a safe integer greater than start_utf8");
assert(nonEmptyString(span.locator), "span.locator must be a non-empty string");
assert(typeof payload.confidence === "number" && Number.isFinite(payload.confidence), "confidence must be finite");
assert(payload.confidence >= 0 && payload.confidence <= 1, "confidence must be between 0 and 1");
assert(payload.raw_text_included === false, "raw text must be excluded by default");
assert(payload.canonical_write_performed === false, "the fixture must prove that no canonical write occurred");
assert(
  Array.isArray(fixture.limitations) && fixture.limitations.length > 0 && fixture.limitations.every(nonEmptyString),
  "limitations must contain non-empty strings",
);
assert(Array.isArray(contract.prohibited_inferences), "prohibited inferences are required");
assert(contract.rollback?.length > 0 && contract.claim_boundary, "rollback and claim boundary are required");

console.log("Authentext StandardFlow integration validation passed");
