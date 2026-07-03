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
- **Decking**: area → rows (board face + gap) → linear feet + waste → boards → packs
- **Framing**: joists at spacing O.C., doubled beam, ledger + flashing (if attached), rim joists,
  6x6 posts + bases, footings (sonotube + concrete bags, or deck blocks), joist hangers
- **Fasteners**: deck screws (wood) or hidden fasteners (composite), structural screws
- **Stairs**: step count from deck height ÷ riser, stringers, tread boards
- **Railing**: exposed perimeter (house side auto-excluded if attached)

## Important notes
- **Prices are editable estimates** (2026 Quebec ballpark). Open *Edit unit prices* and adjust to
  real numbers — no retailer offers a public price/stock API, so live prices can't be pulled in
  automatically. The stock links open the store's own search so you can confirm price & availability.
- This is an **estimator, not engineered plans**. Verify spans, footing depth (frost line),
  ledger attachment, and stair/railing geometry against the **Quebec building code / RBQ**,
  and pull a permit before building.
