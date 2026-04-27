/* UBI Tune-Up v5 — Wrench Path: multi-step diagnostic chains.
 *
 * Each chain is a directed graph of diagnostic steps. The learner picks an
 * answer; the choice's `next` points to the step that follows. Wrong choices
 * still continue (chain teaches the right reasoning) but cost the chain
 * "wrong-step" XP penalty.
 *
 * Format:
 *   chain.id              unique
 *   chain.title           short label
 *   chain.story           customer/symptom statement
 *   chain.topic           drivetrain | brakes | wheels | fit | hydraulic
 *   chain.terms           glossary termLower strings — mastery credit on success
 *   chain.steps           step graph keyed by stepId
 *
 * Each step:
 *   prompt   the question text
 *   kind     'single' | 'multi'        (multi requires requiredCorrect picks)
 *   requiredCorrect  for multi
 *   choices  [{ text, correct, next, teach? }]
 *               correct: did this contribute to the proper diagnosis path?
 *               next:    stepId to render after picking this choice
 *               teach:   short remediation note shown when this is a wrong pick
 *   end      true if reaching this step ends the chain
 *
 *   The starting stepId is always 'start'.
 */
(function () {
  'use strict';

  const CHAINS = [
    // ============== DRIVETRAIN ==============
    {
      id: 'wp_bigbig_skip',
      title: 'Big-big chain skip',
      topic: 'drivetrain',
      story: "Customer says the chain skips under load — but only in the big-ring/big-cog combination. They've ridden ~3,500 miles on this chain.",
      terms: ['chainline', 'cassette', 'chain stretch', 'chain'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Most-likely subsystem behind this complaint?',
          kind: 'single',
          choices: [
            { text: 'Drivetrain', correct: true, next: 'first_test' },
            { text: 'Wheel / hub', correct: false, next: 'first_test', teach: 'Wheel-side noise tends to change with speed, not load. Big-big specifically points drivetrain.' },
            { text: 'Brake system', correct: false, next: 'first_test', teach: 'Brakes drag, they don\'t skip cogs. Drivetrain.' },
            { text: 'Frame / hanger', correct: false, next: 'first_test', teach: 'A bent hanger affects shifting accuracy, not skipping under load. Drivetrain first.' },
          ],
        },
        first_test: {
          prompt: 'Step 2 of 3 — First non-destructive test to run?',
          kind: 'single',
          choices: [
            { text: '12-link chain stretch check', correct: true, next: 'verdict_chainpass' },
            { text: 'Replace cassette without testing', correct: false, next: 'verdict_chainpass', teach: 'Always measure before replacing. The chain is the cheapest part — check it first.' },
            { text: 'Re-tension the rear derailleur cable', correct: false, next: 'verdict_chainpass', teach: 'Cable tension is shifting precision; not the cause when the symptom is load-only skipping.' },
            { text: 'Adjust B-tension screw', correct: false, next: 'verdict_chainpass', teach: 'B-tension affects shift quality, not load-induced skip in big-big.' },
          ],
        },
        verdict_chainpass: {
          prompt: 'Step 3 of 3 — The chain measures within tolerance (passes 12-link). Now what?',
          kind: 'single',
          choices: [
            { text: 'Inspect cassette wear (especially the big cog teeth profile)', correct: true, next: 'end_correct' },
            { text: 'Replace the chain anyway', correct: false, next: 'end_wrong', teach: 'A passing chain on a worn cassette is the *exact* setup that produces big-big skip. Look at the cog teeth.' },
            { text: 'Replace the freehub body', correct: false, next: 'end_wrong', teach: 'Freehub failure pawl-skips audibly on coast, not under-load on a specific cog combo.' },
            { text: 'Re-true the rear wheel', correct: false, next: 'end_wrong', teach: 'A wobbly wheel doesn\'t skip cogs; this is drivetrain wear.' },
          ],
        },
        end_correct: { end: true, summary: 'Cassette is the suspect. Hooked teeth on the big cog let a slightly stretched chain seat fine but lift under load.' },
        end_wrong: { end: true, summary: 'The path is: chain passes → cassette is the next suspect because chainline + load shows wear there first.' },
      },
    },

    {
      id: 'wp_ghost_shift',
      title: 'Ghost shifting on bumps',
      topic: 'drivetrain',
      story: "Customer: \"My rear shifts on its own when I hit bumps.\" Cable is new, hanger is true, shifts crisply on the stand.",
      terms: ['barrel adjuster', 'derailleur cable', 'derailleur'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Crisp on the stand, ghost shifts on the road. What does that pattern most strongly indicate?',
          kind: 'single',
          choices: [
            { text: 'Indexing is on a click boundary — vibration nudges it across', correct: true, next: 'tool' },
            { text: 'Derailleur spring is too weak', correct: false, next: 'tool', teach: 'A weak spring would also fail on the stand under cable pull, not only on bumps.' },
            { text: 'Chain is stretched', correct: false, next: 'tool', teach: 'A stretched chain causes skip under load, not load-independent ghost shifts.' },
            { text: 'Cable housing is too long and absorbs bump shock', correct: false, next: 'tool', teach: 'Long housing dulls shifting, but ghost-shifting on bumps is an indexing-boundary problem.' },
          ],
        },
        tool: {
          prompt: 'Step 2 of 3 — Which tool/control do you reach for FIRST?',
          kind: 'single',
          choices: [
            { text: 'Barrel adjuster — quarter-turn either direction', correct: true, next: 'finish' },
            { text: 'Cable cutters — replace the cable', correct: false, next: 'finish', teach: 'You just installed the cable. Adjust before replacing.' },
            { text: 'Hanger gauge — check alignment', correct: false, next: 'finish', teach: 'Hanger is already verified true.' },
            { text: 'Allen key on the limit screws', correct: false, next: 'finish', teach: 'Limits cap derailleur travel, not indexing precision between gears.' },
          ],
        },
        finish: {
          prompt: 'Step 3 of 3 — After your barrel-adjuster turn, how do you confirm the fix?',
          kind: 'single',
          choices: [
            { text: 'Test under shifting load AND bump-style hand shock; cycle through the cassette', correct: true, next: 'end_correct' },
            { text: 'Spin the cranks on the stand only', correct: false, next: 'end_wrong', teach: 'On-stand testing missed it the first time. Recreate road conditions.' },
            { text: 'Retorque the rear derailleur bolt', correct: false, next: 'end_wrong', teach: 'Torque on the b-bolt isn\'t the variable here.' },
            { text: 'Lubricate the chain heavily', correct: false, next: 'end_wrong', teach: 'Lube doesn\'t change indexing precision.' },
          ],
        },
        end_correct: { end: true, summary: 'Indexing → barrel adjuster → road-condition test. That\'s the loop for ghost-shift complaints.' },
        end_wrong: { end: true, summary: 'The path is: identify the indexing boundary → small barrel-adjuster correction → re-test under load AND bump shock.' },
      },
    },

    {
      id: 'wp_chain_drop_inside',
      title: 'Chain drops inside on downshift',
      topic: 'drivetrain',
      story: "Customer drops the chain to the inside off the small chainring when shifting down quickly under load.",
      terms: ['chainring', 'derailleur'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Which derailleur control caps how far the chain can swing INWARD?',
          kind: 'single',
          choices: [
            { text: 'Inner (low) limit screw on the front derailleur', correct: true, next: 'direction' },
            { text: 'Outer (high) limit screw on the front derailleur', correct: false, next: 'direction', teach: 'High limit caps OUTBOARD travel — the wrong direction here.' },
            { text: 'Cable barrel adjuster', correct: false, next: 'direction', teach: 'Barrel adjusters set indexing tension, not travel limits.' },
            { text: 'B-tension screw on rear derailleur', correct: false, next: 'direction', teach: 'B-tension is rear-derailleur, not relevant to a front-side drop.' },
          ],
        },
        direction: {
          prompt: 'Step 2 of 3 — Which direction do you turn the inner limit screw?',
          kind: 'single',
          choices: [
            { text: 'Tighten (clockwise) — reduces inboard travel', correct: true, next: 'verify' },
            { text: 'Loosen (counter-clockwise) — increases inboard travel', correct: false, next: 'verify', teach: 'Loosening the limit screw lets the cage swing FURTHER toward the frame — exactly what you don\'t want.' },
            { text: 'Quarter-turn either way — direction doesn\'t matter', correct: false, next: 'verify', teach: 'Direction matters: tightening reduces travel; loosening increases it.' },
            { text: 'Adjust until the screw is flush with the cage', correct: false, next: 'verify', teach: 'Set position empirically by watching the cage. There\'s no flush spec.' },
          ],
        },
        verify: {
          prompt: 'Step 3 of 3 — How do you verify the fix without dropping the chain again?',
          kind: 'single',
          choices: [
            { text: 'Shift down repeatedly under simulated load; visually confirm cage clears the small ring without going past it', correct: true, next: 'end_correct' },
            { text: 'Spin only — no need to load', correct: false, next: 'end_wrong', teach: 'The drop happens under load. Replicate it.' },
            { text: 'Replace the chain', correct: false, next: 'end_wrong', teach: 'The chain isn\'t the problem; the limit is.' },
            { text: 'Check chain stretch first', correct: false, next: 'end_wrong', teach: 'Stretch isn\'t why it drops INSIDE — that\'s a limit-travel issue.' },
          ],
        },
        end_correct: { end: true, summary: 'Limit screw → tighten → load test. The cage now stops at the small chainring instead of swinging past.' },
        end_wrong: { end: true, summary: 'The path: inner limit screw → tighten → re-test under load. Always under load — that\'s when it dropped originally.' },
      },
    },

    {
      id: 'wp_btension_problem',
      title: 'Big cog rub on rear derailleur',
      topic: 'drivetrain',
      story: "On the largest rear cog, the chain rubs the upper jockey wheel against the cog. Smaller cogs are fine.",
      terms: ['derailleur', 'cassette'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Which adjustment controls the gap between the upper jockey wheel and the cogs?',
          kind: 'single',
          choices: [
            { text: 'B-tension screw', correct: true, next: 'turn' },
            { text: 'Cable tension at the barrel adjuster', correct: false, next: 'turn', teach: 'Cable tension affects indexing, not jockey-wheel gap.' },
            { text: 'High limit screw', correct: false, next: 'turn', teach: 'Limit screws cap lateral travel, not vertical jockey gap.' },
            { text: 'Hanger angle', correct: false, next: 'turn', teach: 'Hanger angle affects shift quality but the B-screw is the gap-specific control.' },
          ],
        },
        turn: {
          prompt: 'Step 2 of 3 — Chain rubs the BIG cog. Which way do you turn the B-screw?',
          kind: 'single',
          choices: [
            { text: 'Tighten — pushes the jockey wheel further from the cog', correct: true, next: 'check' },
            { text: 'Loosen — brings the jockey wheel closer to the cog', correct: false, next: 'check', teach: 'Looser B brings the jockey nearer, increasing the rub.' },
            { text: 'Doesn\'t matter — set to mid-range', correct: false, next: 'check', teach: 'Direction matters when symptom is rub on the largest cog.' },
            { text: 'Remove the screw entirely', correct: false, next: 'check', teach: 'Don\'t remove derailleur hardware; just adjust.' },
          ],
        },
        check: {
          prompt: 'Step 3 of 3 — How much gap should you set between the upper jockey and the largest cog tooth?',
          kind: 'single',
          choices: [
            { text: '5–6mm with chain on the largest cog (typical spec; varies by manufacturer)', correct: true, next: 'end_correct' },
            { text: 'As tight as possible without touching', correct: false, next: 'end_wrong', teach: 'Too-tight a B-tension setting hurts shift quality elsewhere on the cassette.' },
            { text: '1cm — same as front derailleur cage gap', correct: false, next: 'end_wrong', teach: 'Front derailleur spec doesn\'t apply here.' },
            { text: 'Whatever feels right — no spec', correct: false, next: 'end_wrong', teach: 'Manufacturers publish a B-tension spec; check the spec card.' },
          ],
        },
        end_correct: { end: true, summary: 'B-tension → tighten → set to spec gap. Fixes upper-jockey rub on the largest cog.' },
        end_wrong: { end: true, summary: 'The path: B-tension is the gap control → tighten to push the jockey out → set to manufacturer spec (typ. 5–6mm).' },
      },
    },

    // ============== BRAKES ==============
    {
      id: 'wp_brake_pulse',
      title: 'Disc brake pulse',
      topic: 'brakes',
      story: "Customer reports a regular pulse through the brake lever once per wheel rotation under steady braking. The pad surface looks even.",
      terms: ['brake rotor', 'caliper', 'wheel truth'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Once-per-rotation pulse with even pads — what should you check first?',
          kind: 'single',
          choices: [
            { text: 'Rotor straightness (true)', correct: true, next: 'tool' },
            { text: 'Pad bedding-in', correct: false, next: 'tool', teach: 'Bed-in irregularities cause uneven feel but rarely a clean once-per-rotation pulse.' },
            { text: 'Brake fluid color', correct: false, next: 'tool', teach: 'Fluid affects lever feel/sponginess, not periodic pulse.' },
            { text: 'Wheel bearing preload', correct: false, next: 'tool', teach: 'Bearing play wobbles, but rotor warp is the textbook once-per-rotation cause.' },
          ],
        },
        tool: {
          prompt: 'Step 2 of 3 — Which tool/method do you use to confirm rotor warp?',
          kind: 'single',
          choices: [
            { text: 'Spin the wheel and sight the rotor through the caliper window or use a rotor truing fork against the gauge', correct: true, next: 'fix' },
            { text: 'Magnet on the rotor — measures runout', correct: false, next: 'fix', teach: 'Rotor steel isn\'t reliably ferrous for a magnet-based gauge.' },
            { text: 'Sound test — listen for ticking', correct: false, next: 'fix', teach: 'Audible only confirms contact, not where or how far.' },
            { text: 'Replace the rotor without measuring', correct: false, next: 'fix', teach: 'Measure first; replacement before measurement is wasteful.' },
          ],
        },
        fix: {
          prompt: 'Step 3 of 3 — Rotor confirms a small lateral wobble. What\'s the next call?',
          kind: 'single',
          choices: [
            { text: 'True the rotor with a rotor truing fork; replace if warp is severe', correct: true, next: 'end_correct' },
            { text: 'Sand the pads', correct: false, next: 'end_wrong', teach: 'Pad sanding doesn\'t fix a warped rotor.' },
            { text: 'Tighten the caliper bolts maximally', correct: false, next: 'end_wrong', teach: 'Caliper torque is unrelated to rotor straightness.' },
            { text: 'Bleed the system', correct: false, next: 'end_wrong', teach: 'Bleed addresses lever feel, not periodic pulse from a warped rotor.' },
          ],
        },
        end_correct: { end: true, summary: 'Rotor → measure runout → true with a fork or replace if outside tolerance.' },
        end_wrong: { end: true, summary: 'The path: confirm rotor warp visually → true with a fork → replace if too far gone.' },
      },
    },

    {
      id: 'wp_hydraulic_spongy',
      title: 'Spongy hydraulic lever',
      topic: 'hydraulic',
      story: "Hydraulic disc lever feels spongy and pulls almost to the bar before braking. No visible leak. Pad wear normal.",
      terms: ['brake bleed', 'hydraulic', 'caliper'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Which condition most likely produces a spongy lever?',
          kind: 'single',
          choices: [
            { text: 'Air in the hydraulic line', correct: true, next: 'service' },
            { text: 'Pad glaze', correct: false, next: 'service', teach: 'Glaze affects power, not lever travel/feel.' },
            { text: 'Cable stretch', correct: false, next: 'service', teach: 'There is no cable in a hydraulic system.' },
            { text: 'Loose caliper mounting bolts', correct: false, next: 'service', teach: 'Loose caliper would shift, not feel spongy.' },
          ],
        },
        service: {
          prompt: 'Step 2 of 3 — What\'s the correct service?',
          kind: 'single',
          choices: [
            { text: 'Bleed the brake', correct: true, next: 'fluid' },
            { text: 'Replace the pads', correct: false, next: 'fluid', teach: 'Pads are normal; the issue is hydraulic.' },
            { text: 'Replace the rotor', correct: false, next: 'fluid', teach: 'Rotor doesn\'t affect lever feel like this.' },
            { text: 'Lubricate the lever pivot', correct: false, next: 'fluid', teach: 'Pivot drag changes return, not sponginess.' },
          ],
        },
        fluid: {
          prompt: 'Step 3 of 3 — Which fluid do you use, and how do you confirm the system?',
          kind: 'single',
          choices: [
            { text: 'Use the manufacturer-specified fluid (DOT or mineral oil — never mix). Verify firm lever after bleed.', correct: true, next: 'end_correct' },
            { text: 'Whichever is on the shelf — DOT and mineral oil are interchangeable', correct: false, next: 'end_wrong', teach: 'NEVER mix DOT and mineral oil — they destroy each other\'s seals. Always match the system.' },
            { text: 'Engine oil — same lubricity', correct: false, next: 'end_wrong', teach: 'Engine oil is not a brake fluid. Use spec only.' },
            { text: 'Water — cheap and available', correct: false, next: 'end_wrong', teach: 'Water has zero compressibility tolerance and corrodes seals.' },
          ],
        },
        end_correct: { end: true, summary: 'Air → bleed → match the manufacturer-spec fluid (DOT vs mineral oil; never mix).' },
        end_wrong: { end: true, summary: 'The path: identify air → bleed → use only the spec fluid for that system.' },
      },
    },

    {
      id: 'wp_brake_contam',
      title: 'Disc brake howl + low power',
      topic: 'brakes',
      story: "After a chain-lube job, customer reports brakes howl and stopping power has dropped sharply. Pads are not worn out.",
      terms: ['brake pad', 'contamination'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — What most likely happened during the lube job?',
          kind: 'single',
          choices: [
            { text: 'Chain lube/spray contaminated the pads or rotor', correct: true, next: 'fix' },
            { text: 'The chain became too clean', correct: false, next: 'fix', teach: 'A clean chain doesn\'t cause brake howl.' },
            { text: 'The bottom bracket loosened', correct: false, next: 'fix', teach: 'BB issues don\'t change brake feel.' },
            { text: 'The spokes detensioned', correct: false, next: 'fix', teach: 'Wheel tension doesn\'t affect pad bite.' },
          ],
        },
        fix: {
          prompt: 'Step 2 of 3 — What\'s the correct fix for contaminated pads?',
          kind: 'single',
          choices: [
            { text: 'Replace pads; degrease rotor with appropriate cleaner; sand rotor surface lightly if needed', correct: true, next: 'prevent' },
            { text: 'Just clean the pads with brake cleaner', correct: false, next: 'prevent', teach: 'Pads are porous — once contaminated, they\'re typically unrecoverable. Replace.' },
            { text: 'Run the brakes hot to burn off the lube', correct: false, next: 'prevent', teach: 'Heat-baking contamination drives it deeper into the pad. Replace.' },
            { text: 'Apply more lube to the pads', correct: false, next: 'prevent', teach: 'That\'s the opposite of what\'s needed.' },
          ],
        },
        prevent: {
          prompt: 'Step 3 of 3 — What\'s the prevention going forward?',
          kind: 'single',
          choices: [
            { text: 'Mask or remove the wheel/rotor when lubricating; use precision applicators not aerosols near brakes', correct: true, next: 'end_correct' },
            { text: 'Use only WD-40 on the chain', correct: false, next: 'end_wrong', teach: 'WD-40 is a poor chain lube AND a contamination risk. Use a proper chain lube.' },
            { text: 'Wash the bike with a pressure washer afterward', correct: false, next: 'end_wrong', teach: 'Pressure washing pushes water past seals; doesn\'t solve contamination.' },
            { text: 'Switch to bigger rotors', correct: false, next: 'end_wrong', teach: 'Rotor size doesn\'t prevent contamination.' },
          ],
        },
        end_correct: { end: true, summary: 'Contamination → replace pads + degrease rotor → mask brakes during chain service next time.' },
        end_wrong: { end: true, summary: 'The path: contamination → replace pads + clean rotor → prevent by masking the rotor during chain lube work.' },
      },
    },

    // ============== WHEELS ==============
    {
      id: 'wp_wheel_wobble',
      title: 'Visible wheel wobble',
      topic: 'wheels',
      story: "A wheel wobbles laterally about 3mm at one section. The hub spins smoothly with no play.",
      terms: ['truing', 'spoke tension', 'rim'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Hub is fine, rim has lateral wobble. What\'s the right diagnosis frame?',
          kind: 'single',
          choices: [
            { text: 'Wheel truing — uneven spoke tension on the wobble side', correct: true, next: 'tool' },
            { text: 'Rim is bent and unfixable', correct: false, next: 'tool', teach: 'Most lateral wobble is recoverable through truing unless the rim shows cracks or hard impact damage.' },
            { text: 'Hub bearings need replacement', correct: false, next: 'tool', teach: 'Hub spins clean — bearings aren\'t the cause.' },
            { text: 'Spokes are too long', correct: false, next: 'tool', teach: 'Spoke length is set at build; it doesn\'t cause spot wobble.' },
          ],
        },
        tool: {
          prompt: 'Step 2 of 3 — Which adjustment do you make at the wobble point?',
          kind: 'single',
          choices: [
            { text: 'Loosen spokes on the side the rim is pulled TOWARD; tighten on the opposite side; small turns', correct: true, next: 'verify' },
            { text: 'Tighten all spokes equally', correct: false, next: 'verify', teach: 'Equal tightening doesn\'t fix lateral wobble; you need side-specific correction.' },
            { text: 'Loosen all spokes equally', correct: false, next: 'verify', teach: 'Releases tension globally; doesn\'t correct the side-to-side.' },
            { text: 'Replace the rim', correct: false, next: 'verify', teach: 'Try truing first — most wobbles correct with small turns.' },
          ],
        },
        verify: {
          prompt: 'Step 3 of 3 — How do you finish the truing job correctly?',
          kind: 'single',
          choices: [
            { text: 'Stress-relieve the spokes (squeeze pairs), check both lateral and radial true, verify dish, ride-test', correct: true, next: 'end_correct' },
            { text: 'Stop as soon as lateral is gone — radial doesn\'t matter', correct: false, next: 'end_wrong', teach: 'A wheel needs both lateral AND radial to be in spec. And dish.' },
            { text: 'Use a torque wrench on the spokes', correct: false, next: 'end_wrong', teach: 'Spoke nipple tension is set with a tensiometer + truing stand, not a torque wrench.' },
            { text: 'Tighten the QR/thru-axle as far as possible', correct: false, next: 'end_wrong', teach: 'Axle clamp force doesn\'t fix wheel truth.' },
          ],
        },
        end_correct: { end: true, summary: 'Lateral truing → side-specific spoke turns → stress-relieve → verify lateral, radial, dish.' },
        end_wrong: { end: true, summary: 'The path: targeted spoke turns at the wobble → stress relief → final pass on lateral, radial, dish.' },
      },
    },

    {
      id: 'wp_tubeless_wont_seat',
      title: 'Tubeless tire won\'t seat',
      topic: 'wheels',
      story: "You\'re mounting a fresh tubeless tire. The tire goes on, sealant goes in, but the bead won\'t pop onto the bead seat — even with a high-volume inflator burst.",
      terms: ['tubeless', 'bead', 'rim'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Most likely root cause when a tubeless tire won\'t seat with a burst inflator?',
          kind: 'single',
          choices: [
            { text: 'Tire bead isn\'t in the rim\'s center channel during inflation', correct: true, next: 'second' },
            { text: 'The rim is too narrow for any tubeless setup', correct: false, next: 'second', teach: 'A real width mismatch is the second-most common cause, but bead-in-channel is THE first thing to check.' },
            { text: 'Sealant is the wrong brand', correct: false, next: 'second', teach: 'Sealant doesn\'t affect bead seating force.' },
            { text: 'You used too much sealant', correct: false, next: 'second', teach: 'Excess sealant is messy; it doesn\'t prevent seating.' },
          ],
        },
        second: {
          prompt: 'Step 2 of 3 — You walk the bead all around into the center channel. Still won\'t seat. What\'s next?',
          kind: 'single',
          choices: [
            { text: 'Soapy water on the bead, re-burst with high-volume inflator', correct: true, next: 'last' },
            { text: 'Switch to a track pump, no soap', correct: false, next: 'last', teach: 'Track pumps rarely produce the burst volume needed; soap helps the bead slip onto the seat.' },
            { text: 'Add a tube, then remove it once seated', correct: false, next: 'last', teach: 'This works as a last resort but isn\'t the next step after walking the bead in.' },
            { text: 'Heat the tire', correct: false, next: 'last', teach: 'Heat is rarely necessary and risks damaging the tire.' },
          ],
        },
        last: {
          prompt: 'Step 3 of 3 — Even with soap, it still won\'t seat. What does this likely mean?',
          kind: 'single',
          choices: [
            { text: 'Width compatibility issue or stretched bead — verify the tire/rim ETRTO match', correct: true, next: 'end_correct' },
            { text: 'Sealant is dried out — replace it', correct: false, next: 'end_wrong', teach: 'Sealant freshness affects sealing, not seating force.' },
            { text: 'The valve stem is too short', correct: false, next: 'end_wrong', teach: 'Valve stem length affects pumping access, not bead seating.' },
            { text: 'Add 30+ psi above the printed max', correct: false, next: 'end_wrong', teach: 'Going past max PSI is a blowout / rim-damage risk. Don\'t.' },
          ],
        },
        end_correct: { end: true, summary: 'Bead in channel → soap + burst → if still no seat, suspect ETRTO mismatch or stretched bead.' },
        end_wrong: { end: true, summary: 'The path: walk the bead in → soap + burst → if it still won\'t seat, recheck width compatibility, never overpressurize.' },
      },
    },

    // ============== FIT ==============
    {
      id: 'wp_headset_play',
      title: 'Headset knock',
      topic: 'fit',
      story: "Standing over the bike, the customer reports a knock when rolling forward and squeezing the front brake.",
      terms: ['headset', 'stem', 'top cap'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — What does the brake-squeeze rocking test localize?',
          kind: 'single',
          choices: [
            { text: 'Headset bearing play or preload', correct: true, next: 'sequence' },
            { text: 'Front wheel bearing', correct: false, next: 'sequence', teach: 'Wheel bearing play would also rock laterally; brake-squeeze + roll specifically points at the headset.' },
            { text: 'Loose handlebar clamp', correct: false, next: 'sequence', teach: 'Bar clamp issues feel like rotation, not fore-aft knock.' },
            { text: 'Bottom bracket play', correct: false, next: 'sequence', teach: 'BB issues felt at the cranks, not at the bars.' },
          ],
        },
        sequence: {
          prompt: 'Step 2 of 3 — Threadless headset adjustment. What\'s the correct sequence?',
          kind: 'single',
          choices: [
            { text: 'Loosen stem clamp bolts → set top cap preload → re-torque stem clamp bolts', correct: true, next: 'check' },
            { text: 'Tighten the top cap to spec; ignore the stem bolts', correct: false, next: 'check', teach: 'If the stem clamp is tight, the top cap can\'t preload the bearings.' },
            { text: 'Tighten everything to max torque all at once', correct: false, next: 'check', teach: 'Order matters — preload before clamping the stem.' },
            { text: 'Remove the top cap, ride to feel', correct: false, next: 'check', teach: 'The top cap is the preload control; you need it.' },
          ],
        },
        check: {
          prompt: 'Step 3 of 3 — How do you check that you set preload correctly?',
          kind: 'single',
          choices: [
            { text: 'No knock with brake-squeeze rock; bars rotate freely with no drag', correct: true, next: 'end_correct' },
            { text: 'Bars have noticeable drag', correct: false, next: 'end_wrong', teach: 'Drag means too much preload; back the top cap off slightly.' },
            { text: 'Top cap bolt feels tight', correct: false, next: 'end_wrong', teach: 'The top cap should be just past finger-tight in most setups, not heavily torqued.' },
            { text: 'Bike rolls in a straight line hands-free', correct: false, next: 'end_wrong', teach: 'Headset preload doesn\'t determine straight-line tracking.' },
          ],
        },
        end_correct: { end: true, summary: 'Loosen stem → preload via top cap → torque stem → verify with brake-squeeze rock + free bar rotation.' },
        end_wrong: { end: true, summary: 'The path: stem bolts loose → top cap preloads → re-torque stem → verify no rock and free turn.' },
      },
    },

    {
      id: 'wp_quill_threadless',
      title: 'Stem and steerer mismatch',
      topic: 'fit',
      story: "Customer brings in a vintage road bike with a threaded headset. They picked up a modern threadless stem online and want it installed.",
      terms: ['quill stem', 'threadless stem', 'headset'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Threaded headset vs threadless stem. Are they compatible?',
          kind: 'single',
          choices: [
            { text: 'No — threaded headsets need a quill stem (internal wedge); threadless clamps the steerer externally', correct: true, next: 'options' },
            { text: 'Yes — they\'re cross-compatible with an adapter', correct: false, next: 'options', teach: 'They\'re fundamentally different systems. Adapters exist but aren\'t universal.' },
            { text: 'Yes — file the steerer to fit', correct: false, next: 'options', teach: 'Filing a steerer is destructive and unsafe.' },
            { text: 'Yes — any modern stem fits any modern steerer', correct: false, next: 'options', teach: 'Quill vs threadless is the most common stem mismatch in shops.' },
          ],
        },
        options: {
          prompt: 'Step 2 of 3 — What options do you give the customer?',
          kind: 'single',
          choices: [
            { text: 'Use a threadless-stem adapter (extends inside the threaded steerer) OR install a proper quill stem instead', correct: true, next: 'inform' },
            { text: 'Force the threadless onto the threaded steerer', correct: false, next: 'inform', teach: 'Forcing creates a critical safety failure. Don\'t.' },
            { text: 'Convert the bike to a threadless headset (replace the fork)', correct: false, next: 'inform', teach: 'Possible but expensive — only suggest if the customer specifically wants the upgrade.' },
            { text: 'Tell them the stem can\'t be used and stop there', correct: false, next: 'inform', teach: 'Adapters exist; offer the safe options.' },
          ],
        },
        inform: {
          prompt: 'Step 3 of 3 — If the customer chooses an adapter, what do you check before final install?',
          kind: 'single',
          choices: [
            { text: 'Adapter\'s minimum-insertion mark is below the top of the steerer; torque both adapter and stem to spec', correct: true, next: 'end_correct' },
            { text: 'Just torque the top cap', correct: false, next: 'end_wrong', teach: 'A threaded headset has no top-cap preload like threadless does.' },
            { text: 'Skip torque specs — ride feel matters more', correct: false, next: 'end_wrong', teach: 'Stem/steerer is a critical interface — always to spec.' },
            { text: 'Cut the adapter shorter to lower the bars', correct: false, next: 'end_wrong', teach: 'Cutting reduces minimum insertion — potentially below safe minimum.' },
          ],
        },
        end_correct: { end: true, summary: 'Quill vs threadless = different systems. Adapter or quill stem. Always honor minimum-insertion + torque spec.' },
        end_wrong: { end: true, summary: 'The path: identify quill vs threadless mismatch → offer adapter or quill stem → verify min-insertion and torque to spec.' },
      },
    },

    {
      id: 'wp_disc_rub',
      title: 'Disc brake rub',
      topic: 'brakes',
      story: "After installing a wheel, the rear disc brake rubs slightly through every rotation. The wheel itself is true.",
      terms: ['caliper', 'disc rotor', 'thru-axle'],
      steps: {
        start: {
          prompt: 'Step 1 of 3 — Wheel is true, but the brake rubs. First thing you check?',
          kind: 'single',
          choices: [
            { text: 'Wheel seating in the dropouts and thru-axle/QR alignment', correct: true, next: 'caliper' },
            { text: 'Pad thickness', correct: false, next: 'caliper', teach: 'Pads don\'t suddenly cause rub when a wheel is reinstalled — confirm the seat first.' },
            { text: 'Rotor temperature', correct: false, next: 'caliper', teach: 'Temperature drops back; this is a steady rub.' },
            { text: 'Brake fluid color', correct: false, next: 'caliper', teach: 'Fluid affects feel, not pad-rotor centering.' },
          ],
        },
        caliper: {
          prompt: 'Step 2 of 3 — Wheel is seated correctly. Brake still rubs. What\'s the cleanest centering technique?',
          kind: 'single',
          choices: [
            { text: 'Loosen caliper bolts → squeeze the lever firmly to center the caliper → re-torque while held', correct: true, next: 'verify' },
            { text: 'Hand-eye it: tighten while sighting through the caliper window', correct: false, next: 'verify', teach: 'Hand-eye works on simple cases but the lever-squeeze method is the textbook one.' },
            { text: 'Bend the rotor toward the right side', correct: false, next: 'verify', teach: 'Don\'t bend the rotor; center the caliper.' },
            { text: 'Add a spacer between the caliper and the mount', correct: false, next: 'verify', teach: 'Caliper spacers exist for adapter/mount-standard reasons, not for centering.' },
          ],
        },
        verify: {
          prompt: 'Step 3 of 3 — Caliper centered. How do you verify the job is done?',
          kind: 'single',
          choices: [
            { text: 'Spin the wheel — no audible rub, both pads have a thin gap to the rotor', correct: true, next: 'end_correct' },
            { text: 'Brake hard once and listen', correct: false, next: 'end_wrong', teach: 'A hard squeeze masks rub by holding the caliper. Need a free spin.' },
            { text: 'Ride the bike at speed', correct: false, next: 'end_wrong', teach: 'Verify on the stand before road-test.' },
            { text: 'Check torque on the rotor bolts', correct: false, next: 'end_wrong', teach: 'Rotor bolts haven\'t been touched in this scenario.' },
          ],
        },
        end_correct: { end: true, summary: 'Wheel seat → caliper centering via lever-squeeze → verify with a clean free spin.' },
        end_wrong: { end: true, summary: 'The path: wheel seat → loosen caliper, squeeze lever, retorque → confirm with free spin.' },
      },
    },
  ];

  // Lookup helpers
  const CHAINS_BY_ID = {};
  for (const c of CHAINS) CHAINS_BY_ID[c.id] = c;
  const CHAINS_BY_TOPIC = {};
  for (const c of CHAINS) {
    if (!CHAINS_BY_TOPIC[c.topic]) CHAINS_BY_TOPIC[c.topic] = [];
    CHAINS_BY_TOPIC[c.topic].push(c);
  }

  window.WRENCH_PATH = {
    chains: CHAINS,
    byId: CHAINS_BY_ID,
    byTopic: CHAINS_BY_TOPIC,
  };

  console.log('[Wrench Path] Loaded', CHAINS.length, 'diagnostic chains');
})();
