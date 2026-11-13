const SESSION = {
  regions: [
    { id: "chest", name: "Chest", groups: ["chest-upper", "chest-mid", "chest-lower"] },
    { id: "back", name: "Back", groups: ["lats", "upper-back", "traps"] },
    { id: "shoulders", name: "Shoulders", groups: ["delt-front", "delt-side", "delt-rear"] },
    { id: "arms", name: "Arms", groups: ["biceps", "triceps"] },
    { id: "core", name: "Core", groups: ["abs", "obliques", "erectors"] },
    { id: "glutes", name: "Glutes", groups: ["glutes"] },
    { id: "legs", name: "Legs", groups: ["quads", "hamstrings", "calves"] },
  ],

  groups: [
    { id: "chest-upper", name: "Upper chest", region: "chest", views: ["front"], pattern: "push" },
    { id: "chest-mid", name: "Mid chest", region: "chest", views: ["front"], pattern: "push" },
    { id: "chest-lower", name: "Lower chest", region: "chest", views: ["front"], pattern: "push" },
    { id: "lats", name: "Lats", region: "back", views: ["back"], pattern: "pull" },
    { id: "upper-back", name: "Upper back", region: "back", views: ["back"], pattern: "pull" },
    { id: "traps", name: "Traps", region: "back", views: ["back"], pattern: "raise" },
    { id: "delt-front", name: "Front delt", region: "shoulders", views: ["front"], pattern: "push" },
    { id: "delt-side", name: "Side delt", region: "shoulders", views: ["front", "back"], pattern: "raise" },
    { id: "delt-rear", name: "Rear delt", region: "shoulders", views: ["back"], pattern: "raise" },
    { id: "biceps", name: "Biceps", region: "arms", views: ["front"], pattern: "curl" },
    { id: "triceps", name: "Triceps", region: "arms", views: ["front", "back"], pattern: "extend" },
    { id: "abs", name: "Abs", region: "core", views: ["front"], pattern: "brace" },
    { id: "obliques", name: "Obliques", region: "core", views: ["front"], pattern: "brace" },
    { id: "erectors", name: "Spinal erectors", region: "core", views: ["back"], pattern: "hinge" },
    { id: "glutes", name: "Glute max", region: "glutes", views: ["back"], pattern: "hinge" },
    { id: "quads", name: "Quads", region: "legs", views: ["front"], pattern: "squat" },
    { id: "hamstrings", name: "Hamstrings", region: "legs", views: ["back"], pattern: "hinge" },
    { id: "calves", name: "Calves", region: "legs", views: ["front", "back"], pattern: "raise" },
  ],

  equipment: [
    { id: "barbell", name: "Barbell and rack" },
    { id: "dumbbells", name: "Dumbbells" },
    { id: "bench", name: "Adjustable bench" },
    { id: "cables", name: "Cables" },
    { id: "pullup-bar", name: "Pull-up bar" },
    { id: "chest-press", name: "Chest press" },
    { id: "pec-deck", name: "Pec deck" },
    { id: "lat-pulldown", name: "Lat pulldown" },
    { id: "seated-row", name: "Seated row" },
    { id: "shoulder-press", name: "Shoulder press" },
    { id: "leg-press", name: "Leg press" },
    { id: "leg-extension", name: "Leg extension" },
    { id: "leg-curl", name: "Leg curl" },
    { id: "calf-machine", name: "Calf machine" },
    { id: "hip-thrust", name: "Hip thrust station" },
  ],

  movements: [
    { id: "incline-db-press", name: "Incline dumbbell press", primary: "chest-upper", also: ["delt-front", "triceps"], equipment: ["dumbbells", "bench"], pattern: "push", setup: "Set the bench near 30 degrees and press the dumbbells from the upper chest until the arms are straight." },
    { id: "incline-bb-press", name: "Incline barbell press", primary: "chest-upper", also: ["delt-front", "triceps"], equipment: ["barbell", "bench"], pattern: "push", setup: "Set the bench near 30 degrees. Lower the bar to the upper chest and press it up." },
    { id: "low-to-high-fly", name: "Low-to-high cable fly", primary: "chest-upper", also: ["chest-mid"], equipment: ["cables"], pattern: "push", setup: "Set the cables low. With soft elbows, bring the hands up and together in front of the upper chest." },

    { id: "db-bench", name: "Dumbbell bench press", primary: "chest-mid", also: ["delt-front", "triceps"], equipment: ["dumbbells", "bench"], pattern: "push", setup: "Lie on a flat bench. Lower the dumbbells to the chest and press them until the arms are straight." },
    { id: "bb-bench", name: "Barbell bench press", primary: "chest-mid", also: ["delt-front", "triceps"], equipment: ["barbell", "bench"], pattern: "push", setup: "On a flat bench, lower the bar to the mid chest and press it up. Keep the feet on the floor." },
    { id: "machine-press", name: "Machine chest press", primary: "chest-mid", also: ["delt-front", "triceps"], equipment: ["chest-press"], pattern: "push", setup: "Set the seat so the handles meet the mid chest. Press until the arms are straight, then return under control." },
    { id: "cable-fly", name: "Cable fly", primary: "chest-mid", also: ["chest-upper"], equipment: ["cables"], pattern: "push", setup: "Set the cables at chest height. Bring the hands together in front of the chest with a soft elbow." },
    { id: "pec-deck-fly", name: "Pec deck fly", primary: "chest-mid", also: ["chest-lower"], equipment: ["pec-deck"], pattern: "push", setup: "Sit with the pads at chest height and bring the forearms together. Keep the back against the pad." },

    { id: "decline-db-press", name: "Decline dumbbell press", primary: "chest-lower", also: ["triceps", "chest-mid"], equipment: ["dumbbells", "bench"], pattern: "push", setup: "Set a shallow decline. Press the dumbbells from the lower chest until the arms are straight." },
    { id: "high-to-low-fly", name: "High-to-low cable fly", primary: "chest-lower", also: ["chest-mid"], equipment: ["cables"], pattern: "push", setup: "Set the cables high. Sweep the hands down and together in front of the lower chest." },

    { id: "lat-pulldown", name: "Lat pulldown", primary: "lats", also: ["biceps", "upper-back"], equipment: ["lat-pulldown"], pattern: "pull", setup: "Grip just outside the shoulders and pull the bar toward the upper chest, elbows down." },
    { id: "pull-up", name: "Pull-up", primary: "lats", also: ["biceps", "upper-back"], equipment: ["pullup-bar"], pattern: "pull", setup: "Hang from the bar and pull until the chin clears it. Lower until the arms are straight." },
    { id: "straight-arm-pulldown", name: "Straight-arm pulldown", primary: "lats", also: [], equipment: ["cables"], pattern: "pull", setup: "With nearly straight elbows, pull a bar from overhead down to the thighs." },
    { id: "db-row", name: "One-arm dumbbell row", primary: "lats", also: ["upper-back", "biceps"], equipment: ["dumbbells", "bench"], pattern: "pull", setup: "One hand and knee on the bench. Pull the dumbbell toward the hip and lower it with a straight arm." },

    { id: "seated-row", name: "Seated row", primary: "upper-back", also: ["lats", "biceps"], equipment: ["seated-row"], pattern: "pull", setup: "Sit tall and pull the handle toward the lower ribs, squeezing the shoulder blades." },
    { id: "chest-supported-row", name: "Chest-supported dumbbell row", primary: "upper-back", also: ["lats", "biceps"], equipment: ["dumbbells", "bench"], pattern: "pull", setup: "Lie chest-down on an incline bench and row the dumbbells toward the hips." },
    { id: "bb-row", name: "Barbell bent-over row", primary: "upper-back", also: ["lats", "erectors", "biceps"], equipment: ["barbell"], pattern: "pull", setup: "Hinge until the torso is near flat. Pull the bar to the lower ribs and lower it under control." },

    { id: "db-shrug", name: "Dumbbell shrug", primary: "traps", also: [], equipment: ["dumbbells"], pattern: "raise", setup: "Hold the dumbbells at your sides and lift the shoulders straight up. Pause, then lower." },
    { id: "bb-shrug", name: "Barbell shrug", primary: "traps", also: [], equipment: ["barbell"], pattern: "raise", setup: "Hold the bar in front of the thighs and lift the shoulders straight up, then lower." },
    { id: "cable-shrug", name: "Cable shrug", primary: "traps", also: [], equipment: ["cables"], pattern: "raise", setup: "Hold a low cable at your sides and lift the shoulders straight up." },

    { id: "db-shoulder-press", name: "Seated dumbbell press", primary: "delt-front", also: ["delt-side", "triceps"], equipment: ["dumbbells", "bench"], pattern: "push", setup: "Sit on the bench and press the dumbbells from the shoulders until the arms are straight." },
    { id: "bb-shoulder-press", name: "Barbell overhead press", primary: "delt-front", also: ["delt-side", "triceps"], equipment: ["barbell"], pattern: "push", setup: "Press the bar from the front of the shoulders until the arms are straight, without leaning back." },
    { id: "machine-shoulder-press", name: "Machine shoulder press", primary: "delt-front", also: ["delt-side", "triceps"], equipment: ["shoulder-press"], pattern: "push", setup: "Set the seat so the handles start at shoulder height. Press until the arms are straight." },
    { id: "db-front-raise", name: "Dumbbell front raise", primary: "delt-front", also: [], equipment: ["dumbbells"], pattern: "raise", setup: "Raise the dumbbells to shoulder height with a soft elbow, then lower them." },

    { id: "db-lateral-raise", name: "Dumbbell lateral raise", primary: "delt-side", also: [], equipment: ["dumbbells"], pattern: "raise", setup: "Raise the dumbbells out to the sides to shoulder height, leading with the elbows." },
    { id: "cable-lateral-raise", name: "Cable lateral raise", primary: "delt-side", also: [], equipment: ["cables"], pattern: "raise", setup: "Stand sideways to a low cable and raise the arm out to shoulder height." },

    { id: "reverse-pec-deck", name: "Reverse pec deck", primary: "delt-rear", also: ["upper-back"], equipment: ["pec-deck"], pattern: "raise", setup: "Sit facing the machine and open the arms, leading with the elbows, until they line up with the shoulders." },
    { id: "db-rear-fly", name: "Dumbbell rear delt fly", primary: "delt-rear", also: ["upper-back"], equipment: ["dumbbells", "bench"], pattern: "raise", setup: "Lie chest-down on an incline bench and open the arms until they are in line with the shoulders." },
    { id: "face-pull", name: "Face pull", primary: "delt-rear", also: ["upper-back"], equipment: ["cables"], pattern: "pull", setup: "Set the cable at face height. Pull the rope toward the face with the elbows high." },

    { id: "db-curl", name: "Dumbbell curl", primary: "biceps", also: [], equipment: ["dumbbells"], pattern: "curl", setup: "Curl without swinging the torso. Lower until the elbow is nearly straight." },
    { id: "bb-curl", name: "Barbell curl", primary: "biceps", also: [], equipment: ["barbell"], pattern: "curl", setup: "Curl the bar with the elbows under the shoulders. Lower until the arms are nearly straight." },
    { id: "cable-curl", name: "Cable curl", primary: "biceps", also: [], equipment: ["cables"], pattern: "curl", setup: "Face a low cable and curl the handle, keeping the elbows still." },

    { id: "pressdown", name: "Cable pressdown", primary: "triceps", also: [], equipment: ["cables"], pattern: "extend", setup: "Pin the elbows to your sides and straighten them, then return until the forearms are near the biceps." },
    { id: "db-overhead-ext", name: "Dumbbell overhead extension", primary: "triceps", also: [], equipment: ["dumbbells"], pattern: "extend", setup: "Point the upper arms at the ceiling, bend the elbows, then straighten them." },
    { id: "close-grip-bench", name: "Close-grip bench press", primary: "triceps", also: ["chest-mid"], equipment: ["barbell", "bench"], pattern: "extend", setup: "Hands about shoulder width. Lower the bar to the lower chest and press it up." },

    { id: "cable-crunch", name: "Cable crunch", primary: "abs", also: [], equipment: ["cables"], pattern: "brace", setup: "Kneel at a high cable and round the spine, bringing the ribs toward the pelvis." },
    { id: "db-crunch", name: "Dumbbell crunch", primary: "abs", also: [], equipment: ["dumbbells"], pattern: "brace", setup: "Hold a dumbbell on the chest and curl the ribs toward the pelvis." },
    { id: "hanging-knee-raise", name: "Hanging knee raise", primary: "abs", also: [], equipment: ["pullup-bar"], pattern: "brace", setup: "Hang from the bar and lift the knees without swinging. Lower until the legs are straight." },

    { id: "woodchop", name: "Cable woodchop", primary: "obliques", also: ["abs"], equipment: ["cables"], pattern: "brace", setup: "Sweep the cable from high to low across the body. The arms stay mostly straight and the torso turns." },
    { id: "db-side-bend", name: "Dumbbell side bend", primary: "obliques", also: [], equipment: ["dumbbells"], pattern: "brace", setup: "Hold a dumbbell on one side and bend straight toward it, then come back to standing." },

    { id: "deadlift", name: "Barbell deadlift", primary: "erectors", also: ["glutes", "hamstrings"], equipment: ["barbell"], pattern: "hinge", setup: "Stand over the bar, brace, and stand up by pushing the floor away. Keep the bar close to the legs." },
    { id: "db-back-extension", name: "Dumbbell back extension", primary: "erectors", also: ["glutes"], equipment: ["dumbbells", "bench"], pattern: "hinge", setup: "Hips against the bench, torso hanging, a dumbbell at the chest. Lift until the body is a straight line." },

    { id: "hip-thrust-machine", name: "Machine hip thrust", primary: "glutes", also: ["hamstrings"], equipment: ["hip-thrust"], pattern: "hinge", setup: "Set the pad across the hips and drive through the heels until the hips are straight." },
    { id: "bb-hip-thrust", name: "Barbell hip thrust", primary: "glutes", also: ["hamstrings"], equipment: ["barbell", "bench"], pattern: "hinge", setup: "Upper back on the bench, bar across the hips. Drive the hips up and lower them under control." },
    { id: "pull-through", name: "Cable pull-through", primary: "glutes", also: ["hamstrings"], equipment: ["cables"], pattern: "hinge", setup: "Face away from a low cable, hinge, and stand by squeezing the glutes." },

    { id: "leg-press", name: "Leg press", primary: "quads", also: ["glutes"], equipment: ["leg-press"], pattern: "squat", setup: "Feet about shoulder width on the platform. Lower until the knees bend, then press." },
    { id: "back-squat", name: "Barbell back squat", primary: "quads", also: ["glutes"], equipment: ["barbell"], pattern: "squat", setup: "Bar on the upper back. Sit down between the hips and stand back up. Keep the heels down." },
    { id: "goblet-squat", name: "Goblet squat", primary: "quads", also: ["glutes"], equipment: ["dumbbells"], pattern: "squat", setup: "Hold one dumbbell at the chest and squat between the hips." },
    { id: "walking-lunge", name: "Dumbbell walking lunge", primary: "quads", also: ["glutes"], equipment: ["dumbbells"], pattern: "lunge", setup: "Step forward and lower the back knee, then drive through the front heel." },
    { id: "leg-extension", name: "Leg extension", primary: "quads", also: [], equipment: ["leg-extension"], pattern: "extend", setup: "Straighten the knees and pause. Lower the weight under control." },

    { id: "leg-curl", name: "Leg curl", primary: "hamstrings", also: [], equipment: ["leg-curl"], pattern: "curl", setup: "Curl the heels toward the hips and lower under control." },
    { id: "db-rdl", name: "Dumbbell Romanian deadlift", primary: "hamstrings", also: ["glutes", "erectors"], equipment: ["dumbbells"], pattern: "hinge", setup: "Soft knees, push the hips back, and lower the dumbbells along the thighs. Stand by squeezing the glutes." },
    { id: "bb-rdl", name: "Barbell Romanian deadlift", primary: "hamstrings", also: ["glutes", "erectors"], equipment: ["barbell"], pattern: "hinge", setup: "Soft knees, push the hips back, and lower the bar along the thighs. Stand by squeezing the glutes." },

    { id: "calf-machine", name: "Machine calf raise", primary: "calves", also: [], equipment: ["calf-machine"], pattern: "raise", setup: "Balls of the feet on the platform. Lower the heels, then rise as high as you can." },
    { id: "db-calf-raise", name: "Dumbbell calf raise", primary: "calves", also: [], equipment: ["dumbbells"], pattern: "raise", setup: "Hold the dumbbells at your sides. Rise onto the balls of the feet and lower slowly." },
    { id: "leg-press-calf", name: "Leg press calf raise", primary: "calves", also: [], equipment: ["leg-press"], pattern: "raise", setup: "Feet on the lower edge of the platform. Press through the balls of the feet." },
  ],

  warmups: [
    { id: "heat", name: "Easy march", how: "March in place for about a minute and swing the arms. You are ready when your breathing is a little deeper.", any: true },
    { id: "arm-circles", name: "Arm circles", how: "Ten small circles each way, then ten larger ones. Keep the shoulders from creeping up.", patterns: ["push", "raise", "extend"], groups: ["chest-upper", "chest-mid", "chest-lower", "delt-front", "delt-side", "delt-rear", "triceps", "traps"] },
    { id: "scap-push", name: "Scapular push-ups", how: "From a wall or a plank, do eight push-ups where only the shoulder blades move.", patterns: ["push"], groups: ["chest-upper", "chest-mid", "chest-lower", "delt-front"] },
    { id: "shoulder-set", name: "Shoulder set", how: "Roll the shoulders slowly, five each way. Then draw the shoulder blades down and back ten times.", patterns: ["pull", "raise"], groups: ["lats", "upper-back", "traps", "delt-rear"] },
    { id: "pull-apart", name: "Empty pull-aparts", how: "With empty hands in front of you, squeeze the shoulder blades together and apart for ten slow reps.", patterns: ["pull"], groups: ["lats", "upper-back", "delt-rear"] },
    { id: "bodyweight-squat", name: "Bodyweight squat", how: "Ten slow squats. Keep the heels down and let the knees travel over the toes.", patterns: ["squat", "lunge"], groups: ["quads", "glutes"] },
    { id: "hip-circles", name: "Hip circles", how: "Lift one knee and draw five slow circles each way. Switch legs.", patterns: ["squat", "lunge"], groups: ["quads", "glutes"] },
    { id: "hinge-drill", name: "Hip hinge", how: "Eight hinges with the hands on the thighs. Push the hips back and keep the back long.", patterns: ["hinge"], groups: ["hamstrings", "glutes", "erectors"] },
    { id: "glute-bridge", name: "Glute bridge", how: "Eight bridges. Pause at the top with the ribs down.", patterns: ["hinge"], groups: ["glutes", "hamstrings"] },
    { id: "easy-curl", name: "Unloaded curls", how: "Bend and straighten the elbows ten times with empty hands, then open and close the fingers.", patterns: ["curl"], groups: ["biceps"] },
    { id: "easy-extend", name: "Unloaded elbow bends", how: "Take the hands from the shoulders to a full reach, ten times, with no weight.", patterns: ["extend"], groups: ["triceps"] },
    { id: "dead-bug", name: "Dead bug", how: "Five each side, lying on your back. The low back stays gently down.", patterns: ["brace"], groups: ["abs", "obliques"] },
    { id: "cat-cow", name: "Cat-cow", how: "On hands and knees, six slow cycles from a rounded back to a long one.", patterns: ["brace", "hinge"], groups: ["erectors", "abs"] },
    { id: "arm-slides", name: "Wall slides", how: "Stand against a wall and slide the arms overhead and back down, eight times, without shrugging.", patterns: ["raise"], groups: ["delt-front", "delt-side", "delt-rear", "traps"] },
    { id: "easy-calves", name: "Easy calf raises", how: "Hold something for balance and do fifteen slow raises on both feet.", patterns: ["raise"], groups: ["calves"] },
  ],
};
