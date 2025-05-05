const selectSound = new Audio('Menu Select.wav');
const generateSound = new Audio('Guten Tag!.wav');

// --- Workout Database ---
// Store workouts categorized by difficulty
const workouts = {
    easy: [
        "10 Jumping Jacks",
        "5 Knee Push-ups",
        "15 Bodyweight Squats",
        "30 sec Plank",
        "10 Lunges (each leg)",
        "10 Crunches",
        "5 Burpees (slow pace)",
        "1 min Wall Sit",
        "10 Glute Bridges"
    ],
    medium: [
        "25 Jumping Jacks",
        "10 Standard Push-ups",
        "20 Bodyweight Squats",
        "45 sec Plank",
        "15 Lunges (each leg)",
        "20 Crunches",
        "10 Burpees",
        "1 min High Knees",
        "15 Glute Bridges",
        "8 Diamond Push-ups"
    ],
    hard: [
        "50 Jumping Jacks",
        "20 Standard Push-ups",
        "30 Jump Squats",
        "1 min Plank",
        "20 Walking Lunges (each leg)",
        "30 Bicycle Crunches",
        "15 Burpees",
        "1 min Mountain Climbers",
        "20 Glute Bridges (single leg)",
        "15 Diamond Push-ups",
        "5 Pull-ups (or assisted)"
    ],
    extreme: [
        "100 Jumping Jacks",
        "30 Push-ups (or variation)",
        "50 Jump Squats",
        "90 sec Plank",
        "25 Bulgarian Split Squats (each leg)",
        "50 V-Ups",
        "25 Burpees (fast pace)",
        "2 min Mountain Climbers",
        "10 Pistol Squats (each leg, or assisted)",
        "10 Pull-ups",
        "Handstand Push-ups (or progression)"
    ]
};

// --- Get HTML Elements ---
const generateBtn = document.getElementById('generate-btn');
const workoutListElement = document.getElementById('workout-list');
const spriteElement = document.getElementById('difficulty-sprite');
const difficultyLabels = document.querySelectorAll('.options-container label');

let currentDifficulty = 'easy'; // Default difficulty

// --- Event Listener ---
generateBtn.addEventListener('click', handleGenerateClick);

// Add click listeners to the labels
difficultyLabels.forEach(label => {
    label.addEventListener('click', handleDifficultyClick);
});

// --- Functions ---

function updateSprite(difficulty) {
    // Remove all potentially existing sprite classes first
    spriteElement.classList.remove('sprite-easy', 'sprite-medium', 'sprite-hard', 'sprite-extreme');

    // Add the class corresponding to the selected difficulty
    switch (difficulty) {
        case 'easy':
            spriteElement.classList.add('sprite-easy');
            break;
        case 'medium':
            spriteElement.classList.add('sprite-medium');
            break;
        case 'hard':
            spriteElement.classList.add('sprite-hard');
            break;
        case 'extreme':
            spriteElement.classList.add('sprite-extreme');
            break;
        default:
            spriteElement.classList.add('sprite-easy'); // Default fallback
    }
}

function handleDifficultyClick(event) {
    // Get the difficulty from the clicked label's data attribute
    const selectedDifficulty = event.target.dataset.difficulty;

    if (selectedDifficulty === currentDifficulty) return;

    // --- Play Sound ---
    // Reset playback to the beginning (for rapid clicks)
    selectSound.currentTime = 0;
    // Play the sound
    selectSound.play().catch(error => {
        // Autoplay policies might prevent sound initially in some browsers
        // until the user interacts more. Log error if needed.
        console.error("Audio play failed:", error);
    });
    // ------------------

    // Update the current difficulty state
    currentDifficulty = selectedDifficulty;

    // Update the 'active' class on labels
    difficultyLabels.forEach(lbl => {
        if (lbl.dataset.difficulty === currentDifficulty) {
            lbl.classList.add('active-difficulty');
        } else {
            lbl.classList.remove('active-difficulty');
        }
    });

    // Update the sprite
    updateSprite(currentDifficulty);

    // Generate a new workout for the selected difficulty
    generateWorkout();
}

// Function to get N random unique elements from an array
function getRandomWorkouts(arr, num) {
    if (num > arr.length) {
        console.warn("Requested more workouts than available for this difficulty. Returning all.");
        return [...arr]; // Return a copy of all available workouts
    }

    // Shuffle the array (Fisher-Yates algorithm)
    const shuffled = arr.slice(); // Create a copy to avoid modifying the original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }

    // Return the first 'num' elements
    return shuffled.slice(0, num);
}

function handleGenerateClick() {
    // --- Play Sound ---
    // Reset playback to the beginning (for rapid clicks)
    generateSound.currentTime = 0;
    // Play the sound
    generateSound.play().catch(error => {
        // Autoplay policies might prevent sound initially in some browsers
        // until the user interacts more. Log error if needed.
        console.error("Audio play failed:", error);
    });
    // ------------------

    generateWorkout();
}

function generateWorkout() {
    // Use the currentDifficulty state variable directly
    const availableWorkouts = workouts[currentDifficulty];

    if (!availableWorkouts || availableWorkouts.length === 0) {
        workoutListElement.innerHTML = '<li>No workouts defined for this level yet.</li>';
        return;
    }

    const selectedWorkouts = getRandomWorkouts(availableWorkouts, 3);

    workoutListElement.innerHTML = '';
    selectedWorkouts.forEach(workout => {
        const listItem = document.createElement('li');
        listItem.textContent = workout;
        workoutListElement.appendChild(listItem);
    });
}

// --- Initial Setup on Page Load ---
function initializeApp() {
    // Set the initial active class on the default label ('easy')
    difficultyLabels.forEach(lbl => {
        if (lbl.dataset.difficulty === currentDifficulty) {
            lbl.classList.add('active-difficulty');
        } else {
            lbl.classList.remove('active-difficulty'); // Ensure others aren't active initially
        }
    });

    // Set the initial sprite
    updateSprite(currentDifficulty);

    // Generate the initial workout
    generateWorkout();
}

// Run the initialization function when the script loads
initializeApp();