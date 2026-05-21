> "Your app serves as a good starter for rehabilitation. The completeness of your 
> app is high."
>
> — Course Instructor, SM3607

Delivered as a **fully functional solo Android MVP in 2 weeks**, covering the 
complete rehabilitation flow from exercise selection through real-time motion 
detection, rep counting, and daily progress tracking.

- 3 distinct motion detection algorithms implemented, each independently designed 
  to match the specific kinematic structure of its exercise
- Real-time sensor fusion across `TYPE_LINEAR_ACCELERATION` and `TYPE_GRAVITY` 
  across all exercises
- Pre-check orientation validation, diagonal movement rejection, and baseline 
  calibration — all functional and tested against real movement data

**One identified hardware limitation** emerged during development: several exercises 
require a relaxed, hanging arm while simultaneously holding the phone, creating a 
tension between natural posture and device grip. A wrist-mounted form factor was 
evaluated as a solution, but introduces a new trade-off — smartphone weight is 
non-trivial and may compromise the quality of passive exercises like the Pendulum. 
This remains the primary hardware design question for the next development phase.

This version is a starting point. The architecture is designed to support a growing 
exercise library — the roadmap mirrors the structure of gym coaching apps, where 
movements are progressively added as the platform matures. The broader ambition is 
to propose a scalable, wearable-free rehabilitation model for Hong Kong's 
physiotherapy sector: clinical-grade guidance, delivered through a device every 
patient already owns.