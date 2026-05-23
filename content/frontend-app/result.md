> "Your app serves as a good starter for rehabilitation. The completeness of your app is high."
>
> — Course Instructor, SM3607

Built as a **fully functional solo Android MVP in 2 weeks**, covering the full rehabilitation flow from exercise selection to real-time motion detection, rep counting, and daily progress tracking.

- 3 separate motion detection algorithms, each designed to fit the specific movement structure of its exercise
- Real-time sensor fusion using `TYPE_LINEAR_ACCELERATION` and `TYPE_GRAVITY` across all exercises
- Pre-check orientation validation, diagonal movement rejection, and baseline calibration, all tested against real movement data

**One hardware limitation came up during development**: some exercises need the arm to hang relaxed while still holding the phone, which creates an awkward tension between natural posture and grip. A wrist-mounted form factor was considered as a fix, but that brings its own problem: a smartphone is heavy enough to affect passive exercises like the Pendulum. This is the main hardware question to sort out in the next phase.

This version is a starting point. The architecture is built to support more exercises over time, the roadmap works like gym coaching apps, where movements are added as the platform grows. The bigger goal is to offer a wearable-free rehabilitation option for Hong Kong's physiotherapy space: proper guided exercise, on a device every patient already has.
