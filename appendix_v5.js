/* UBI Tune-Up v4 — Spec Vault Module
 *
 * The Spec Vault is a chart-driven companion zone built directly from the
 * Appendix of the UBI Professional Repair manual. Every question forces
 * the student to READ a real chart and make a shop-floor decision.
 *
 * Stages → Boss
 *   Stage 1 — 📑 Standards Lab        (Threads/TPI · Bearings · OLD widths)
 *   Stage 2 — 🚲 Sizing Bench         (Tire BSD · BB standards · BCD · Chains)
 *   Stage 3 — 🎯 Cockpit Calculator   (Steerer · Quill · Threadless · Bars)
 *   Stage 4 — 🧮 Conversion Garage    (PSI ↔ kPa · N·m ↔ ft·lbs · Gear Inches · Frame · Braze-ons)
 *   BOSS    — 🏆 Customer Spec Sheet  (multi-chart cross-reference)
 *
 * Question fields mirror the Wheelhouse engine:
 *   id, kind ('mc'|'multi'|'fill_blank'), difficulty, story, chartHtml,
 *   question, choices/correctAnswer/acceptedAnswers, requiredCorrect,
 *   why, hook, refs.
 *
 * chartHtml is RAW HTML (not escaped) — small inline tables the student
 * actually reads to choose the answer. Decision-making is the point.
 */
(function () {
'use strict';

// ---------- Inline chart helpers (compact tables student reads to decide) ----------
function chart(title, headers, rows, opts) {
  opts = opts || {};
  const cls = 'appx-chart' + (opts.dense ? ' dense' : '');
  const head = '<thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead>';
  const body = '<tbody>' + rows.map(r => {
    const hi = r.__highlight ? ' class="hi"' : '';
    const cells = r.cells || r;
    return '<tr' + hi + '>' + cells.map(c => '<td>' + c + '</td>').join('') + '</tr>';
  }).join('') + '</tbody>';
  return '<div class="appx-chart-wrap">' +
    '<div class="appx-chart-title">' + title + '</div>' +
    '<table class="' + cls + '">' + head + body + '</table>' +
    '</div>';
}
function note(text) {
  return '<div class="appx-chart-note">' + text + '</div>';
}

// =================== STAGE 1: STANDARDS LAB ===================
const S1 = {
  id: 'appx_standards',
  name: 'Standards Lab',
  icon: '📑',
  subtitle: 'Threads · TPI · OLD widths · Bearings',
  blurb: 'You can\'t spec what you can\'t identify. Read the standards charts, name the part, choose the right replacement.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'ax_s1_1', kind: 'mc', difficulty: 'easy',
      story: 'A customer brings in a loose nipple from a high-quality wheel build and asks what TPI they need to order replacements.',
      chartHtml: chart('Table 1 — English TPI Threads (excerpt)',
        ['TPI', 'Common Application'],
        [
          { __highlight: true, cells: ['56tpi', 'Most high-quality spokes and nipples'] },
          ['28tpi', 'Older axles, one-piece cranks'],
          ['26tpi', 'Hub axles, oversize steerer tubes'],
          ['24tpi', 'ISO/Italian/English BBs, 1" steerer, freewheels'],
          ['20tpi', 'Most pedal spindles, 14mm BMX hub axles'],
        ]),
      question: 'Per the standards chart, what TPI fits a quality spoke and nipple?',
      choices: [
        { text: '20 tpi', correct: false },
        { text: '24 tpi', correct: false },
        { text: '28 tpi', correct: false },
        { text: '56 tpi', correct: true },
      ],
      why: 'Quality spokes and nipples thread at <strong>56 tpi</strong> — the highlighted row in the chart. 24tpi is for BBs and freewheels; 20tpi is for pedal spindles.',
      hook: '56 = spokes. 24 = BBs/freewheels. 20 = pedals.',
      refs: ['A-4 · Table 1'],
    },
    {
      id: 'ax_s1_2', kind: 'mc', difficulty: 'medium',
      story: 'You\'re ordering a replacement bottle-cage bolt and a derailleur limit screw from the same vendor.',
      chartHtml: chart('Table 1 — Metric Threads (M = mm/thread)',
        ['Pitch', 'Common Application'],
        [
          ['1.25mm', 'Nut-type BB spindles'],
          ['1.0mm',  'Brake mount bolts, cable pinch bolts, common axles'],
          { __highlight: true, cells: ['0.8mm', 'Bottle braze-ons, rack mounts, downtube shifter bosses, 5mm bolts'] },
          { __highlight: true, cells: ['0.5mm', 'Dropout adjusting screws, some derailleur limit screws'] },
        ]),
      question: 'Which two pitches matter for those two parts?',
      choices: [
        { text: '1.25mm for the bottle bolt; 0.8mm for the limit screw.', correct: false },
        { text: '0.8mm for the bottle bolt; 0.5mm for the limit screw.', correct: true },
        { text: '1.0mm for both — they\'re both small fasteners.', correct: false },
        { text: '0.5mm for the bottle bolt; 0.8mm for the limit screw.', correct: false },
      ],
      why: 'Bottle/rack/braze-on bolts use <strong>M5 × 0.8</strong> pitch. Derailleur limit and dropout-adjuster screws use the finer <strong>0.5mm</strong> pitch (small thread, fine tuning).',
      hook: 'Bottle = 0.8 · Limit screw = 0.5. Smaller part = finer pitch.',
      refs: ['A-4 · Table 1'],
    },
    {
      id: 'ax_s1_3', kind: 'mc', difficulty: 'medium',
      story: 'A customer just ordered a new road frame with a 142mm rear through-axle dropout. They\'re trying to use their old quick-release wheelset built on 130mm OLD road hubs.',
      chartHtml: chart('Table 3 — OLD Width (Rear, excerpt)',
        ['OLD', 'Application'],
        [
          { __highlight: true, cells: ['130/131mm', '8–10 spd road / 11sp DT Swiss'] },
          ['135mm', '7–11 spd older QR MTB and disc QR road'],
          { __highlight: true, cells: ['142mm', 'Rear through-axle 9–11 spd road and mountain'] },
          ['148mm', 'Boost through-axles'],
        ]),
      question: 'Best honest response?',
      choices: [
        { text: '"Yes — 130 and 142 are both road, just thread the through-axle through your QR hub."', correct: false },
        { text: '"No — 130 OLD QR hubs and 142 through-axle dropouts are different rear standards. The wheel won\'t fit the frame correctly even with adapters; spec a 142×12 wheelset."', correct: true },
        { text: '"Just space the frame to 130mm with a hammer."', correct: false },
        { text: '"Use the 142mm spec only on the drive side."', correct: false },
      ],
      why: 'OLD is the dropout-to-dropout face spec AND the axle interface. <strong>130 = QR road, 142 = through-axle road/MTB.</strong> They are different standards: end-cap shape, axle length, dropout interface — all different. The correct fix is a hub matching the frame.',
      hook: '130 OLD ≠ 142 OLD. QR vs through-axle is a different system, not a different size.',
      refs: ['A-5 · Table 3'],
    },
    {
      id: 'ax_s1_4', kind: 'mc', difficulty: 'medium',
      story: 'A modern fat-bike fork sits on the bench. The customer wants a front hub. The fork is marked 150mm spacing with a 15mm through-axle.',
      chartHtml: chart('Table 3 — OLD Width (Front)',
        ['OLD', 'Application'],
        [
          ['100mm', 'Modern: bolt-on, 9mm QR, 12/15mm thru-axles'],
          ['110mm', 'Front hubs with 20mm thru-axles, 15mm Boost'],
          { __highlight: true, cells: ['150mm', 'Front hubs for FAT BIKE forks, 15mm thru-axles'] },
        ]),
      question: 'Which front-hub OLD do you order?',
      choices: [
        { text: '100mm', correct: false },
        { text: '110mm Boost', correct: false },
        { text: '150mm fat-bike-specific', correct: true },
        { text: '142mm (the rear standard)', correct: false },
      ],
      why: 'Fat-bike forks use <strong>150mm front OLD with a 15mm thru-axle</strong>. 100mm is standard road/MTB; 110mm is Boost. Don\'t cross spec families.',
      hook: 'Fat front = 150mm × 15mm. The fork width tells you the hub.',
      refs: ['A-5 · Table 3'],
    },
    {
      id: 'ax_s1_5', kind: 'multi', difficulty: 'medium', requiredCorrect: 2,
      story: 'You\'re servicing a higher-end road brake caliper and a pivoting brake lever. The manual\'s bearing-application chart is on the bench.',
      chartHtml: chart('Table 2 — Bicycle Bearing Applications (excerpt)',
        ['Bearing Type', 'Location'],
        [
          ['Loose ball', 'Hubs, headsets, pedals'],
          ['Cartridge', 'Hubs, headsets, BBs, pedals, suspension pivots, derailleur pulleys, some brake/shift lever pivots'],
          ['Angular contact', 'Hubs, headsets, some suspension pivots, serviceable BBs'],
          ['Roller', 'Hubs (freehub bodies)'],
          ['Needle', 'Freehub bodies, pedal axles, some suspension pivots'],
          { __highlight: true, cells: ['Thrust', 'Brake caliper pivots (higher-end)'] },
          { __highlight: true, cells: ['Bushings', 'Suspension forks/pivots, pedal axles, derailleur pulleys'] },
        ]),
      question: 'Pick the TWO bearing types you might find in a high-end caliper or some shift-lever pivots:',
      choices: [
        { text: 'Thrust bearings (higher-end caliper pivots)', correct: true },
        { text: 'Cartridge bearings (some brake-lever / shift-lever pivots)', correct: true },
        { text: 'Roller bearings (freehub body)', correct: false },
        { text: 'Angular contact bearings (hubs/headsets)', correct: false },
        { text: 'Needle bearings (freehub body / pedal axle)', correct: false },
      ],
      why: 'The chart is the answer key. <strong>Thrust</strong> bearings appear at higher-end caliper pivots (axial loads through the arm). <strong>Cartridge</strong> bearings show up in shift/brake lever pivots. Roller/needle are freehub-body specific; angular contact is hubs/serviceable BBs.',
      hook: 'Caliper pivots = thrust (higher end). Lever pivots = cartridge. Freehub = roller/needle.',
      refs: ['A-5 · Table 2'],
    },
    {
      id: 'ax_s1_6', kind: 'fill_blank', difficulty: 'easy',
      story: 'A standard 9mm-QR rear road hub for an 8-speed cassette walks into the shop. The customer asks the OLD spec.',
      chartHtml: chart('Table 3 — OLD Width (Rear, excerpt)',
        ['OLD', 'Application'],
        [
          ['126mm', '6 & 7 spd (older road)'],
          ['130mm', '7 spd MTB'],
          { __highlight: true, cells: ['130/131mm', '8–10 spd road (131mm DT Swiss 11sp)'] },
          ['135mm', '7–11 spd older QR MTB and disc QR road'],
        ]),
      question: 'Per the chart, what is the standard OLD (in mm) for an 8–10 speed road QR hub?',
      correctAnswer: '130mm',
      acceptedAnswers: ['130', '130 mm'],
      why: 'Modern road QR rear OLD for 8–10 spd is <strong>130mm</strong>. (135mm is QR MTB / disc QR road; 131 only on DT Swiss 11sp.)',
      hook: '130 = road QR · 135 = MTB QR / disc QR road · 142 = thru-axle road/MTB.',
      refs: ['A-5 · Table 3'],
    },
    {
      id: 'ax_s1_7', kind: 'mc', difficulty: 'hard',
      story: 'A walk-in has a 7-speed older MTB rear wheel and wants to swap it into a frame originally built for an 8-speed road bike. The customer is positive "they\'re both 7-ish speeds, must fit."',
      chartHtml: chart('Table 3 — OLD Width (Rear, key rows)',
        ['OLD', 'Application'],
        [
          ['126mm', '6 & 7 spd (older road)'],
          { __highlight: true, cells: ['130mm', '7 spd MTB'] },
          { __highlight: true, cells: ['130/131mm', '8–10 spd road / 11sp DT Swiss'] },
          ['135mm', '7–11 spd older QR MTB / disc QR road'],
        ]),
      question: 'Reading the chart, what\'s the actual answer?',
      choices: [
        { text: 'Yes — 7 spd MTB and 8 spd road are both 130mm OLD; mechanically compatible.', correct: true },
        { text: 'No — 7 spd MTB is 135mm and won\'t fit 130mm road dropouts.', correct: false },
        { text: 'No — they\'re different speed counts, the chain won\'t shift.', correct: false },
        { text: 'No — 7 spd MTB is 126mm; needs cold-set spreading.', correct: false },
      ],
      why: 'OLD is the same: <strong>130mm</strong> for 7 spd MTB and 8–10 spd road. Mechanically the wheel fits. (Drivetrain compatibility — freehub width vs cassette/derailleur — is a separate question, but the OLD does match.)',
      hook: '7 MTB = 130mm. 8–10 road = 130mm. Same OLD. Different chart questions = different answers.',
      refs: ['A-5 · Table 3'],
    },
  ],
};

// =================== STAGE 2: SIZING BENCH ===================
const S2 = {
  id: 'appx_sizing',
  name: 'Sizing Bench',
  icon: '🚲',
  subtitle: 'Tire BSD · BB standards · BCD · Chains',
  blurb: 'BSD numbers, BB shells, bolt circles, chain pin widths. Match the chart row to the part, every time.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'ax_s2_1', kind: 'mc', difficulty: 'easy',
      story: 'A customer wants a 700C touring tire. They\'re in your shop next to a wall of tires.',
      chartHtml: chart('Table 4 — Tire Sizing (BSD highlights)',
        ['BSD', 'Common Name', 'Apps'],
        [
          ['630mm', '27"', 'Older road bike size'],
          { __highlight: true, cells: ['622mm', '700c / 29"', 'Common road, 29er MTB'] },
          ['584mm', '650B / 27.5"', 'Common MTB, gravel, road plus, touring'],
          ['571mm', '650C', 'Smaller road, TT, triathlon'],
          ['559mm', '26"', 'Older MTB, fat bikes'],
        ]),
      question: 'Which BSD do you grab from the wall?',
      choices: [
        { text: '630mm', correct: false },
        { text: '622mm', correct: true },
        { text: '584mm', correct: false },
        { text: '559mm', correct: false },
      ],
      why: '700C and 29" mountain both share the <strong>622mm BSD</strong>. The number on the sidewall is what matches the rim, regardless of the marketing name.',
      hook: '700C = 29" = 622mm BSD. Same circle, three names.',
      refs: ['A-6 · Table 4'],
    },
    {
      id: 'ax_s2_2', kind: 'mc', difficulty: 'medium',
      story: 'A 1970s cruiser with "26 × 1 3/8" stamped on the tire rolls in. The owner wants a fresh tire and assumes a generic 26" off the wall will fit.',
      chartHtml: chart('Table 4 — Tire Sizing (look for the 26-class trap)',
        ['BSD', 'NA/Brit', 'Apps'],
        [
          ['597mm', '26" × 1 3/8"', 'Older Schwinn S-5 & S-6'],
          { __highlight: true, cells: ['590mm', '650A / 26" × 1 3/8"', 'Older British 3-speed'] },
          ['571mm', '650C / 26" × 1"', 'Smaller road, TT'],
          ['559mm', '26" × 1.5–5.0"', 'Modern MTB / fat'],
        ]),
      question: 'Best response based on the chart?',
      choices: [
        { text: '"All 26-inch tires interchange — grab any 26."', correct: false },
        { text: '"It\'s a different BSD — likely 597 or 590, not 559. A modern \'26-inch\' MTB tire will NOT fit."', correct: true },
        { text: '"Squeeze a modern 26 × 2.0 — same BSD."', correct: false },
        { text: '"You need a 700C tire instead."', correct: false },
      ],
      why: 'The "26 × 1 3/8" name covers <strong>multiple different BSDs</strong> (597, 590) — none match the modern <strong>559mm</strong> MTB BSD. Tire NAME never overrides BSD. Always read the BSD off the tire and rim.',
      hook: '"26-inch" is a marketing name with three real BSDs. Always read the number, not the name.',
      refs: ['A-6 · Table 4'],
    },
    {
      id: 'ax_s2_3', kind: 'multi', difficulty: 'medium', requiredCorrect: 2,
      story: 'You\'re overhauling a vintage road bike. The drive-side BB cup just won\'t budge — and you suspect it\'s NOT a standard ISO/English shell.',
      chartHtml: chart('Table 5 — Threaded BB Standards (DRIVE SIDE matters)',
        ['Standard', 'Thread Spec', 'Drive Side'],
        [
          { __highlight: true, cells: ['ISO', '1.375" × 24 TPI', 'LEFT-hand thread'] },
          ['English/BSC', '1.370" × 24 TPI', 'LEFT-hand thread'],
          { __highlight: true, cells: ['Italian', '36mm × 24 TPI', 'RIGHT-hand thread'] },
          { __highlight: true, cells: ['French*', '35mm × 1mm', 'RIGHT-hand thread'] },
          ['T-47', '47mm × 1mm', 'LEFT-hand thread'],
        ]),
      question: 'Pick the TWO standards where the DRIVE-side cup unthreads OPPOSITE the modern direction (i.e. drive side is RIGHT-hand thread):',
      choices: [
        { text: 'Italian (36 × 24 TPI)', correct: true },
        { text: 'French (35 × 1mm)', correct: true },
        { text: 'ISO (1.375 × 24 TPI)', correct: false },
        { text: 'English/BSC (1.370 × 24 TPI)', correct: false },
        { text: 'T-47 (47 × 1mm)', correct: false },
      ],
      why: 'On <strong>Italian and French</strong> shells, BOTH cups are right-hand thread. So on the drive side you turn it the SAME direction as the non-drive — opposite of ISO/English/BSC/T-47 (where drive side is left-hand). Mistaking direction = stripped cup.',
      hook: 'Italian + French = both sides RH. ISO/English/T-47 = drive side LH. Read the shell before you crank.',
      refs: ['A-6 · Table 5'],
    },
    {
      id: 'ax_s2_4', kind: 'mc', difficulty: 'medium',
      story: 'A frame is stamped "PF30" on the BB shell. The customer wants to know what bearing system fits.',
      chartHtml: chart('Table 6 — Threadless BB Standards',
        ['Standard', 'Shell Width', 'Shell I.D.', 'Bearing or Cup', 'Bearing I.D.'],
        [
          ['BB30', '68/73mm', '42mm', 'Bearing', '30mm'],
          { __highlight: true, cells: ['PF30', '68/73/83mm', '46mm', 'Cup (press-fit)', '30mm'] },
          ['BB86/92', '86.5/91.5mm', '41mm', 'Bearing', '24mm'],
          ['BB90/95', '90.5/95.5mm', '37mm', 'Bearing', '24mm'],
          ['BB386EVO', '86.5mm', '46mm', 'Cup', '30mm'],
        ]),
      question: 'Per the chart, what does PF30 require?',
      choices: [
        { text: '42mm shell I.D., bearing pressed direct, 30mm spindle', correct: false },
        { text: '46mm shell I.D., press-fit CUP, 30mm spindle', correct: true },
        { text: '41mm shell I.D., direct-press bearing, 24mm spindle', correct: false },
        { text: 'Any 24mm spindle — universally compatible', correct: false },
      ],
      why: 'PF30 = <strong>46mm shell I.D., press-fit CUP, 30mm spindle</strong>. BB30 also takes a 30mm spindle but presses the bearing directly into a 42mm shell — different shell I.D., different install method. Don\'t cross-spec.',
      hook: 'PF30 = 46 + cup + 30. BB30 = 42 + direct bearing + 30. Same spindle, different shell.',
      refs: ['A-6 · Table 6'],
    },
    {
      id: 'ax_s2_5', kind: 'mc', difficulty: 'medium',
      story: 'A road customer wants to swap their 53/39 standard double for a "compact" double crankset. They want to know if their existing chainrings (130 BCD) will fit the new spider.',
      chartHtml: chart('Table 7 — BCD (selected)',
        ['Crankset Style', 'BCD'],
        [
          { __highlight: true, cells: ['Road double "standard"', '130mm'] },
          { __highlight: true, cells: ['Road double "compact"', '110mm'] },
          ['Road double Campagnolo', '135mm'],
          ['Track', '144mm'],
          ['MTB 3×9/3×10 (outer/middle)', '104mm'],
        ]),
      question: 'Will the old rings fit the new compact crank?',
      choices: [
        { text: 'Yes — all road doubles share the same BCD.', correct: false },
        { text: 'No — standard double is 130 BCD; compact is 110 BCD. They will NOT interchange.', correct: true },
        { text: 'Yes — only the inner ring changes BCD; outer is universal.', correct: false },
        { text: 'Only if the rings are Campagnolo (135 BCD).', correct: false },
      ],
      why: 'Bolt Circle Diameter is the circle on which the chainring bolts sit. Different BCD = different ring footprint. <strong>Standard road = 130; compact = 110</strong>. The student needs new rings sized for the new spider.',
      hook: 'Compact = 110 BCD · Standard = 130 · Campy = 135. Cranks pick the rings.',
      refs: ['A-7 · Table 7'],
    },
    {
      id: 'ax_s2_6', kind: 'mc', difficulty: 'hard',
      story: 'You measure a chain pin width with calipers — about 5.9mm. The customer doesn\'t know what cassette is on the bike.',
      chartHtml: chart('Table 9 — Derailleur Chain ID by Pin Width',
        ['Speeds', 'Pin Width'],
        [
          ['5 & 6 spd', '7.5–8.0mm'],
          ['7 & 8 spd', '7.0–7.5mm'],
          ['9 spd', '6.5–6.9mm'],
          { __highlight: true, cells: ['10 spd', '~5.9mm'] },
          ['11 spd', '~5.5mm'],
          ['12 spd', '~5.2mm'],
        ]),
      question: 'Per the chain ID chart, what speed cassette does this drivetrain use?',
      choices: [
        { text: '8 speed', correct: false },
        { text: '9 speed', correct: false },
        { text: '10 speed', correct: true },
        { text: '11 speed', correct: false },
      ],
      why: '<strong>~5.9mm pin width</strong> = 10 speed. The chain narrows as speed count goes up; ordering the wrong replacement chain by guess is a sure way to wreck shifting and tear sprockets.',
      hook: 'Chain ID by caliper: 8sp ≈ 7.3 · 9sp ≈ 6.7 · 10sp ≈ 5.9 · 11sp ≈ 5.5 · 12sp ≈ 5.2.',
      refs: ['A-7 · Table 9'],
    },
    {
      id: 'ax_s2_7', kind: 'multi', difficulty: 'medium', requiredCorrect: 2,
      story: 'A vintage cruiser with a single-speed coaster brake hub rolls in. You need to replace the chain.',
      chartHtml: chart('Table 8 — Single-Cog Chain ID',
        ['Chain Type', 'Pin Width'],
        [
          { __highlight: true, cells: ['1/2" × 1/8"', '9–10mm'] },
          ['1/2" × 3/32"', '7.5–8mm'],
          ['1/2" × 3/16"', '13mm+'],
        ]),
      question: 'Pick the TWO statements that follow from the chart for a typical coaster-brake single-speed:',
      choices: [
        { text: 'A 1/2" × 1/8" chain has a pin width around 9–10mm.', correct: true },
        { text: '1/2" × 1/8" is the standard heavier single-cog chain — coaster brake / BMX / single-speed.', correct: true },
        { text: 'A 10-speed derailleur chain (~5.9mm) is correct for this build.', correct: false },
        { text: '3/16" inner-link width is the lightweight track choice.', correct: false },
        { text: 'Pin width doesn\'t matter on single-speed — any chain works.', correct: false },
      ],
      why: 'Single-cog: <strong>1/2" × 1/8"</strong> is the everyday standard with ~9–10mm pin width. Derailleur chains are too narrow at the rollers; 3/16" is heavier industrial use, not lightweight track.',
      hook: 'Single-speed default: 1/2 × 1/8, ~9–10mm pin. Don\'t use derailleur chains on a coaster brake.',
      refs: ['A-7 · Table 8'],
    },
  ],
};

// =================== STAGE 3: COCKPIT CALCULATOR ===================
const S3 = {
  id: 'appx_cockpit',
  name: 'Cockpit Calculator',
  icon: '🎯',
  subtitle: 'Steerers · Quills · Threadless · Bars',
  blurb: 'Stem clamps and steerer tubes — five wrong sizes look identical until you measure. Read, decide, order.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'ax_s3_1', kind: 'mc', difficulty: 'easy',
      story: 'A 1" THREADED steerer tube on an old road bike needs a quill stem.',
      chartHtml: chart('Table 11 — Quill Diameters',
        ['Quill Diameter', 'Typical Usage'],
        [
          { __highlight: true, cells: ['22.2mm', 'MOST COMMON · 1" threaded headsets'] },
          ['25.4mm', 'Older MTB · 1-1/8" threaded headsets'],
          ['28.6mm', 'Older MTB · 1-1/4" threaded headsets'],
        ]),
      question: 'Which QUILL diameter do you order?',
      choices: [
        { text: '22.2mm', correct: true },
        { text: '25.4mm', correct: false },
        { text: '28.6mm', correct: false },
        { text: '31.8mm', correct: false },
      ],
      why: '1" threaded steerer = <strong>22.2mm quill</strong>. The quill slides INSIDE the steerer, so quill diameter is always smaller than the steerer I.D.',
      hook: '1" threaded steerer ↔ 22.2mm quill. Most common combo on every shop wall.',
      refs: ['A-8 · Table 11'],
    },
    {
      id: 'ax_s3_2', kind: 'mc', difficulty: 'medium',
      story: 'You measure a customer\'s drop bar at 31.8mm clamp diameter. They want a new stem.',
      chartHtml: chart('Table 13 — Handlebar Clamp Diameters',
        ['Clamp Ø', 'Typical Usage'],
        [
          ['35mm', 'Newer bars, road and MTB'],
          { __highlight: true, cells: ['31.8mm', 'Most modern bars (road and MTB) · "road oversize"'] },
          ['26.0mm', 'Italian standard road (older)'],
          ['25.4mm', 'Older ISO · newer riser/cruiser'],
          ['22.2mm', 'BMX & older MTB'],
        ]),
      question: 'Which stem do you grab?',
      choices: [
        { text: '35mm clamp', correct: false },
        { text: '31.8mm clamp', correct: true },
        { text: '26.0mm clamp', correct: false },
        { text: 'Any of them, with a shim', correct: false },
      ],
      why: '<strong>31.8mm bar = 31.8mm stem</strong>. Shimming UP from a smaller stem can work but isn\'t the right first answer — the chart already lists the matching size. Match the spec; don\'t engineer around it.',
      hook: 'Bar Ø = stem clamp Ø. 31.8 has been the modern default for ~20 years.',
      refs: ['A-9 · Table 13'],
    },
    {
      id: 'ax_s3_3', kind: 'mc', difficulty: 'medium',
      story: 'A modern MTB has a TAPERED steerer. The bottom of the steerer is bigger than the top.',
      chartHtml: chart('Table 12 — Threadless Steerers (TAPERED)',
        ['Top → Bottom', 'Typical Usage'],
        [
          ['1-1/8" → 1-1/4"', 'Road'],
          { __highlight: true, cells: ['1-1/8" → 1.5"', 'Mountain and road'] },
          ['1-1/4" → 1.5"', 'Giant Overdrive'],
        ]),
      question: 'For a modern MTB, the most common tapered profile is:',
      choices: [
        { text: '1" → 1-1/8"', correct: false },
        { text: '1-1/8" → 1-1/4" (road)', correct: false },
        { text: '1-1/8" → 1.5" (MTB / road)', correct: true },
        { text: '1-1/4" → 1.5" (Giant Overdrive)', correct: false },
      ],
      why: '<strong>1-1/8" upper to 1.5" lower</strong> is the dominant tapered standard for MTB and current road. Larger lower bearing = stiffer front end where the load is highest.',
      hook: 'MTB tapered default: 1-1/8 → 1.5. Big at the bottom, normal at the top.',
      refs: ['A-8 · Table 12'],
    },
    {
      id: 'ax_s3_4', kind: 'mc', difficulty: 'medium',
      story: 'A customer brings in an older Cinelli road bar — they want a matching stem.',
      chartHtml: chart('Table 13 — Bar Clamp Ø (vintage Cinelli row)',
        ['Clamp Ø', 'Typical Usage'],
        [
          { __highlight: true, cells: ['26.4mm', 'Older Cinelli handlebars and Cinelli copies'] },
          ['26.0mm (25.8)', 'Italian standard road · 3T/Ritchey/ITM 26.0 stem'],
          ['25.4mm', 'Older ISO · newer riser/cruiser'],
        ]),
      question: 'What clamp Ø is the original Cinelli vintage spec?',
      choices: [
        { text: '25.4mm', correct: false },
        { text: '26.0mm', correct: false },
        { text: '26.4mm', correct: true },
        { text: '31.8mm', correct: false },
      ],
      why: 'Vintage Cinelli (and the Cinelli copies) used a unique <strong>26.4mm</strong> bar clamp — slightly larger than the Italian 26.0 standard. A 26.0 stem on a 26.4 bar will not clamp safely.',
      hook: 'Old Cinelli = 26.4. Italian = 26.0. Don\'t cross them.',
      refs: ['A-9 · Table 13'],
    },
    {
      id: 'ax_s3_5', kind: 'fill_blank', difficulty: 'medium',
      story: 'A modern THREADLESS road frame uses a 1-1/8" straight steerer.',
      chartHtml: chart('Table 10 — Steerer Tube Diameters',
        ['Imperial', 'Metric'],
        [
          ['1"', '25.4mm'],
          { __highlight: true, cells: ['1-1/8"', '28.6mm'] },
          ['1-1/4"', '31.75mm'],
          ['1.5"', '38.1mm'],
        ]),
      question: 'In millimeters (one decimal place), what is the OUTSIDE diameter of a 1-1/8" steerer?',
      correctAnswer: '28.6mm',
      acceptedAnswers: ['28.6', '28.6 mm', '28.6mm'],
      why: '1-1/8" = <strong>28.6mm</strong>. This is the most common modern threadless road/older-MTB standard.',
      hook: '1" = 25.4 · 1-1/8" = 28.6 · 1-1/4" = 31.75 · 1.5" = 38.1.',
      refs: ['A-8 · Table 10'],
    },
    {
      id: 'ax_s3_6', kind: 'mc', difficulty: 'hard',
      story: 'A customer has a "newer riser bar" that\'s 25.4mm clamp. They want to install a modern road stem rated 31.8mm clamp ONLY.',
      chartHtml: chart('Table 13 — Clamp Ø excerpt',
        ['Clamp Ø', 'Typical Usage'],
        [
          ['31.8mm', 'Most modern bars, road and MTB'],
          { __highlight: true, cells: ['25.4mm', 'Older ISO · newer riser/cruiser'] },
          ['22.2mm', 'BMX, older MTB'],
        ]),
      question: 'Best response based on the chart?',
      choices: [
        { text: '"Use a 25.4 → 31.8 shim sleeve over the bar — that\'s a standard clamping fix."', correct: true },
        { text: '"Tighten the stem extra hard, it\'ll grip 25.4."', correct: false },
        { text: '"Buy a new 31.8 bar and reuse the stem you already have."', correct: false },
        { text: '"You need to clamp on the brake levers instead."', correct: false },
      ],
      why: 'Bar/stem size is non-negotiable for clamp safety. Either replace the bar (fine) OR install a <strong>shim sleeve</strong> rated for the size jump (also fine). Cranking torque on a mismatched clamp will deform parts and fail in service.',
      hook: 'Mismatched clamp: shim or replace. Never just over-torque.',
      refs: ['A-9 · Table 13'],
    },
  ],
};

// =================== STAGE 4: CONVERSION GARAGE ===================
const S4 = {
  id: 'appx_convert',
  name: 'Conversion Garage',
  icon: '🧮',
  subtitle: 'PSI ↔ kPa · Torque · Gear Inches · Frame · Braze-ons',
  blurb: 'Real shop math: convert pressure, convert torque, calculate gear inches, pick frame materials and braze-on threads from the chart.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'ax_s4_1', kind: 'mc', difficulty: 'medium',
      story: 'A customer\'s tire is marked "MAX 6.9 BAR." Their pump only reads PSI.',
      chartHtml: chart('Pressure Conversion (Appendix)',
        ['I have…', '× by', 'to receive…'],
        [
          ['psi', '6.894', 'kPa'],
          { __highlight: true, cells: ['psi', '0.0689476', 'Bar'] },
        ]) +
        note('To convert <strong>Bar → psi</strong>, divide by 0.0689476 (or multiply by ~14.5).'),
      question: 'About what PSI is the MAX rating?',
      choices: [
        { text: '~50 psi', correct: false },
        { text: '~70 psi', correct: false },
        { text: '~100 psi', correct: true },
        { text: '~145 psi', correct: false },
      ],
      why: '<strong>6.9 bar × 14.5 ≈ 100 psi.</strong> Equivalent: 6.9 / 0.0689476 ≈ 100. Inflate to or below the MAX. (~145 psi would only happen at ~10 bar.)',
      hook: '1 bar ≈ 14.5 psi. 6.9 bar ≈ 100 psi. 8 bar ≈ 116 psi.',
      refs: ['A-2'],
    },
    {
      id: 'ax_s4_2', kind: 'mc', difficulty: 'medium',
      story: 'A torque spec card says "tighten stem bolts to 5 N·m." Your beam wrench reads in inch-pounds.',
      chartHtml: chart('Torque Conversion',
        ['I have…', '× by', 'to receive…'],
        [
          ['N·m', '0.738', 'ft·lbs'],
          { __highlight: true, cells: ['N·m', '8.851', 'inch·lbs'] },
          ['inch·lbs', '0.113', 'N·m'],
        ]),
      question: 'What does 5 N·m equal in inch-pounds?',
      choices: [
        { text: '~3.7 inch·lbs', correct: false },
        { text: '~22 inch·lbs', correct: false },
        { text: '~44 inch·lbs', correct: true },
        { text: '~88 inch·lbs', correct: false },
      ],
      why: '<strong>5 N·m × 8.851 ≈ 44 inch·lbs.</strong> Mixing N·m and ft·lbs is the classic stem-bolt overtighten — a 5 N·m bolt at 5 ft·lbs (≈ 60 inch·lbs) is ~36% over spec.',
      hook: 'N·m × 8.851 = inch·lbs. N·m × 0.738 = ft·lbs. Always check the units printed on the bolt.',
      refs: ['A-2'],
    },
    {
      id: 'ax_s4_3', kind: 'mc', difficulty: 'hard',
      story: 'A 26" MTB has a 36-tooth front chainring and an 18-tooth rear cog selected.',
      chartHtml: '<div class="appx-formula"><strong>Gear Inches</strong> = (Front teeth ÷ Rear teeth) × Wheel diameter (in inches)<br><span class="formula-mini">Distance per pedal rev = Gear inches × π</span></div>',
      question: 'What is the gear inch value for that combination?',
      choices: [
        { text: '26 gear inches', correct: false },
        { text: '40 gear inches', correct: false },
        { text: '52 gear inches', correct: true },
        { text: '78 gear inches', correct: false },
      ],
      why: '<strong>(36 ÷ 18) × 26 = 2 × 26 = 52 gear inches.</strong> A higher number = harder to pedal. The Penny-Farthing analog: this gear feels like a 52" front wheel direct drive.',
      hook: '(Front ÷ Rear) × Wheel diameter. Bigger number = harder gear.',
      refs: ['A-2'],
    },
    {
      id: 'ax_s4_4', kind: 'mc', difficulty: 'medium',
      story: 'You\'re comparing a 6061 aluminum frame with a 4130 steel frame for a customer obsessed with stiffness numbers.',
      chartHtml: chart('Table 14 — Frame Material Properties',
        ['Property', '4130 Steel', '6061 Al', '3/2.5 Ti', 'Carbon'],
        [
          ['Density (lb/in³)', '.283', '.098', '.160', '.056'],
          { __highlight: true, cells: ['Mod. of Elasticity (Mpsi)', '30', '10', '16', '17'] },
          ['Yield Strength (ksi)', '63', '40', '105', 'n/a'],
          ['Tensile Strength (ksi)', '97', '45', '125', '275'],
        ]),
      question: 'Per the chart, the MODULUS (stiffness) of 6061 Al vs. 4130 steel is roughly:',
      choices: [
        { text: 'Aluminum is ~3× stiffer than steel.', correct: false },
        { text: 'Aluminum is ~3× LESS stiff than steel (steel ≈ 30 Mpsi vs Al ≈ 10 Mpsi).', correct: true },
        { text: 'They\'re identical at the same density.', correct: false },
        { text: 'Aluminum has zero modulus per the chart.', correct: false },
      ],
      why: 'Modulus of elasticity = the material\'s intrinsic stiffness. Steel ≈ 30 Mpsi, Al ≈ 10 Mpsi — <strong>steel is ~3× stiffer per area.</strong> That\'s why aluminum frames are made with bigger-diameter, thicker-walled tubes — to hit equivalent frame stiffness despite the lower material modulus.',
      hook: 'Aluminum frames look fat because the metal is less stiff. Bigger tubes restore stiffness.',
      refs: ['A-9 · Table 14'],
    },
    {
      id: 'ax_s4_5', kind: 'mc', difficulty: 'medium',
      story: 'A customer\'s frame has a stripped water-bottle braze-on. They want to know which tap to buy.',
      chartHtml: chart('Table 15 — Braze-on Thread Sizes',
        ['Thread', 'Common Application'],
        [
          { __highlight: true, cells: ['M5 × 0.8', 'Water bottle, rack, fender eyelets'] },
          ['M6 × 1.0', 'Brake bosses (cantilever, linear, disc), DT shifter bosses'],
          ['M10 × 1.0', 'Derailleur hanger mounting hole'],
          ['M12 × 1.5', 'Shimano E-thru, RockShox Maxle Stealth'],
        ]),
      question: 'Per the chart, which tap goes into a water-bottle boss?',
      choices: [
        { text: 'M4 × 0.7', correct: false },
        { text: 'M5 × 0.8', correct: true },
        { text: 'M6 × 1.0', correct: false },
        { text: 'M10 × 1.0', correct: false },
      ],
      why: 'Water-bottle / rack / fender braze-ons are <strong>M5 × 0.8</strong>. Don\'t guess on a stripped boss — chasing with the wrong tap will permanently destroy the threads.',
      hook: 'Bottle/rack/fender = M5 × 0.8. Brake boss = M6 × 1.0. Hanger mount = M10 × 1.0.',
      refs: ['A-9 · Table 15'],
    },
    {
      id: 'ax_s4_6', kind: 'mc', difficulty: 'hard',
      story: 'You\'re fitting a custom front thru-axle. The fork is marked "M15 × 1.5" but the customer also has a similar-looking M15 axle from another bike marked "M15 × ???"  — and you\'re considering whether to test-fit it.',
      chartHtml: chart('Table 15 — Thru-axle Threads (excerpt)',
        ['Thread', 'Application'],
        [
          { __highlight: true, cells: ['M15 × 1.5', 'RockShox Maxle Light Ft & Ultimate, X-Fusion'] },
          ['M14 × 1.5', 'Fox thru-axle'],
          ['M12 × 1.5', 'Shimano E-thru, Maxle Stealth (front & rear)'],
          ['M12 × 1.75', 'RockShox Maxle Light & Ultimate (rear only)'],
          ['M20 × 2.0', 'RockShox downhill front'],
        ]) +
        note('"Thread length will vary between types: thru-axles may not be compatible even within the same size."'),
      question: 'Best move?',
      choices: [
        { text: 'Test-fit the unknown axle by hand — if it spins in, send it.', correct: false },
        { text: 'Don\'t test-fit. Per the chart note, even SAME-SIZE thru-axles can have different pitch/length and risk cross-threading the fork.', correct: true },
        { text: 'Use a torque wrench at 10 N·m to "force" the threads to match.', correct: false },
        { text: 'Any M15 axle is universal — fork manufacturers harmonized in 2018.', correct: false },
      ],
      why: 'The manual\'s note is explicit: thread length and pitch vary between manufacturers and models. <strong>Cross-threading a fork crown is a frame-level repair</strong> — verify the spec FIRST, don\'t test-fit on guesswork.',
      hook: 'Same diameter ≠ same thread. Look up before you twist.',
      refs: ['A-9 · Table 15'],
    },
  ],
};

// =================== BOSS: CUSTOMER SPEC SHEET SHOWDOWN ===================
const BOSS = {
  id: 'appx_boss',
  name: 'BOSS: Customer Spec Sheet Showdown',
  icon: '🏆',
  subtitle: 'Multi-chart cross-reference under shop pressure',
  blurb: 'A walk-in hands you a half-filled spec sheet. You\'ll cross-reference five charts to complete the work order — every wrong cell costs the shop time.',
  intro: '<strong>Walk-in:</strong> Customer brings in an older Italian-made road frame with rim brakes for a top-to-bottom restoration. The spec sheet has fields you must fill correctly before parts go on order.<br><br>You\'ll work the charts: BB standard, BCD, OLD, tire BSD, and torque + braze-on threads. <em>Pass: 4 of 5.</em>',
  rounds: [
    {
      id: 'appx_boss_r1', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 1 — Bottom bracket. The shell is stamped "36 × 24". The drive cup will not budge counter-clockwise.',
      chartHtml: chart('Table 5 — Threaded BB Standards',
        ['Standard', 'Spec', 'Drive Side'],
        [
          ['ISO', '1.375" × 24 TPI', 'LEFT-hand thread'],
          ['English/BSC', '1.370" × 24 TPI', 'LEFT-hand thread'],
          { __highlight: true, cells: ['Italian', '36mm × 24 TPI', 'RIGHT-hand thread'] },
          ['T-47', '47mm × 1mm', 'LEFT-hand thread'],
        ]),
      question: 'What\'s the BB standard, and which way does the drive cup come OUT?',
      choices: [
        { text: 'English — drive cup comes out CLOCKWISE.', correct: false },
        { text: 'Italian — drive cup comes out COUNTER-CLOCKWISE (right-hand thread, normal "lefty-loosey").', correct: true },
        { text: 'ISO — drive cup comes out CLOCKWISE.', correct: false },
        { text: 'T-47 — drive cup comes out CLOCKWISE.', correct: false },
      ],
      why: 'Italian (36 × 24) is right-hand thread on BOTH sides. So the drive cup loosens <strong>counter-clockwise</strong> ("lefty loosey"). On English/ISO/T-47, the drive cup is reverse — turn CLOCKWISE to loosen.',
      hook: 'Italian = both RH (normal direction). English = drive side LH (clockwise to loosen). Read the shell first.',
    },
    {
      id: 'appx_boss_r2', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 2 — Crankset. The customer wants to keep the original 53/39 chainrings. Their existing crank is a road-double "standard" 130 BCD spider. Replacement crank is a "compact" road-double.',
      chartHtml: chart('Table 7 — BCD',
        ['Crankset', 'BCD'],
        [
          ['Road double "standard"', '130mm'],
          { __highlight: true, cells: ['Road double "compact"', '110mm'] },
          ['Road triple inner', '74mm'],
          ['Road Campagnolo double', '135mm'],
        ]),
      question: 'Will the 53/39 rings fit the new compact crank?',
      choices: [
        { text: 'Yes — all road doubles share BCD.', correct: false },
        { text: 'No — 53/39 are 130 BCD rings, compact is 110 BCD. They will NOT fit.', correct: true },
        { text: 'Yes, only after re-drilling the inner ring.', correct: false },
        { text: 'Yes, if you swap to Campagnolo bolts.', correct: false },
      ],
      why: 'Standard double = 130 BCD; compact = 110 BCD. The bolt pattern doesn\'t line up. Per the chart, <strong>you spec rings to the spider</strong>, not the rider\'s preferences. Compact-friendly choices are typically 50/34 or 52/36.',
      hook: 'Compact 110 BCD won\'t take 130 BCD rings. Spider sets the size.',
    },
    {
      id: 'appx_boss_r3', kind: 'mc', difficulty: 'hard',
      story: 'ROUND 3 — Wheels. The frame has horizontal rear dropouts measuring 126mm OLD. The customer wants a 9-speed cassette wheel.',
      chartHtml: chart('Table 3 — Rear OLD',
        ['OLD', 'Application'],
        [
          { __highlight: true, cells: ['126mm', '6 & 7 spd (older road)'] },
          ['130mm', '7 spd MTB'],
          ['130/131mm', '8–10 spd road / 11sp DT Swiss'],
          ['135mm', '7–11 spd older QR MTB / disc QR road'],
        ]),
      question: 'What is the cleanest path forward?',
      choices: [
        { text: 'Force a 130mm 9-spd wheel into the 126mm dropouts and ride.', correct: false },
        { text: 'Cold-set the rear triangle of the steel frame from 126 → 130mm; install a 9-spd 130mm wheel. (Steel only — never aluminum/carbon.)', correct: true },
        { text: 'Re-cut the dropouts wider with a file.', correct: false },
        { text: 'Spec a 7-speed wheel only — frame is locked at 6/7.', correct: false },
      ],
      why: 'Steel frames can be safely cold-set 126→130 by a trained mechanic — that\'s how 8/9/10sp upgrades happened on classic road frames. <strong>Aluminum and carbon frames cannot be cold-set safely.</strong> Forcing the wheel without setting the frame loads the dropouts asymmetrically.',
      hook: '126→130 cold-set: steel only. Never on aluminum or carbon.',
    },
    {
      id: 'appx_boss_r4', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 4 — Tires. The customer wants to keep the original 27" rims (they refuse to rebuild). They walk over to your tire wall.',
      chartHtml: chart('Table 4 — Tire BSD',
        ['BSD', 'Common Name', 'Apps'],
        [
          { __highlight: true, cells: ['630mm', '27"', 'Older road bike'] },
          ['622mm', '700c / 29"', 'Common road · 29er MTB'],
          ['571mm', '650C', 'Smaller road, TT'],
        ]),
      question: 'Which BSD tire do they need? And what gotcha do you flag?',
      choices: [
        { text: '622mm (700c) — same circle, same fit.', correct: false },
        { text: '630mm — and flag that 27" tires are increasingly hard to source. Suggest considering a wheelset rebuild to 622 (700c) for long-term parts availability.', correct: true },
        { text: '559mm — older "26-inch" road style.', correct: false },
        { text: '571mm (650C) — smaller-diameter road match.', correct: false },
      ],
      why: '27" = <strong>630mm BSD</strong>, NOT 700c (622mm). Mixing them up means the bead won\'t seat on the rim. Real-world note: 27" tire selection is shrinking — a UBI mechanic flags the long-term sourcing risk to the customer.',
      hook: '27" = 630 · 700c = 622. Eight millimeters ≠ "close enough."',
    },
    {
      id: 'appx_boss_r5', kind: 'multi', difficulty: 'medium', requiredCorrect: 3,
      story: 'ROUND 5 — Final-fit. The customer wants water bottles, fenders, and the stem bolts torqued correctly. The torque spec card shows "5 N·m."',
      chartHtml: chart('Conversion + Table 15 (combined)',
        ['Spec', 'Standard'],
        [
          { __highlight: true, cells: ['Bottle/fender/rack braze-on', 'M5 × 0.8'] },
          { __highlight: true, cells: ['Brake boss (cantilever/linear/disc)', 'M6 × 1.0'] },
          ['Stem bolt torque (5 N·m)', '× 8.851 = 44.3 inch·lbs'],
        ]) +
        note('Reminder: psi × 0.0689476 = bar.'),
      question: 'Pick the THREE statements that are CORRECT shop facts:',
      choices: [
        { text: 'Bottle and fender braze-ons take an M5 × 0.8 tap.', correct: true },
        { text: '5 N·m on the stem bolts is approximately 44 inch-pounds.', correct: true },
        { text: 'Brake bosses (cantilever/linear/disc) take an M6 × 1.0 tap.', correct: true },
        { text: 'Bottle bosses take an M6 × 1.0 tap (same as brake bosses).', correct: false },
        { text: '5 N·m is approximately 5 ft·lbs (just convert through pounds).', correct: false },
      ],
      why: 'Per the charts: <strong>M5 × 0.8</strong> for bottles/fenders/racks; <strong>M6 × 1.0</strong> for brake bosses; <strong>5 N·m × 8.851 ≈ 44 inch·lbs</strong> (NOT 5 ft·lbs — that would be ~60 inch·lbs, ~36% over). Mixing N·m and ft·lbs is the classic stem-bolt strip.',
      hook: 'M5 = bottle. M6 = brake boss. 1 N·m = 8.851 inch·lbs. Always read the wrench scale.',
    },
  ],
};

// ===================== BADGES =====================
const BADGES = [
  { id: 'ax_apprentice', icon: '📑', name: 'Spec Vault Apprentice', desc: 'Cracked the appendix open.', hint: 'Start any Spec Vault stage' },
  { id: 'ax_standards', icon: '📐', name: 'Standards Reader', desc: 'Reads thread, OLD, and bearing charts cold.', hint: 'Pass Stage 1 — Standards Lab' },
  { id: 'ax_sizing', icon: '📏', name: 'Sizing Bench Pro', desc: 'BSD, BB, BCD, chains — by chart, not by guess.', hint: 'Pass Stage 2 — Sizing Bench' },
  { id: 'ax_cockpit', icon: '🎯', name: 'Cockpit Calculator', desc: 'Steerer, quill, bar — exact every time.', hint: 'Pass Stage 3 — Cockpit Calculator' },
  { id: 'ax_convert', icon: '🧮', name: 'Conversion Mechanic', desc: 'PSI, N·m, gear inches, materials.', hint: 'Pass Stage 4 — Conversion Garage' },
  { id: 'ax_champion', icon: '🏆', name: 'Spec Vault Champion', desc: 'Cleared the customer spec sheet boss.', hint: 'Beat the Customer Spec Sheet Showdown' },
  { id: 'ax_perfectionist', icon: '💎', name: 'Spec Vault Perfectionist', desc: 'Every stage, no errors.', hint: 'Clear all 4 stages 100% on a single attempt each' },
];

const STAGES = [S1, S2, S3, S4];

window.APPENDIX = {
  meta: {
    version: 1,
    totalStages: STAGES.length,
    totalQuestions: STAGES.reduce((a, s) => a + s.questions.length, 0),
  },
  stages: STAGES,
  boss: BOSS,
  badges: BADGES,
};

console.log('[SpecVault] Loaded', STAGES.length, 'stages,',
  STAGES.reduce((a, s) => a + s.questions.length, 0), 'questions, +',
  BOSS.rounds.length, 'boss rounds.');
})();
