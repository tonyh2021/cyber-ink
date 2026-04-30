## Tasks

- [x] Update `PolishStatus` type: drop `previous`/`current`, add `rounds: string[]`
- [x] Rewrite `polish-data.ts`: replace `rotatePolishRound` with `savePolishRound`, update `getPolishStatus` to read `rounds/` directory, update `initPolishSession` to create `rounds/` dir, update `applyPolish` to derive picks from rounds
- [x] Update `polish/round/route.ts`: call `savePolishRound` instead of `rotatePolishRound`
- [x] Update `polish/apply/route.ts`: validate picks against rounds array
- [x] Update `workspace.tsx`: derive `current`/`previous` from `rounds` array, remove `polishPrevious`/`polishCurrent` state, update diff logic
- [x] Update `PolishToolbar`: remove `hasPrevious` prop, "vs Previous" button always enabled
- [x] Update `PolishApplyModal`: derive choices from rounds array
- [ ] Verify: Round 1 "vs Previous" shows diff against original
- [ ] Verify: Round 2+ "vs Previous" shows diff against last round
- [ ] Verify: Apply modal shows correct content for each choice
