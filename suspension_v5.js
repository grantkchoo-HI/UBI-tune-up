/* UBI Tune-Up v5 — Suspension Systems Mastery Module
 *
 * A dedicated multi-stage zone covering Chapter 14: Suspension from the
 * UBI Professional Repair manual (OCR'd source: CH 14, 33 pages).
 *
 * Structure:
 *   6 stages → 1 boss
 *   Stage 1 — 🔧 Anatomy & Theory Bay     (chassis, CSU, stanchions, lowers, terms)
 *   Stage 2 — 🌬️ Spring Lab               (coil, elastomer, air; spring rate; negative spring)
 *   Stage 3 — 💧 Damper Workshop          (friction/air/oil; rebound, compression, lockout)
 *   Stage 4 — 📚 Damper Types & Service   (open bath/cartridge/semi; viscosity; intervals)
 *   Stage 5 — 📊 Sag & Setup Bench        (sag chart, setup sequence, rebound/compression dials)
 *   Stage 6 — 🩺 Trail Diagnosis Pit      (rider feel → adjustment, scenario-heavy)
 *   BOSS    — 🏆 The Walk-In Suspension Tune (2019 Suntour Auron service + tune)
 *
 * Per-question fields (mirror Wheelhouse / Spec Vault engine):
 *   id           string
 *   kind         'mc' | 'multi' | 'fill_blank' | 'typing'
 *   difficulty   'easy' | 'medium' | 'hard'
 *   story        optional shop / trail context preamble
 *   chartHtml    optional inline chart (sag table, torque table, etc.)
 *   question     prompt
 *   choices      [{text, correct}]   (mc + multi)
 *   requiredCorrect  for multi
 *   correctAnswer    for fill_blank/typing
 *   acceptedAnswers  array of accepted variations
 *   why          HTML explanation shown after answer
 *   hook         memory hook
 *   refs         chapter section refs (e.g. ['14-19'])
 *
 * Real values pulled from the PDF (page-cited in `refs`):
 *   - Sag % chart by discipline (p.22)
 *   - 2019 Suntour Auron torque values (p.26)
 *   - Oil viscosities (5wt damper, 15wt chassis) (p.20)
 *   - Linear coil curve (100# at 1" = 100 lb) (p.10)
 *   - Progressive air curve (100psi at 4" → 200psi at 2") (p.12)
 */
(function () {
'use strict';

// ---------- Inline chart helpers (compact tables for sag/torque/viscosity) ----------
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

// Re-used across stages
const SAG_CHART = chart('Sag Targets by Discipline (Manual p.14-19)',
  ['Discipline', 'Travel range', 'Target sag'],
  [
    ['XC / Race', '80–120 mm', '10–20%'],
    { __highlight: true, cells: ['Trail', '120–160 mm', '20–30%'] },
    ['DH / Freeride', '160–250 mm', '30–40%'],
  ]);

// =================== STAGE 1: ANATOMY & THEORY BAY ===================
const S1 = {
  id: 'su_anatomy',
  name: 'Anatomy & Theory Bay',
  icon: '🔧',
  subtitle: 'Chassis · CSU · stanchions · lowers · terms',
  blurb: 'Before you tune it, you have to name it. Three components. Two purposes. The vocabulary of every suspension conversation.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'su_a_1', kind: 'mc', difficulty: 'easy',
      question: 'A bicycle suspension system is comprised of THREE main components. Pick the correct set:',
      choices: [
        { text: 'Chassis · Spring · Damper', correct: true },
        { text: 'Fork · Shock · Rebound knob', correct: false },
        { text: 'Stanchion · Lower · Crown', correct: false },
        { text: 'Spring · Damper · Air seal', correct: false },
      ],
      why: 'Per the manual: every suspension system, fork or rear shock, is built from <strong>Chassis · Spring · Damper</strong>. Each must be in good working order AND tuned together to perform.',
      hook: 'C·S·D — Chassis, Spring, Damper. Three legs of every suspension stool.',
      refs: ['14-3'],
    },
    {
      id: 'su_a_2', kind: 'multi', difficulty: 'easy', requiredCorrect: 2,
      question: 'Pick the TWO purposes of a bicycle suspension system, per the manual:',
      choices: [
        { text: 'Give the rider more control by allowing the wheels to track the ground (better traction & braking).', correct: true },
        { text: 'Provide comfort by absorbing jarring bumps before they reach the frame and rider.', correct: true },
        { text: 'Increase top-end speed on flat pavement.', correct: false },
        { text: 'Reduce the bike\'s overall weight.', correct: false },
        { text: 'Replace the need for a quality saddle.', correct: false },
      ],
      why: 'The two-fold purpose: <strong>(1) traction & control</strong> — wheels track uneven ground; <strong>(2) comfort</strong> — bumps are absorbed before they shake the frame and rider. Speed and weight are NOT goals.',
      hook: 'Suspension = Traction + Comfort. Not speed, not weight.',
      refs: ['14-2'],
    },
    {
      id: 'su_a_3', kind: 'fill_blank', difficulty: 'easy',
      question: 'When the axle moves toward the rider and the suspension component becomes shorter, the suspension is in __________.',
      correctAnswer: 'compression',
      acceptedAnswers: ['compression', 'compressing', 'compress'],
      why: 'Compression = axle moving up toward rider, component getting shorter. Rebound = the opposite — axle extending back toward the ground, component returning to its longest state.',
      hook: 'Compress = squish in. Rebound = bounce out.',
      refs: ['14-3'],
    },
    {
      id: 'su_a_4', kind: 'mc', difficulty: 'medium',
      question: 'In a telescoping fork, what does "CSU" stand for?',
      choices: [
        { text: 'Compression · Spring · Uppers', correct: false },
        { text: 'Crown · Steerer · Upper', correct: true },
        { text: 'Cartridge · Seal · Underbody', correct: false },
        { text: 'Casting · Stanchion · Unit', correct: false },
      ],
      why: 'CSU = <strong>Crown · Steerer · Upper (tubes)</strong>. These three parts are typically pressed together into one structure that anchors the fork to the bike\'s steering and houses the spring/damper internals.',
      hook: 'CSU = Crown · Steerer · Upper. The "skeleton" of a telescoping fork.',
      refs: ['14-4'],
    },
    {
      id: 'su_a_5', kind: 'mc', difficulty: 'easy',
      story: 'You\'re looking at a conventional (right-side-up) telescoping suspension fork on the workstand.',
      question: 'Which tubes are at the TOP of the fork?',
      choices: [
        { text: 'The larger-diameter lowers (sliders).', correct: false },
        { text: 'The smaller-diameter uppers (stanchions).', correct: true },
        { text: 'There are no tubes — only the crown.', correct: false },
        { text: 'The damper cartridge sticks out the top.', correct: false },
      ],
      why: 'Conventional / right-side-up: <strong>smaller-diameter stanchions on TOP</strong>, larger-diameter lowers on BOTTOM. Inverted (upside-down) is the opposite.',
      hook: 'Conventional = small up top, big down bottom. Inverted = flipped.',
      refs: ['14-5'],
    },
    {
      id: 'su_a_6', kind: 'fill_blank', difficulty: 'medium',
      question: 'On most suspension forks, the lower legs (sliders) are typically cast as one piece from __________.',
      correctAnswer: 'magnesium',
      acceptedAnswers: ['magnesium', 'mag'],
      why: 'Lowers are typically cast <strong>magnesium</strong> for the strength-to-weight balance. They house the bushings, dust wipers, brake mount, and front-axle interface.',
      hook: 'Lowers = magnesium casting. Steerer = steel/alu/carbon.',
      refs: ['14-4'],
    },
    {
      id: 'su_a_7', kind: 'mc', difficulty: 'medium',
      question: 'Conventional vs inverted forks — pick the TRUE statement per the manual:',
      choices: [
        { text: 'Inverted forks always offer better steering precision than conventional.', correct: false },
        { text: 'Inverted forks can offer better tire clearance and fore/aft stiffness, while conventional forks tend to provide better steering control (more torsionally stiff).', correct: true },
        { text: 'Conventional forks have no real advantages — they\'re cheaper to make.', correct: false },
        { text: 'Inverted forks cannot be used on mountain bikes.', correct: false },
      ],
      why: 'Manual: inverted = better tire clearance + fore/aft stiffness; conventional = better steering control because it\'s usually <strong>stiffer in torsion</strong>. Both are valid — different tradeoffs.',
      hook: 'Inverted = clearance + fore/aft. Conventional = torsion = steering.',
      refs: ['14-5'],
    },
    {
      id: 'su_a_8', kind: 'mc', difficulty: 'medium',
      question: 'Where would you most commonly find a DUAL-CROWN fork?',
      choices: [
        { text: 'On entry-level hybrid bikes', correct: false },
        { text: 'On road race bikes for aerodynamics', correct: false },
        { text: 'On downhill (DH) racing bikes — for added stiffness and longer travel', correct: true },
        { text: 'Only on cargo bikes hauling kids', correct: false },
      ],
      why: 'Dual-crown forks add a second crown ABOVE the head tube. The longer stanchions run through both crowns — <strong>much stiffer structure, more travel</strong>. That\'s why they live on DH race bikes.',
      hook: 'Dual crown = downhill. One crown above, one below the head tube.',
      refs: ['14-5'],
    },
  ],
};

// =================== STAGE 2: SPRING LAB ===================
const S2 = {
  id: 'su_spring',
  name: 'Spring Lab',
  icon: '🌬️',
  subtitle: 'Coil · elastomer · air · spring rate · negative spring',
  blurb: 'The spring holds the rider up and stores the bump energy. Coil is linear, air is progressive — and elastomers are mostly history. Read the curve.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'su_sp_1', kind: 'fill_blank', difficulty: 'easy',
      question: 'When a spring is fully compressed and the suspension reaches its shortest possible state, this is called __________.',
      correctAnswer: 'bottom-out',
      acceptedAnswers: ['bottom-out', 'bottom out', 'bottomed out', 'bottoming out', 'bottomout'],
      why: 'Without the spring (or with a spring far too soft), the suspension collapses to its <strong>bottom-out</strong> state. Volume reducers / tokens add air-spring progressivity to resist bottom-out without a stiffer base spring rate.',
      hook: 'Bottom-out = fork all the way collapsed. Token it up to fight it.',
      refs: ['14-6'],
    },
    {
      id: 'su_sp_2', kind: 'mc', difficulty: 'medium',
      chartHtml: chart('Linear Coil Spring Rate (100# spring)',
        ['Compression', 'Force exerted'],
        [
          ['1"', '100 lb'],
          ['2"', '200 lb'],
          { __highlight: true, cells: ['3"', '?'] },
          ['4"', '400 lb'],
        ]),
      question: 'A 100# coil spring (linear). At 3" of compression, how much force is the spring resisting with?',
      choices: [
        { text: '150 lb', correct: false },
        { text: '200 lb', correct: false },
        { text: '300 lb', correct: true },
        { text: '500 lb', correct: false },
      ],
      why: 'Coil springs are <strong>linear</strong> — every inch adds the same force. 100# spring × 3" = <strong>300 lb</strong>. Plot it: a straight line through (0,0) → (1, 100) → (3, 300) → and so on until the spring would coil-bind.',
      hook: 'Linear = inches × spring rate. 100# × 3" = 300 lb. No surprises.',
      refs: ['14-6'],
    },
    {
      id: 'su_sp_3', kind: 'mc', difficulty: 'medium',
      chartHtml: chart('Progressive Air Spring (100 psi at 4" travel)',
        ['Position in travel', 'Air pressure'],
        [
          ['0" (top out)', '100 psi'],
          { __highlight: true, cells: ['2" (halfway)', '?'] },
          ['3" (¾ through)', '~300 psi'],
          ['Near bottom (1" left)', '400 psi'],
        ]),
      question: 'A 100 psi air spring in a 4" travel fork. When the fork is compressed halfway (2" remaining chamber), what does the air pressure become?',
      choices: [
        { text: '100 psi (stays the same — air is compressible)', correct: false },
        { text: '150 psi', correct: false },
        { text: '200 psi', correct: true },
        { text: '50 psi (the air bleeds off)', correct: false },
      ],
      why: 'Halve the air chamber → DOUBLE the pressure. 100 psi at 4" → <strong>200 psi at 2"</strong> → 400 psi at 1". This is what makes air springs <strong>progressive</strong> — they ramp up steeply near bottom-out, resisting hard bottoming.',
      hook: 'Halve the volume = double the psi. Progressive curve baked into the air spring.',
      refs: ['14-9'],
    },
    {
      id: 'su_sp_4', kind: 'multi', difficulty: 'hard', requiredCorrect: 2,
      question: 'Pick the TWO statements that are TRUE when comparing COIL springs to AIR springs (per the manual):',
      choices: [
        { text: 'Coil springs are renowned for excellent small-bump sensitivity.', correct: true },
        { text: 'Air springs can typically be tuned in increments as small as 1 psi (limited mostly by shock-pump accuracy).', correct: true },
        { text: 'Coil springs are typically lighter than air springs.', correct: false },
        { text: 'Air springs are less affected by temperature than coil springs.', correct: false },
        { text: 'Coil springs are easier to tune than air springs.', correct: false },
      ],
      why: 'Coil = small-bump sensitive + temperature-stable + LESS tunable. Air = lightweight + 1psi-tunable + MORE temperature-sensitive. Air is the most tunable; coil is the most consistent feel.',
      hook: 'Coil = supple + stable, but limited tuning. Air = light + tunable, but pickier with temp.',
      refs: ['14-6', '14-8'],
    },
    {
      id: 'su_sp_5', kind: 'mc', difficulty: 'easy',
      question: 'Why are elastomers (Urethane / MCU) no longer used as the PRIMARY spring in modern long-travel suspension?',
      choices: [
        { text: 'They\'re too expensive to manufacture.', correct: false },
        { text: 'They don\'t compress (shorten) enough for long-travel forks, AND they get stiffer in cold / softer in heat.', correct: true },
        { text: 'They\'ve been banned by UCI rules.', correct: false },
        { text: 'They only work with steel-tubed bikes.', correct: false },
      ],
      why: 'Elastomers had two killing flaws for modern forks: <strong>limited compression</strong> (you can\'t fit 5–6" of travel\'s worth of elastomer in a fork leg) and <strong>temperature sensitivity</strong> (cold = harder, hot = softer). They survive only as travel-stop bumpers.',
      hook: 'Elastomer ≠ primary spring anymore. Travel limit + temperature drift killed them.',
      refs: ['14-7'],
    },
    {
      id: 'su_sp_6', kind: 'mc', difficulty: 'medium',
      question: 'What is the JOB of a NEGATIVE spring in an air-sprung fork?',
      choices: [
        { text: 'To pre-load the main spring before the rider sits down.', correct: false },
        { text: 'To reduce the initial breakaway force, so the fork can be compliant over small bumps.', correct: true },
        { text: 'To act as a backup spring if the primary fails.', correct: false },
        { text: 'To convert compression force into rebound speed.', correct: false },
      ],
      why: 'Older air-sprung forks were stiff over small bumps because the small bump couldn\'t overcome the pressurized main spring holding the fork at full extension. A <strong>negative spring</strong> (coil OR a separate pressurized chamber) cancels some of that initial holding force, letting the fork respond to ripple.',
      hook: 'Negative spring = anti-stiction. Lets small bumps in.',
      refs: ['14-9'],
    },
    {
      id: 'su_sp_7', kind: 'mc', difficulty: 'hard',
      story: 'A customer rides their air-sprung fork at the bike park. Mid-run, they hear a hiss, the fork goes fully soft, and the bars dive when they put weight on them.',
      question: 'What happened, and what\'s the rider\'s next move?',
      choices: [
        { text: 'Spring rate change due to heat — keep riding, it\'ll recover when the fork cools.', correct: false },
        { text: 'Air seal failure → fork has collapsed to bottom-out → bike is unsafe to ride. Stop, walk it down, replace the air seals.', correct: true },
        { text: 'Negative spring engaged — push down hard to "reset" it.', correct: false },
        { text: 'Damper cavitation — pump the lever twice and continue.', correct: false },
      ],
      why: 'Air-sprung systems depend on quality seals to hold pressure. <strong>If an air seal fails, the suspension collapses to bottom-out — the bike becomes unsafe to ride.</strong> Walk it out and replace the seal. Don\'t try to ride out a soft fork.',
      hook: 'Air seal fail = fork collapse = walk, don\'t ride. No exceptions.',
      refs: ['14-9'],
    },
    {
      id: 'su_sp_8', kind: 'fill_blank', difficulty: 'medium',
      question: 'The point at which all coils touch each other and the spring CAN\'T compress any further is called __________.',
      correctAnswer: 'coil bind',
      acceptedAnswers: ['coil bind', 'coilbind', 'coil-bind', 'bind'],
      why: 'Most coil-sprung suspension is intentionally designed so the chassis bottoms out BEFORE the spring reaches <strong>coil bind</strong> — actually binding the coils would slam-stop the fork. The chassis takes the hit; the spring keeps reserve room.',
      hook: 'Coil bind = coils touching = no more compression. Designed to never quite get there.',
      refs: ['14-7'],
    },
    {
      id: 'su_sp_9', kind: 'mc', difficulty: 'hard',
      question: 'Most coil springs in performance bicycle suspension are made of which material?',
      choices: [
        { text: 'Aluminum wire', correct: false },
        { text: 'Stainless steel wire', correct: false },
        { text: 'Chrome silicon (spring) steel', correct: true },
        { text: 'Forged carbon fiber', correct: false },
      ],
      why: 'Performance coil springs use <strong>chrome silicon (spring) steel</strong> — durable, resilient, well-suited to repeated loading. <strong>Titanium</strong> appears in high-end / weight-focused builds (longer fatigue life than steel, but expensive).',
      hook: 'Coil = chrome silicon steel. Ti = boutique upgrade.',
      refs: ['14-6'],
    },
    {
      id: 'su_sp_10', kind: 'mc', difficulty: 'medium',
      story: 'A rider on an air-sprung fork wants the same overall sag as before but a steeper ramp-up near bottom-out, so the fork resists big-hit bottoming.',
      question: 'Per the manual, what tuning move accomplishes this WITHOUT increasing baseline air pressure (which would change sag)?',
      choices: [
        { text: 'Add a negative spring volume.', correct: false },
        { text: 'Reduce the air-chamber volume (e.g., add volume spacers / "tokens").', correct: true },
        { text: 'Replace the air spring with a coil.', correct: false },
        { text: 'Use thicker damper oil.', correct: false },
      ],
      why: 'Some air systems let you change the chamber volume to <strong>tune the spring-rate CURVE</strong> without changing the baseline psi. Smaller chamber = steeper progressive ramp = stronger bottom-out resistance. Sag stays the same; the deep-stroke just gets firmer.',
      hook: 'Volume reducer = ramp up the back end. Sag stays; bottom-out fights back.',
      refs: ['14-9'],
    },
  ],
};

// =================== STAGE 3: DAMPER WORKSHOP ===================
const S3 = {
  id: 'su_damper',
  name: 'Damper Workshop',
  icon: '💧',
  subtitle: 'Oil · ports · pistons · rebound · compression · lockout',
  blurb: 'Without the damper, the spring would launch the bike like a pogo. Oil through ports, controlled by shims — that\'s the whole game.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'su_d_1', kind: 'mc', difficulty: 'easy',
      question: 'A suspension component with ONLY a spring (no damper) would behave like:',
      choices: [
        { text: 'A solid rigid fork.', correct: false },
        { text: 'A pogo stick — unregulated bouncing.', correct: true },
        { text: 'A locked-out fork on a climb.', correct: false },
        { text: 'A coil-bound spring.', correct: false },
      ],
      why: 'The spring stores and releases energy — but unregulated, that release is uncontrolled. Without a damper, every hit becomes a <strong>pogo bounce</strong>. The damper\'s job is to regulate the spring.',
      hook: 'No damper = pogo stick. Damper = the brake on the spring.',
      refs: ['14-9'],
    },
    {
      id: 'su_d_2', kind: 'mc', difficulty: 'medium',
      question: 'Of compression and rebound damping, which one does the manual call "the most imperative"?',
      choices: [
        { text: 'Compression damping.', correct: false },
        { text: 'Rebound damping.', correct: true },
        { text: 'Both equally — they cancel each other.', correct: false },
        { text: 'Neither — only the spring matters.', correct: false },
      ],
      why: 'The damper has two jobs (regulate compression speed AND rebound speed) but the manual is explicit: <strong>rebound control is the most imperative</strong>. Without it, the spring snaps the fork back, the wheel leaves the ground, and traction collapses.',
      hook: 'Spring sets sag · Rebound sets ride · Compression sets climb. Rebound is the keystone.',
      refs: ['14-9'],
    },
    {
      id: 'su_d_3', kind: 'fill_blank', difficulty: 'easy',
      story: 'The piston/shaft inside a damper moves at very different speeds depending on what\'s causing the suspension to compress.',
      question: 'A rider lands a 3-foot drop and the fork\'s piston shaft moves through travel very fast. This is called a __________ (H/S) shaft event.',
      correctAnswer: 'high-speed',
      acceptedAnswers: ['high-speed', 'high speed', 'highspeed', 'h/s', 'hs'],
      why: '<strong>High-speed (H/S)</strong> = terrain-induced — square-edged rocks, roots, drop landings. Causes the piston to move FAST through the oil. <strong>Low-speed (L/S)</strong> = rider-induced — pedaling efforts, brake dive, shallow-angle bumps. Slow piston motion.',
      hook: 'H/S = terrain (rocks/drops). L/S = rider (pedal/brake/dive).',
      refs: ['14-9'],
    },
    {
      id: 'su_d_4', kind: 'mc', difficulty: 'medium',
      story: 'A rider out of the saddle, sprinting up a fire road on flat asphalt. The fork bobs slightly with each pedal stroke.',
      question: 'The piston/shaft motion inside the damper from this pedal-bob is BEST described as:',
      choices: [
        { text: 'High-speed (H/S) shaft motion.', correct: false },
        { text: 'Low-speed (L/S) shaft motion.', correct: true },
        { text: 'No shaft motion — pedaling can\'t move the damper.', correct: false },
        { text: 'Variable, depending on tire pressure.', correct: false },
      ],
      why: 'Pedaling-induced bob = <strong>rider-induced motion = low-speed (L/S) shaft motion</strong>. That\'s why the L/S compression dial is the right tool to tune out unwanted pedal-bob without numbing the fork on real bumps.',
      hook: 'Pedal-bob = L/S. Tune with the L/S compression knob, not the H/S.',
      refs: ['14-9'],
    },
    {
      id: 'su_d_5', kind: 'multi', difficulty: 'medium', requiredCorrect: 3,
      question: 'Why has OIL become the dominant damping medium in performance bicycle suspension? Pick the THREE valid reasons:',
      choices: [
        { text: 'Oil is non-compressible (consistent damping force).', correct: true },
        { text: 'Oil deals with heat well (consistent under load).', correct: true },
        { text: 'Oil is self-lubricating and comes in different viscosities for tuning.', correct: true },
        { text: 'Oil weighs less than air at the same volume.', correct: false },
        { text: 'Oil never breaks down or needs replacement.', correct: false },
      ],
      why: 'Oil wins on three counts: <strong>non-compressible</strong> (force translates directly), <strong>heat-tolerant</strong> (consistent across a hot ride), <strong>self-lubricating + viscosity-tunable</strong>. It IS heavier than air and DOES break down — which is why service intervals exist.',
      hook: 'Oil: incompressible · heat-stable · viscosity-tunable · self-lubricating. Worth the service.',
      refs: ['14-11'],
    },
    {
      id: 'su_d_6', kind: 'mc', difficulty: 'medium',
      question: 'What part of an oil damper switches which ports flow during the COMPRESSION stroke vs. the REBOUND stroke?',
      choices: [
        { text: 'The dust wiper', correct: false },
        { text: 'A control shim (often spring-backed) acting as a check valve', correct: true },
        { text: 'The crown bearing', correct: false },
        { text: 'The volume reducer token', correct: false },
      ],
      why: 'A <strong>control shim</strong> (a thin plastic or metal disc, usually spring-backed) acts as a check valve. Compression stroke: many ports open → oil flows freely → fast absorption. Rebound stroke: shim closes most ports → oil restricted to one path → controlled return.',
      hook: 'Control shim = check valve = which way the oil can sneak through.',
      refs: ['14-12'],
    },
    {
      id: 'su_d_7', kind: 'mc', difficulty: 'easy',
      question: 'Lockout (compression damping fully closed) physically prevents the fork from compressing because:',
      choices: [
        { text: 'The spring becomes infinitely stiff', correct: false },
        { text: 'Oil is non-compressible — if it can\'t flow through any port, the piston can\'t move', correct: true },
        { text: 'The crown bolts magnetically clamp', correct: false },
        { text: 'The negative spring locks the chassis', correct: false },
      ],
      why: 'Lockout closes the compression ports completely. Because <strong>oil is non-compressible</strong>, oil that has nowhere to flow holds the piston in place — and the fork can\'t compress. Note: a true lockout is an oil-flow block, NOT a spring change.',
      hook: 'Lockout = "no port = no flow = no movement." All down to oil being incompressible.',
      refs: ['14-14'],
    },
    {
      id: 'su_d_8', kind: 'mc', difficulty: 'hard',
      question: 'During an ABSORBED COMPRESSION stroke (rider lands a small drop), how do the OIL PORTS in the damper typically behave?',
      choices: [
        { text: 'All ports closed — relies on the spring alone.', correct: false },
        { text: 'Multiple ports OPEN to let oil flow quickly through; rebound stroke then closes most ports so oil flows slowly back.', correct: true },
        { text: 'Only the rebound port opens during compression.', correct: false },
        { text: 'Ports are irrelevant — only the shim spring matters.', correct: false },
      ],
      why: 'The shim opens MULTIPLE ports during compression so the fork can absorb the bump quickly without spiking. On the way back, the shim closes most of those ports — oil now squeezes through ONE port → rebound is controlled and slow.',
      hook: 'Compression: many ports open (fast absorb). Rebound: one port (controlled return).',
      refs: ['14-13'],
    },
    {
      id: 'su_d_9', kind: 'mc', difficulty: 'medium',
      question: 'Why is AIR rarely used as a damping medium in performance bicycle suspension?',
      choices: [
        { text: 'Air is too expensive to source.', correct: false },
        { text: 'Air is COMPRESSIBLE, expands with heat, and can be drawn toward vacuum — making it inconsistent compared to oil.', correct: true },
        { text: 'Air leaks out of all dampers within minutes.', correct: false },
        { text: 'It\'s actually the most common — you just rarely see it advertised.', correct: false },
      ],
      why: 'Air damping has one advantage (lightweight) and several disadvantages: <strong>compressible</strong> (acts like a second spring), <strong>expands with heat</strong> from suspension friction, and <strong>can be drawn toward vacuum</strong>. Net: inconsistent. Oil wins.',
      hook: 'Air spring = great. Air damper = inconsistent. Oil for damping, every time.',
      refs: ['14-11'],
    },
    {
      id: 'su_d_10', kind: 'mc', difficulty: 'easy',
      question: 'In most modern forks, where is the COMPRESSION DAMPER assembly typically housed?',
      choices: [
        { text: 'In the very bottom of the lower leg, near the axle.', correct: false },
        { text: 'In the TOP of the fork (top of the damper assembly), with an external compression adjuster knob on the crown side.', correct: true },
        { text: 'Inside the air-spring chamber.', correct: false },
        { text: 'Mounted to the crown race below the head tube.', correct: false },
      ],
      why: 'Compression damping parts share the SAME body of oil as rebound, but they\'re located at the <strong>top of the fork damper assembly</strong>. That\'s where the compression adjuster knob (and lockout lever) lives — easy reach for on-the-fly tuning.',
      hook: 'Compression knob lives up top. Rebound knob usually lives at the bottom of the leg.',
      refs: ['14-13'],
    },
  ],
};

// =================== STAGE 4: DAMPER TYPES & SERVICE STAND ===================
const S4 = {
  id: 'su_service',
  name: 'Damper Types & Service Stand',
  icon: '📚',
  subtitle: 'Open bath · cartridge · semi-cartridge · viscosity · service intervals',
  blurb: 'Three damper architectures, two oil weights, one service interval rule: follow the SUSPENSION manufacturer, not the bike brand.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'su_sv_1', kind: 'mc', difficulty: 'medium',
      question: 'Which damper architecture has its oil SEALED inside the cartridge, not shared with the chassis lubrication?',
      choices: [
        { text: 'Open bath damper', correct: false },
        { text: 'Cartridge damper', correct: true },
        { text: 'Semi-cartridge damper', correct: false },
        { text: 'Friction damper', correct: false },
      ],
      why: 'A <strong>cartridge damper</strong> is a sealed unit — its oil is its own. Less oil overall, lighter, more consistent performance. Open bath SHARES oil with the chassis (large reservoir, more contamination risk).',
      hook: 'Cartridge = sealed = consistent. Open bath = shared = lots of oil + lube duty.',
      refs: ['14-14'],
    },
    {
      id: 'su_sv_2', kind: 'mc', difficulty: 'medium',
      question: 'What is the primary ADVANTAGE of an OPEN BATH damper?',
      choices: [
        { text: 'Lowest possible weight.', correct: false },
        { text: 'Larger oil volume gives more consistent performance over long, hot rides — and lubricates the bushings.', correct: true },
        { text: 'Cannot get contaminated.', correct: false },
        { text: 'Eliminates the need for service.', correct: false },
      ],
      why: 'Open bath = <strong>more oil = better thermal stability</strong>, and the same oil pool also lubricates seals and bushings in the lowers. The catch: more oil means more chances for contamination — service it on schedule.',
      hook: 'Open bath = more oil = more consistent + lube. But more service-sensitive.',
      refs: ['14-14'],
    },
    {
      id: 'su_sv_3', kind: 'mc', difficulty: 'medium',
      question: 'How often, at minimum, should most bicycle suspension systems be serviced?',
      choices: [
        { text: 'Once every 5 years', correct: false },
        { text: 'Once per year (and per the manufacturer\'s hours-ridden specs)', correct: true },
        { text: 'Only if there\'s a visible problem', correct: false },
        { text: 'Every 10,000 miles, regardless of brand', correct: false },
      ],
      why: 'Manual: <strong>at least once per year</strong>. Manufacturers also publish hours-ridden intervals — those override calendar time if you ride a lot. And different parts of the same fork may want different intervals.',
      hook: 'Service: 1× per year minimum. Hours-based if you ride hard.',
      refs: ['14-15'],
    },
    {
      id: 'su_sv_4', kind: 'mc', difficulty: 'medium',
      story: 'A customer brings in a Trek with a FOX 36 fork, asking for service. They say "Trek\'s site doesn\'t list service intervals — guess it doesn\'t need any?"',
      question: 'What\'s the correct response?',
      choices: [
        { text: '"Trek doesn\'t list intervals — you\'re right, no service needed."', correct: false },
        { text: '"Service intervals come from the SUSPENSION manufacturer (FOX), not the bike brand (Trek). Let me look up the FOX schedule."', correct: true },
        { text: '"All forks share the same generic 24-month interval. Book you in?"', correct: false },
        { text: '"FOX doesn\'t publish intervals — only RockShox does."', correct: false },
      ],
      why: 'Per the manual: <strong>service intervals come from the suspension component manufacturer (RockShox, FOX, etc.) — NOT from the bicycle brand (Trek, Santa Cruz, etc.)</strong>. Always look up the suspension brand\'s schedule.',
      hook: 'Service interval = from the suspension brand, not the bike brand. FOX, not Trek.',
      refs: ['14-15'],
    },
    {
      id: 'su_sv_5', kind: 'mc', difficulty: 'easy',
      chartHtml: chart('Suspension Oil Viscosity (Manual p.14-17)',
        ['Weight (wt)', 'Thickness'],
        [
          ['3wt', 'Thinnest — flows fastest'],
          { __highlight: true, cells: ['5wt', 'Common DAMPER oil'] },
          ['10wt', 'Medium-thick'],
          { __highlight: true, cells: ['15wt', 'Common CHASSIS lubricating oil — thickest example'] },
        ]),
      question: 'Per the chart, which oil RESISTS FLOW the MOST?',
      choices: [
        { text: '3wt', correct: false },
        { text: '5wt', correct: false },
        { text: '10wt', correct: false },
        { text: '15wt', correct: true },
      ],
      why: '<strong>Higher viscosity number = thicker oil = more resistance to flow</strong>. 15wt > 10wt > 5wt > 3wt. The same fork can ask for THIN damper oil (e.g., 5wt) AND THICK chassis oil (e.g., 15wt) — different jobs.',
      hook: 'Bigger wt = thicker. 5wt damper inside, 15wt chassis outside.',
      refs: ['14-16'],
    },
    {
      id: 'su_sv_6', kind: 'mc', difficulty: 'medium',
      story: 'A customer rocks the lowers fore/aft on the uppers in the workstand. There\'s a knock that feels like a loose headset. You tighten the headset preload — the knock is still there.',
      question: 'Most likely diagnosis?',
      choices: [
        { text: 'Brake caliper bolts are loose.', correct: false },
        { text: 'Worn bushing interface between the upper and lower legs — needs service.', correct: true },
        { text: 'Air spring is over-pressured.', correct: false },
        { text: 'Tire is mounted backwards.', correct: false },
      ],
      why: 'The manual flags this exact diagnostic: a worn bushing interface <strong>"may feel like a loose headset when on the ground."</strong> If the headset preload is correct and the knock persists when you rock the lowers on the uppers, the bushings are worn — service the chassis.',
      hook: '"Loose headset feel" + headset is fine = bushing service. Classic suspension misdiagnosis.',
      refs: ['14-15'],
    },
    {
      id: 'su_sv_7', kind: 'multi', difficulty: 'hard', requiredCorrect: 3,
      story: 'Before disassembling a fork for service, the manual REQUIRES you to record specific settings so you can restore the customer\'s tune afterward.',
      question: 'Pick the THREE settings that MUST be recorded pre-disassembly:',
      choices: [
        { text: 'Air spring pressure (psi) — OR coil spring preload turns', correct: true },
        { text: 'Rebound damping setting (clicks) — both L/S and H/S if equipped', correct: true },
        { text: 'Compression damping setting (clicks) — both L/S and H/S if equipped', correct: true },
        { text: 'Tire pressure (PSI)', correct: false },
        { text: 'Stem bolt torque (N·m)', correct: false },
      ],
      why: 'Pre-service record card: <strong>spring (psi or preload), rebound clicks, compression clicks</strong>. Restore after service. Tire PSI and stem torque are unrelated to the fork tune — they\'re separate concerns.',
      hook: 'Pre-service: write down PRESSURE + REBOUND + COMPRESSION. Three numbers, every time.',
      refs: ['14-16'],
    },
    {
      id: 'su_sv_8', kind: 'mc', difficulty: 'medium',
      question: 'Using a NON-manufacturer-specified oil during service typically does what?',
      choices: [
        { text: 'Improves performance — generic oils are always cheaper and just as good.', correct: false },
        { text: 'Voids the manufacturer\'s warranty on the suspension product.', correct: true },
        { text: 'Has no effect — oil is oil.', correct: false },
        { text: 'Makes the fork legally unrideable.', correct: false },
      ],
      why: 'Manual: <strong>using non-manufacturer parts/oils typically VOIDS the warranty</strong>. Different oils have different additives, viscosity stability, and seal compatibility. Stick to the spec sheet.',
      hook: 'Wrong oil = voided warranty. Match the spec sheet.',
      refs: ['14-16'],
    },
    {
      id: 'su_sv_9', kind: 'mc', difficulty: 'medium',
      question: 'A SEMI-cartridge damper differs from a true cartridge damper because it:',
      choices: [
        { text: 'Has no piston — uses friction only.', correct: false },
        { text: 'Uses one of the fork\'s upper tubes (stanchions) as the damper body itself, with the rebound piston sealing against the inside of the leg.', correct: true },
        { text: 'Cannot be serviced at all.', correct: false },
        { text: 'Is only used on rear shocks.', correct: false },
      ],
      why: 'In a <strong>semi-cartridge</strong>, the upper tube doubles as the damper body. The rebound piston seals against the inside of the leg. Lighter and cheaper than a true cartridge, but service procedures are different — read the manual.',
      hook: 'Semi-cartridge = stanchion IS the damper body. Cost-down version of true cartridge.',
      refs: ['14-14'],
    },
  ],
};

// =================== STAGE 5: SAG & SETUP BENCH ===================
const S5 = {
  id: 'su_sag',
  name: 'Sag & Setup Bench',
  icon: '📊',
  subtitle: 'Sag % chart · setup sequence · rebound · compression dialing',
  blurb: 'A poorly-set premium fork rides worse than a properly-set entry-level one. Read the sag chart. Spring → Rebound → Compression. Always in that order.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'su_sg_1', kind: 'fill_blank', difficulty: 'easy',
      question: 'Sag is the amount the suspension settles under the rider\'s weight. It\'s usually expressed as a __________ of total travel.',
      correctAnswer: 'percentage',
      acceptedAnswers: ['percentage', 'percent', '%'],
      why: '<strong>Sag = % of total travel</strong>. Some forks print sag percentages directly on the stanchion. The travel-indicator O-ring is your measurement tool.',
      hook: 'Sag is a percentage. Not millimeters first — percentage of travel first.',
      refs: ['14-18'],
    },
    {
      id: 'su_sg_2', kind: 'mc', difficulty: 'medium',
      story: 'A customer brings in a 140mm trail bike. They ride local singletrack — climbs, fast descents, the occasional small jump. They want their sag set correctly.',
      chartHtml: SAG_CHART,
      question: 'Per the chart, what is the target SAG % for this rider?',
      choices: [
        { text: '5–10% — they\'re a fast rider.', correct: false },
        { text: '10–20% — XC range.', correct: false },
        { text: '20–30% — Trail range.', correct: true },
        { text: '40–50% — they want plush.', correct: false },
      ],
      why: 'A 140mm-travel "trail" bike falls inside the manual\'s <strong>120–160mm trail bracket → 20–30% sag</strong>. That\'s the sweet spot for general singletrack riding: enough small-bump compliance, enough deep-stroke reserve.',
      hook: 'Trail (120–160mm) = 20–30% sag. Memorize the bracket — it\'s the most common.',
      refs: ['14-18'],
    },
    {
      id: 'su_sg_3', kind: 'mc', difficulty: 'medium',
      story: 'A customer brings in a 200mm-travel DH park bike for an end-of-season service. They\'ve been riding bike park lifts only — pure descents, big drops.',
      chartHtml: SAG_CHART,
      question: 'Per the chart, what is the target SAG % for this discipline?',
      choices: [
        { text: '10–20%', correct: false },
        { text: '20–30%', correct: false },
        { text: '30–40%', correct: true },
        { text: '50–60%', correct: false },
      ],
      why: '<strong>DH / Freeride (160–250mm travel) → 30–40% sag</strong>. Deep sag keeps the wheel in the ground on big drops and steep terrain.',
      hook: 'DH = 30–40% sag. More travel = more sag. Counter-intuitive but correct.',
      refs: ['14-18'],
    },
    {
      id: 'su_sg_4', kind: 'mc', difficulty: 'hard',
      story: 'A customer rides a 100mm XC race bike. You target 15% sag (mid-range of the XC bracket).',
      chartHtml: SAG_CHART,
      question: 'In MILLIMETERS, what does 15% sag on a 100mm fork translate to?',
      choices: [
        { text: '5 mm', correct: false },
        { text: '10 mm', correct: false },
        { text: '15 mm', correct: true },
        { text: '30 mm', correct: false },
      ],
      why: '15% × 100mm = <strong>15mm</strong>. Sag math always: % × total travel. The travel-indicator O-ring on the stanchion is what you measure to.',
      hook: 'Sag mm = sag % × total travel. 15% × 100mm = 15mm. Easy multiply.',
      refs: ['14-18'],
    },
    {
      id: 'su_sg_5', kind: 'mc', difficulty: 'medium',
      question: 'When setting up a new suspension fork from scratch, which adjustment ALWAYS goes FIRST?',
      choices: [
        { text: 'Rebound damping', correct: false },
        { text: 'Compression damping', correct: false },
        { text: 'Spring (set the sag)', correct: true },
        { text: 'Lockout', correct: false },
      ],
      why: 'The setup sequence is FIXED: <strong>Spring (sag) → Rebound → Compression</strong>. You cannot tune rebound or compression sensibly until the spring is right for the rider, because the damper is balancing forces from THAT spring at THAT pressure.',
      hook: 'Spring sets sag · Rebound sets ride · Compression sets climb. In that order.',
      refs: ['14-18'],
    },
    {
      id: 'su_sg_6', kind: 'mc', difficulty: 'easy',
      question: 'Pick the CORRECT setup sequence for a fork from scratch:',
      choices: [
        { text: 'Compression → Rebound → Spring', correct: false },
        { text: 'Spring → Rebound → Compression', correct: true },
        { text: 'Rebound → Spring → Compression', correct: false },
        { text: 'All three at once — adjust as you ride', correct: false },
      ],
      why: 'Always: <strong>Spring → Rebound → Compression</strong>. Each step changes the playing field for the next — you can\'t set rebound for a spring you haven\'t set yet.',
      hook: 'S·R·C. Spring · Rebound · Compression. Same order, every time.',
      refs: ['14-18'],
    },
    {
      id: 'su_sg_7', kind: 'mc', difficulty: 'medium',
      story: 'You set sag for a coil-sprung fork. The customer is RIGHT in between two spring rates — the lighter spring gives 35% sag (too much), the heavier gives 25% (too little). They want their target ~28%.',
      question: 'Per the manual, what\'s the right move?',
      choices: [
        { text: 'Tell them to lose weight until the lighter spring works.', correct: false },
        { text: 'Use the lighter spring with PRELOAD — a threaded device that exerts compressive force on the spring before the suspension acts.', correct: true },
        { text: 'Mix two springs in one fork.', correct: false },
        { text: 'Add an air-volume reducer — works for coil too.', correct: false },
      ],
      why: 'When a coil spring is "almost right" but not quite, <strong>preload</strong> dials it in. Preload = a threaded device that pre-compresses the coil before the suspension acts on it. If the spring is FAR off, swap to a different spring rate — preload can\'t bridge a big gap.',
      hook: 'Coil "almost right" = preload. Coil far off = swap the spring.',
      refs: ['14-19'],
    },
    {
      id: 'su_sg_8', kind: 'mc', difficulty: 'medium',
      story: 'On a coil-sprung fork, the customer needs FAR more spring force than the installed spring can provide — even with maximum preload, sag is still way too much.',
      question: 'What\'s the correct move?',
      choices: [
        { text: 'Crank the preload past max anyway — it\'s designed for it.', correct: false },
        { text: 'Switch to an AIR spring conversion kit on the spot.', correct: false },
        { text: 'Replace the coil spring with one of the appropriate (heavier) rate.', correct: true },
        { text: 'Tell the customer to ride it as-is — it\'ll break in.', correct: false },
      ],
      why: 'Preload bridges SMALL gaps. <strong>If the spring is much too weak (or much too strong), it must be replaced</strong> with one of the appropriate rate. Cranking preload past spec is unsafe and changes nothing about the underlying spring rate.',
      hook: 'Big mismatch = swap the spring. Preload is a fine-tune, not a fix.',
      refs: ['14-19'],
    },
    {
      id: 'su_sg_9', kind: 'mc', difficulty: 'easy',
      question: 'When measuring sag on most modern forks, which feature on the stanchion is your reference?',
      choices: [
        { text: 'The dust wiper', correct: false },
        { text: 'The travel-indicator O-ring', correct: true },
        { text: 'The crown bolt', correct: false },
        { text: 'The brake post', correct: false },
      ],
      why: 'A <strong>travel-indicator O-ring</strong> sits on the stanchion. Push it down to the dust wiper, have the rider mount and dismount carefully, then measure how far the O-ring traveled. That distance is the sag.',
      hook: 'O-ring on the stanchion = your sag ruler.',
      refs: ['14-18'],
    },
    {
      id: 'su_sg_10', kind: 'mc', difficulty: 'medium',
      story: 'You\'re about to measure sag for a customer.',
      question: 'BEFORE the rider mounts the bike to set the O-ring, what do you do?',
      choices: [
        { text: 'Lock out the fork — that gives a true reading.', correct: false },
        { text: 'Cycle the suspension SEVERAL times in the MOST OPEN / FASTEST damper settings, so chassis friction and damper resistance don\'t interfere with the measurement.', correct: true },
        { text: 'Tighten the rebound to max — slows the fork down for accuracy.', correct: false },
        { text: 'Skip cycling — the O-ring will read accurately without prep.', correct: false },
      ],
      why: 'Damper resistance and chassis stiction can hold the fork higher than its true settled height — giving a falsely-LOW sag reading. The fix: <strong>cycle the suspension a few times with damper fully open / fast</strong> so it can find its actual settle point.',
      hook: 'Open the damper, cycle it, THEN measure sag. Stiction lies.',
      refs: ['14-18'],
    },
  ],
};

// =================== STAGE 6: TRAIL DIAGNOSIS PIT ===================
const S6 = {
  id: 'su_trail',
  name: 'Trail Diagnosis Pit',
  icon: '🩺',
  subtitle: 'Rider feel → adjustment · symptom-to-fix scenarios',
  blurb: 'Customers describe what they FEEL. You translate that into a click count or a psi change. Read the symptom, pick the fix.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'su_t_1', kind: 'mc', difficulty: 'easy',
      story: 'Trail rider says: "Every bump and the fork bounces back like a pogo stick. Tires almost lift off the ground after each hit."',
      question: 'Most likely cause and adjustment?',
      choices: [
        { text: 'Spring too soft — add air pressure.', correct: false },
        { text: 'Rebound too FAST (too open) — SLOW it down (add rebound damping clicks).', correct: true },
        { text: 'Compression too closed — open it.', correct: false },
        { text: 'Bushings worn — service the chassis.', correct: false },
      ],
      why: 'Pogo-stick feel = the spring is launching the fork back faster than the damper can control. <strong>Slow the rebound</strong> (more rebound damping = fewer/closer clicks toward the slow end).',
      hook: 'Pogo-stick = rebound too fast. Slow it down.',
      refs: ['14-19'],
    },
    {
      id: 'su_t_2', kind: 'mc', difficulty: 'medium',
      story: 'Trail rider on rocky chatter: "After 3 or 4 bumps in a row, the fork feels like it\'s sitting deeper and deeper in travel — never recovers between hits. By the bottom of the rough section, it\'s harsh."',
      question: 'What\'s happening, and what\'s the fix?',
      choices: [
        { text: 'Spring too stiff — drop pressure.', correct: false },
        { text: '"Packing up" — rebound is set too SLOW. SPEED IT UP (open rebound clicks toward fast).', correct: true },
        { text: 'Compression damping is broken — service the damper.', correct: false },
        { text: 'Bottom-out bumper failure — replace the chassis.', correct: false },
      ],
      why: 'Packing up = rebound returns slower than the next bump arrives, so the fork rides progressively deeper through a rough section. Fix: <strong>speed up rebound</strong> a few clicks until the fork recovers between hits.',
      hook: 'Packing up = rebound too slow. Speed it up.',
      refs: ['14-19'],
    },
    {
      id: 'su_t_3', kind: 'mc', difficulty: 'medium',
      story: 'A rider on a long fire-road climb: "Every pedal stroke the fork bobs and dives. Wastes my energy. But on the descent, the fork feels great."',
      question: 'On-the-fly adjustment?',
      choices: [
        { text: 'Add air pressure for the climb, bleed it out for the descent.', correct: false },
        { text: 'Use the COMPRESSION damping range — close it (or use lockout) for the climb, open it back up for the descent.', correct: true },
        { text: 'Slow the rebound for the climb.', correct: false },
        { text: 'Replace the spring — this is a sag problem.', correct: false },
      ],
      why: 'Compression damping is the on-the-fly tool — the manual literally calls out climb-vs-descent as the canonical use case. <strong>Close compression (or full lockout) for long climbs</strong>; open it back up at the top.',
      hook: 'Climb = close compression / lockout. Descent = open it back up. Compression is on-the-fly.',
      refs: ['14-20'],
    },
    {
      id: 'su_t_4', kind: 'mc', difficulty: 'medium',
      story: 'Rider on a flow trail with rolling jumps: "I\'m bottoming out HARD on every single landing. Hear a clunk every time."',
      question: 'BEST first move (don\'t change sag)?',
      choices: [
        { text: 'Slow the rebound — it\'s the rebound\'s fault.', correct: false },
        { text: 'Add air pressure (or stiffer coil) AND/OR add a volume reducer to ramp up the late stroke. Token it up before changing sag.', correct: true },
        { text: 'Open the compression — let it bottom faster.', correct: false },
        { text: 'Tell them to land softer.', correct: false },
      ],
      why: 'Repeat hard bottom-outs = the spring isn\'t resisting deep stroke enough. Options: <strong>add pressure (sag changes), OR add volume reducer / token (sag stays, ramp gets steeper), OR more compression</strong>. Volume reducer first if you want to keep the sag.',
      hook: 'Bottom-out clunks = stiffen the back end. Add pressure, OR add a token, OR add compression.',
      refs: ['14-9'],
    },
    {
      id: 'su_t_5', kind: 'mc', difficulty: 'hard',
      story: 'A rider says: "The fork feels HARSH on small chatter — it just won\'t respond to little bumps. But it works fine on bigger hits. Sag is set correctly."',
      question: 'Most likely culprit?',
      choices: [
        { text: 'Spring rate too soft — needs stiffer coil.', correct: false },
        { text: 'Stiction — chassis seals/bushings binding, OR the negative spring system isn\'t doing its job (chamber needs equalizing or service).', correct: true },
        { text: 'Rebound too slow — speed it up.', correct: false },
        { text: 'Crown is cracked — replace the fork.', correct: false },
      ],
      why: 'If sag is right but small bumps don\'t register, <strong>breakaway force is too high</strong>. Causes: dry/dirty seals (chassis service), or a negative-spring chamber that needs equalizing (some air systems require an inflate sequence to balance positive/negative). Service the chassis first.',
      hook: 'Small-bump dead = stiction. Service the seals; check the negative spring.',
      refs: ['14-9'],
    },
    {
      id: 'su_t_6', kind: 'mc', difficulty: 'medium',
      story: 'A vintage 1990s mountain bike. Customer: "My fork feels rock-hard in my cold garage but goes plush after the first 10 minutes of riding in the sun."',
      question: 'What\'s most likely going on?',
      choices: [
        { text: 'Air spring leak that re-seals when warm.', correct: false },
        { text: 'Elastomer-sprung fork — temperature sensitivity is the elastomer\'s key drawback (cold = harder, hot = softer).', correct: true },
        { text: 'Damper oil viscosity is incorrect.', correct: false },
        { text: 'Rebound knob has loosened in the cold.', correct: false },
      ],
      why: 'A 1990s fork with this thermal swing is almost certainly <strong>elastomer-sprung</strong>. Elastomers go HARDER in cold and SOFTER in heat — that drift is exactly why they were dropped from modern performance forks.',
      hook: 'Vintage fork + temperature drift = elastomer. The 1990s called.',
      refs: ['14-7'],
    },
    {
      id: 'su_t_7', kind: 'mc', difficulty: 'hard',
      story: 'Rider on a trail rolls into the parking lot: "Halfway down the descent, my fork went totally soft, fully collapsed. Kept it upright but the bars dove every time I touched the brakes."',
      question: 'Diagnosis and shop call?',
      choices: [
        { text: 'Rider error — they hit the lockout. Open it back up and send them out.', correct: false },
        { text: 'Air seal failure → fork has collapsed to bottom-out → bike is UNSAFE. Do not send the rider back out. Replace seals; fully service.', correct: true },
        { text: 'Just low pressure — pump it up to 100psi and send.', correct: false },
        { text: 'Damper cavitation — it\'ll come back tomorrow.', correct: false },
      ],
      why: 'Air-spring collapse mid-ride = <strong>seal failure</strong>. The manual explicitly says this makes the bike <strong>unsafe to ride</strong>. Stop, do a full service with new seals, verify the system holds pressure under cycles before releasing.',
      hook: 'Mid-ride air collapse = stop. Replace seals. No exceptions.',
      refs: ['14-9'],
    },
    {
      id: 'su_t_8', kind: 'mc', difficulty: 'medium',
      story: 'You rock the bike fore/aft holding the bars. Knock-knock. You tighten the headset preload — knock\'s still there. Customer says "yeah, it\'s been like that for a while."',
      question: 'Diagnosis?',
      choices: [
        { text: 'Brake pads need replacing.', correct: false },
        { text: 'Crown is cracked — retire the fork.', correct: false },
        { text: 'Worn bushing interface in the lower legs — chassis service required.', correct: true },
        { text: 'Tire pressure is too low.', correct: false },
      ],
      why: 'When the headset is properly tensioned and the knock persists with fore/aft rocking, the manual flags this as <strong>worn bushings</strong>. The bushing interface allows the lowers to slide on the uppers; when worn, you get play that mimics a loose headset.',
      hook: 'Headset feels loose, headset is fine = bushings. (Stage 4 callback.)',
      refs: ['14-15'],
    },
    {
      id: 'su_t_9', kind: 'mc', difficulty: 'medium',
      story: 'A rider says "after every compression I hear a CLACK as the fork tops out — it\'s loud and harsh."',
      question: 'Cause and fix?',
      choices: [
        { text: 'Air pressure too low — add 20 psi.', correct: false },
        { text: 'Rebound far too fast — slow it down several clicks.', correct: true },
        { text: 'Compression damping locked out — open it.', correct: false },
        { text: 'Crown service needed — disassemble.', correct: false },
      ],
      why: 'Audible top-out is the spring slamming the fork to full extension because rebound damping isn\'t controlling the return. <strong>Slow the rebound</strong> a few clicks until the top-out goes silent. (Cousin of the pogo-stick symptom.)',
      hook: 'Audible top-out = rebound too fast. Slow it.',
      refs: ['14-19'],
    },
    {
      id: 'su_t_10', kind: 'mc', difficulty: 'hard',
      story: 'A trail rider on a 140mm fork. You set the travel-indicator O-ring, they mount and dismount carefully. The O-ring has moved 8mm.',
      chartHtml: SAG_CHART,
      question: 'What\'s the sag % — and what would you adjust?',
      choices: [
        { text: '~5.7% — way too little sag for trail. Reduce air pressure (or use a lighter spring) until you\'re inside 20–30%.', correct: true },
        { text: '~22% — perfect trail sag. No change.', correct: false },
        { text: '~35% — a little too much sag. Add some pressure.', correct: false },
        { text: 'Cannot determine without knowing the rider\'s weight.', correct: false },
      ],
      why: '8mm ÷ 140mm = <strong>5.7%</strong> sag. Trail target is 20–30%. The fork is FAR over-sprung for this rider — air is too high. <strong>Reduce pressure</strong> incrementally until sag lands in the trail bracket (28–42mm range on this fork).',
      hook: 'Sag math: O-ring mm ÷ travel mm × 100 = sag %. Compare to chart.',
      refs: ['14-18'],
    },
  ],
};

// ===================== BOSS — The Walk-In Suspension Tune =====================
const BOSS = {
  id: 'su_boss_walkin',
  name: 'BOSS: The Walk-In Suspension Tune',
  icon: '🏆',
  subtitle: 'Service + setup + diagnosis on a 2019 Suntour Auron',
  blurb: 'A trail customer drops off their 2019 Suntour Auron-equipped trail bike. Service it correctly, dial it in, and answer their post-ride symptom. Ten rounds. Charts, torques, sag math, and rider feel — all at once.',
  intro: '<strong>The walk-in:</strong> A trail rider hands you a 140mm-travel bike with a 2019 Suntour Auron fork. Last service: 14 months ago. They want it serviced AND set up properly for trail riding.<br><br>You\'ll work the spec sheet (torque values, oil weights), the sag chart, and the rebound/compression dials. Then they\'ll come back after a test ride and describe what they feel — you have to translate that to an adjustment.<br><br>Ten rounds. <em>Pass: 8 of 10.</em>',
  rounds: [
    {
      id: 'su_boss_r1', kind: 'multi', difficulty: 'medium', requiredCorrect: 3,
      story: 'ROUND 1 — Pre-service intake. Before disassembling the Auron, the manual REQUIRES you to record the customer\'s current settings so you can restore them after service.',
      question: 'Pick the THREE settings you MUST record:',
      choices: [
        { text: 'Air spring pressure (psi)', correct: true },
        { text: 'Rebound damping setting (clicks)', correct: true },
        { text: 'Compression damping setting (clicks)', correct: true },
        { text: 'Front tire PSI', correct: false },
        { text: 'Stem bolt torque', correct: false },
      ],
      why: 'Pre-service: <strong>spring (psi) + rebound clicks + compression clicks</strong>. Tire PSI and stem torque belong to other systems. Record on a service tag; restore after assembly is complete.',
      hook: 'Pre-service triad: psi · rebound · compression. Three numbers, one tag.',
      refs: ['14-16'],
    },
    {
      id: 'su_boss_r2', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 2 — Torque chart. Per the 2019 Suntour Auron service spec sheet:',
      chartHtml: chart('Suntour Auron 2019 — Torque Values (Manual p.H14-1)',
        ['Fastener', 'Torque'],
        [
          ['Shaft bolts', '6 N·m'],
          { __highlight: true, cells: ['Damper top cap', '10 N·m'] },
          ['Spring assembly top cap', '10 N·m'],
          ['Spring stanchion end cap', '10 N·m'],
        ]),
      question: 'You\'re reinstalling the damper cartridge. What torque value do you set on your micrometer wrench?',
      choices: [
        { text: '4 N·m', correct: false },
        { text: '6 N·m', correct: false },
        { text: '10 N·m', correct: true },
        { text: '15 N·m', correct: false },
      ],
      why: 'Damper top cap = <strong>10 N·m</strong>. Same value as both the spring assembly top cap AND the spring stanchion end cap. <strong>Shaft bolts are different — they\'re 6 N·m.</strong> Read the chart, set the wrench, never guess.',
      hook: 'Auron 2019: top caps = 10 N·m. Shaft bolts = 6 N·m. Two values, never mix.',
      refs: ['H14-1'],
    },
    {
      id: 'su_boss_r3', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 3 — Oil selection. The damper cartridge needs new oil. You reach for the suspension oil shelf.',
      question: 'Per the Auron service procedure, what weight oil goes in the damper?',
      choices: [
        { text: '3wt', correct: false },
        { text: '5wt', correct: true },
        { text: '10wt', correct: false },
        { text: '15wt — same as the chassis', correct: false },
      ],
      why: 'Manual: damper calls for <strong>5wt suspension fluid</strong>. (Chassis lube can be a heavier weight in the same fork — different jobs, different viscosities.)',
      hook: 'Auron damper = 5wt. Chassis lube weight is its own spec.',
      refs: ['H14-1'],
    },
    {
      id: 'su_boss_r4', kind: 'mc', difficulty: 'easy',
      story: 'ROUND 4 — Setup sequence. The Auron is reassembled, lowers torqued to 6 N·m, and ready for setup. The customer is in the shop, in their riding gear.',
      question: 'In what order do you set the three adjustments?',
      choices: [
        { text: 'Compression → Rebound → Spring', correct: false },
        { text: 'Rebound → Spring → Compression', correct: false },
        { text: 'Spring (sag) → Rebound → Compression', correct: true },
        { text: 'All three simultaneously while they sit on the bike', correct: false },
      ],
      why: '<strong>Spring → Rebound → Compression</strong>. Always. Each step changes what the next step is balancing — set them out of order and you\'re tuning against unstable inputs.',
      hook: 'S·R·C. Same order, every customer, every fork.',
      refs: ['14-18'],
    },
    {
      id: 'su_boss_r5', kind: 'mc', difficulty: 'hard',
      story: 'ROUND 5 — Sag math. The customer mounts the Auron (140mm travel) in full kit. You set the O-ring to the dust wiper, they dismount carefully. The O-ring has moved 32mm.',
      chartHtml: SAG_CHART,
      question: 'What\'s the sag %, and is it inside the trail bracket?',
      choices: [
        { text: '~10% — too little sag for trail. Drop pressure.', correct: false },
        { text: '~22.8% — inside the 20–30% trail bracket. Good.', correct: true },
        { text: '~32% — too much sag for trail. Add pressure.', correct: false },
        { text: '~45% — bottoming territory. Add a lot of pressure.', correct: false },
      ],
      why: '32mm ÷ 140mm = <strong>22.8%</strong> sag. Trail bracket = 20–30%. <strong>Inside the target.</strong> Move on to rebound.',
      hook: 'Sag % = O-ring mm ÷ travel mm. Compare to chart bracket.',
      refs: ['14-18'],
    },
    {
      id: 'su_boss_r6', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 6 — Test ride feedback. The customer comes back grinning, then frowning: "Sag felt great. But every compression CLACKS as the fork tops back out — really loud, kind of harsh on the hands."',
      question: 'Adjustment?',
      choices: [
        { text: 'Add air pressure — fix it with the spring.', correct: false },
        { text: 'Slow the REBOUND a few clicks — it\'s returning faster than the damper can control.', correct: true },
        { text: 'Crank the compression all the way closed.', correct: false },
        { text: 'Service the damper — there\'s air in the cartridge.', correct: false },
      ],
      why: 'Audible top-out = rebound returning too fast → spring slams the fork back to full extension. <strong>Slow rebound</strong> incrementally until the clack is gone but the fork still recovers between bumps.',
      hook: 'Top-out clack = rebound too fast. Slow a few clicks.',
      refs: ['14-19'],
    },
    {
      id: 'su_boss_r7', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 7 — More feedback. "The trails out here have long fire-road climbs followed by descents. On the climb the fork dives all over with my pedal stroke; on the descent it works great."',
      question: 'Best advice?',
      choices: [
        { text: 'Add 30 psi for the climb, drop it back for the descent.', correct: false },
        { text: 'Use the COMPRESSION damping (or lockout) for the climb — close it up at the bottom of the climb, open it back up at the top.', correct: true },
        { text: 'Slow the rebound permanently to fight the bob.', correct: false },
        { text: 'Switch to a coil spring — handles climbs better.', correct: false },
      ],
      why: 'Compression damping is the <strong>on-the-fly tool</strong> — the manual specifically calls out the long-climb-then-descent scenario. Lockout (or close LSC) for the climb, open it back up at the top.',
      hook: 'Compression = on-the-fly. Climb closed. Descent open.',
      refs: ['14-20'],
    },
    {
      id: 'su_boss_r8', kind: 'mc', difficulty: 'hard',
      story: 'ROUND 8 — Safety scenario. Two weeks later the customer rolls back in, walking the bike. "Halfway down a descent the fork suddenly went completely soft. Bars dove every time I touched the brakes. Walked it back to the trailhead."',
      question: 'Diagnosis and shop call?',
      choices: [
        { text: 'Just low pressure — top up the air spring and send them.', correct: false },
        { text: 'Air seal failure → suspension collapsed to bottom-out → BIKE IS UNSAFE TO RIDE. Full chassis service, replace the seals, verify pressure holds before releasing.', correct: true },
        { text: 'Probably a stuck lockout — wiggle the lever and send them out.', correct: false },
        { text: 'Damper cavitation — bleed the damper, no spring service needed.', correct: false },
      ],
      why: 'Air-spring collapse mid-ride is the manual\'s textbook seal failure. <strong>"If an air seal fails, the suspension collapses to the bottomed-out state, effectively making the bike unsafe to ride."</strong> Don\'t patch it — service it.',
      hook: 'Mid-ride air collapse = unsafe = full service. No shortcuts, no field hacks.',
      refs: ['14-9'],
    },
    {
      id: 'su_boss_r9', kind: 'mc', difficulty: 'medium',
      story: 'ROUND 9 — Service interval. A different customer brings in a Specialized Stumpjumper with a FOX 36 fork. They say it\'s been about 200 hours since the last service. They ask: "Specialized\'s site doesn\'t list a service interval — are we good?"',
      question: 'What\'s the correct shop response?',
      choices: [
        { text: '"Specialized doesn\'t list one, so you\'re fine for another year."', correct: false },
        { text: '"Service intervals come from the SUSPENSION manufacturer (FOX), not the bike brand. Let me look up the FOX schedule for the 36 — 200 hours is well into FOX\'s recommended service window."', correct: true },
        { text: '"All forks share a 24-month interval — you\'ve got time."', correct: false },
        { text: '"FOX doesn\'t publish intervals — only Suntour does."', correct: false },
      ],
      why: 'Manual: <strong>service intervals come from the suspension component manufacturer, not the bike brand</strong>. FOX publishes detailed hours-based service schedules; 200 hours typically lands well into "lower-leg service / damper service" territory.',
      hook: 'Service intervals = from the SUSPENSION brand. Always.',
      refs: ['14-15'],
    },
    {
      id: 'su_boss_r10', kind: 'mc', difficulty: 'easy',
      story: 'ROUND 10 — Final hand-off. The Auron service is complete. Just before you call the customer to pick up the bike, what\'s the last setup step?',
      question: 'What do you do?',
      choices: [
        { text: 'Wipe the fork down, install the wheel — done.', correct: false },
        { text: 'Restore the customer\'s PRE-SERVICE settings (psi + rebound clicks + compression clicks) from your service tag, then test the fork for function.', correct: true },
        { text: 'Set everything to factory default — let the customer re-tune from scratch.', correct: false },
        { text: 'Crank rebound and compression to maximum to "break in" the new oil.', correct: false },
      ],
      why: 'The manual is explicit: <strong>"the customer\'s previous damper and spring settings should be restored to their pre-service status."</strong> Their tune is THEIR tune — your job is to service the fork, not re-tune it without permission.',
      hook: 'Last step always: restore the customer\'s pre-service settings. Hand it back the way it came in (just serviced).',
      refs: ['14-16'],
    },
  ],
};

// ===================== BADGES (Suspension-specific) =====================
const BADGES = [
  { id: 'su_apprentice',     icon: '🛡️',  name: 'Suspension Apprentice',     desc: 'Cracked open the Suspension Sanctuary.', hint: 'Start any Suspension stage' },
  { id: 'su_anatomy_master', icon: '🔧',  name: 'Anatomy Master',            desc: 'Names every part, fork or shock.',         hint: 'Pass Stage 1 — Anatomy & Theory' },
  { id: 'su_spring_savant',  icon: '🌬️',  name: 'Spring Savant',             desc: 'Reads coil curves AND air ramps.',         hint: 'Pass Stage 2 — Spring Lab' },
  { id: 'su_damper_doctor',  icon: '💧',  name: 'Damper Doctor',             desc: 'Knows why the oil flows.',                 hint: 'Pass Stage 3 — Damper Workshop' },
  { id: 'su_service_steady', icon: '📚',  name: 'Service Steady',            desc: 'Right oil. Right interval. Every time.',    hint: 'Pass Stage 4 — Damper Types & Service' },
  { id: 'su_sag_sage',       icon: '📊',  name: 'Sag Sage',                  desc: 'Sets sag from feel, confirms from chart.',  hint: 'Pass Stage 5 — Sag & Setup' },
  { id: 'su_trail_tuner',    icon: '🩺',  name: 'Trail Tuner',               desc: 'Translates rider feel into clicks.',        hint: 'Pass Stage 6 — Trail Diagnosis' },
  { id: 'su_champion',       icon: '🏆',  name: 'Suspension Champion',       desc: 'Walked in, tuned out.',                     hint: 'Beat the Walk-In Suspension Tune boss' },
  { id: 'su_perfectionist',  icon: '💎',  name: 'Suspension Perfectionist',  desc: 'Every stage, no errors.',                   hint: 'Clear all 6 stages 100% on a single attempt each' },
];

// V5: variant prompts — alternate phrasings the renderer rotates between
// to defeat pure "memorize the wording" recall on retries.
const SUSPENSION_VARIANTS_V5 = {
  // Stage 1 — Anatomy
  'su_a_1': [
    "Name the THREE main suspension components in the correct set.",
    "Which group correctly lists the three top-level components of a suspension system?",
  ],
  'su_a_2': [
    "Pick TWO statements that describe what a suspension system is FOR (per the manual).",
    "Which TWO purposes does a bicycle suspension serve, by the book?",
  ],
  'su_a_4': [
    "Decode the abbreviation \"CSU\" used on a telescoping fork.",
    "What three parts make up the CSU?",
  ],
  'su_a_7': [
    "Pick the TRUE statement comparing inverted vs conventional fork chassis.",
    "Which statement matches the manual\'s tradeoff for inverted vs conventional?",
  ],
  // Stage 2 — Spring
  'su_sp_2': [
    "100# coil at 3\" of compression — what force?",
    "Linear coil, 100 lb/in. At 3\" compressed, the force is?",
  ],
  'su_sp_3': [
    "Halve the air-spring chamber — what does pressure do?",
    "100 psi air spring at 4\" travel. Halfway through travel, pressure becomes?",
  ],
  'su_sp_4': [
    "Pick the TWO TRUE statements about coil vs. air springs.",
    "Two truths about coil vs. air, per the manual — pick them.",
  ],
  'su_sp_6': [
    "What is the JOB of a negative spring?",
    "Why do air-sprung forks include a negative spring?",
  ],
  'su_sp_10': [
    "Without changing sag, how do you make the air-spring END of stroke firmer?",
    "Pick the tuning move that ramps the back end of an air spring without touching baseline psi.",
  ],
  // Stage 3 — Damper
  'su_d_2': [
    "Compression vs rebound — which does the manual flag as \"most imperative\"?",
    "Which damping job is more critical to get right?",
  ],
  'su_d_3': [
    "A 3-foot drop landing — name the shaft-speed type (H/S or L/S).",
    "Categorize: drop landing → high-speed or low-speed shaft event?",
  ],
  'su_d_5': [
    "Pick the THREE valid reasons OIL is the dominant damping medium.",
    "Three reasons oil wins over air for damping — pick them.",
  ],
  'su_d_7': [
    "Why does a true LOCKOUT actually stop the fork from compressing?",
    "What property of oil makes lockout possible?",
  ],
  // Stage 4 — Service
  'su_sv_4': [
    "Whose service intervals do you follow on a Trek/FOX combo?",
    "Service-interval source: bike brand or suspension brand?",
  ],
  'su_sv_5': [
    "Per the chart, which oil weight resists flow MOST?",
    "Which viscosity from the chart is the THICKEST?",
  ],
  'su_sv_6': [
    "Headset-like knock that doesn\'t go away when you tighten the headset — diagnosis?",
    "Fore/aft knock + correct headset preload = what\'s actually worn?",
  ],
  'su_sv_7': [
    "Pick the THREE settings you MUST record before disassembling a fork.",
    "Pre-service, three settings get tagged — which three?",
  ],
  // Stage 5 — Sag
  'su_sg_2': [
    "140mm trail fork — what sag % per the chart?",
    "Trail bike, 140mm travel — pick the target sag bracket.",
  ],
  'su_sg_5': [
    "First adjustment in any setup sequence?",
    "Which dial gets touched FIRST when setting up a fork?",
  ],
  'su_sg_7': [
    "Coil sag is \"almost right\" — which tool dials it in WITHOUT swapping the spring?",
    "Coil sag close but not quite — what\'s the move?",
  ],
  // Stage 6 — Trail Diagnosis
  'su_t_1': [
    "Pogo-stick feel — most likely cause and adjustment?",
    "Fork bouncing back like a pogo — what dial, which way?",
  ],
  'su_t_2': [
    "\"Packing up\" through rough sections — what setting is wrong?",
    "Fork rides progressively deeper through chatter — diagnose and fix.",
  ],
  'su_t_3': [
    "Long climb pedal-bob, descent feels great — best on-the-fly adjustment?",
    "Climb dive + descent fine — which dial fixes it?",
  ],
  'su_t_7': [
    "Mid-ride air collapse — diagnosis and shop call?",
    "Fork went soft mid-descent. What is it, and what do you do?",
  ],
  // Boss rounds
  'su_boss_r2': [
    "Damper top cap reinstall torque per the chart?",
    "Set the wrench: damper top cap on the Auron is what N·m?",
  ],
  'su_boss_r5': [
    "32mm O-ring travel on a 140mm fork — sag %?",
    "Compute the sag: 32mm of indicator movement on 140mm of travel.",
  ],
  'su_boss_r10': [
    "Final step before handing the serviced fork back?",
    "What\'s the last-mile move on a finished fork service?",
  ],
};

(function injectSuspensionVariants() {
  const apply = (q) => {
    if (q && q.id && SUSPENSION_VARIANTS_V5[q.id]) {
      q.variants = SUSPENSION_VARIANTS_V5[q.id];
    }
  };
  for (const stage of [S1, S2, S3, S4, S5, S6]) {
    if (stage.questions) for (const q of stage.questions) apply(q);
  }
  if (BOSS && BOSS.rounds) for (const q of BOSS.rounds) apply(q);
})();

const STAGES = [S1, S2, S3, S4, S5, S6];

window.SUSPENSION = {
  meta: {
    version: 1,
    totalStages: STAGES.length,
    totalQuestions: STAGES.reduce((a, s) => a + s.questions.length, 0),
  },
  stages: STAGES,
  boss: BOSS,
  badges: BADGES,
};

console.log('[Suspension] Loaded', STAGES.length, 'stages,',
  STAGES.reduce((a, s) => a + s.questions.length, 0), 'questions, +',
  BOSS.rounds.length, 'boss rounds.');
})();
