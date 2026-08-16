# Sign-out gallery import

- [ ] G1: Confirm the source folder and exact image count.
  CHECK: PowerShell file enumeration
  EVIDENCE: pending
- [ ] G2: Convert every source image to WebP and upload it to the production Blob store.
  CHECK: importer summary and WebP content-type verification
  EVIDENCE: pending
- [ ] G3: Create one published gallery record and media asset for every uploaded image.
  CHECK: production database count and duplicate check
  EVIDENCE: pending
- [ ] G4: Keep the import resumable so rerunning it does not duplicate gallery records.
  CHECK: importer duplicate-skip summary
  EVIDENCE: pending
- [ ] G5: Confirm the live production gallery exposes the imported records.
  CHECK: production gallery response
  EVIDENCE: pending
