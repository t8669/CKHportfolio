## Concept & Differentiation

CityLog isn't a review app, a city guide, or a typical social feed. The key difference is **place-bound discovery tied to physical movement**: content is anchored to GPS coordinates, hidden until you're physically nearby, and ranked by a mix of distance, freshness, and community reaction, not follower count or algorithm.

The MVP was scoped to deliver this core loop end-to-end within a **3-week development cycle**, using AI-assisted tooling to speed up generation and implementation, while independently designing the backend architecture, data model, and system logic.

---

## System Architecture

The app follows a strict **MVVM pattern** (Repository-ViewModel-Activity) with a full Firebase backend, structured across three layers:

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | Android / Kotlin; 8 Activities, 3 Fragments, 8 ViewModels |
| **Backend** | Firestore, Firebase Storage, Cloud Functions (Node.js) |
| **Communication** | Repository pattern: no direct Firestore access from Views or Activities |

The Repository layer handles all data operations, backed by Firestore Security Rules that block any client-side write to sensitive aggregate fields (`upvoteCount`, `downvoteCount`, `commentCount`).

---

## Key Technical Decisions

### Location Querying — Lat/Lng Range Filter vs Geohash

A standard proximity query using two-dimensional lat/lng range filters (`WHERE lat BETWEEN x AND y AND lng BETWEEN a AND b`) doesn't work in Firestore, which only supports single-field range queries per request.

- **Geohash encoding** turns a 2D coordinate into a 1D string where nearby strings map to nearby locations — a 100-metre radius query becomes a set of string prefix ranges on a single indexed field
- Implemented using **GeoFireUtils** to calculate query bounds, then filtering by Haversine distance on the client side to trim false positives at geohash cell edges
- Works with Firestore's index model directly, without needing a dedicated geospatial service

### Vote Aggregates — Client Increment vs Cloud Function Recount

Keeping accurate `upvoteCount` and `downvoteCount` on each log document introduced a classic **race condition**: if two users vote at the same time and both read the same count before writing, one increment gets lost.

- The first approach used `FieldValue.increment()` directly from the client — fast, but open to concurrent writes overwriting each other
- The final approach uses an **event-driven Cloud Function** (`onVoteWrite`) that triggers on any write to `logs/{logId}/votes/{userId}`, does a full recount from the votes subcollection, and writes the correct totals back to the parent document
- **Idempotent by design**: even with Firebase's at-least-once delivery, re-running the function on the same vote document always produces the right result
- The UI applies **optimistic updates** via ViewModel LiveData for instant feedback, with Firestore's `snapshotListener` correcting the value once the Cloud Function finishes

### Area Labelling — Manual Input vs Automated Reverse Geocoding

Asking users to manually label the area of each log would cause friction and inconsistent naming. Instead, an `onLogCreated` Cloud Function automatically assigns a readable area label to every new log.

- Calls the **Google Maps Reverse Geocoding API** with the log's lat/lng coordinates
- A priority-type parser goes through the response's `addressComponents`, picking the most specific useful label (street name → neighbourhood → district) and skipping bare street numbers
- The UI shows a loading placeholder right after log creation; the Firestore `snapshotListener` updates the label once the function completes, no polling needed

### Background Geofencing — Notification Trigger Design

The app registers the **top 20 highest-upvoted logs** in the user's city as invisible 500-metre geofences using Android's `GeofencingClient` from Google Play Services.

- Requires both `FOREGROUND_LOCATION` and `ACCESS_BACKGROUND_LOCATION` permissions to work reliably when the app is in the background
- A `PendingIntent` fires to `CityHotGeofenceReceiver` on `GEOFENCE_TRANSITION_ENTER` events
- An **`AppSessionFlags` throttle** (10-minute cooldown) stops repeated API calls within the same session, preventing Google Play Services rate limit hits and unnecessary battery drain

### Security Model — Anonymous Auth for MVP Scope

The current build uses **Firebase Anonymous Authentication** only, a deliberate MVP scoping decision, not a permanent choice. Anonymous auth removes all onboarding friction while still giving each device a stable UID for Firestore Security Rules.

- Users can set a display name, handle, and generated colour avatar, stored locally and tied to their anonymous UID — a personal identity with no account required
- Firestore Rules use `request.auth.uid` to enforce per-user vote uniqueness and block unauthorised writes
- Google Sign-In, Apple Sign-In, and email authentication are planned for the next development phase

---

## Project Structure at Completion

- **8 Activities**, 3 Fragments, 8 ViewModels, 5 Repositories
- **5 Cloud Functions**: `onVoteWrite` (vote recount), `onCommentWrite` (comment count + owner notification), `onLogCreated` (reverse geocoding), `getDailyTopLogs` (ranking build), FCM token management
- Firebase services used: **Firestore, Storage, Cloud Functions, Cloud Messaging, Anonymous Auth**
