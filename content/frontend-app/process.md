## Concept & Scope

Frozen Shoulder Home Coach guides users through three doctor-recommended rehabilitation 
exercises — **Table Slide**, **Wall Hand Slide**, and **Pendulum Side-to-Side** — 
using only the phone's built-in motion sensors. No wearables, no external equipment. 
All three exercises are drawn from the Hospital Authority Hong Kong's official 
*Adhesive Capsulitis Self-care Guide*.

This version is a **functional MVP built solo in 2 weeks** as the second assignment 
for SM3607. The three exercises represent a focused starting point — the longer-term 
vision is a full rehabilitation library modelled after gym coaching apps, where 
exercises can be progressively added as resources allow. The goal of this version 
is to validate the core motion-detection approach and demonstrate a viable product 
direction for Hong Kong's physiotherapy and rehabilitation sector.

---

## Reverse Engineering the Algorithms

The first approach was conventional: define expected motion characteristics and set 
fixed thresholds manually. This broke down quickly. Threshold tuning required a 
full reinstall cycle for every adjustment, and thresholds guessed from first 
principles were consistently inaccurate — especially for the Pendulum, where the 
acceleration profile was impossible to predict without seeing real data.

The turning point was recording actual movement data.

![raw data](../assets/projects/frontend-app/process_1.png)

1. Performed each exercise while logging raw accelerometer and gravity sensor output
2. Used AI tools to visualise the time-series curves — making one correct repetition 
   clearly visible as a data pattern
3. Compared correct movement curves against deliberately incorrect ones (diagonal 
   slides, too-fast swings, missing holds) to identify distinguishing signal features
4. **Worked backwards from the data to the algorithm** — deriving thresholds from 
   measured averages rather than inventing them from assumption

![visualize data pattern](../assets/projects/frontend-app/process_2.png)

This process also solved an AI collaboration problem. Because these specific 
rehabilitation gestures do not exist as training data in any public dataset, AI tools 
had no domain knowledge to offer. By providing recorded sensor curves as context, 
the AI could meaningfully assist with algorithm design — filling the knowledge gap 
with real evidence rather than guesswork. The result was faster iteration and 
significantly more accurate detection thresholds across all three exercises.

---

## Algorithm Design: Matching Strategy to Motion

Each exercise required a different algorithmic strategy, determined by direct 
observation of the movement's characteristics — not a generic template applied 
uniformly.

### Table Slide & Wall Hand Slide — State Machine

Both exercises share a **discrete, sequential structure**: start position → controlled 
slide → hold at end → return. This maps naturally to a state machine:

`IDLE → SLIDING_FORWARD → HOLDING → SLIDING_BACKWARD → IDLE`

- `TYPE_LINEAR_ACCELERATION` reads X/Y/Z motion; the relevant axis (Y) is treated 
  as the primary direction of travel
- `TYPE_GRAVITY` confirms phone orientation — the detector refuses to count a rep 
  if the phone is not in the correct position (horizontal for Table Slide, vertical 
  for Wall Hand Slide)
- A **2-second baseline calibration** at IDLE prevents counting before the user is 
  properly positioned
- **Diagonal movement guards**: if X or Z acceleration exceeds threshold at the 
  moment of entering a sliding phase, the rep is rejected and the state resets
- **Direction guards** prevent small rebounds from being misread as new repetitions

### Pendulum — Peak Detection

The Pendulum is fundamentally different: it is **rhythmic and continuous**, with no 
discrete hold phases or clear state boundaries. A state machine would create false 
transitions on every oscillation.

Instead, the algorithm detects **valid left and right extremes** of the swing arc:

- Z-axis tracks the lateral swing; a left extreme is confirmed when Z drops below 
  threshold *and* X contamination is low
- A right extreme is confirmed when Z rises above threshold under the same clean 
  conditions
- One left extreme + one right extreme = one counted repetition
- A **moving average smoother** is applied continuously to reduce sensor noise 
  without introducing lag
- If X acceleration is disproportionately large at the moment of threshold crossing, 
  the swing is classified as diagonal and the count is not updated

The decision to use two entirely different strategies was driven by observation 
of the real movement, not convention — the algorithm fits the motion, not the other 
way around.

---

## UX Design Considerations

The app is designed for middle-aged and elderly users who may not be technically 
confident. Key UX decisions:

- **Pre-check screen** before each exercise confirms phone orientation using sensor 
  data, with additional manual reminders for conditions the sensor cannot verify 
  (e.g., clear space around the user)
- **Large central rep counter** and a single plain-language instruction sentence 
  during exercise — no information overload mid-movement
- **Today's progress** on the home screen gives a clear daily completion state with 
  visual check marks — reducing the cognitive load of remembering what has been done