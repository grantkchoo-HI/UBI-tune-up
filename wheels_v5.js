/* UBI Tune-Up v4 — The Wheelhouse: Wheels & Tires Mastery Module
 *
 * A dedicated multi-stage zone covering Chapter 4 (Wheel Building & Service)
 * and Chapter 5 (Tires and Tubes) from the UBI Professional Repair manual.
 *
 * Structure:
 *   6 stages → 1 boss
 *   Stage 1 — 🔧 Anatomy Bay        (rim types, components, materials)
 *   Stage 2 — 📏 Sizing & Compat    (ETRTO/ISO, BSD, rim/tire width)
 *   Stage 3 — 💨 Tubeless Lab       (UST, sealant, burping, hookless, valves)
 *   Stage 4 — 📊 Pressure Bench     (PSI by terrain & rider)
 *   Stage 5 — 🩺 Diagnosis Pit      (real shop scenarios)
 *   Stage 6 — 🛠️ Build Stand        (tension, dish, truing, lacing)
 *   BOSS    — 🏆 Walk-In Wheel Rebuild
 *
 * Per-question fields:
 *   id           string
 *   kind         'mc' | 'multi' | 'typing' | 'fill_blank'
 *   difficulty   'easy' | 'medium' | 'hard'
 *   story        optional shop context preamble
 *   question     the prompt
 *   choices      [{text, correct}]   (mc + multi)
 *   requiredCorrect  for multi
 *   correctAnswer    for typing/fill_blank
 *   acceptedAnswers  array of accepted variations
 *   why          HTML explanation shown right or wrong
 *   hook         memory hook (also shown after answer)
 *   refs         chapter refs
 *   retry        optional alternate-format Q used in re-roll queue
 */
(function () {
'use strict';

const STAGES = [
  // ===================== STAGE 1: ANATOMY BAY =====================
  {
    id: 'anatomy',
    name: 'Anatomy Bay',
    icon: '🔧',
    subtitle: 'Rim types, components, materials',
    blurb: 'Identify what you\'re holding before you wrench on it. Rims, spokes, nipples — the four-piece foundation of every wheel.',
    passThreshold: 0.7,
    questions: [
      {
        id: 'wh_a_1', kind: 'mc', difficulty: 'easy',
        question: 'A bicycle wheel is constructed from FOUR main components. Which set lists them correctly?',
        choices: [
          { text: 'Rim · Hub · Spokes · Tire', correct: false },
          { text: 'Rim · Hub · Spokes · Nipples', correct: true },
          { text: 'Rim · Hub · Tire · Tube', correct: false },
          { text: 'Rim · Spokes · Bearings · Axle', correct: false },
        ],
        why: 'A wheel proper is <strong>Rim, Hub, Spokes, Nipples</strong>. The tire is its own system — not part of the wheel build.',
        hook: 'RHSN: Rim · Hub · Spokes · Nipples. Tire is a tenant, not part of the building.',
        refs: ['4-3'],
      },
      {
        id: 'wh_a_2', kind: 'mc', difficulty: 'medium',
        story: 'You spin a 5-year-old aluminum rim-brake wheel and run your finger across the brake track. On a brand-new rim of this model, you would feel a small dimple machined in. On this wheel, the dimple is GONE.',
        question: 'What does this tell you?',
        choices: [
          { text: 'Brake pads are glazed — sand them.', correct: false },
          { text: 'Wear indicator is gone — the rim has worn past the safe braking-surface threshold and must be replaced before riding.', correct: true },
          { text: 'Rim was never indicator-stamped — ignore.', correct: false },
          { text: 'Pad compound has bonded to the rim — degrease it.', correct: false },
        ],
        why: 'European safety standards require new rims to ship with a brake <strong>wear indicator</strong> (dimple or groove). When it disappears, the brake track has thinned past safe — a rim failure under braking load is now a real risk.',
        hook: 'Dimple Gone = Rim Done.',
        refs: ['4-4'],
      },
      {
        id: 'wh_a_3', kind: 'mc', difficulty: 'easy',
        story: 'A customer brings in a brand-new pair of disc-brake-specific aluminum rims. They want to lace them onto their old rim-brake road bike since the BSD matches.',
        question: 'Best response?',
        choices: [
          { text: '"All good — same diameter, fresh pads, you\'re set."', correct: false },
          { text: '"Don\'t — disc-brake-specific rims have NO engineered brake track. Unsafe with rim brakes."', correct: true },
          { text: '"Sand the sidewalls flat for a rim-brake surface."', correct: false },
          { text: '"OK as long as you don\'t descend hard."', correct: false },
        ],
        why: 'Disc-brake-specific rims drop the brake track entirely for stiffer/lighter design. From the manual: <em>"Disc brake rims should never be used with rim brakes."</em>',
        hook: 'If it\'s disc, it stays disc. No brake track = no rim brakes. Ever.',
        refs: ['4-5'],
      },
      {
        id: 'wh_a_4', kind: 'multi', difficulty: 'medium', requiredCorrect: 2,
        question: 'Pick the TWO statements that are TRUE about HOOK-LESS rims compared to traditional hooked clinchers:',
        choices: [
          { text: 'Hook-less rims have shown to BURP AIR LESS OFTEN past the bead in tubeless applications.', correct: true },
          { text: 'Hook-less rims allow more rim-profile design freedom (no hook to mold around).', correct: true },
          { text: 'Hook-less rims only work with tubular (sew-up) tires.', correct: false },
          { text: 'Hook-less rims always run higher max pressure than hooked clinchers.', correct: false },
          { text: 'Hook-less rims require an inner tube (cannot run tubeless).', correct: false },
        ],
        why: 'Hook-less designs use a center channel + bead-lock ridges instead of a hook. Result: tighter bead seal (less burping) and freer profile design. Max pressures are typically LOWER, not higher — and they\'re tubeless-friendly clinchers, not tubulars.',
        hook: '"No hook, more book." Engineers got a fresh design page — better tubeless seal at the cost of high-PSI ceiling.',
        refs: ['4-5'],
      },
      {
        id: 'wh_a_5', kind: 'mc', difficulty: 'medium',
        question: 'Which spoke MATERIAL is most commonly used on QUALITY (mid-to-high-end) bicycles thanks to its excellent fatigue life and corrosion resistance?',
        choices: [
          { text: 'Galvanized steel', correct: false },
          { text: 'Stainless steel', correct: true },
          { text: 'Titanium', correct: false },
          { text: 'Aluminum', correct: false },
        ],
        why: 'Galvanized = entry-level (rust-prone even with zinc). <strong>Stainless steel</strong> is the workhorse for quality wheels — wide gauge selection, fatigue life, corrosion resistance. Titanium = expensive + porous (wind-up issues). Aluminum = proprietary pre-built only.',
        hook: 'Quality wheel? Stainless. Cheapie? Galvanized. Boutique? Ti or Al pre-built.',
        refs: ['4-5', '4-6'],
      },
      {
        id: 'wh_a_6', kind: 'fill_blank', difficulty: 'easy',
        question: 'The most widely used spoke NIPPLE material — chosen for its low cost, high strength, corrosion resistance, and low friction — is __________.',
        correctAnswer: 'brass',
        acceptedAnswers: ['brass'],
        why: 'Brass nipples are the shop default. Aluminum nipples save weight (~10g vs ~30g per 32) but corrode in salt and fatigue faster.',
        hook: 'Brass = boring brilliance. Aluminum = grams at a cost.',
        refs: ['4-7'],
      },
      {
        id: 'wh_a_7', kind: 'mc', difficulty: 'medium',
        question: 'Where would you most likely find STRAIGHT-PULL spokes (no J-bend / no elbow)?',
        choices: [
          { text: 'On any standard hand-built wheel', correct: false },
          { text: 'On entry-level hybrid bikes', correct: false },
          { text: 'On proprietary, pre-built wheel systems with specially shaped hub flanges', correct: true },
          { text: 'On tubular-only wheels', correct: false },
        ],
        why: 'Straight-pull spokes need a custom hub flange that holds them without the elbow. That\'s why they\'re almost exclusively found on factory <strong>pre-built systems</strong>, not custom builds.',
        hook: 'Straight pull = factory wheel. J-bend = mechanic\'s wheel.',
        refs: ['4-6'],
      },
    ],
  },

  // ===================== STAGE 2: SIZING & COMPATIBILITY =====================
  {
    id: 'sizing',
    name: 'Sizing & Compatibility Stand',
    icon: '📏',
    subtitle: 'ETRTO / ISO, BSD, rim-tire width',
    blurb: 'Nominal sizes lie. ISO/ETRTO doesn\'t. Match BSD, casing width, and rim width — or you\'re sending a customer home on a danger.',
    passThreshold: 0.7,
    questions: [
      {
        id: 'wh_s_1', kind: 'mc', difficulty: 'easy',
        question: 'Why does the manual prefer ISO (ETRTO) tire sizing over the nominal designation (e.g., "26 inch")?',
        choices: [
          { text: 'ISO is the only system used internationally.', correct: false },
          { text: 'Nominal sizes can be ambiguous — different bikes labeled "26 inch" use different rim diameters.', correct: true },
          { text: 'Nominal sizing only applies to road bikes.', correct: false },
          { text: 'ISO uses metric; nominal uses imperial.', correct: false },
        ],
        why: 'A "26-inch" mountain tire and a "26-inch" Schwinn cruiser tire are DIFFERENT rim diameters. ISO sizing gives the actual <strong>casing width × Bead Seat Diameter (BSD)</strong> in mm, removing guesswork.',
        hook: 'Nominal = nickname. ISO = legal name. Trust ISO.',
        refs: ['5-8'],
      },
      {
        id: 'wh_s_2', kind: 'mc', difficulty: 'medium',
        question: 'A tire labeled "700C × 25" measures, in ISO terms, as 25-622. What does the SECOND number (622) represent?',
        choices: [
          { text: 'Tire outer diameter in mm', correct: false },
          { text: 'Bead Seat Diameter (BSD) — where the tire bead engages the rim hook', correct: true },
          { text: 'Tube valve length in mm', correct: false },
          { text: 'Casing thickness in microns', correct: false },
        ],
        why: 'ISO format: <strong>casing width × BSD</strong>. The 622mm BSD is the rim-bead interface diameter — same number on every 700C road rim AND every 29er mountain rim.',
        hook: 'ISO: width × BSD. 622 = the road/29er handshake.',
        refs: ['5-8'],
      },
      {
        id: 'wh_s_3', kind: 'fill_blank', difficulty: 'medium',
        question: 'A 27.5" mountain bike (also called 650B) has a Bead Seat Diameter of __________ mm.',
        correctAnswer: '584',
        acceptedAnswers: ['584', '584mm'],
        why: '650B / 27.5" = <strong>584 BSD</strong>. (For reference: 700C/29er = 622, 26" MTB = 559, 24" = 507, 20" = 406.)',
        hook: 'BSD ladder: 622 → 584 → 559 → 507 → 406. (700c/29 → 27.5 → 26 → 24 → 20)',
        refs: ['5-9'],
      },
      {
        id: 'wh_s_4', kind: 'mc', difficulty: 'medium',
        question: 'Which BSD value is the standard for traditional 26-inch mountain bike wheels (NOT 27.5", NOT cruisers)?',
        choices: [
          { text: '622 mm', correct: false },
          { text: '584 mm', correct: false },
          { text: '559 mm', correct: true },
          { text: '507 mm', correct: false },
        ],
        why: 'Classic 26" MTB = <strong>559 BSD</strong>. Includes fat-bike sizing too. Don\'t confuse with 26" Schwinn cruisers (different BSD entirely — that\'s the whole reason ISO exists).',
        hook: '26" MTB → 559. 26" cruiser → not 559. Always check BSD.',
        refs: ['5-9'],
      },
      {
        id: 'wh_s_5', kind: 'multi', difficulty: 'hard', requiredCorrect: 2,
        story: 'A customer brings in a 622-BSD rim with an internal width of 19mm. They want to mount a 50mm-wide gravel tire because they "saw a YouTube video say it works."',
        question: 'Pick the TWO statements that match what the manual says about rim-width / tire-casing compatibility:',
        choices: [
          { text: 'Each rim width is designed to support a SPECIFIC RANGE of tire casing widths.', correct: true },
          { text: 'Mounting a tire OUTSIDE the manufacturer\'s recommended casing-width range can be dangerous.', correct: true },
          { text: 'BSD alone determines compatibility — internal rim width is irrelevant.', correct: false },
          { text: 'A tire is always safe so long as the bead diameter (BSD) matches.', correct: false },
          { text: 'Rim manufacturers recommend the WIDEST possible tire by default.', correct: false },
        ],
        why: 'BSD says the tire will <em>seat</em>. But each rim has a <strong>casing-width range</strong>. Outside that range — too narrow or too wide — the bead support changes, sidewall geometry distorts, and the system can fail under load. Always check the rim manufacturer\'s tire-width spec.',
        hook: 'BSD seats the bead. Internal width supports the casing. BOTH must match.',
        refs: ['5-9'],
      },
      {
        id: 'wh_s_6', kind: 'mc', difficulty: 'hard',
        question: 'A modern road rim and a modern 29er mountain bike rim can BOTH have the same BSD (622). Why doesn\'t that mean a 25mm road tire is interchangeable with a 2.4" mountain tire?',
        choices: [
          { text: 'Casing width and rim internal width are very different — only certain casing widths are safe on a given rim.', correct: true },
          { text: 'They\'re actually fully interchangeable — any 622 tire fits any 622 rim.', correct: false },
          { text: 'Mountain tires only work on tubeless rims.', correct: false },
          { text: 'Road rims have a different BSD measurement standard.', correct: false },
        ],
        why: '<strong>Same BSD ≠ same wheel.</strong> The 622 family spans casing widths from ~21mm to 75mm. A narrow road rim can\'t safely support a 60mm casing; a wide gravel rim won\'t shape a 23mm tire properly. Always verify casing-width range with the rim spec.',
        hook: '622 is a meeting point, not a license. Check the casing range.',
        refs: ['5-9'],
      },
      {
        id: 'wh_s_7', kind: 'mc', difficulty: 'medium',
        question: 'Which tire bead type is HEAVIER, more rigid, and CANNOT be folded for storage or shipping?',
        choices: [
          { text: 'Folding bead (Aramid / carbon)', correct: false },
          { text: 'Wire bead (steel)', correct: true },
          { text: 'Tubeless bead', correct: false },
          { text: 'Cable bead', correct: false },
        ],
        why: '<strong>Wire bead</strong> = steel wires molded into the casing. Cheap, durable, rigid — won\'t fold. Folding-bead tires use Aramid (Kevlar®) or carbon — lighter, packable, more expensive. Cable bead (WTB) is a foldable variant of wire-style.',
        hook: 'Wire = rigid + cheap. Folding/Aramid = packable + premium.',
        refs: ['5-3'],
      },
    ],
  },

  // ===================== STAGE 3: TUBELESS LAB =====================
  {
    id: 'tubeless',
    name: 'Tubeless Lab',
    icon: '💨',
    subtitle: 'UST, sealant, burping, hookless, valves',
    blurb: 'Lower pressure, fewer pinch flats, more traction — if (and only if) the system is set up right. Burping, sealant, valves, compatibility.',
    passThreshold: 0.7,
    questions: [
      {
        id: 'wh_t_1', kind: 'mc', difficulty: 'medium',
        story: 'You have a bare modern rim on the bench. The tire-side bed has only ONE hole (for the valve), there are no spoke holes drilled through, and you can feel a distinct bead-lock ridge molded into the inner profile.',
        question: 'Which tire system was this rim originally engineered for?',
        choices: [
          { text: 'Standard tube-type clincher only', correct: false },
          { text: 'Tubular (sew-up — glued)', correct: false },
          { text: 'Original UST (Universal System Tubeless)', correct: true },
          { text: 'Hookless tubeless conversion', correct: false },
        ],
        why: 'Original <strong>UST rims</strong> are required to have a SINGLE hole on the tire side (just for the valve) and an engineered bead-lock profile. Spoke nipples are accessed from the hub side only.',
        hook: 'UST = Sealed bed + 1 valve hole + bead-lock ridge. (Tubular has no bead at all — glued to a smooth U.)',
        refs: ['5-6'],
      },
      {
        id: 'wh_t_2', kind: 'fill_blank', difficulty: 'medium',
        story: 'Mid-corner on a tubeless setup, the rider hears a hissing chirp and the tire briefly loses some air, then re-seats and holds.',
        question: 'The term for this — when the bead temporarily disengages from the rim and lets some air escape — is __________.',
        correctAnswer: 'burping',
        acceptedAnswers: ['burping', 'burp', 'burp out'],
        why: '<strong>Burping</strong> happens when lateral load (cornering, hard side-impact) momentarily breaks the bead-to-rim seal. Lower pressure + low bead retention = more burps. Bead-lock ridges and hookless designs reduce it.',
        hook: 'Burp = bead burped some air. Common on low-pressure tubeless.',
        refs: ['5-6'],
      },
      {
        id: 'wh_t_3', kind: 'multi', difficulty: 'medium', requiredCorrect: 2,
        question: 'Pick the TWO advantages tubeless setups offer OVER tube-type clinchers, per the manual:',
        choices: [
          { text: 'Allows lower tire pressure for better traction.', correct: true },
          { text: 'Decreases the likelihood of pinch flats.', correct: true },
          { text: 'Always lighter than tube-type setup.', correct: false },
          { text: 'Easier to repair on the roadside than tube-type.', correct: false },
          { text: 'Eliminates the need for a valve stem.', correct: false },
        ],
        why: 'Tubeless = no tube to pinch + lower running pressure for traction without sacrificing rim safety. Weight depends on the system; roadside repair is often HARDER (sealant mess, plug kit, sometimes tube install).',
        hook: 'Tubeless wins: lower pressure + no pinch flats. Loses: more setup, messier repair.',
        refs: ['5-5'],
      },
      {
        id: 'wh_t_4', kind: 'mc', difficulty: 'easy',
        question: 'Tubeless tire SEALANT does which TWO jobs at once?',
        choices: [
          { text: 'Lubricates the bead-rim interface and prevents tire stretching.', correct: false },
          { text: 'Seals the tire casing airtight AND plugs small punctures during a ride.', correct: true },
          { text: 'Coats the inner tube and inflates it slowly.', correct: false },
          { text: 'Cleans the rim bead seat over time.', correct: false },
        ],
        why: 'Sealant\'s primary job is making the tire casing airtight (since the casing alone leaks). Bonus benefit: when a thorn or nail punctures, the spinning sealant flows into the hole and seals it on the road.',
        hook: 'Sealant = casing seal + puncture plug. Two jobs, one bottle.',
        refs: ['5-6'],
      },
      {
        id: 'wh_t_5', kind: 'mc', difficulty: 'hard',
        question: 'A customer is shopping for a NEW tire and wants to swap their TUBULAR (sew-up) wheels for clincher tires. What\'s the correct guidance?',
        choices: [
          { text: 'They can mount any clincher tire — the bead just clicks in.', correct: false },
          { text: 'They\'ll need NEW WHEELS — tubular and clincher rims are NOT cross-compatible.', correct: true },
          { text: 'Add a tubeless rim strip and clincher will work.', correct: false },
          { text: 'Swap to a tubeless tire (clinchers fit tubular rims if tubeless-rated).', correct: false },
        ],
        why: 'Tubular rims have no hook and no bead seat — they\'re a smooth U-channel that the tubular tire is GLUED to. A clincher tire has nothing to engage. From the manual: <em>"there is no cross compatibility between tubular and clincher tires and rims."</em>',
        hook: 'Tubular rim → glue only. Clincher rim → bead + hook. New wheels needed for the swap.',
        refs: ['5-2', '5-7'],
      },
      {
        id: 'wh_t_6', kind: 'mc', difficulty: 'easy',
        question: 'Which valve type is WIDER and the same standard used on automobile tires — but should NOT be inflated with a service-station compressor?',
        choices: [
          { text: 'Presta', correct: false },
          { text: 'Schrader', correct: true },
          { text: 'Dunlop', correct: false },
          { text: 'Tubeless valve', correct: false },
        ],
        why: '<strong>Schrader</strong> is the wider, auto-style valve common on kids\' bikes, MTB, and entry-level road. Service-station compressors push too high a VOLUME of air — risking a blowout — even though the valve fits.',
        hook: 'Schrader fits the gas-station nozzle. Doesn\'t mean you should use it.',
        refs: ['5-10', '5-11'],
      },
      {
        id: 'wh_t_7', kind: 'mc', difficulty: 'medium',
        question: 'A customer brings in a Presta-valved road tube and mentions they pumped it at the gas station with an adapter, "no problem, full pressure." What\'s the real risk?',
        choices: [
          { text: 'The adapter strips the Presta nut.', correct: false },
          { text: 'Service-station compressors push too high a VOLUME, which can cause a tube blowout.', correct: true },
          { text: 'Compressors don\'t reach road tire pressures.', correct: false },
          { text: 'The Presta core jams from compressor moisture.', correct: false },
        ],
        why: 'Auto compressors are designed for low-pressure, high-volume car tires. They can dump several PSI into a thin road tube before the gauge catches up. Even with an adapter, the tube can blow before you blink.',
        hook: 'Auto compressor + bike tube = boom risk. Use a floor pump or low-volume head.',
        refs: ['5-11'],
      },
      {
        id: 'wh_t_8', kind: 'mc', difficulty: 'medium',
        question: 'Why is the PRESTA valve typically used on road and high-end rims instead of Schrader?',
        choices: [
          { text: 'Presta holds more pressure than Schrader.', correct: false },
          { text: 'Presta is narrower, so the rim valve hole stays smaller — preserving rim strength on narrow road rims.', correct: true },
          { text: 'Presta self-seals if the cap is missing.', correct: false },
          { text: 'Presta is required for tubeless setups.', correct: false },
        ],
        why: 'A Schrader valve hole is wider — on a narrow road rim, that\'s a meaningful weak spot. The narrow Presta hole preserves rim strength. The locknut + need for length variants are downstream consequences.',
        hook: 'Presta = small hole = strong rim. Schrader = big hole = strong-arm rim.',
        refs: ['5-11'],
      },
    ],
  },

  // ===================== STAGE 4: PRESSURE BENCH =====================
  {
    id: 'pressure',
    name: 'The Pressure Bench',
    icon: '📊',
    subtitle: 'PSI by terrain, rider, and system',
    blurb: 'Pressure is a tuning knob. Heavier rider, narrower tire, harder surface → higher PSI. Reverse all three → lower. Tubeless lets you go lower without pinching.',
    passThreshold: 0.7,
    questions: [
      {
        id: 'wh_p_1', kind: 'mc', difficulty: 'easy',
        question: 'A "PINCH FLAT" occurs when…',
        choices: [
          { text: 'A thorn punctures the tire from the outside.', correct: false },
          { text: 'A sharp object compresses the tire enough that the TUBE is jammed against the RIM HOOK and pinched, creating a hole.', correct: true },
          { text: 'The tube is over-inflated and bursts.', correct: false },
          { text: 'The bead unseats during a turn.', correct: false },
        ],
        why: 'Classic mechanism: hard hit (rock, curb edge) → tire compresses → tube gets clamped between sharp object and rim hook → two slits ("snake bite"). Lowering pressure + going tubeless reduces the risk.',
        hook: 'Pinch flat = tube + rim hook + hard hit. Snake bite slits are the giveaway.',
        refs: ['5-5'],
      },
      {
        id: 'wh_p_2', kind: 'multi', difficulty: 'medium', requiredCorrect: 2,
        story: 'A customer wants to run lower pressure for more comfort and traction on rough roads. They\'re currently on tube-type clinchers at 95 PSI.',
        question: 'Pick the TWO most accurate statements you should give them:',
        choices: [
          { text: 'A tubeless conversion would let them safely run lower pressure with much less pinch-flat risk.', correct: true },
          { text: 'Lower pressure increases comfort and grip but raises the risk of pinch flats on tube-type setups.', correct: true },
          { text: 'Tube-type setups can match tubeless\' lowest safe pressures.', correct: false },
          { text: 'Higher pressure always equals better traction.', correct: false },
          { text: 'Pressure should be set purely by tire sidewall maximum.', correct: false },
        ],
        why: 'Lower pressure → larger contact patch → more grip + comfort. But on a TUBE-TYPE system the tube can pinch on hard hits. Tubeless removes that limit. Sidewall MAX is a ceiling, not the target — actual pressure depends on rider weight, terrain, and tire width.',
        hook: 'Want lower PSI safely? Go tubeless. Tube-type = mind the pinch line.',
        refs: ['5-5'],
      },
      {
        id: 'wh_p_3', kind: 'mc', difficulty: 'medium',
        question: 'When SELECTING an inner tube for a tire, the manual says it is BETTER to err on which side of size?',
        choices: [
          { text: 'On the WIDE side — fills the casing better.', correct: false },
          { text: 'On the NARROW side — wider tubes are difficult to insert and get crowded inside the tire.', correct: true },
          { text: 'On the LONGER valve side — more pump clearance.', correct: false },
          { text: 'On the LATEX side — better suppleness.', correct: false },
        ],
        why: 'A too-wide tube bunches, folds, and can pinch itself on installation. A slightly narrow tube stretches to fit. Match casing width range, but lean narrow if between sizes.',
        hook: 'Tube too wide = bad install. Lean narrow within range.',
        refs: ['5-10'],
      },
      {
        id: 'wh_p_4', kind: 'mc', difficulty: 'medium',
        question: 'BUTYL vs LATEX tubes — which statement is correct, per the manual?',
        choices: [
          { text: 'Butyl is lighter and suppler than latex.', correct: false },
          { text: 'Latex is light and supple but does NOT retain air as well as butyl.', correct: true },
          { text: 'Latex is the most common because of low cost.', correct: false },
          { text: 'Both retain air equally; only the ride feel differs.', correct: false },
        ],
        why: 'Butyl is the synthetic workhorse — best air retention, common, cheap. Latex is light + supple (faster-feeling ride) but porous → noticeable pressure loss in 24h. That\'s why latex is rare and expensive.',
        hook: 'Butyl = boring + tight. Latex = supple + leaky.',
        refs: ['5-10'],
      },
      {
        id: 'wh_p_5', kind: 'mc', difficulty: 'medium',
        story: 'You\'re selling a customer THORN-RESISTANT tubes for a commuter route through goat-head territory.',
        question: 'What\'s the trade-off you should mention?',
        choices: [
          { text: 'They self-seal punctures using internal sealant.', correct: false },
          { text: 'They use thicker walls and carry a SEVERE WEIGHT PENALTY.', correct: true },
          { text: 'They require a special pump.', correct: false },
          { text: 'They require Presta valves only.', correct: false },
        ],
        why: 'Thorn-resistant tubes are simply butyl tubes with much thicker walls. Punctures down. Rotational mass UP — noticeably so. Different from self-sealing (sealant inside) and tire liners (separate strip).',
        hook: 'Thorn-resistant = thick wall = heavy. Self-sealing = sealant inside. Tire liner = separate strip.',
        refs: ['5-10'],
      },
      {
        id: 'wh_p_6', kind: 'mc', difficulty: 'hard',
        story: 'Two riders, same bike, same 700×28 tubeless tires:\n  • Rider A — 65 kg (143 lb), smooth pavement\n  • Rider B — 95 kg (210 lb), rough chipseal',
        question: 'Which adjustment FROM RIDER A → RIDER B is conceptually correct (per general PSI tuning principles in the chapter)?',
        choices: [
          { text: 'Both riders should run identical pressure — tire is the same.', correct: false },
          { text: 'Rider B should run LOWER pressure than Rider A — heavier rider = more cushion needed.', correct: false },
          { text: 'Rider B should run HIGHER pressure — heavier load + rougher terrain both push pressure UP, partially offset by going tubeless for traction.', correct: true },
          { text: 'Pressure should only depend on terrain, never on rider weight.', correct: false },
        ],
        why: 'Heavier rider → needs higher PSI to support load (avoid bottoming out & rim damage). Rough surface alone wants lower PSI for grip — but the WEIGHT factor here dominates, especially with pinch-flat risk. Tubeless lets B push pressure DOWN further than tube-type allows, but B still runs higher absolute PSI than A.',
        hook: 'Heavy rider + rough = up. Light rider + smooth = down. Tubeless lets you drop further than tubed allows.',
        refs: ['5-5'],
      },
    ],
  },

  // ===================== STAGE 5: DIAGNOSIS PIT =====================
  {
    id: 'diagnosis',
    name: 'Diagnosis Pit',
    icon: '🩺',
    subtitle: 'Real shop scenarios & on-trail problems',
    blurb: 'Customer rolls up. Symptom on the table. You diagnose. This is what the test actually rewards — transfer.',
    passThreshold: 0.7,
    questions: [
      {
        id: 'wh_d_1', kind: 'mc', difficulty: 'easy',
        story: 'A wheel wobbles SIDE-TO-SIDE against the brake pad as it spins. Hop / roundness is fine. Centering looks OK.',
        question: 'What kind of truing does this wheel need?',
        choices: [
          { text: 'Lateral truing — adjust spoke tension side to side.', correct: true },
          { text: 'Radial truing — work on roundness.', correct: false },
          { text: 'Re-dish — center the rim over the hub.', correct: false },
          { text: 'Replace the rim.', correct: false },
        ],
        why: 'Side-to-side = <strong>lateral truing</strong>. To pull the rim AWAY from a brake pad on the right, tighten left-side spokes / loosen right-side spokes near the wobble (or vice versa).',
        hook: 'Lateral = sideways. Radial = round. Dish = centered. Three different truings.',
        refs: ['H4-21'],
      },
      {
        id: 'wh_d_2', kind: 'mc', difficulty: 'medium',
        story: 'A rim-brake wheel spins LATERALLY TRUE in the stand, but the brake lever pulses ONCE PER REVOLUTION when the customer brakes hard.',
        question: 'What\'s the most likely cause?',
        choices: [
          { text: 'Wheel is out of round (a hop) — needs RADIAL truing.', correct: true },
          { text: 'Brake pads are contaminated.', correct: false },
          { text: 'Wheel is out of dish.', correct: false },
          { text: 'Hub bearings are loose.', correct: false },
        ],
        why: 'Pulse once per revolution under braking = the rim is not perfectly round. Lateral truing is fine; that doesn\'t fix a hop. <strong>Radial truing</strong> brings the rim to true roundness.',
        hook: 'Pulse-per-rev = hop = radial. Sideways scrape = lateral. Always diagnose the symptom direction.',
        refs: ['H4-22'],
      },
      {
        id: 'wh_d_3', kind: 'mc', difficulty: 'medium',
        story: 'A customer says: "I just bought this used wheel — the cassette unscrewed itself on a ride." You spin the cogs by hand. When the customer pedals BACKWARD, the entire cog cluster rotates with the cranks.',
        question: 'What\'s actually going on, and what tool do you reach for?',
        choices: [
          { text: 'It\'s a cassette — grab the lockring tool and chain whip.', correct: false },
          { text: 'It\'s a FREEWHEEL (threads on, has its own internal ratchet) — you need a freewheel removal tool.', correct: true },
          { text: 'Hub bearings collapsed — replace the hub.', correct: false },
          { text: 'Lockring is loose — re-torque to spec.', correct: false },
        ],
        why: 'On a CASSETTE, the freehub body holds the ratchet — the hub clicks while the bike coasts. On a FREEWHEEL, the ratchet is in the cog cluster itself, screwed onto the hub. If pedaling backward turns the whole cluster, there\'s no ratchet in the hub → freewheel. Wrong tool = stripped cassette body.',
        hook: 'Backwards pedal turns the cluster? Freewheel. Hub clicks alone? Cassette+freehub.',
        refs: ['4-6'],
      },
      {
        id: 'wh_d_4', kind: 'mc', difficulty: 'medium',
        story: 'Customer: "I just set up tubeless yesterday. This morning, the tire is half-flat — but no visible puncture, no hissing."',
        question: 'Most likely first cause to investigate?',
        choices: [
          { text: 'The valve core is stripped — replace it.', correct: false },
          { text: 'Sealant hasn\'t fully coated the casing yet — small porosity leaks until the sealant finishes wicking through and around the bead.', correct: true },
          { text: 'The bead is unseated — re-mount the tire.', correct: false },
          { text: 'The rim is cracked.', correct: false },
        ],
        why: 'Fresh tubeless installs commonly leak through the casing and around the bead until sealant has time to wick into every micro-channel. Spin and shake the wheel, leave it overnight rotated to a new orientation, top up pressure. Usually self-resolves in 1-2 days.',
        hook: 'New tubeless lost air overnight? Rotate, shake, top up. Sealant\'s still working.',
        refs: ['5-6'],
      },
      {
        id: 'wh_d_5', kind: 'mc', difficulty: 'easy',
        story: 'A customer pulls up on a high-end carbon-fiber rim-brake road bike and asks for "any standard road brake pads — same as the alloy bikes."',
        question: 'You stop them. Why?',
        choices: [
          { text: 'Carbon rims need WIDER pads to grip the wider sidewall.', correct: false },
          { text: 'Carbon-fiber rims dissipate braking HEAT differently than aluminum — they require manufacturer-specific brake pads designed for the resin and braking characteristics.', correct: true },
          { text: 'Carbon rims always need disc brakes.', correct: false },
          { text: 'Pads must be metal-matrix only.', correct: false },
        ],
        why: 'Aluminum sinks heat into the rim. Carbon fiber dissipates it differently and the resin binder can be damaged by the wrong pad compound. Use the manufacturer-specified carbon pad — generic alloy pads can glaze, overheat, or even delaminate the rim.',
        hook: 'Carbon rim → carbon-specific pads. Generic alloy pads = damaged rim.',
        refs: ['4-4'],
      },
      {
        id: 'wh_d_6', kind: 'mc', difficulty: 'hard',
        story: 'You\'re building a wheel on a B-TYPE rim, but you laced the hub assuming an A-TYPE pattern. After lacing, you notice every spoke head/elbow on the second side is reversed compared to the first side — they\'re NOT mirror images.',
        question: 'What does this tell you, and what\'s the fix?',
        choices: [
          { text: 'Build is fine — heads/elbows can face either direction.', correct: false },
          { text: 'The hub was loaded for the wrong rim type — undo the lacing and reload the hub correctly for the actual rim type.', correct: true },
          { text: 'Just retension and stress relieve more aggressively.', correct: false },
          { text: 'Replace half the spokes with longer ones.', correct: false },
        ],
        why: 'A-type vs B-type only differs in which side the first spoke hole offsets toward. Each requires a SPECIFIC initial hub-loading order so heads/elbows end up MIRROR IMAGES across the wheel. If they\'re not mirrored after lacing, the hub was loaded for the wrong type — undo it.',
        hook: 'Heads/elbows must mirror. Don\'t mirror? Wrong hub load. Start over.',
        refs: ['H4-15', 'H4-19'],
      },
      {
        id: 'wh_d_7', kind: 'mc', difficulty: 'hard',
        story: 'A customer says their tubeless tire BURPS air every time they corner hard at low pressure. Sealant is fresh, bead is fully seated, no leaks at rest.',
        question: 'Two reasonable corrective options. Which is MOST LIKELY to fix the burping without losing the low-pressure traction the rider wants?',
        choices: [
          { text: 'Switch to a hookless rim, or move to a tire/rim combo with stronger bead-lock retention.', correct: true },
          { text: 'Add a tube — convert back to tube-type.', correct: false },
          { text: 'Pump the tire to maximum sidewall PSI.', correct: false },
          { text: 'Glue the bead to the rim.', correct: false },
        ],
        why: 'Burping = bead briefly unseats under lateral load. Per the manual, hook-less designs (with center channel + bead-lock ridges) burp LESS in tubeless applications. A bead-lock-friendly rim/tire combo is the right targeted fix. Adding a tube defeats the purpose; max PSI defeats traction; gluing is not a real solution.',
        hook: 'Burping = bead unseating. Real fix = better bead retention (hookless / bead-lock ridges). Not "more PSI."',
        refs: ['4-5', '5-6'],
      },
    ],
  },

  // ===================== STAGE 6: BUILD STAND =====================
  {
    id: 'build',
    name: 'The Build Stand',
    icon: '🛠️',
    subtitle: 'Tension, dish, truing, lacing, spoke length',
    blurb: 'Building a wheel from zero. ERD, lacing, low working tension, lateral & radial true, dish, optimum tension, stress relief.',
    passThreshold: 0.7,
    questions: [
      {
        id: 'wh_b_1', kind: 'fill_blank', difficulty: 'easy',
        question: 'The single most important rim measurement when calculating spoke length is the distance from the spoke nipple seat on one side of the rim to the spoke nipple seat on the opposite side. This is called the __________  __________  __________ (3 words).',
        correctAnswer: 'effective rim diameter',
        acceptedAnswers: ['effective rim diameter', 'erd'],
        why: 'ERD = <strong>Effective Rim Diameter</strong>. It\'s NOT the BSD or the outer diameter — it\'s the nipple-seat-to-nipple-seat distance, the only one that matters for spoke length math.',
        hook: 'ERD ≠ BSD ≠ nominal. ERD is between nipple seats — that\'s where spoke length stops.',
        refs: ['4-10'],
      },
      {
        id: 'wh_b_2', kind: 'mc', difficulty: 'medium',
        question: 'Which lacing pattern is appropriate ONLY where torsional load is minimal — typically a non-disc front wheel or the non-drive side of a non-disc rear?',
        choices: [
          { text: '3-cross tangential', correct: false },
          { text: '4-cross tangential', correct: false },
          { text: 'Radial (no crosses, straight from hub to rim)', correct: true },
          { text: '2-cross drive-side', correct: false },
        ],
        why: '<strong>Radial</strong> spokes don\'t cross — they can\'t transfer torque well. So they\'re reserved for situations with no torsional load: non-disc front wheels, or non-drive-side rear non-disc. Disc-brake wheels and drive-sides need tangential lacing.',
        hook: 'Radial = no torque path. Disc brake or drive side? Always tangential.',
        refs: ['4-9'],
      },
      {
        id: 'wh_b_3', kind: 'mc', difficulty: 'easy',
        question: 'Among tangential lacing patterns (1x, 2x, 3x, 4x), which is the MOST WIDELY USED?',
        choices: [
          { text: '1-cross', correct: false },
          { text: '2-cross', correct: false },
          { text: '3-cross', correct: true },
          { text: '4-cross', correct: false },
        ],
        why: '<strong>3-cross</strong> is the dominant pattern for hand-built wheels — good torque handling, reasonable spoke length, well-established for most wheel sizes and counts.',
        hook: '3-cross = the default. Memorize it.',
        refs: ['4-9'],
      },
      {
        id: 'wh_b_4', kind: 'mc', difficulty: 'medium',
        question: 'Per the chapter, in the absence of manufacturer-specific tension data, the generally-accepted target spoke tension for a DISHLESS hand-built wheel (e.g., symmetrical front road) is approximately:',
        choices: [
          { text: '50 kgf', correct: false },
          { text: '100 kgf', correct: true },
          { text: '150 kgf', correct: false },
          { text: '200 kgf', correct: false },
        ],
        why: 'Industry rule of thumb without manufacturer spec: <strong>~100 kgf for dishless wheels, ~110 kgf for the more vertical (drive-side) spokes of dished wheels</strong>. Always defer to the rim manufacturer\'s max tension if you have it — exceeding it can crack a rim.',
        hook: '100 dishless / 110 drive-side dished. Rim spec wins if you have it.',
        refs: ['H4-25'],
      },
      {
        id: 'wh_b_5', kind: 'mc', difficulty: 'hard',
        story: 'You\'re tensioning a wheel and notice some spokes are visibly TWISTING (winding up) as you tighten the nipples.',
        question: 'If you ignore the wind-up and call the wheel done, what\'s the customer most likely to experience?',
        choices: [
          { text: 'The wheel will be slightly heavier.', correct: false },
          { text: 'On the FIRST RIDE, the wound-up spokes will pop back to their neutral state — undoing some of the truing accuracy.', correct: true },
          { text: 'Nothing — wind-up is permanent.', correct: false },
          { text: 'The rim will fail under braking.', correct: false },
        ],
        why: 'Spoke wind-up stores torsional load in the spoke wire itself. As soon as the wheel is loaded by riding, those wound spokes spring back, releasing the stored twist — and the wheel goes out of true. <strong>Stress relief</strong> during the build forces wind-up to release on the bench instead of the road.',
        hook: 'Wind-up unspun = first-ride detune. Stress relief on the bench, not on the customer.',
        refs: ['H4-25'],
      },
      {
        id: 'wh_b_6', kind: 'mc', difficulty: 'medium',
        story: 'Your dishing tool shows a visible 2 mm GAP between the piston and the hub locknut on one side.',
        question: 'How big is the actual dishing error?',
        choices: [
          { text: '2 mm', correct: false },
          { text: '4 mm', correct: false },
          { text: '1 mm', correct: true },
          { text: '0.5 mm', correct: false },
        ],
        why: 'The dishing tool registers the error as a doubled visual: any visible gap = TWICE the actual offset. A 2 mm gap means the rim is offset 1 mm from centered. To correct: tighten the side the rim needs to move TOWARD.',
        hook: 'Visible gap = 2× actual error. Always halve the number you see.',
        refs: ['H4-23'],
      },
      {
        id: 'wh_b_7', kind: 'mc', difficulty: 'hard',
        question: 'During the wheel-build sequence, when do you ADD final tension to optimum?',
        choices: [
          { text: 'First — before any truing or dishing.', correct: false },
          { text: 'After the wheel is laterally true, radially true, and properly dished AT LOW WORKING TENSION — only then ramp up tension in 1/4-turn layers, retruing after each layer.', correct: true },
          { text: 'Only after the customer test-rides it.', correct: false },
          { text: 'Tension is the very first step — it makes truing easier.', correct: false },
        ],
        why: 'Build sequence: lace → low working tension → lateral true → radial true → dish → THEN add tension in 1/4-turn layers, re-checking lateral/radial/dish after each layer → stress relieve → final QA. Tensioning a misaligned wheel locks errors in.',
        hook: 'Truth + dish FIRST at low tension. Tension LAST in 1/4-turn layers.',
        refs: ['H4-21', 'H4-24'],
      },
      {
        id: 'wh_b_8', kind: 'mc', difficulty: 'medium',
        question: 'Why do mechanics LUBRICATE the nipple seat (where the nipple meets the rim bed) with grease BEFORE lacing?',
        choices: [
          { text: 'To make the wheel quieter while riding.', correct: false },
          { text: 'To reduce friction during tensioning — preventing surface wear, accelerated corrosion (especially aluminum nipples on carbon rims), and excess spoke wind-up.', correct: true },
          { text: 'To seal the rim for tubeless setup.', correct: false },
          { text: 'To prevent the spoke from threading too far through the nipple.', correct: false },
        ],
        why: 'As you tighten, the nipple grinds against its seat — wearing protective coatings, exposing raw metal, and (for AL nipples on carbon) inviting galvanic corrosion. Greasing the seat reduces friction → less wind-up → cleaner build → longer life.',
        hook: 'Grease the seat. Less friction = less wind-up = a longer-lived build.',
        refs: ['4-13'],
      },
    ],
  },
];

// ===================== BOSS: WALK-IN WHEEL REBUILD =====================
const BOSS = {
  id: 'boss_walkin',
  name: 'BOSS: Walk-In Wheel Rebuild',
  icon: '🏆',
  subtitle: 'Multi-stage real customer case',
  blurb: 'A real walk-in. You\'ll diagnose, spec, build, and QA. Five rounds. Anatomy + sizing + tubeless + pressure + diagnosis + build, all at once.',
  intro: '<strong>The case:</strong> A customer rolls in with a 700C road bike, 622-BSD rims that are tube-type clinchers, currently running 25mm tires at 95 PSI. They\'re a 90 kg rider doing a mixed-surface gravel race in 3 weeks. They want: <em>tubeless conversion, wider tires for grip, and a wheel that won\'t go out of true on rough chipseal.</em><br><br>Walk through five decisions. Each is graded; you need 4/5 to clear the boss.',
  rounds: [
    {
      id: 'boss_r1', kind: 'multi', difficulty: 'medium', requiredCorrect: 3,
      story: 'ROUND 1 — Compatibility check. Before quoting the job, you need to verify three things about the customer\'s current rims.',
      question: 'Pick the THREE checks you MUST perform on the rims before quoting a tubeless conversion:',
      choices: [
        { text: 'Confirm the rim is tubeless-ready (sealed bed or accepts tubeless tape).', correct: true },
        { text: 'Confirm the rim\'s internal width supports the wider tire casing the customer wants.', correct: true },
        { text: 'Confirm the BSD matches the new tire (622).', correct: true },
        { text: 'Confirm the rim accepts BOTH disc and rim brakes.', correct: false },
        { text: 'Confirm the rim has aluminum spoke nipples installed.', correct: false },
      ],
      why: 'Tubeless conversion requires: (1) <strong>tubeless-ready rim</strong> (sealed or tape-capable), (2) <strong>casing width within rim spec</strong> (so the wider tire is supported), (3) <strong>matching BSD</strong> (622). Brake type and nipple material are unrelated to tubeless compatibility.',
      hook: 'Tubeless gate: TR rim + width range + BSD match. Three checks, every time.',
    },
    {
      id: 'boss_r2', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 2 — Tire & pressure spec. The customer wants 35mm gravel tires, tubeless, with strong puncture resistance and good cornering grip.',
      question: 'Which tire-system choice best fits this brief?',
      choices: [
        { text: 'Folding-bead tubeless tire, mid TPI, dual rubber compound (firmer center, softer side knobs).', correct: true },
        { text: 'Wire-bead tube-type tire, low TPI, single hard compound.', correct: false },
        { text: 'Tubular (sew-up) tire glued to a tubular rim.', correct: false },
        { text: 'Hookless rim with tubular tire and inner tube.', correct: false },
      ],
      why: 'Folding-bead tubeless = lower weight + tubeless compatibility. Mid-TPI = balance of supple ride + durability. Dual compound = firm center for low rolling resistance, softer sides for cornering grip. Wire-bead is heavier and can\'t fold; tubulars are an entirely different rim system; hookless+tubular is a category mismatch.',
      hook: 'Gravel tubeless: folding bead + tubeless casing + dual compound. Standard recipe.',
    },
    {
      id: 'boss_r3', kind: 'mc', difficulty: 'hard',
      story: 'ROUND 3 — Build planning. The customer\'s existing rim is rated for 6.5mph radial true variance. They\'re a 90kg rider on chipseal. The wheel will see significant lateral loads in cornering and surface impacts.',
      question: 'Based on the manual, which lacing approach is most appropriate for the rear wheel\'s DRIVE side?',
      choices: [
        { text: 'Radial — shortest spokes, best aerodynamics.', correct: false },
        { text: '3-cross tangential — standard pattern, good torsional handling for drive-side power and braking loads.', correct: true },
        { text: 'Half-radial / half-tangential mixed.', correct: false },
        { text: 'Crow\'s foot, one-cross only.', correct: false },
      ],
      why: 'Drive-side rear sees the strongest torsional load (drivetrain torque). Radial = no torque path = wrong here. 3-cross is the most widely used tangential pattern and matches both the load profile and the customer\'s use case.',
      hook: 'Drive side rear = tangential, default 3x. Radial only where torque is absent.',
    },
    {
      id: 'boss_r4', kind: 'mc', difficulty: 'hard',
      story: 'ROUND 4 — Build execution. You\'ve laced the wheel. Low working tension is set. You true laterally, then radially, then check dish — visible 2mm gap, drive side high. You correct it, then add a layer of tension. The dish goes back out.',
      question: 'What is the CORRECT next move?',
      choices: [
        { text: 'Ignore it — it\'ll stress-relieve itself on the customer\'s first ride.', correct: false },
        { text: 'Re-true lateral, re-true radial, re-check dish at the new tension layer — repeat after every tension layer until the wheel is true, round, dished, and stress-relieved at OPTIMUM tension.', correct: true },
        { text: 'Loosen all spokes back to low working tension and start over.', correct: false },
        { text: 'Replace the rim — visible dish drift means a defective rim.', correct: false },
      ],
      why: 'Per the chapter: at the end of EVERY tension layer, recheck lateral, radial, dish — correct any drift before the next layer. Tension layers want to lock in errors if you don\'t catch them. Stress relieve as the wheel approaches optimum tension.',
      hook: 'Every tension layer → re-true lateral, radial, dish. Stress-relieve near optimum.',
    },
    {
      id: 'boss_r5', kind: 'multi', difficulty: 'medium', requiredCorrect: 3,
      story: 'ROUND 5 — Final QA. The wheel is built and dished. You\'re about to hand it off.',
      question: 'Which THREE checks belong in your final-wheel QA before mounting the tire?',
      choices: [
        { text: 'Lateral and radial true within shop tolerance.', correct: true },
        { text: 'Average spoke tension and tension VARIANCE (partner-spoke balance).', correct: true },
        { text: 'Stress-relief complete — no audible pings under spoke squeeze.', correct: true },
        { text: 'Tire pressure dialed in (PSI).', correct: false },
        { text: 'Brake pads broken in.', correct: false },
      ],
      why: 'Wheel-build QA happens BEFORE the tire goes on: lateral/radial true, dish, average tension + variance, stress relief. PSI and brake pads are downstream concerns (wheel is already built).',
      hook: 'Wheel QA = true + dish + tension avg + tension variance + stress relief. PSI is the rider\'s problem.',
    },
  ],
};

// ===================== BADGES (Wheelhouse-specific) =====================
const BADGES = [
  { id: 'wh_apprentice', icon: '🛞', name: 'Wheelhouse Apprentice', desc: 'Cracked open the Wheelhouse zone.', hint: 'Start any Wheelhouse stage' },
  { id: 'wh_anatomy_master', icon: '🔧', name: 'Anatomy Master', desc: 'Knows every rim by feel.', hint: 'Pass Stage 1 — Anatomy Bay' },
  { id: 'wh_size_savant', icon: '📏', name: 'Sizing Savant', desc: 'Reads BSDs in their sleep.', hint: 'Pass Stage 2 — Sizing & Compat' },
  { id: 'wh_tubeless_pro', icon: '💨', name: 'Tubeless Pro', desc: 'Sealant\'s your friend.', hint: 'Pass Stage 3 — Tubeless Lab' },
  { id: 'wh_pressure_perfectionist', icon: '📊', name: 'Pressure Perfectionist', desc: 'Reads riders, not gauges.', hint: 'Pass Stage 4 — Pressure Bench' },
  { id: 'wh_wheel_doctor', icon: '🩺', name: 'Wheel Doctor', desc: 'Reads symptoms, finds causes.', hint: 'Pass Stage 5 — Diagnosis Pit' },
  { id: 'wh_wheel_builder', icon: '🛠️', name: 'Wheel Builder', desc: 'Truth, dish, tension, done.', hint: 'Pass Stage 6 — Build Stand' },
  { id: 'wh_champion', icon: '🏆', name: 'Wheelhouse Champion', desc: 'Boss down. Ride home.', hint: 'Beat the Walk-In Wheel Rebuild boss' },
  { id: 'wh_perfectionist', icon: '💎', name: 'Wheelhouse Perfectionist', desc: 'Every stage, no errors.', hint: 'Clear all 6 stages 100% on a single attempt each' },
];

// V5: variant prompts. Renderer pulls a non-most-recent variant on each
// appearance so retries can't rely on identical wording for recall.
const WHEELHOUSE_VARIANTS_V5 = {
  // Stage 1 — Anatomy
  'wh_a_2': [
    "Two TRUE statements about hooked-clincher rims — pick them.",
    "Which TWO are correct about the hook profile on a clincher rim?",
  ],
  'wh_a_4': [
    "Pick the TWO statements that hold up about hookless vs. hooked rims.",
    "Two truths about hookless rims relative to hooked clinchers — pick them.",
  ],
  'wh_a_5': [
    "Pick the rim wear indicator the manual flags as service-replace.",
    "Which sign tells you a rim has hit its replacement threshold?",
  ],
  'wh_a_7': [
    "Which feature distinguishes a UST tubeless rim from a non-UST tubeless-ready rim?",
    "How does a UST rim differ from a tubeless-ready (non-UST) rim?",
  ],
  // Stage 2 — Sizing
  'wh_s_2': [
    "What does the first ETRTO/ISO number actually describe?",
    "Read the ETRTO label — what is the leading number?",
  ],
  'wh_s_4': [
    "Why does inner rim width matter for tire fit?",
    "How does inner rim width affect the way a tire seats and behaves?",
  ],
  'wh_s_5': [
    "Pick the TWO TRUE statements about hookless ETRTO compatibility.",
    "Two truths about hookless rim/tire matching by ETRTO — pick them.",
  ],
  'wh_s_6': [
    "Given these specs, which combination is unsafe to use?",
    "Which pairing of these specs falls outside ETRTO compatibility?",
  ],
  'wh_s_7': [
    "What does mounting a 28c tire on a 25mm internal-width rim do to the tire profile?",
    "How does a wider rim change the cross-section of a 28c tire?",
  ],
  // Stage 3 — Tubeless
  'wh_t_1': [
    "Pick the statement that best describes how sealant actually fixes a hole.",
    "What's the correct mechanism by which sealant seals a tubeless puncture?",
  ],
  'wh_t_3': [
    "Two TRUE statements about burping — pick them.",
    "Which TWO accurately describe what burping is and what causes it?",
  ],
  'wh_t_5': [
    "Pick the most likely cause of a tubeless tire that won't seat.",
    "Why won't this tubeless tire pop onto the bead seat?",
  ],
  'wh_t_7': [
    "Which valve-stem mistake most often causes slow leaks?",
    "What's the most common valve-related cause of a slow tubeless leak?",
  ],
  'wh_t_8': [
    "When should a tubeless tire NEVER be re-installed?",
    "Which condition disqualifies a tubeless tire from being remounted?",
  ],
  // Stage 4 — Pressure
  'wh_p_2': [
    "Pick TWO TRUE statements about how pressure interacts with rolling resistance.",
    "Two correct points about pressure and rolling resistance — pick them.",
  ],
  'wh_p_3': [
    "Which rider/condition combination calls for the LOWEST pressure?",
    "Which scenario among these justifies the lowest PSI setting?",
  ],
  'wh_p_4': [
    "What does going OVER the printed max PSI risk?",
    "Which failure mode is most associated with exceeding max PSI?",
  ],
  'wh_p_5': [
    "How does rim width change the pressure target for the same tire size?",
    "Why does a wider internal rim let you safely run lower pressure?",
  ],
  'wh_p_6': [
    "Which pressure call best matches this rider, terrain, and tire?",
    "Pick the pressure that hits the sweet spot for this scenario.",
  ],
  // Stage 5 — Diagnosis
  'wh_d_2': [
    "What is the most likely cause of this symptom on the wheel?",
    "Which root cause best explains what the customer is feeling?",
  ],
  'wh_d_3': [
    "What's the FIRST thing you check given this complaint?",
    "Where does your diagnostic flow start on this one?",
  ],
  'wh_d_4': [
    "Which bearing condition matches what you're feeling?",
    "How would you classify this bearing's state?",
  ],
  'wh_d_6': [
    "Which combination of symptoms points to a cracked rim bed?",
    "Which finding cluster correctly identifies a rim bed crack?",
  ],
  'wh_d_7': [
    "Pick the next non-destructive test that will narrow the diagnosis.",
    "What's the cleanest next test to localize this issue?",
  ],
  // Stage 6 — Build
  'wh_b_2': [
    "Why does a wheel-building stand measure tension separately for drive vs non-drive side?",
    "What's the reason tension is reported per-side on a typical rear wheel build?",
  ],
  'wh_b_4': [
    "Which truing adjustment do you make FIRST on this wheel?",
    "What's the correct first adjustment for this wheel's symptom?",
  ],
  'wh_b_5': [
    "Which lacing pattern matches this drive demand and rim?",
    "Pick the lacing pattern best suited to this wheel application.",
  ],
  'wh_b_6': [
    "What is the correct order of operations when finishing a wheel build?",
    "Which sequence reflects the right finishing-pass order?",
  ],
  'wh_b_7': [
    "Which TWO failures result from over-tensioning a rear drive-side wheel?",
    "Pick the TWO consequences of running drive-side tension too high.",
  ],
  'wh_b_8': [
    "Which spoke prep practice best prevents nipple loosening?",
    "What's the correct prep call to keep nipples from backing out?",
  ],
  // Boss rounds (hard-tier)
  'boss_r3': [
    "Given the inspection results, which call do you make on this wheel?",
    "Based on what you've found, what's the right shop decision?",
  ],
  'boss_r4': [
    "Pick the spec choice that matches this build correctly.",
    "Which spec is consistent with all the constraints above?",
  ],
};

(function injectWheelhouseVariants() {
  const apply = (q) => {
    if (q && q.id && WHEELHOUSE_VARIANTS_V5[q.id]) {
      q.variants = WHEELHOUSE_VARIANTS_V5[q.id];
    }
  };
  for (const stage of STAGES) {
    if (stage.questions) for (const q of stage.questions) apply(q);
  }
  if (BOSS && BOSS.rounds) for (const q of BOSS.rounds) apply(q);
})();

window.WHEELHOUSE = {
  meta: {
    version: 1,
    totalStages: STAGES.length,
    totalQuestions: STAGES.reduce((a, s) => a + s.questions.length, 0),
  },
  stages: STAGES,
  boss: BOSS,
  badges: BADGES,
};

console.log('[Wheelhouse] Loaded', STAGES.length, 'stages,',
  STAGES.reduce((a, s) => a + s.questions.length, 0), 'questions, +',
  BOSS.rounds.length, 'boss rounds');
})();
