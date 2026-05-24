# Bio
    Final-year Creative Media student at City University of Hong Kong, 
    building at the intersection of software, hardware, and interaction design.
                
    Most developers write code. Most designers make interfaces. I do both 
    and when the problem calls for it, I fabricate the physical object too. 
    My FYP combined custom Arduino hardware, Godot-powered projections, and 
    9 original IP characters into a single installation. My other work spans 
    Firebase-backed Android apps and sensor-driven rehabilitation tools.
                
    I work with AI as a force multiplier, not to replace thinking, but to 
    compress the distance between a problem and a working solution. That means 
    directing AI with real-world context it cannot source itself: recording 
    actual motion data to anchor algorithm design, feeding domain knowledge 
    that has no training set. The goal is always the same: spend less 
    attention on implementation mechanics, and more on the problem that 
    actually matters.

# Experience

- Furniture Station — Graphic Designer — Jun – Sep 2023
- Echouse — Marketing Executive — Jan – Jul 2023
- SCM Student Event Team — CityU — Visual Design Director — 2023 – 2024
- BBA Global Business — CityU HK — Website UI/UX Designer — 2023 – 2024
- Anything But Limited 不正常研究所 — Internship — July – July 2025
- City University of Hong Kong — Jockey Club Project IDEA Teaching Assistant — Oct 2025 – March 2026


# Published Projects

## Tea Sensory Lab

- Category: HARDWARE
- Tech Stack Inline: Godot • Arduino • ESP32 • 3D Printing
- Tech Stack: Godot, Arduino, ESP32, Serial Communication, Acrylic Fabrication, 3D Printing

### Problem

Tea is losing ground with younger generations in Hong Kong. On top of being seen as old-fashioned, it can't keep up with coffee across the things Gen Z actually cares about: more flavour variety, a better fit for busy city life, and a much bigger presence online and on the street, walk around Hong Kong and coffee shops visibly outnumber tea houses.

Research backs this up: Gen Z now makes up roughly **71% of new tea-drinking experiences**, but they lean toward customised, shareable formats like bubble tea and matcha rather than traditional brews. At the same time, heritage tea shops are shutting down — squeezed by rising rents and a shrinking young customer base.

> We didn't see this as cultural decline: we saw it as a design problem. The gap isn't there because tea is worse. It's there because no one has made it feel personal, modern, and worth sharing.

### Experience

Tea Sensory Lab guides each user through a **four-zone journey** to discover their Tea Spirit, a personalised character matched to a unique tea blend. The experience takes approximately 5–8 minutes and requires no staff assistance.

#### Zone 1 — Discover Your Profile

A teacup sits on an illuminated tabletop. Slide it across glowing options to navigate an 8-question personality quiz. **Shake the cup to confirm** each answer.

The quiz maps your responses to one of **9 Tea Spirit archetypes**, each corresponding to a unique blend of tea base, flower, and fruit.

#### Zone 2 — Collect Your Ingredients

The table reveals your personalised recipe. A breathing light appears at each ingredient station in sequence, lift the indicated bottle to collect it. Pick up the wrong one, and the system halts until it is returned.

**The ingredients you collect are real**, the bottles contain the actual components of your blend.

#### Zone 2.5 — Smell Your Blend

Stack your collected bottles on the Scent Platform. Squeeze the air bulb. Your blended aroma is pushed directly toward you, your first sensory encounter with your tea.

#### Zone 3 — Summon Your Tea Spirit

Your Tea Spirit arrives on the tabletop as a volatile fog. Push the physical slider across the table to scan and resolve it, the fog clears to reveal your character. The wall display toggles between your tea's **flavour science data** and your Spirit's **personality lore**.

**High-five the character** on the tabletop. The Spirit reacts, and a postcard is dispensed: one side your Tea Master's Guide, the other your Spirit's story. A QR code appears on screen to save and share your result.

The system resets. The next user begins.

### Process

#### Research Foundation

Before any hardware was built, we spent **three months on research** covering consumer psychology, multisensory flavour science, and local tea history.

- Up to **80% of perceived flavour** comes from smell, not taste, this directly shaped the scent-mixing zone design
- Hong Kong has a mostly forgotten tea cultivation history, from 17th-century Qing Dynasty plantations on Castle Peak to the now-closed Ngong Ping Tea Plantation on Lantau
- Two fieldwork visits to **Kadoorie Farm and Botanic Garden (KFBG)**, working with the Regenerative Agriculture Department and Hong Kong Tea Research Institute, gave the project real industry grounding

#### System Architecture

The installation runs across four zones inside a single Lab cabinet, all communicating with a **Godot state-machine controller** via Serial protocol.

| Zone | Interaction | Hardware |
|------|-------------|----------|
| **Zone 1** — Quiz | Slide cup to navigate, shake to confirm | ESP32-C3 + MPU6050 Smart Teacup, IR touch surface |
| **Zone 2** — Ingredients | Lift the correct ingredient bottles | FSR array × 11 stations |
| **Zone 2.5** — Scent | Squeeze air bulb to release aroma | Sound-peak sensor + pneumatic scent tower |
| **Zone 3** — Ritual | Scan spirit with slider, high-five to claim | Linear potentiometer + capacitive touch sensor + 9-channel motorised dispenser |

#### Key Technical Decisions

##### Game Engine — HTML vs Godot

Both were options I had worked with before, the decision came down to how deep the integration needed to go.

- **Serial communication** with Arduino was straightforward and stable in Godot; WebSerial in a browser added unreliable overhead
- **Custom shaders** for the fog dissolve and high-five particle effects needed a proper rendering pipeline
- **State machine and asset management** worked better in a system running continuously for hours, without a browser runtime getting in the way
- I already knew Godot well, which kept development moving from day one

##### Table Fabrication — One-Piece Custom vs Acrylic Laser Cutting + 3D Printing

A 12-slot tabletop with specific sensor cutouts and cable routing wasn't something we could buy off the shelf.

- One-piece custom fabrication was **too expensive**, hard to transport, and couldn't handle last-minute design changes
- **Laser-cut acrylic panels** let us adjust cutout sizes without re-ordering a whole piece
- **3D-printed basin inserts** handled the precise sensor clearances and cable routing that flat acrylic alone couldn't manage
- The combined approach hit the same accuracy at a much lower cost, important on a student budget

##### Answer Confirmation — IR Dwell Time vs Shake to Confirm

Early prototypes used a 3-second IR hover to confirm answers. That caused two problems: users accidentally confirmed when they paused, and the waiting felt passive and broke the experience.

- **Near-zero false trigger rate** — a deliberate shake is clear; a timed hover is not
- **Tea science connection** — shaking mixes saponins with air to build foam, and releases aromatic compounds that carry floral and fruity scents, so the gesture has a real meaning beyond just UI
- **Labour Illusion (UX psychology)** — active movement makes wait time feel shorter and makes users feel the result is more earned
- A good fit for a **low-frequency, entertainment-first** installation where engagement matters more than speed

##### Material Detection — Film Pressure Sensor vs Photoresistor

Zone 2 needed to detect when ingredient bottles were lifted, but the bottles were so light.

- **FSR sensors** couldn't reliably read such light weights — the readings were too inconsistent
- The ingredient blocked the light consistently when placed. Basins and basin inserts are transparent. **Light can be straightforwardly detected from below.**
- Easier to calibrate, and no wear from repeated use across a full exhibition day

##### Scent Activation — Barometric Pressure vs Sound-Peak Sensor

Detecting a hand squeeze on an air bulb had to work across different grip strengths.

- The **BMP280 barometer** wasn't sensitive enough for a hand squeeze — readings varied too much between users
- A **sound-peak sensor** picking up the air rush from the nozzle gave a consistent trigger regardless of how hard someone squeezed
- No physical contact between the sensor and the bulb — simpler to assemble, and no wear-related failures

#### Hardware Iteration

Every physical component was built from scratch. Nothing off the shelf met the size, look, and Arduino integration requirements at the same time.

- **Card dispenser** — 9 full build iterations, working through structural issues, FDM overhangs, surface friction, servo alignment, exit speed, and card corner snagging before getting consistent single-card ejection
- **Scent vessels** — 8 iterations; moved from injection-moulded acrylic (**700 RMB/unit**) to transparent resin 3D printing (**150 RMB/unit**) with a threadless silicone O-ring seal
- **Cabinet exterior** — covered all opaque surfaces in textured wallpaper to bring the mixed fabrication materials into a consistent Lab look, keeping only the transparent acrylic front edge visible as a deliberate design choice

#### Visual & Character Design

Nine Tea Spirit IP characters were designed under a **modular species system**, linking each character's shape and colour directly to its tea profile.

| Species | Silhouette Base | Tea Types | Design Language |
|---------|-----------------|-----------|-----------------|
| Floral | Circle | Jasmine, Osmanthus, Rose | Soft, rounded, approachable |
| Fruity | Rectangle | Lemon, Peach, Asian Pear | Relaxed, elongated, chill vibe |
| Floral-Fruity | Triangle | Chamomile blends | Balanced, expressive |

Each character's **primary colour** was pulled from tea liquor references in tasting literature: straw-to-jade for green tea, bright amber for oolong, copper-red to mahogany for black tea. The silhouettes went through three rounds of feedback, moving away from an overly complex slime-base direction toward a simpler, more readable animal-like form with expressive eyes and a species-specific headpiece. The modular system makes it easy to add new archetypes later without redesigning from scratch.

### Result

> "Distinguished by thorough background research and on-site fieldwork, strong hardware product design, including an independently developed card dispenser and scent-permeable storage vessels, and a cohesive visual and character identity throughout."
>
> — FYP Supervisor, Ms. Koala Yip, School of Creative Media, CityU

Across the 12-week implementation phase, I was solely responsible for:

- **Awarded Grade A**
- Arduino and sensor architecture across all four zones
- Godot–hardware Serial integration and state-machine logic
- Card dispenser fabrication and iteration (9 builds)
- Scent vessel design and iteration (8 builds)
- Acrylic tabletop specification and assembly
- UI visual identity and projection layout
- All 9 Tea Spirit IP character designs

---

## CityLog

- Category: APP
- Tech Stack Inline: Android • Full-Stack • Firebase • Cloud Functions
- Tech Stack: Android Studio, MVVM, Firestore, Cloud Functions, Google Maps API

### Problem

Social media apps like Instagram and Xiaohongshu are built for polished, broadcast-style content, such as landmarks, major attractions, highlight-reel moments. They're not built for the smaller observations that make city walking actually interesting: a detail on a side street, the atmosphere of a specific corner at a specific time, a small discovery that's too subtle to post but too easy to forget.

Map-based review apps like Google Maps or OpenRice give you ratings and information, but lose the human side of noticing. They answer *what is here*, not *what someone felt here*.

> The gap isn't a lack of content: it's a lack of a format that treats place-bound, personal observations as worth keeping. CityLog was built to fill that gap.

There's also a secondary problem: exploring a city alone can feel isolating. No existing tool creates a sense of social presence through a physical space — the feeling that others have walked the same street and left something behind for you to find.

### Process

#### Concept & Differentiation

CityLog isn't a review app, a city guide, or a typical social feed. The key difference is **place-bound discovery tied to physical movement**: content is anchored to GPS coordinates, hidden until you're physically nearby, and ranked by a mix of distance, freshness, and community reaction, not follower count or algorithm.

The MVP was scoped to deliver this core loop end-to-end within a **3-week development cycle**, using AI-assisted tooling to speed up generation and implementation, while independently designing the backend architecture, data model, and system logic.

#### System Architecture

The app follows a strict **MVVM pattern** (Repository-ViewModel-Activity) with a full Firebase backend, structured across three layers:

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | Android / Kotlin; 8 Activities, 3 Fragments, 8 ViewModels |
| **Backend** | Firestore, Firebase Storage, Cloud Functions (Node.js) |
| **Communication** | Repository pattern: no direct Firestore access from Views or Activities |

The Repository layer handles all data operations, backed by Firestore Security Rules that block any client-side write to sensitive aggregate fields (`upvoteCount`, `downvoteCount`, `commentCount`).

#### Key Technical Decisions

##### Location Querying — Lat/Lng Range Filter vs Geohash

A standard proximity query using two-dimensional lat/lng range filters (`WHERE lat BETWEEN x AND y AND lng BETWEEN a AND b`) doesn't work in Firestore, which only supports single-field range queries per request.

- **Geohash encoding** turns a 2D coordinate into a 1D string where nearby strings map to nearby locations — a 100-metre radius query becomes a set of string prefix ranges on a single indexed field
- Implemented using **GeoFireUtils** to calculate query bounds, then filtering by Haversine distance on the client side to trim false positives at geohash cell edges
- Works with Firestore's index model directly, without needing a dedicated geospatial service

##### Vote Aggregates — Client Increment vs Cloud Function Recount

Keeping accurate `upvoteCount` and `downvoteCount` on each log document introduced a classic **race condition**: if two users vote at the same time and both read the same count before writing, one increment gets lost.

- The first approach used `FieldValue.increment()` directly from the client — fast, but open to concurrent writes overwriting each other
- The final approach uses an **event-driven Cloud Function** (`onVoteWrite`) that triggers on any write to `logs/{logId}/votes/{userId}`, does a full recount from the votes subcollection, and writes the correct totals back to the parent document
- **Idempotent by design**: even with Firebase's at-least-once delivery, re-running the function on the same vote document always produces the right result
- The UI applies **optimistic updates** via ViewModel LiveData for instant feedback, with Firestore's `snapshotListener` correcting the value once the Cloud Function finishes

##### Area Labelling — Manual Input vs Automated Reverse Geocoding

Asking users to manually label the area of each log would cause friction and inconsistent naming. Instead, an `onLogCreated` Cloud Function automatically assigns a readable area label to every new log.

- Calls the **Google Maps Reverse Geocoding API** with the log's lat/lng coordinates
- A priority-type parser goes through the response's `addressComponents`, picking the most specific useful label (street name → neighbourhood → district) and skipping bare street numbers
- The UI shows a loading placeholder right after log creation; the Firestore `snapshotListener` updates the label once the function completes, no polling needed

##### Background Geofencing — Notification Trigger Design

The app registers the **top 20 highest-upvoted logs** in the user's city as invisible 500-metre geofences using Android's `GeofencingClient` from Google Play Services.

- Requires both `FOREGROUND_LOCATION` and `ACCESS_BACKGROUND_LOCATION` permissions to work reliably when the app is in the background
- A `PendingIntent` fires to `CityHotGeofenceReceiver` on `GEOFENCE_TRANSITION_ENTER` events
- An **`AppSessionFlags` throttle** (10-minute cooldown) stops repeated API calls within the same session, preventing Google Play Services rate limit hits and unnecessary battery drain

##### Security Model — Anonymous Auth for MVP Scope

The current build uses **Firebase Anonymous Authentication** only, a deliberate MVP scoping decision, not a permanent choice. Anonymous auth removes all onboarding friction while still giving each device a stable UID for Firestore Security Rules.

- Users can set a display name, handle, and generated colour avatar, stored locally and tied to their anonymous UID — a personal identity with no account required
- Firestore Rules use `request.auth.uid` to enforce per-user vote uniqueness and block unauthorised writes
- Google Sign-In, Apple Sign-In, and email authentication are planned for the next development phase

#### Project Structure at Completion

- **8 Activities**, 3 Fragments, 8 ViewModels, 5 Repositories
- **5 Cloud Functions**: `onVoteWrite` (vote recount), `onCommentWrite` (comment count + owner notification), `onLogCreated` (reverse geocoding), `getDailyTopLogs` (ranking build), FCM token management
- Firebase services used: **Firestore, Storage, Cloud Functions, Cloud Messaging, Anonymous Auth**

### Result

> "The concept creates clear differentiation in a crowded social media market. "
> "You are the top group in the class that applied the most techniques in your app — almost full marks were achieved."
>
> — Jacky Cheung, Lecturer, SM3607

Delivered as a **fully functional Android MVP in 3 weeks**, covering from anonymous onboarding through log creation, proximity-based discovery, social interaction, and geofence notifications.

Key outcomes at submission:

- Ranked **#1 in class** for technical breadth across all project groups
- End-to-end location-aware architecture: geohash querying, 100-metre unlock radius, and 500-metre geofence notification zones, all functional
- 5 Cloud Functions handling vote aggregation, comment counts, reverse geocoding, daily ranking, and push notification delivery
- Full MVVM architecture across 8 Activities and 5 Repositories, with zero direct Firestore access from the UI layer
- Firestore Security Rules enforcing per-user vote uniqueness and protecting all server-side aggregate fields from client manipulation

---

## Frozen Shoulder Home Coach

- Category: APP
- Tech Stack Inline: Android • Java • Accelerometer • Sensor Fusion
- Tech Stack: Android Studio, Sensor Fusion, Java

### Problem

Frozen shoulder affects roughly **3–5% of adults globally**, but the numbers in Hong Kong are harder to ignore: **90% of working adults report neck and shoulder pain**, yet fewer than 20% seek professional help. With 33.3% of Hong Kong's population projected to be aged 65 or above by 2039, the need for accessible, at-home rehabilitation tools is only going to grow.

The clinical gap is well-documented. Only **35% of physiotherapy patients stick to their prescribed home exercise plans**  without a daily guide or reminder, routines get dropped quickly. Older patients forget up to **37% of a longer exercise list** after a single teaching session, even with written instruction sheets to help.

> The problem isn't a lack of medical knowledge: it's the absence of a tool that connects the clinic to everyday life, using hardware people already own.

Existing solutions either require expensive wearables, rely on passive video demos with no real-time feedback, or assume a level of technical confidence that many older adults don't have. This app takes a different approach for Hong Kong's physiotherapy and rehabilitation space: a motion-guided coach that runs entirely on the phone already in your pocket — no equipment, no subscriptions, no barriers.

### Process

#### Concept & Scope

Frozen Shoulder Home Coach walks users through three doctor-recommended rehabilitation exercises: **Table Slide**, **Wall Hand Slide**, and **Pendulum Side-to-Side**, using only the phone's built-in motion sensors. No wearables, no external equipment. All three exercises come from the Hospital Authority Hong Kong's official *Adhesive Capsulitis Self-care Guide*.

This version is a **functional MVP built solo in 2 weeks** as the second assignment for SM3607. The three exercises are a focused starting point, the longer-term vision is a full rehabilitation library similar to gym coaching apps, where more exercises can be added over time. The goal here is to validate the core motion-detection approach and show a workable product direction for Hong Kong's physiotherapy and rehabilitation space.

#### Reverse Engineering the Algorithms

The first approach was straightforward: define expected motion characteristics and set fixed thresholds manually. It fell apart quickly. Tuning thresholds meant a full reinstall cycle for every change, and guessed values were consistently off, especially for the Pendulum, where the acceleration profile was impossible to predict without real data.

The turning point was recording actual movement data.

1. Performed each exercise while logging raw accelerometer and gravity sensor output
2. Used AI tools to visualise the time-series curves: making one correct repetition clearly visible as a data pattern
3. Compared correct movement curves against deliberately wrong ones (diagonal slides, too-fast swings, missing holds) to find the key signal differences
4. **Worked backwards from the data to the algorithm**: deriving thresholds from measured averages rather than guessing

This approach also solved an AI collaboration problem. Because these specific rehabilitation gestures don't exist in any public training dataset, AI tools had no useful domain knowledge to start with. By feeding in recorded sensor curves as context, the AI could actually help with algorithm design, using real evidence instead of guesswork. The result was faster iteration and much more accurate detection thresholds across all three exercises.

#### Algorithm Design: Matching Strategy to Motion

Each exercise needed a different algorithm, chosen based on how the movement actually looks, not a one-size-fits-all template.

##### Table Slide & Wall Hand Slide — State Machine

Both exercises follow a **clear, step-by-step structure**: start position → controlled slide → hold at end → return. A state machine is a natural fit:

`IDLE → SLIDING_FORWARD → HOLDING → SLIDING_BACKWARD → IDLE`

- `TYPE_LINEAR_ACCELERATION` reads X/Y/Z motion; the Y axis is treated as the main direction of travel
- `TYPE_GRAVITY` checks phone orientation: the detector won't count a rep if the phone isn't in the right position (horizontal for Table Slide, vertical for Wall Hand Slide)
- A **2-second baseline calibration** at IDLE stops counting before the user is properly set up
- **Diagonal movement guards**: if X or Z acceleration goes over threshold when entering a sliding phase, the rep is rejected and the state resets
- **Direction guards** stop small rebounds from being counted as new repetitions

##### Pendulum — Peak Detection

The Pendulum is a different kind of movement: it's **rhythmic and continuous**, with no clear hold phases or state boundaries. A state machine would produce false transitions on every swing.

Instead, the algorithm detects **valid left and right extremes** of the swing arc:

- Z-axis tracks the lateral swing; a left extreme is confirmed when Z drops below threshold *and* X interference is low
- A right extreme is confirmed when Z rises above threshold under the same clean conditions
- One left extreme + one right extreme = one counted repetition
- A **moving average smoother** runs continuously to reduce sensor noise without adding lag
- If X acceleration is too high at the moment of threshold crossing, the swing is flagged as diagonal and the count doesn't update

The choice to use two completely different strategies came from watching the actual movements, the algorithm fits the motion, not the other way around.

#### UX Design Considerations

The app is designed for middle-aged and elderly users who may not be very comfortable with technology. Key UX decisions:

- **Pre-check screen** before each exercise confirms phone orientation using sensor data, plus manual reminders for things the sensor can't verify (e.g., clear space around the user)
- **Large central rep counter** and a single plain-language instruction during exercise, no extra information mid-movement
- **Today's progress** on the home screen shows a clear daily completion state with visual check marks, so users don't have to remember what they've already done

### Result

> "Your app serves as a good starter for rehabilitation. The completeness of your app is high."
>
> — Course Instructor, SM3607

Built as a **fully functional solo Android MVP in 2 weeks**, covering the full rehabilitation flow from exercise selection to real-time motion detection, rep counting, and daily progress tracking.

- 3 separate motion detection algorithms, each designed to fit the specific movement structure of its exercise
- Real-time sensor fusion using `TYPE_LINEAR_ACCELERATION` and `TYPE_GRAVITY` across all exercises
- Pre-check orientation validation, diagonal movement rejection, and baseline calibration, all tested against real movement data

**One hardware limitation came up during development**: some exercises need the arm to hang relaxed while still holding the phone, which creates an awkward tension between natural posture and grip. A wrist-mounted form factor was considered as a fix, but that brings its own problem: a smartphone is heavy enough to affect passive exercises like the Pendulum. This is the main hardware question to sort out in the next phase.

This version is a starting point. The architecture is built to support more exercises over time, the roadmap works like gym coaching apps, where movements are added as the platform grows. The bigger goal is to offer a wearable-free rehabilitation option for Hong Kong's physiotherapy space: proper guided exercise, on a device every patient already has.

### Reference

1. Jacob, L., Gyasi, R. M., Koyanagi, A., Haro, J. M., Smith, L., & Kostev, K. (2023). Prevalence of and risk factors for adhesive capsulitis of the shoulder in older adults from Germany. Journal of Clinical Medicine, 12(2), 669. https://doi.org/10.3390/jcm12020669
2. Hong Kong Sanatorium & Hospital. (n.d.). Frozen shoulder. HKSH Healthcare. https://mobile.hksh.com/sites/default/files/publications/en/3c7c223b8fbbc79bbc5e4ddb43209c28.pdf
3. Ho, K. (2026, May 4). Nine in 10 HK employees suffer from neck and shoulder pain, survey reveals. The Standard. https://www.thestandard.com.hk/news/article/331170/Nine-in-10-HK-employees-suffer-from-neck-and-shoulder-pain-survey-reveals
4. Health Bureau, Hong Kong SAR Government. (n.d.). Chapter 1: Overview of common musculoskeletal conditions in Hong Kong. Primary Healthcare Commission. https://www.healthbureau.gov.hk/phcc/rfs/src/pdfviewer/web/pdf/musculoskeletal/en/02_CoreDocument/04_en_musculoskeletal_chapter1
5. WebPT. (2018, June 19). Improving home exercise program adherence in physical therapy. https://www.webpt.com/blog/improving-home-exercise-program-adherence-in-physical-therapy
6. Rastall, M., Brooks, B., Klarnet, M., Moylan, N., McCloud, W., & Tracey, S. (1999). An investigation into younger and older adults' memory for physiotherapy exercises. Physiotherapy, 85(3), 122–128. https://www.sciencedirect.com/science/article/abs/pii/S003194060565691X
