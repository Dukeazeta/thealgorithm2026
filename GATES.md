# Gallery display cap fix

- [x] G1: The server-rendered gallery loads more than the API's default page size.
  CHECK: pnpm typecheck
  EVIDENCE: passed; the page receives `nextOffset` and the client loads 50-item batches.
- [x] G2: The gallery still builds and lint passes.
  CHECK: pnpm lint && pnpm build
  EVIDENCE: `pnpm lint` passed with one pre-existing warning in `scripts/upload-signout-gallery.ts`; `pnpm build` passed.
- [x] G3: The production API remains paginated while the page requests the full set.
  CHECK: source inspection and production response
  EVIDENCE: local API verified page one `50`, page two `50`, and `nextOffset=100`; the client observer appends batches and shows `Back to top` after exhaustion.
