// Headless sanity tests for the takeoff engine inside patio-deck-designer.html.
// No browser needed: stub the DOM, extract the page's <script>, run computeBOQ,
// and assert invariants. Run with:  node test.mjs
import fs from 'fs';

/* ---------- minimal DOM / browser stub ---------- */
const store = {};
const defaults = {
  boardLen:'12', gap:'0.1875', waste:'10', packSize:'1', joistOC:'16', deckHeight:'3',
  postSpacing:'6', footing:'sonotube', stairWidth:'4', riserH:'7.5', store:'canac', scale:'14',
  railStyle:'rail_alum', borderRows:'1', stairSide:'S', stairPos:'50', boardProfile:'54x6',
  joistSize:'auto', beamSize:'auto', footingDia:'8', frostDepth:'4.5',
  labor:'0', contingency:'0', permitFee:'0', delivery:'0',
};
const checks = {
  attached:true, hasHouse:true, hasStairs:true, hasRail:true, hasFascia:false, hasSkirting:false,
  hasBorder:false, hasDrainage:false, railN:true, railS:true, railE:true, railW:true,
  showFraming:false, showFootings:false, cantilever:false, diagonal:false,
};
const ctxStub = new Proxy(
  { measureText:()=>({width:0}), createLinearGradient:()=>({addColorStop(){}}), setLineDash(){} },
  { get:(t,p)=> (p in t ? t[p] : ()=>{}), set:()=>true });
function stub(id){
  if(!store[id]) store[id] = {
    value: defaults[id]!==undefined ? defaults[id] : '',
    checked: checks[id]!==undefined ? checks[id] : false,
    style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false}},
    innerHTML:'', textContent:'', dataset:{}, placeholder:'', width:1000, height:680,
    appendChild(){}, addEventListener(){}, querySelectorAll(){return[]},
    getContext(){return ctxStub}, getBoundingClientRect(){return{left:0,top:0,width:1000,height:680}},
    setPointerCapture(){},
  };
  return store[id];
}
global.document = { getElementById:stub, createElement:()=>stub('_'+Math.random()),
  addEventListener(){}, querySelectorAll(){return[]}, get activeElement(){return {tagName:'BODY'}} };
global.window = { addEventListener(){}, open:()=>({document:{write(){},close(){}},print(){}}) };
global.location = { hash:'', origin:'http://x', pathname:'/' };
global.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
global.history = { replaceState(){} };
global.requestAnimationFrame = ()=>{};
global.prompt = ()=>''; global.confirm = ()=>false; global.alert = ()=>{};
global.Image = function(){};
global.structuredClone = global.structuredClone || (o=>JSON.parse(JSON.stringify(o)));

/* ---------- load the engine straight out of the HTML ---------- */
const html = fs.readFileSync(new URL('./patio-deck-designer.html', import.meta.url), 'utf8');
const lines = html.split('\n');
const a = lines.indexOf('<script>');
const b = lines.indexOf('</script>', a + 1);
if (a < 0 || b < 0) { console.error('Could not locate <script> block'); process.exit(1); }
const code = lines.slice(a + 1, b).join('\n') +
  '\nglobalThis.__api = { computeBOQ, setMaterial, state, footingBags, pickJoist, getStairGeom, unionMetrics, edgeIntervals, interLevelStairs };';
(0, eval)(code);                       // indirect eval → runs in global scope
const { computeBOQ, setMaterial, state, footingBags, getStairGeom, unionMetrics, edgeIntervals, interLevelStairs } = globalThis.__api;

/* ---------- tiny assert harness ---------- */
let fails = 0, count = 0;
function ok(cond, msg){ count++; if(!cond){ fails++; console.error('  ✗ ' + msg); } }
function grand(r){ const taxable = r.matSubtotal + r.laborTotal + r.delivery + r.contingency;
  return taxable * 1.14975 + r.permit; }
function sane(r, label){
  ok(r.area > 0, `${label}: area > 0`);
  ok(r.items.every(i => i.name && isFinite(i.total) && i.total >= 0), `${label}: no bad line items`);
  ok(r.effSpanMax <= r.joistSpanMax + 0.01 || r.spanFail, `${label}: bay span within joist limit (or flagged)`);
  ok(isFinite(grand(r)) && grand(r) > 0, `${label}: total is a positive number`);
  ok(JOIST_ORDER_HAS(r.joistSizeUsed), `${label}: joist size valid (${r.joistSizeUsed})`);
}
const JOIST_ORDER_HAS = s => ['2x6','2x8','2x10','2x12'].includes(s);
const reset = () => { state.sections = [{id:1,x:2,y:2,w:16,h:12}];
  Object.keys(store).forEach(k => { if(k in defaults) store[k].value = defaults[k];
    if(k in checks) store[k].checked = checks[k]; }); };

/* ---------- tests ---------- */
console.log('engine tests');

reset(); setMaterial('wood');
let r = computeBOQ();
sane(r, 'default 16×12 wood');
ok(r.joistSizeUsed === '2x8', 'default picks 2x8 joists at 16" O.C.');
ok(!r.multiLevel, 'default is single-level');

// per-bay span fix: a deep deck must NOT falsely fail — beams break the span
reset(); state.sections = [{id:1,x:2,y:2,w:20,h:18}]; r = computeBOQ();
sane(r, 'deep 20×18');
ok(r.effSpanMax <= r.joistSpanMax + 0.01, 'deep deck: per-bay span stays within limit');
ok(r.maxSpan > r.joistSpanMax, 'deep deck: full depth exceeds one-span limit (beams required)');

// cantilever reduces the supported span / footprint of supports
reset(); const noCant = computeBOQ();
store.cantilever.checked = true; const withCant = computeBOQ();
sane(withCant, 'cantilever');
ok(withCant.cantMax > 0, 'cantilever: overhang reported');
ok(withCant.postCount <= noCant.postCount, 'cantilever: needs no more footings than without');
store.cantilever.checked = false;

// multi-level: per-section height
reset(); state.sections = [{id:1,x:2,y:2,w:12,h:10}, {id:2,x:14,y:2,w:10,h:10,z:1}];
r = computeBOQ();
sane(r, 'multi-level');
ok(r.multiLevel, 'multi-level: detected');
ok(r.hMax > r.hMin, 'multi-level: height range spans two levels');

// budget add-ons flow into the total and taxes
reset();
store.labor.value = '15'; store.permitFee.value = '250'; store.delivery.value = '120'; store.contingency.value = '10';
r = computeBOQ();
sane(r, 'budget');
ok(r.addons.length === 4, 'budget: four add-on lines');
ok(r.permit === 250, 'budget: permit passthrough');
ok(grand(r) > r.matSubtotal * 1.14975, 'budget: add-ons raise the total');

// stairs must sit fully inside ONE contiguous deck run on the chosen side (never over a gap)
function stairOnEdge(label){
  const U = unionMetrics(state.sections);
  const st = getStairGeom(U); if(!st) return;
  const a0 = (st.side==='S'||st.side==='N') ? st.sx : st.sy;       // flight start along the edge
  const a1 = a0 + st.stairW;                                        // flight end
  const { ints } = edgeIntervals(st.side, U);
  const inside = ints.some(iv => a0 >= iv[0] - 1e-6 && a1 <= iv[1] + 1e-6);
  ok(inside, `${label}: stair flight sits within a contiguous deck run`);
}
reset(); store.stairSide.value='S'; store.stairPos.value='0';  stairOnEdge('stairs at 0%');
// position 0 must clear the corner (not jam flush) when the edge has room
(() => { const U=unionMetrics(state.sections), st=getStairGeom(U);
  ok(st && st.sx > U.minX + 0.5, 'stairs at 0% keep clearance from the corner'); })();
reset(); store.stairSide.value='S'; store.stairPos.value='100'; stairOnEdge('stairs at 100%');
reset(); store.stairSide.value='E'; store.stairPos.value='95';  stairOnEdge('stairs right edge 95%');
// L-shape: bottom edge is only the lower-left rectangle; stairs on S must sit on it, not the notch
reset(); state.sections=[{id:1,x:2,y:2,w:16,h:8},{id:2,x:2,y:10,w:8,h:8}];
store.stairSide.value='S'; store.stairPos.value='100'; stairOnEdge('L-shape stairs on short bottom edge');
// U-shape / detached: two top sections with a GAP between them; stairs on N must not float over the gap
reset(); state.sections=[{id:1,x:2,y:2,w:6,h:8},{id:2,x:16,y:2,w:6,h:8}];
['0','50','100'].forEach(p=>{ store.stairSide.value='N'; store.stairPos.value=p; stairOnEdge('gap top edge @'+p+'%'); });

// inter-level transition steps between adjacent sections at different heights
reset(); state.sections=[{id:1,x:2,y:2,w:12,h:10}, {id:2,x:14,y:2,w:10,h:10,z:1.5}];  // 1.5 ft step, shared edge at x=14→? not adjacent (gap)
// make them share an edge: second starts where first ends
state.sections=[{id:1,x:2,y:2,w:12,h:10}, {id:2,x:14,y:2,w:10,h:10,z:1.5}];
state.sections[1].x = state.sections[0].x + state.sections[0].w;   // adjacent (x=14)
{ const trs=interLevelStairs();
  ok(trs.length===1, 'adjacent different-height sections produce one transition');
  ok(trs.length && trs[0].risers>=1, 'transition has at least one riser');
  const r=computeBOQ();
  ok(r.transitions===1, 'BOQ reports the transition');
  ok(r.items.some(i=>/transition/i.test(i.name)), 'BOQ adds transition material');
}
// same height, adjacent → no transition
reset(); state.sections=[{id:1,x:2,y:2,w:12,h:10},{id:2,x:14,y:2,w:10,h:10}];
ok(interLevelStairs().length===0, 'same-height neighbours produce no transition');
// different height but NOT adjacent (gap) → no transition
reset(); state.sections=[{id:1,x:2,y:2,w:8,h:10},{id:2,x:16,y:2,w:8,h:10,z:2}];
ok(interLevelStairs().length===0, 'non-adjacent levels produce no transition');

// footing concrete scales with tube diameter
ok(footingBags(10,4.5) > footingBags(8,4.5), 'footings: 10" needs more concrete than 8"');
ok(footingBags(12,4.5) > footingBags(10,4.5), 'footings: 12" needs more concrete than 10"');
ok(footingBags(8,1.0) < footingBags(8,4.5), 'footings: shallower needs less concrete');

console.log(`\n${count - fails}/${count} assertions passed`);
if (fails) { console.error(`${fails} FAILED`); process.exit(1); }
console.log('ALL GOOD');
