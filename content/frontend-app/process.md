## Concept & Scope

Frozen Shoulder Home Coach walks users through three doctor-recommended rehabilitation exercises: **Table Slide**, **Wall Hand Slide**, and **Pendulum Side-to-Side**, using only the phone's built-in motion sensors. No wearables, no external equipment. All three exercises come from the Hospital Authority Hong Kong's official *Adhesive Capsulitis Self-care Guide*.

This version is a **functional MVP built solo in 2 weeks** as the second assignment for SM3607. The three exercises are a focused starting point, the longer-term vision is a full rehabilitation library similar to gym coaching apps, where more exercises can be added over time. The goal here is to validate the core motion-detection approach and show a workable product direction for Hong Kong's physiotherapy and rehabilitation space.

---

## Reverse Engineering the Algorithms

The first approach was straightforward: define expected motion characteristics and set fixed thresholds manually. It fell apart quickly. Tuning thresholds meant a full reinstall cycle for every change, and guessed values were consistently off, especially for the Pendulum, where the acceleration profile was impossible to predict without real data.

The turning point was recording actual movement data.

![raw data](../assets/projects/frontend-app/process_1.png)

1. Performed each exercise while logging raw accelerometer and gravity sensor output
2. Used AI tools to visualise the time-series curves: making one correct repetition clearly visible as a data pattern
3. Compared correct movement curves against deliberately wrong ones (diagonal slides, too-fast swings, missing holds) to find the key signal differences
4. **Worked backwards from the data to the algorithm**: deriving thresholds from measured averages rather than guessing

![visualize data pattern](../assets/projects/frontend-app/process_2.png)

This approach also solved an AI collaboration problem. Because these specific rehabilitation gestures don't exist in any public training dataset, AI tools had no useful domain knowledge to start with. By feeding in recorded sensor curves as context, the AI could actually help with algorithm design, using real evidence instead of guesswork. The result was faster iteration and much more accurate detection thresholds across all three exercises.

---

## Algorithm Design: Matching Strategy to Motion

Each exercise needed a different algorithm, chosen based on how the movement actually looks, not a one-size-fits-all template.

### Table Slide & Wall Hand Slide — State Machine

Both exercises follow a **clear, step-by-step structure**: start position → controlled slide → hold at end → return. A state machine is a natural fit:

`IDLE → SLIDING_FORWARD → HOLDING → SLIDING_BACKWARD → IDLE`

- `TYPE_LINEAR_ACCELERATION` reads X/Y/Z motion; the Y axis is treated as the main direction of travel
- `TYPE_GRAVITY` checks phone orientation: the detector won't count a rep if the phone isn't in the right position (horizontal for Table Slide, vertical for Wall Hand Slide)
- A **2-second baseline calibration** at IDLE stops counting before the user is properly set up
- **Diagonal movement guards**: if X or Z acceleration goes over threshold when entering a sliding phase, the rep is rejected and the state resets
- **Direction guards** stop small rebounds from being counted as new repetitions

### Pendulum — Peak Detection

The Pendulum is a different kind of movement: it's **rhythmic and continuous**, with no clear hold phases or state boundaries. A state machine would produce false transitions on every swing.

Instead, the algorithm detects **valid left and right extremes** of the swing arc:

- Z-axis tracks the lateral swing; a left extreme is confirmed when Z drops below threshold *and* X interference is low
- A right extreme is confirmed when Z rises above threshold under the same clean conditions
- One left extreme + one right extreme = one counted repetition
- A **moving average smoother** runs continuously to reduce sensor noise without adding lag
- If X acceleration is too high at the moment of threshold crossing, the swing is flagged as diagonal and the count doesn't update

The choice to use two completely different strategies came from watching the actual movements, the algorithm fits the motion, not the other way around.

---

## UX Design Considerations

The app is designed for middle-aged and elderly users who may not be very comfortable with technology. Key UX decisions:

- **Pre-check screen** before each exercise confirms phone orientation using sensor data, plus manual reminders for things the sensor can't verify (e.g., clear space around the user)
- **Large central rep counter** and a single plain-language instruction during exercise, no extra information mid-movement
- **Today's progress** on the home screen shows a clear daily completion state with visual check marks, so users don't have to remember what they've already done
