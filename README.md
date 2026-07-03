# Patio Deck Designer (Quebec)

A single-file tool to design a patio deck, get a full material takeoff (boards, packs,
framing, stairs, railing, fasteners, footings), and estimate cost with Quebec taxes.

## How to use
1. **Double-click `patio-deck-designer.html`** — it opens in any browser. No install, works offline.
2. (Optional) Click **📷 Photo** and upload a picture of your yard to trace over. Adjust opacity.
3. Turn on **✏️ Draw rectangle** and drag on the canvas to sketch each deck section
   (add several rectangles for an L-shape), or type exact width × length in the left panel.
4. Pick **material** (PT wood or composite), board profile, length, joist spacing, height, stairs, railing.
5. Read the **right panel**: deck summary, full parts list with quantities/packs, and total cost
   (subtotal + GST 5% + QST 9.975%).
6. Each line has a **🔎 check stock** link that searches your chosen store (Canac default,
   or Rona / Home Depot / Patrick Morin).
7. **💾 Save** to a `.json` file to reopen later, or **🖨️ Print / Save PDF** for a shopping list.

## What it calculates
- **Decking**: area → rows (board face + gap) → linear feet + waste → boards → packs.
  Optional **45° diagonal** layout adds ~15% board.
- **Framing (auto-sized)**: joists sized to the span (**2×6/2×8/2×10/2×12**, or forced) — beams are
  added so each *bay* stays within the joist's allowable span, and the note reports the real per-bay
  span (not the whole depth). Built-up beam is sized (2×8/2×10/2×12, 2- or 3-ply) to the tributary +
  post spacing, and post spacing auto-tightens if the beam can't reach it. Optional **joist
  cantilever** past the outer beam pulls the footing line inboard. Ledger + flashing (if attached),
  rim joists, blocking.
- **Footings**: 6×6 posts + bases; sonotube **diameter (8/10/12″)** and **frost depth** drive the
  concrete bag count (π·r²·depth) and tube count; or on-grade deck blocks. **Region presets**
  auto-fill a typical Québec footing depth by area.
- **Multi-level**: give any section its own height (row or on-canvas editor) — posts are sized per
  level and the 3D/section/code all follow.
- **Fasteners**: deck screws (wood) or hidden fasteners (composite), structural screws
- **Stairs**: step count from deck height ÷ riser, stringers, tread boards
- **Railing**: exposed perimeter (house side auto-excluded if attached)
- **Budget add-ons** (optional): labour ($/ft²), permit fee (untaxed), delivery, contingency % —
  folded into the Québec-tax total.

- **Code check (Québec/CNB planning guidance)**: guards, stair riser/run + handrail + stair guard,
  lateral-load hold-downs on attached decks, tall-post bracing, cantilever, and per-bay joist span.

## Also
- **⇄ ft / m** units toggle for dimensions & areas (Québec permit offices use metric).
- **📐 Section** view — dimensioned side elevation (height, posts, footings, frost line) for a permit sketch.
- **📍 Footing plan** overlay — footing coordinates dimensioned from the house-side corner.
- **⚖ Compare** — wood vs composite side-by-side, including ~10-year staining upkeep for wood.
- **📚 Saved** — keep several named designs in the browser.
- **📋 Proposal / PDF** now embeds plan + 3D + section views.
- **🏛 Permit sheet** — a print-ready drawing set: dimensioned plan + side section, a **footing
  schedule** (X/Y from the house corner, size, depth), a project-data spec table, and a Québec/CNB
  code-compliance summary.
- **🔩 Beam & post assembly guide** — build steps, ply fastening (2-ply nails vs 3-ply bolts),
  splice/crown rules, post-cap detail and joist ties, generated from the design's own numbers.

## Tests
- `node test.mjs` runs headless engine sanity checks (no browser): stubs the DOM, loads the page's
  script, and asserts span/beam/footing/tax/multi-level invariants. Run it after any engine edit.

## Important notes
- **Prices are editable estimates** (2026 Quebec ballpark). Open *Edit unit prices* and adjust to
  real numbers — no retailer offers a public price/stock API, so live prices can't be pulled in
  automatically. The stock links open the store's own search so you can confirm price & availability.
- This is an **estimator, not engineered plans**. Verify spans, footing depth (frost line),
  ledger attachment, and stair/railing geometry against the **Quebec building code / RBQ**,
  and pull a permit before building.
