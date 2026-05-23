## Research Foundation

Before any hardware was built, we spent **three months on research** covering consumer psychology, multisensory flavour science, and local tea history.

- Up to **80% of perceived flavour** comes from smell, not taste, this directly shaped the scent-mixing zone design
- Hong Kong has a mostly forgotten tea cultivation history, from 17th-century Qing Dynasty plantations on Castle Peak to the now-closed Ngong Ping Tea Plantation on Lantau
- Two fieldwork visits to **Kadoorie Farm and Botanic Garden (KFBG)**, working with the Regenerative Agriculture Department and Hong Kong Tea Research Institute, gave the project real industry grounding

![Kadoorie Farm and Botanic Garden (KFBG) site visit](../assets/projects/tea-sensory-lab/content/ResearchFoundation_1.png)

---

## System Architecture

The installation runs across four zones inside a single Lab cabinet, all communicating with a **Godot state-machine controller** via Serial protocol.

| Zone | Interaction | Hardware |
|------|-------------|----------|
| **Zone 1** — Quiz | Slide cup to navigate, shake to confirm | ESP32-C3 + MPU6050 Smart Teacup, IR touch surface |
| **Zone 2** — Ingredients | Lift the correct ingredient bottles | FSR array × 11 stations |
| **Zone 2.5** — Scent | Squeeze air bulb to release aroma | Sound-peak sensor + pneumatic scent tower |
| **Zone 3** — Ritual | Scan spirit with slider, high-five to claim | Linear potentiometer + capacitive touch sensor + 9-channel motorised dispenser |

---

## Key Technical Decisions

### Game Engine — HTML vs Godot

Both were options I had worked with before, the decision came down to how deep the integration needed to go.

- **Serial communication** with Arduino was straightforward and stable in Godot; WebSerial in a browser added unreliable overhead
- **Custom shaders** for the fog dissolve and high-five particle effects needed a proper rendering pipeline
- **State machine and asset management** worked better in a system running continuously for hours, without a browser runtime getting in the way
- I already knew Godot well, which kept development moving from day one

### Table Fabrication — One-Piece Custom vs Acrylic Laser Cutting + 3D Printing

A 12-slot tabletop with specific sensor cutouts and cable routing wasn't something we could buy off the shelf.

- One-piece custom fabrication was **too expensive**, hard to transport, and couldn't handle last-minute design changes
- **Laser-cut acrylic panels** let us adjust cutout sizes without re-ordering a whole piece
- **3D-printed basin inserts** handled the precise sensor clearances and cable routing that flat acrylic alone couldn't manage
- The combined approach hit the same accuracy at a much lower cost, important on a student budget

![We were installing the 3D-printed basin](../assets/projects/tea-sensory-lab/content/TableFabrication_1.png)
![We were installing the 3D-printed basin](../assets/projects/tea-sensory-lab/content/TableFabrication_2.png)
![The whole Laser-cut acrylic panels](../assets/projects/tea-sensory-lab/content/TableFabrication_3.png)

### Answer Confirmation — IR Dwell Time vs Shake to Confirm

Early prototypes used a 3-second IR hover to confirm answers. That caused two problems: users accidentally confirmed when they paused, and the waiting felt passive and broke the experience.

- **Near-zero false trigger rate** — a deliberate shake is clear; a timed hover is not
- **Tea science connection** — shaking mixes saponins with air to build foam, and releases aromatic compounds that carry floral and fruity scents, so the gesture has a real meaning beyond just UI
- **Labour Illusion (UX psychology)** — active movement makes wait time feel shorter and makes users feel the result is more earned
- A good fit for a **low-frequency, entertainment-first** installation where engagement matters more than speed

### Material Detection — Film Pressure Sensor vs Photoresistor

Zone 2 needed to detect when ingredient bottles were lifted, but the bottles were so light.

- **FSR sensors** couldn't reliably read such light weights — the readings were too inconsistent
- The ingredient blocked the light consistently when placed. Basins and basin inserts are transparent. **Light can be straightforwardly detected from below.**
- Easier to calibrate, and no wear from repeated use across a full exhibition day

![We were installing the Photoresistor](../assets/projects/tea-sensory-lab/content/MaterialDetection_1.jpg)

### Scent Activation — Barometric Pressure vs Sound-Peak Sensor

Detecting a hand squeeze on an air bulb had to work across different grip strengths.

- The **BMP280 barometer** wasn't sensitive enough for a hand squeeze — readings varied too much between users
- A **sound-peak sensor** picking up the air rush from the nozzle gave a consistent trigger regardless of how hard someone squeezed
- No physical contact between the sensor and the bulb — simpler to assemble, and no wear-related failures

---

## Hardware Iteration

Every physical component was built from scratch. Nothing off the shelf met the size, look, and Arduino integration requirements at the same time.

- **Card dispenser** — 9 full build iterations, working through structural issues, FDM overhangs, surface friction, servo alignment, exit speed, and card corner snagging before getting consistent single-card ejection
- **Scent vessels** — 8 iterations; moved from injection-moulded acrylic (**700 RMB/unit**) to transparent resin 3D printing (**150 RMB/unit**) with a threadless silicone O-ring seal
- **Cabinet exterior** — covered all opaque surfaces in textured wallpaper to bring the mixed fabrication materials into a consistent Lab look, keeping only the transparent acrylic front edge visible as a deliberate design choice

![Card dispenser](../assets/projects/tea-sensory-lab/content/Carddispenser_1.png)
![Scent Vessels](../assets/projects/tea-sensory-lab/content/ScentVessels_1.png)

---

## Visual & Character Design

Nine Tea Spirit IP characters were designed under a **modular species system**, linking each character's shape and colour directly to its tea profile.

| Species | Silhouette Base | Tea Types | Design Language |
|---------|-----------------|-----------|-----------------|
| Floral | Circle | Jasmine, Osmanthus, Rose | Soft, rounded, approachable |
| Fruity | Rectangle | Lemon, Peach, Asian Pear | Relaxed, elongated, chill vibe |
| Floral-Fruity | Triangle | Chamomile blends | Balanced, expressive |

![Character Design 1](../assets/projects/tea-sensory-lab/content/Character_1.png)
![Character Design 2](../assets/projects/tea-sensory-lab/content/Character_2.png)

Each character's **primary colour** was pulled from tea liquor references in tasting literature: straw-to-jade for green tea, bright amber for oolong, copper-red to mahogany for black tea. The silhouettes went through three rounds of feedback, moving away from an overly complex slime-base direction toward a simpler, more readable animal-like form with expressive eyes and a species-specific headpiece. The modular system makes it easy to add new archetypes later without redesigning from scratch.
