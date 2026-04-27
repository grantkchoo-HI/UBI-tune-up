/* UBI Tune-Up v5 — Authored Diagnostic Scenarios (with variants)
 * v5 adds `variants` per scenario: a list of rephrased question prompts.
 * On repeat exposure (re-roll, due-for-review), the renderer pulls a
 * non-most-recent variant so wording can't be memorized in lieu of meaning.
 *
 * v3 origins:
 * Each scenario exercises 2-4 glossary terms and teaches TRANSFER:
 * using multiple concepts together to diagnose a real situation.
 *
 * Format:
 *   id        unique string
 *   topic     chapter / bucket
 *   title     short label (shown in review)
 *   story     the situation (what the customer says or what you see)
 *   question  what you need to answer
 *   kind      'single' or 'multi'
 *   requiredCorrect  for multi-select: number that must be picked
 *   choices   array of { text, correct }
 *   terms     array of termLower strings — mastery credit awarded
 *   why       explanation shown always (right or wrong) with term refs
 *   difficulty 'easy' | 'medium' | 'hard'
 */
window.SCENARIOS_V3 = [

  // ========== DRIVETRAIN ==========
  {
    id: 's_chain_bigbig',
    topic: 'drivetrain',
    title: 'Skipping only in big-big',
    story: "A customer brings in a road bike. The chain skips under load — but only in the big-ring/big-cog combination. You've verified cable tension is correct and the chain passes the 12-link measurement for stretch.",
    question: "Which TWO are the most likely culprits?",
    kind: 'multi',
    requiredCorrect: 2,
    choices: [
      { text: 'Chainline angle', correct: true },
      { text: 'Cassette wear', correct: true },
      { text: 'Freehub body', correct: false },
      { text: 'B-tension screw', correct: false },
      { text: 'Lockring torque', correct: false },
    ],
    terms: ['chainline', 'cassette', 'chain stretch'],
    why: "Big-big is the most extreme chainline angle AND the highest load — so any wear shows up there first. If the 12-link stretch test passed, focus on <strong>cassette</strong> wear: a slightly stretched chain still seats into worn cog valleys but skips on fresh teeth. <strong>Chainline</strong> puts lateral load on the chain, accelerating both.",
    difficulty: 'hard',
  },
  {
    id: 's_freewheel_or_cassette',
    topic: 'drivetrain',
    title: 'Freewheel vs cassette',
    story: "A customer walks in: \"I need a new cassette — mine unscrewed itself during a ride.\" You spin the cogs and notice the whole cluster rotates with them when they pedal backward.",
    question: "What does this tell you, and what tool do you need?",
    kind: 'single',
    choices: [
      { text: "It's a freewheel, not a cassette — you need a freewheel removal tool.", correct: true },
      { text: "It's a cassette — grab the lockring tool and chain whip.", correct: false },
      { text: "It's a loose lockring — retorque to 40Nm.", correct: false },
      { text: "It's a damaged freehub body — replace it.", correct: false },
    ],
    terms: ['freewheel', 'cassette', 'freehub'],
    why: "If cogs rotate backward together, there's no internal ratchet in the hub — the ratchet is in the cog unit itself. That's a <strong>freewheel</strong> (threads on). A <strong>cassette</strong> slides onto a <strong>freehub</strong> body where the ratchet lives. Wrong tool = wrong removal strategy.",
    difficulty: 'medium',
  },
  {
    id: 's_ghost_shift',
    topic: 'drivetrain',
    title: 'Ghost shifting on bumps',
    story: "\"My rear derailleur shifts on its own whenever I hit a bump,\" says the customer. The cable is new, shifts are crisp on the stand, and the hanger measures true.",
    question: "What's the most likely cause?",
    kind: 'single',
    choices: [
      { text: 'Housing is too long — absorbs bump shock into cable pull.', correct: false },
      { text: 'Indexing is off by a click — bumps push it past the threshold.', correct: true },
      { text: 'Derailleur spring is weak.', correct: false },
      { text: 'Chain is stretched.', correct: false },
    ],
    terms: ['derailleur', 'barrel adjuster', 'derailleur cable'],
    why: "Crisp on the stand but ghost-shifting on the road is classic <strong>indexing</strong> boundary behavior. Turn the <strong>barrel adjuster</strong> a quarter-turn either way and test. Loaded <strong>derailleur cable</strong> under vibration sits right at the switch point and nudges over.",
    difficulty: 'medium',
  },
  {
    id: 's_chain_drop_inside',
    topic: 'drivetrain',
    title: 'Chain drops off small ring',
    story: "Customer: \"Chain drops to the inside off my small chainring when I shift down too fast.\"",
    question: "What adjustment corrects this?",
    kind: 'single',
    choices: [
      { text: 'Tighten the inner (low) limit screw on the front derailleur.', correct: true },
      { text: 'Tighten the outer (high) limit screw on the front derailleur.', correct: false },
      { text: 'Increase cable tension with the barrel adjuster.', correct: false },
      { text: 'Replace the chainring bolt.', correct: false },
    ],
    terms: ['chainring', 'derailleur'],
    why: "Dropping to the INSIDE means the derailleur is swinging too far toward the frame. The inner/low limit screw caps how far it can travel. Tighten (turn clockwise usually) to reduce that travel until the chain stops over-shifting past the small <strong>chainring</strong>.",
    difficulty: 'easy',
  },
  {
    id: 's_chain_suck',
    topic: 'drivetrain',
    title: 'Chain suck',
    story: "After a wet muddy ride, a customer's chain drags up with the chainring and jams between the ring and the frame.",
    question: "Which TWO factors most commonly cause this?",
    kind: 'multi',
    requiredCorrect: 2,
    choices: [
      { text: 'Worn chainring teeth (hooked).', correct: true },
      { text: 'Contaminated / dry chain.', correct: true },
      { text: 'Under-torqued lockring.', correct: false },
      { text: 'Wrong bottom bracket spindle length.', correct: false },
      { text: 'Cassette out of dish.', correct: false },
    ],
    terms: ['chain suck', 'chainring', 'chain', 'contamination'],
    why: "<strong>Chain suck</strong> happens when the chain won't release from the chainring at the bottom of rotation. Two usual causes: worn hook-shaped <strong>chainring</strong> teeth that grab the chain, and a dirty / dry <strong>chain</strong> that sticks to those teeth thanks to <strong>contamination</strong>.",
    difficulty: 'hard',
  },
  {
    id: 's_cable_stretch',
    topic: 'drivetrain',
    title: 'New cable, sloppy shifts',
    story: "You installed a new derailleur cable yesterday. Customer returns after 50 miles: \"It was perfect, now it's slow to shift up.\"",
    question: "Quickest fix?",
    kind: 'single',
    choices: [
      { text: 'Quarter-turn the barrel adjuster counterclockwise (increase tension).', correct: true },
      { text: 'Replace the cable — it\'s defective.', correct: false },
      { text: 'Adjust the high limit screw.', correct: false },
      { text: 'Re-torque the derailleur clamp bolt.', correct: false },
    ],
    terms: ['barrel adjuster', 'derailleur cable'],
    why: "New <strong>derailleur cable</strong> settles/stretches in the first 50-100 miles. Slow up-shifts = not enough tension. The <strong>barrel adjuster</strong> is exactly there for this — counterclockwise (looking at the derailleur) lengthens housing / tightens cable.",
    difficulty: 'easy',
  },
  {
    id: 's_btension',
    topic: 'drivetrain',
    title: 'Noisy in the biggest cog',
    story: "Quiet in every gear except the 32t cog, where the rear derailleur's upper pulley looks like it's almost touching the cog.",
    question: "What adjustment?",
    kind: 'single',
    choices: [
      { text: 'Back off the B-tension screw.', correct: false },
      { text: 'Tighten the B-tension screw (add clearance).', correct: true },
      { text: 'Increase cable tension.', correct: false },
      { text: 'Adjust the low limit screw.', correct: false },
    ],
    terms: ['body angle screw (b-adjust or b-tension)', 'derailleur'],
    why: "The <strong>B-tension</strong> screw sets the vertical gap between the upper pulley and the cogs. Too close = noise and poor shift quality in the biggest cog. Tightening it rotates the derailleur body away, adding clearance.",
    difficulty: 'medium',
  },

  // ========== WHEELS ==========
  {
    id: 's_wobble_true',
    topic: 'wheels',
    title: 'Lateral wobble',
    story: "A wheel wobbles side-to-side against the brake pad when spinning. Hop/roundness is fine.",
    question: "What kind of truing does this wheel need?",
    kind: 'single',
    choices: [
      { text: 'Lateral truing — adjust spoke tension side to side.', correct: true },
      { text: 'Radial truing — work on roundness.', correct: false },
      { text: 'Re-dish — center the rim over the hub.', correct: false },
      { text: 'Replace the rim.', correct: false },
    ],
    terms: ['truing', 'spoke', 'rim'],
    why: "Side-to-side = <strong>lateral truing</strong>. Tighten a <strong>spoke</strong> on the opposite side of the wobble (or loosen on the same side) to pull the <strong>rim</strong> over. Radial truing addresses hop; dishing addresses centering.",
    difficulty: 'easy',
  },
  {
    id: 's_brake_pulse',
    topic: 'wheels',
    title: 'Rim brake pulses',
    story: "A rim-brake wheel spins laterally true but the brake lever pulses once per revolution under braking.",
    question: "What's wrong?",
    kind: 'single',
    choices: [
      { text: 'Wheel is out of round (hop).', correct: true },
      { text: 'Brake pads are contaminated.', correct: false },
      { text: 'Wheel is out of dish.', correct: false },
      { text: 'Hub bearings are loose.', correct: false },
    ],
    terms: ['truing', 'rim', 'rim brake'],
    why: "Pulse once per revolution under braking = the <strong>rim</strong> isn't perfectly round. That's radial — needs <strong>truing</strong> for roundness, which is separate from the side-to-side kind. Lateral truing alone won't fix a hop.",
    difficulty: 'medium',
  },
  {
    id: 's_ab_type_rim',
    topic: 'wheels',
    title: 'A-type or B-type?',
    story: "Looking at an unbuilt rim from the drive side: the spoke hole immediately to the right of the valve hole is offset toward the NON-drive side of the bike.",
    question: "Which rim is it, and why does it matter?",
    kind: 'single',
    choices: [
      { text: 'A-type — the lacing pattern follows to keep heads/elbows in correct positions.', correct: true },
      { text: 'B-type — the lacing pattern follows to keep heads/elbows in correct positions.', correct: false },
      { text: 'Symmetric — either pattern works.', correct: false },
      { text: 'Out of spec — replace the rim.', correct: false },
    ],
    terms: ['a-type (rim)', 'b-type (rim)', 'spoke lacing pattern'],
    why: "<strong>A-type rim</strong>: the hole right of the valve offsets to the non-drive side. <strong>B-type</strong> is the mirror. Getting this wrong means your <strong>spoke lacing pattern</strong> will have heads/elbows reversed — the wheel builds but won't tension correctly.",
    difficulty: 'hard',
  },
  {
    id: 's_dish',
    topic: 'wheels',
    title: 'Rim not centered',
    story: "A freshly built rear wheel is laterally true but sits 3mm closer to the drive side in the frame.",
    question: "What's the issue?",
    kind: 'single',
    choices: [
      { text: 'Wheel is out of dish — needs re-dishing (drive-side tension too high or non-drive too low).', correct: true },
      { text: 'Hub axle is bent.', correct: false },
      { text: 'Frame is out of alignment.', correct: false },
      { text: 'Rim is A-type but was laced as B-type.', correct: false },
    ],
    terms: ['dish (wheels)', 'dishing', 'spoke'],
    why: "<strong>Dish</strong> is how centered the rim is between the hub locknuts. Off-center = <strong>dishing</strong> adjustment: tighten opposite-side <strong>spokes</strong> (or loosen same-side) to pull the rim over without changing roundness.",
    difficulty: 'medium',
  },
  {
    id: 's_drive_side_spokes',
    topic: 'wheels',
    title: 'Repeat drive-side breaks',
    story: "A rider keeps breaking drive-side rear spokes on the same wheel — 3rd one this season.",
    question: "What's the most likely root cause?",
    kind: 'single',
    choices: [
      { text: 'Low overall tension — fatigue failures on the higher-tension side.', correct: true },
      { text: 'Chainline is off.', correct: false },
      { text: 'Rim is A-type instead of B-type.', correct: false },
      { text: 'Rider is too heavy for the rim depth.', correct: false },
    ],
    terms: ['spoke', 'dish (wheels)', 'rim'],
    why: "A dished rear wheel has much higher drive-side <strong>spoke</strong> tension than non-drive. If OVERALL tension is too low, the drive side still fatigues first because it's the loaded side. Raise <strong>rim</strong> tension across the board; drive-side breaks usually stop.",
    difficulty: 'hard',
  },
  {
    id: 's_aero_spoke_orient',
    topic: 'wheels',
    title: 'Aero spoke twist',
    story: "Building a wheel with bladed spokes. As you bring them to final tension, the blades are rotating out of line with the direction of travel.",
    question: "What do you do?",
    kind: 'single',
    choices: [
      { text: "Use a bladed-spoke holder and hold the spoke flat while tensioning.", correct: true },
      { text: "Tension harder — they'll settle flat.", correct: false },
      { text: "Replace with round spokes — bladed don't work in this rim.", correct: false },
      { text: "Switch to A-type rim.", correct: false },
    ],
    terms: ['bladed spoke', 'aero spoke', 'spoke'],
    why: "<strong>Bladed / aero spokes</strong> twist under torque from the nipple wrench. Without holding the blade, they spiral and lose their aerodynamic orientation. A bladed <strong>spoke</strong> holder immobilizes the flat portion while you turn the nipple.",
    difficulty: 'medium',
  },

  // ========== BOTTOM BRACKET / CUPS ==========
  {
    id: 's_cup_direction',
    topic: 'bb',
    title: 'Which cup is which?',
    story: "An English-thread loose-ball bottom bracket. You need to service it. Customer wants the non-drive side cup retorqued.",
    question: "Which cup is it, and what holds it?",
    kind: 'single',
    choices: [
      { text: 'Adjustable cup — held by a lockring against the frame.', correct: true },
      { text: 'Fixed cup — has no lockring.', correct: false },
      { text: 'Both threads are right-hand and need thread-locker.', correct: false },
      { text: 'Adapter cup — it converts square taper to splined.', correct: false },
    ],
    terms: ['adjustable cup', 'fixed cup', 'lockring', 'bottom bracket'],
    why: "Non-drive side of a serviceable <strong>bottom bracket</strong> = the <strong>adjustable cup</strong>, which you set for bearing play and then lock in place with a <strong>lockring</strong>. Drive side = the <strong>fixed cup</strong> (left-hand thread on English/BSA), which doesn't adjust.",
    difficulty: 'medium',
  },
  {
    id: 's_bb_adapter',
    topic: 'bb',
    title: 'Crankset won\'t fit frame',
    story: "A customer wants to install a 24mm-spindle crankset into a PF30 frame (42mm bore, 68mm wide).",
    question: "What do you need?",
    kind: 'single',
    choices: [
      { text: 'A bottom bracket adapter for 24mm spindle into PF30 shell.', correct: true },
      { text: 'A new crankset matching PF30.', correct: false },
      { text: 'Nothing — the shell tolerances will handle it.', correct: false },
      { text: 'A new frame.', correct: false },
    ],
    terms: ['adapter (bottom bracket)', 'bottom bracket', 'bottom bracket spindle'],
    why: "An <strong>adapter (bottom bracket)</strong> lets mismatched spindle and shell standards work together — that's literally its job. <strong>Bottom bracket spindle</strong> diameter and shell bore/width must be reconciled by the adapter's bearings and seats.",
    difficulty: 'medium',
  },
  {
    id: 's_bb_creak',
    topic: 'bb',
    title: 'Creak from the BB',
    story: "A pedaling creak, louder under load, seems to come from the bottom bracket area. You pull the crank — it's clean and torqued. Pedals are torqued.",
    question: "Which TWO should you check next?",
    kind: 'multi',
    requiredCorrect: 2,
    choices: [
      { text: 'Cup interfaces (grease, torque, adjustment).', correct: true },
      { text: 'Seatpost and saddle clamp (creaks transmit through frames).', correct: true },
      { text: 'Chain lubricant level.', correct: false },
      { text: 'Spoke tension.', correct: false },
      { text: 'Headset preload.', correct: false },
    ],
    terms: ['adjustable cup', 'fixed cup', 'bottom bracket'],
    why: "Creaks lie — the sound often isn't where it feels like. After ruling out crank & pedals, check <strong>bottom bracket</strong> cup interfaces (<strong>adjustable</strong> and <strong>fixed cup</strong>) for proper grease and torque, and always check the seatpost — it's a classic false-positive for BB creaks.",
    difficulty: 'hard',
  },

  // ========== BRAKES ==========
  {
    id: 's_disc_rub',
    topic: 'brakes',
    title: 'Disc brake rubs one side',
    story: "After a wheel swap, the disc rotor is rubbing against one pad. The rotor spins true on a truing stand.",
    question: "First fix to try?",
    kind: 'single',
    choices: [
      { text: "Loosen caliper bolts, squeeze lever firmly, retighten bolts in that position.", correct: true },
      { text: "True the rotor with a rotor truing tool.", correct: false },
      { text: "Bleed the system to equalize pistons.", correct: false },
      { text: "Replace the pads.", correct: false },
    ],
    terms: ['caliper', 'rotor (brake)'],
    why: "When the <strong>rotor (brake)</strong> spins true, the <strong>caliper</strong> is off-center. The self-aligning trick: loosen the caliper mount bolts, pull the lever to center the caliper on the rotor, hold, retorque. Works in most cases before you touch pistons.",
    difficulty: 'easy',
  },
  {
    id: 's_hydraulic_spongy',
    topic: 'brakes',
    title: 'Spongy lever',
    story: "A hydraulic brake lever pulls nearly to the bar and feels spongy. Pads and rotor look fine.",
    question: "What's required?",
    kind: 'single',
    choices: [
      { text: 'Bleed the system — air is in the hydraulic line.', correct: true },
      { text: 'Replace the pads — they\'re glazed.', correct: false },
      { text: 'Tighten the caliper bolts.', correct: false },
      { text: 'Recenter the rotor.', correct: false },
    ],
    terms: ['bleeding', 'bleed kit'],
    why: "Spongy = compressible air in the line. A <strong>bleed kit</strong> lets you push fluid through while purging bubbles — that's <strong>bleeding</strong>. Hydraulic fluid is nearly incompressible; air is very compressible.",
    difficulty: 'easy',
  },
  {
    id: 's_brake_contam',
    topic: 'brakes',
    title: 'Weak brakes after service',
    story: "After replacing pads and rotors, the customer says braking is worse than before. You notice a faint shiny glaze on the pads.",
    question: "What happened?",
    kind: 'single',
    choices: [
      { text: 'Pad contamination — likely oily fingers or chain lube overspray during install.', correct: true },
      { text: 'Pads installed backwards.', correct: false },
      { text: 'Wrong pad compound for the rotor material.', correct: false },
      { text: 'Bleed air in the line.', correct: false },
    ],
    terms: ['contamination', 'bed-in (disc brakes)', 'rotor (brake)'],
    why: "<strong>Contamination</strong> on new pads (oil, lube, skin oil) glazes during the first stops and kills bite. Fresh pads should also be <strong>bedded-in</strong> properly — a series of controlled stops that transfer pad material evenly onto the <strong>rotor (brake)</strong>.",
    difficulty: 'medium',
  },
  {
    id: 's_rim_brake_grab',
    topic: 'brakes',
    title: 'Rim brake grabs',
    story: "A rim brake grabs hard then releases, repeatedly, in each revolution. Rim surface looks OK.",
    question: "Where do you look?",
    kind: 'single',
    choices: [
      { text: 'Wheel roundness — a hop is bringing the rim in and out of the pads.', correct: true },
      { text: 'Brake cable — it\'s frayed internally.', correct: false },
      { text: 'Pad compound — wrong for this rim material.', correct: false },
      { text: 'Caliper spring — weak on one side.', correct: false },
    ],
    terms: ['rim brake', 'rim', 'truing'],
    why: "A cyclical grab-release on a <strong>rim brake</strong> is the <strong>rim</strong> going in and out of the pad as it rotates. That's a hop — radial <strong>truing</strong> corrects it.",
    difficulty: 'medium',
  },

  // ========== MEASUREMENT / TOLERANCE ==========
  {
    id: 's_accuracy_precision',
    topic: 'measurement',
    title: 'Accuracy vs precision',
    story: "You measure a hub axle three times: 10.1mm, 10.1mm, 10.1mm. Spec is 10.0mm ± 0.05mm.",
    question: "How do you characterize these measurements?",
    kind: 'single',
    choices: [
      { text: 'Precise but not accurate — the axle is out of spec.', correct: true },
      { text: 'Accurate but not precise.', correct: false },
      { text: 'Both accurate and precise.', correct: false },
      { text: 'Neither — the measurements are unreliable.', correct: false },
    ],
    terms: ['accuracy', 'precision'],
    why: "<strong>Precision</strong> = how tight your measurements cluster (three identical readings = very precise). <strong>Accuracy</strong> = how close they are to the true value (10.1 vs. spec 10.0 = off by 0.1mm, outside ±0.05mm tolerance). Precise but inaccurate — the axle is out of spec.",
    difficulty: 'medium',
  },
  {
    id: 's_torque_range',
    topic: 'measurement',
    title: 'Stem bolt torque',
    story: "Stem bolts spec 5Nm. You have a click-type torque wrench rated 10–50Nm.",
    question: "Can you use this wrench?",
    kind: 'single',
    choices: [
      { text: "No — 5Nm is below the wrench's accurate range. Use a smaller wrench.", correct: true },
      { text: "Yes — click-type wrenches extrapolate below their minimum.", correct: false },
      { text: "Yes — as long as you go slow.", correct: false },
      { text: "No — click-type wrenches are never used on stems.", correct: false },
    ],
    terms: ['torque', 'torque wrench - click (micrometer) type'],
    why: "A <strong>click-type torque wrench</strong> is <strong>accurate</strong> only in its rated range. Below minimum, the click mechanism isn't calibrated and you're guessing. 5Nm with a 10-50Nm wrench = uncalibrated territory. Use a wrench whose range includes 5Nm, typically a 2-10Nm beam or small click type.",
    difficulty: 'easy',
  },
  {
    id: 's_tolerance_fit',
    topic: 'measurement',
    title: 'Loose headset cup',
    story: "A headset cup with nominal 30.0mm OD measured at 29.97mm. Frame head tube ID is 30.00mm spec. The cup presses in easily — almost slides.",
    question: "What's the problem, in measurement terms?",
    kind: 'single',
    choices: [
      { text: 'Interference fit is lost — without enough material overlap, the cup won\'t stay seated.', correct: true },
      { text: 'The cup is too tight.', correct: false },
      { text: 'The head tube is too small.', correct: false },
      { text: 'Nothing — 30.00 and 29.97 are within normal tolerance.', correct: false },
    ],
    terms: ['allowance', 'headset bearing assembly', 'crown race'],
    why: "A press-fit relies on an interference <strong>allowance</strong> — the OD should be slightly LARGER than the ID so material compresses to grip. 29.97 into 30.00 is a slip fit, not interference. The <strong>headset bearing assembly</strong> will creep. Same principle applies to the <strong>crown race</strong> on the fork steerer.",
    difficulty: 'hard',
  },

  // ========== TIRES ==========
  {
    id: 's_tubeless_leak',
    topic: 'tires',
    title: 'Slow tubeless leak',
    story: "A tubeless tire has been losing ~15psi overnight for the last month. Customer says it was perfect for 6 months.",
    question: "Most likely cause?",
    kind: 'single',
    choices: [
      { text: 'Sealant has dried up — needs to be refreshed.', correct: true },
      { text: 'Rim tape has failed.', correct: false },
      { text: 'Bead is no longer seated.', correct: false },
      { text: 'Tire casing is worn through.', correct: false },
    ],
    terms: ['sealant', 'tubeless (tire)', 'tubeless (rim)'],
    why: "<strong>Sealant</strong> in a <strong>tubeless (tire)</strong> setup dries out in 3–6 months depending on climate. When fresh it self-seals small leaks; when dried, micro-porosity in the casing and the bead/<strong>tubeless (rim)</strong> interface loses its seal. Refresh first before chasing other causes.",
    difficulty: 'easy',
  },
  {
    id: 's_rim_tape_fail',
    topic: 'tires',
    title: 'New leak after a pump-up',
    story: "After inflating a tubeless tire to 85psi (rated 90psi max), it suddenly starts hissing loudly. Sealant sprays from near a spoke hole.",
    question: "What failed?",
    kind: 'single',
    choices: [
      { text: 'Rim tape — it blew off a spoke hole at high pressure.', correct: true },
      { text: 'The bead unseated.', correct: false },
      { text: 'The sealant is too thin.', correct: false },
      { text: 'The valve core loosened.', correct: false },
    ],
    terms: ['rim tape', 'rim strip', 'tubeless (rim)'],
    why: "<strong>Rim tape</strong> is the pressure seal over spoke holes on a <strong>tubeless (rim)</strong>. Marginal tape can hold at lower pressure but fail at the top of the range. Re-tape with proper tubeless tape (wider, stickier than a normal <strong>rim strip</strong>).",
    difficulty: 'medium',
  },

  // ========== BEARINGS / HEADSET ==========
  {
    id: 's_headset_play',
    topic: 'headset',
    title: 'Headset play',
    story: "Front brake on, rocking the bike forward-back reveals a knock from the headset. You tighten the top cap preload bolt — still knocks.",
    question: "What's likely next?",
    kind: 'single',
    choices: [
      { text: "Stem pinch bolts are still tight — loosen them before re-tightening the top cap.", correct: true },
      { text: "Replace the headset bearings immediately.", correct: false },
      { text: "Add a spacer below the stem.", correct: false },
      { text: "Grease the crown race.", correct: false },
    ],
    terms: ['headset bearing assembly', 'crown race'],
    why: "The top cap only preloads the <strong>headset bearing assembly</strong> when the stem pinch bolts are LOOSE. If they're tight, the top cap is pulling against a clamped stem and doing nothing. Loosen pinch → snug top cap → re-tighten pinch. If still loose, inspect the <strong>crown race</strong> seat.",
    difficulty: 'medium',
  },
  {
    id: 's_bearing_rough',
    topic: 'bearings',
    title: 'Rough after overhaul',
    story: "After a headset overhaul, the steering feels rough and notchy, especially in one position.",
    question: "Which TWO could cause this?",
    kind: 'multi',
    requiredCorrect: 2,
    choices: [
      { text: 'Over-tightened preload, compressing the bearings.', correct: true },
      { text: 'Brinelled (indented) bearing races from prior use.', correct: true },
      { text: 'Wrong grease type.', correct: false },
      { text: 'A-type rim mismatch.', correct: false },
      { text: 'Loose chainring bolts.', correct: false },
    ],
    terms: ['bearing', 'ball bearing', 'headset bearing assembly', 'bearing retainer'],
    why: "Rough-in-one-spot usually = indents in the race (brinelling) from a previous incident — even new <strong>ball bearings</strong> will feel notchy in those spots. Over-preload of the <strong>headset bearing assembly</strong> compresses the <strong>bearing</strong> balls/<strong>bearing retainer</strong>, also making it rough. Back off preload first; if still rough, inspect races.",
    difficulty: 'hard',
  },

  // ========== SHIFTING ELECTRONICS ==========
  {
    id: 's_eps_di2',
    topic: 'shifting',
    title: 'EPS vs Di2',
    story: "A customer says, \"My EPS is misbehaving.\"",
    question: "What brand are you working on?",
    kind: 'single',
    choices: [
      { text: "Campagnolo (EPS = Electronic Power Shift).", correct: true },
      { text: "Shimano (Di2).", correct: false },
      { text: "SRAM AXS.", correct: false },
      { text: "FSA K-Force WE.", correct: false },
    ],
    terms: ['eps (electronic power shift)', 'di2 (digital integrated intelligence)'],
    why: "<strong>EPS</strong> is Campagnolo's electronic group. <strong>Di2</strong> is Shimano's. Same category, different brands, different diagnostic tools. Always confirm the group before pulling out the wrong software.",
    difficulty: 'easy',
  },
  {
    id: 's_di2_adjust_mode',
    topic: 'shifting',
    title: 'Di2 micro-adjust',
    story: "A Di2 rear derailleur shifts fine up the cassette but is noisy (not skipping) in cogs 5–8.",
    question: "What's the procedure?",
    kind: 'single',
    choices: [
      { text: 'Enter Adjustment Mode and shift in the micro-increments to align the derailleur.', correct: true },
      { text: 'Bleed the system.', correct: false },
      { text: 'Adjust the barrel adjuster on the housing.', correct: false },
      { text: 'Replace the derailleur cable.', correct: false },
    ],
    terms: ['adjustment mode', 'di2 (digital integrated intelligence)'],
    why: "Electronic systems don't have cable tension — they have <strong>adjustment mode</strong> where you step the derailleur position in fractions of a millimeter to center it on the cogs. Noise without skipping = slightly off alignment, the whole reason adjustment mode exists.",
    difficulty: 'medium',
  },

  // ========== STEM / COCKPIT ==========
  {
    id: 's_quill_threaded',
    topic: 'cockpit',
    title: 'Vintage stem',
    story: "A customer brings in a 1980s road bike for a stem replacement. The fork steerer is threaded and 1-inch diameter.",
    question: "What type of stem do you need?",
    kind: 'single',
    choices: [
      { text: "A quill stem — wedges inside the steerer tube.", correct: true },
      { text: "A threadless stem — clamps the outside of the steerer.", correct: false },
      { text: "Either type works on threaded steerers.", correct: false },
      { text: "A press-fit stem with a crown race spacer.", correct: false },
    ],
    terms: ['quill'],
    why: "Threaded (quill) headsets require a <strong>quill</strong> stem — a vertical post that inserts into the steerer with an internal wedge/bolt. Threadless stems clamp OUTSIDE a threadless steerer — different system entirely, not interchangeable.",
    difficulty: 'easy',
  },
];

// V5: rephrased prompts per scenario id. Renderer picks one each appearance.
// Two variants per scenario = three total wordings (original + 2 variants).
const SCENARIO_VARIANTS_V5 = {
  's_chain_bigbig': [
    "Which TWO components are most likely the source of the skip?",
    "Pick the TWO factors most consistent with this symptom pattern.",
  ],
  's_freewheel_or_cassette': [
    "What system is this, and which removal tool will you reach for?",
    "Identify the system and name the correct tool.",
  ],
  's_ghost_shift': [
    "What's the single most likely root cause here?",
    "Which adjustment failure best explains this behavior?",
  ],
  's_chain_drop_inside': [
    "Which limit screw correction fixes this?",
    "What single adjustment will keep the chain from over-shifting inward?",
  ],
  's_chain_suck': [
    "Pick the TWO conditions most often behind chain suck.",
    "Which TWO factors should you suspect first on this complaint?",
  ],
  's_cable_stretch': [
    "Which TWO root causes are you most likely chasing?",
    "Pick TWO — what's typically going on after this much riding?",
  ],
  's_btension': [
    "Which adjustment is the most likely fix?",
    "What's the single screw most likely to clear this up?",
  ],
  's_wobble_true': [
    "Which TWO things are you adjusting first, in order?",
    "Pick the TWO actions to attack this in proper sequence.",
  ],
  's_brake_pulse': [
    "What is the most likely cause of the pulse?",
    "Which single source best explains the repeating brake feel?",
  ],
  's_ab_type_rim': [
    "What does this rim profile mean for tire choice and pressure?",
    "How does this rim shape change your tire and pressure call?",
  ],
  's_dish': [
    "What does correct dish actually mean here?",
    "Which statement correctly describes a properly dished wheel?",
  ],
  's_drive_side_spokes': [
    "Why is the drive-side tension higher than non-drive on a typical rear wheel?",
    "What makes drive-side tension run hotter than non-drive on the rear?",
  ],
  's_aero_spoke_orient': [
    "Which orientation gives the lowest drag on a bladed spoke?",
    "How should bladed spokes face for cleanest aero flow?",
  ],
  's_cup_direction': [
    "Which cup unscrews CLOCKWISE on most threaded English BBs?",
    "On a standard English-threaded BB, which cup is reverse-threaded?",
  ],
  's_bb_adapter': [
    "What's the cleanest correct route to mount this crankset?",
    "Which option preserves spec without warranty risk?",
  ],
  's_bb_creak': [
    "Which TWO causes deserve a torque-and-grease check first?",
    "Pick the TWO interfaces most worth re-prepping before deeper diagnosis.",
  ],
  's_disc_rub': [
    "Which TWO causes are you investigating first?",
    "Pick TWO root causes that match this symptom pattern.",
  ],
  's_hydraulic_spongy': [
    "What's the corrective procedure?",
    "Which service does the lever feel point you toward?",
  ],
  's_brake_contam': [
    "What's the correct remediation?",
    "Which fix actually restores stopping power here?",
  ],
  's_rim_brake_grab': [
    "Pick the TWO most probable culprits.",
    "Which TWO factors are most likely producing this grab?",
  ],
  's_accuracy_precision': [
    "Which statement correctly distinguishes accuracy from precision?",
    "How would you explain accuracy vs. precision on a torque tool?",
  ],
  's_torque_range': [
    "Which statement is true about torque-spec ranges?",
    "How should the printed spec range be interpreted?",
  ],
  's_tolerance_fit': [
    "Which fit is appropriate, and why?",
    "Which tolerance call matches a press-in cup correctly?",
  ],
  's_tubeless_leak': [
    "Pick the TWO most likely sources of the slow loss.",
    "Which TWO leak paths should top your check-list?",
  ],
  's_rim_tape_fail': [
    "What is the right diagnosis and remediation?",
    "Which fix matches what's actually failing here?",
  ],
  's_headset_play': [
    "What's the correct adjustment sequence?",
    "Which order of operations actually fixes this?",
  ],
  's_bearing_rough': [
    "What's the cleanest path forward — replace, repack, or live with it?",
    "Which call matches industry guidance on this bearing condition?",
  ],
  's_eps_di2': [
    "Which TWO statements correctly describe EPS vs Di2?",
    "Pick TWO — what's actually true across these systems?",
  ],
  's_di2_adjust_mode': [
    "What does \"adjust mode\" let you do?",
    "Which capability matches Di2's adjust mode correctly?",
  ],
  's_quill_threaded': [
    "Which stem matches a threaded headset?",
    "Pick the stem style that pairs with a threaded steerer.",
  ],
};

// Inject variants onto the scenario objects so the runtime can find them.
(function injectScenarioVariants() {
  for (const s of window.SCENARIOS_V3) {
    if (SCENARIO_VARIANTS_V5[s.id]) s.variants = SCENARIO_VARIANTS_V5[s.id];
  }
})();

// Helper: lookup scenarios by topic
window.SCENARIOS_BY_TOPIC = (function () {
  const m = {};
  for (const s of window.SCENARIOS_V3) {
    if (!m[s.topic]) m[s.topic] = [];
    m[s.topic].push(s);
  }
  return m;
})();
