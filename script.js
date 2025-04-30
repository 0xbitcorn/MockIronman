document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const LAPS_PER_MILE = 32.2;
    const fullIronmanDistances = { swim: 2.4, bike: 112, run: 26.2 };
    let goalMultiplier = 1.0; // 1.0 for Full, 0.5 for Half

    // --- Workout Data Structure Update ---
    const workouts = [
        // Store plannedPercent relative to FULL Ironman distances
        { id: 1, activity: 'SWIM', plannedPercent: 0.2 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 2, activity: 'BIKE', plannedPercent: 6 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 3, activity: 'RUN', plannedPercent: 1.5 / fullIronmanDistances.run, actualMiles: null, completed: true }, // Example
        { id: 4, activity: 'SWIM', plannedPercent: 0.3 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 5, activity: 'BIKE', plannedPercent: 8 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 6, activity: 'RUN', plannedPercent: 2 / fullIronmanDistances.run, actualMiles: null, completed: false },
        { id: 7, activity: 'SWIM', plannedPercent: 0.3 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 8, activity: 'BIKE', plannedPercent: 10 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 9, activity: 'RUN', plannedPercent: 2.5 / fullIronmanDistances.run, actualMiles: null, completed: false },
        { id: 10, activity: 'SWIM', plannedPercent: 0.3 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 11, activity: 'BIKE', plannedPercent: 12 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 12, activity: 'RUN', plannedPercent: 3 / fullIronmanDistances.run, actualMiles: null, completed: false },
        { id: 13, activity: 'SWIM', plannedPercent: 0.3 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 14, activity: 'BIKE', plannedPercent: 16 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 15, activity: 'RUN', plannedPercent: 3.5 / fullIronmanDistances.run, actualMiles: null, completed: false },
        { id: 16, activity: 'SWIM', plannedPercent: 0.3 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 17, activity: 'BIKE', plannedPercent: 18 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 18, activity: 'RUN', plannedPercent: 4 / fullIronmanDistances.run, actualMiles: null, completed: false },
        { id: 19, activity: 'SWIM', plannedPercent: 0.3 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 20, activity: 'BIKE', plannedPercent: 20 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 21, activity: 'RUN', plannedPercent: 4.5 / fullIronmanDistances.run, actualMiles: null, completed: false },
        { id: 22, activity: 'SWIM', plannedPercent: 0.4 / fullIronmanDistances.swim, actualLaps: null, completed: false },
        { id: 23, activity: 'BIKE', plannedPercent: 22 / fullIronmanDistances.bike, actualMiles: null, completed: false },
        { id: 24, activity: 'RUN', plannedPercent: 5.2 / fullIronmanDistances.run, actualMiles: null, completed: false }
    ];

    // Add temporary properties for adjusted planned values during calculation
    workouts.forEach(w => { w.currentPlannedMiles = 0; w.currentPlannedLaps = 0; });

    // --- DOM Elements ---
    const tableBody = document.getElementById('workout-table-body');
    const swimProgressBar = document.getElementById('swim-progress-bar');
    const bikeProgressBar = document.getElementById('bike-progress-bar');
    const runProgressBar = document.getElementById('run-progress-bar');
    const overallProgressBar = document.getElementById('overall-progress-bar');
    const swimProgressText = document.getElementById('swim-progress-text');
    const bikeProgressText = document.getElementById('bike-progress-text');
    const runProgressText = document.getElementById('run-progress-text');
    const overallProgressText = document.getElementById('overall-progress-text');
    const swimGoalSpan = document.getElementById('swim-goal');
    const bikeGoalSpan = document.getElementById('bike-goal');
    const runGoalSpan = document.getElementById('run-goal');
    const swimLapsGoalSpan = document.getElementById('swim-laps-goal');
    const swimIcon = document.getElementById('swim-icon');
    const bikeIcon = document.getElementById('bike-icon');
    const runIcon = document.getElementById('run-icon');
    const generateShareBtn = document.getElementById('generate-share-text');
    const shareTextOutput = document.getElementById('share-text-output');
    const generateImageBtn = document.getElementById('generate-image-btn');
    const progressCaptureArea = document.getElementById('progress-capture-area');
    const goalToggleInput = document.getElementById('goal-toggle-input');
    const goalToggleContainer = document.getElementById('goal-toggle-container-div');

    // --- Functions ---
    function loadState() {
        const savedMultiplier = localStorage.getItem('goalMultiplier');
        goalMultiplier = (savedMultiplier === '0.5' || savedMultiplier === '1') ? parseFloat(savedMultiplier) : 1.0;
        goalToggleInput.checked = (goalMultiplier === 1.0); // Set toggle state

        workouts.forEach(workout => {
            const savedCompleted = localStorage.getItem(`workout_${workout.id}_completed`);
            workout.completed = savedCompleted !== null ? JSON.parse(savedCompleted) : workout.completed;
            const savedActualMiles = localStorage.getItem(`workout_${workout.id}_actualMiles`);
            workout.actualMiles = savedActualMiles !== null ? parseFloat(savedActualMiles) : null;
            const savedActualLaps = localStorage.getItem(`workout_${workout.id}_actualLaps`);
            workout.actualLaps = savedActualLaps !== null ? parseInt(savedActualLaps) : null;
        });
        console.log("State loaded. Goal Multiplier:", goalMultiplier);
    }

    function saveState() {
        localStorage.setItem('goalMultiplier', goalMultiplier.toString());
    }

    function saveWorkoutCompletion(workoutId, isCompleted) {
        localStorage.setItem(`workout_${workoutId}_completed`, JSON.stringify(isCompleted));
    }

    function saveWorkoutActuals(workoutId) {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;
        if (workout.actualMiles !== null) localStorage.setItem(`workout_${workout.id}_actualMiles`, workout.actualMiles.toString());
        else localStorage.removeItem(`workout_${workout.id}_actualMiles`);
        if (workout.actualLaps !== null) localStorage.setItem(`workout_${workout.id}_actualLaps`, workout.actualLaps.toString());
        else localStorage.removeItem(`workout_${workout.id}_actualLaps`);
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const headers = Array.from(document.querySelectorAll('.table-container th')).map(th => th.textContent.trim()); // Trim whitespace

        workouts.forEach((workout) => {
            const row = tableBody.insertRow();
            row.id = `workout-row-${workout.id}`;
            if (workout.completed) row.classList.add('completed');

            // Completed Checkbox
            const cellCheckbox = row.insertCell();
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = workout.completed;
            checkbox.dataset.workoutId = workout.id;
            checkbox.addEventListener('change', handleCheckboxChange);
            cellCheckbox.appendChild(checkbox);

            // Workout # Cell
            const cellId = row.insertCell();
            cellId.setAttribute('data-label', headers[1] || 'Workout #'); // Add data-label
            cellId.textContent = workout.id;

            // Activity Cell
            const cellActivity = row.insertCell();
            cellActivity.setAttribute('data-label', headers[2] || 'Activity'); // Add data-label
            cellActivity.textContent = workout.activity;

            // Planned Value (Uses the dynamically calculated currentPlanned...)
            const cellPlanned = row.insertCell();
            cellPlanned.setAttribute('data-label', headers[3] || 'Goal'); // Add data-label
            if (workout.activity === 'SWIM') {
                // Ensure currentPlannedLaps is a number before displaying
                cellPlanned.textContent = `${Number(workout.currentPlannedLaps).toFixed(0)} laps`;
            } else {
                // Ensure currentPlannedMiles is a number before displaying
                cellPlanned.textContent = `${Number(workout.currentPlannedMiles).toFixed(1)} mi`;
            }
            if (workout.completed) {
                cellPlanned.style.textDecoration = 'line-through';
                cellPlanned.style.textDecorationColor = '#90ee90';
            } else {
                cellPlanned.style.textDecoration = 'none';
            }

            // Actual Input Value
            const cellActual = row.insertCell();
            cellActual.setAttribute('data-label', headers[4] || 'Actual'); // Add data-label
            const input = document.createElement('input');
            input.type = 'number';
            input.step = workout.activity === 'SWIM' ? '1' : '0.1';
            input.min = '0';
            input.dataset.workoutId = workout.id;
            input.disabled = !workout.completed;
            if (workout.activity === 'SWIM') {
                input.value = workout.actualLaps !== null ? workout.actualLaps : '';
                input.placeholder = 'Laps';
                input.dataset.type = 'laps';
            } else {
                // Ensure actualMiles is formatted correctly if it exists
                input.value = workout.actualMiles !== null ? Number(workout.actualMiles).toFixed(1) : '';
                input.placeholder = 'Miles';
                input.dataset.type = 'miles';
            }
            input.addEventListener('change', handleInputChange);
            cellActual.appendChild(input);
        });
        console.log("Table rendered.");
    }

    function handleCheckboxChange(event) {
        const checkbox = event.target;
        const workoutId = parseInt(checkbox.dataset.workoutId);
        const isChecked = checkbox.checked;
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;

        workout.completed = isChecked;
        saveWorkoutCompletion(workoutId, isChecked);

        // --- Run updateProgress FIRST to calculate adjusted planned values ---
        updateProgress();

        // --- Pre-fill logic AFTER table is re-rendered ---
        const row = document.getElementById(`workout-row-${workoutId}`); // Get row again
        const inputField = row?.querySelector('input[type="number"]'); // Use optional chaining

        if (isChecked && inputField) {
            inputField.disabled = false; // Ensure enabled
            // Pre-fill only if actual is still null
            if (workout.actualMiles === null && workout.actualLaps === null) {
                if (workout.activity === 'SWIM') {
                    workout.actualLaps = workout.currentPlannedLaps; // Use calculated planned
                    inputField.value = workout.actualLaps;
                } else {
                    workout.actualMiles = workout.currentPlannedMiles; // Use calculated planned
                    inputField.value = workout.actualMiles.toFixed(1);
                }
                saveWorkoutActuals(workoutId); // Save the pre-filled value
            }
        } else if (!isChecked && inputField) {
            inputField.disabled = true; // Ensure disabled
            inputField.value = ''; // Clear the input field
            workout.actualLaps = null; // Reset actuals
            workout.actualMiles = null; // Reset actuals
            saveWorkoutActuals(workoutId); // Save the cleared value
        }
        // --- End Pre-fill ---
        updateProgress();
        renderTable();
    }

    function handleInputChange(event) {
        const input = event.target;
        const workoutId = parseInt(input.dataset.workoutId);
        const inputType = input.dataset.type;
        const value = input.value;
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;

        if (inputType === 'laps') {
            const laps = parseInt(value);
            workout.actualLaps = isNaN(laps) || laps < 0 ? null : laps;
        } else {
            const miles = parseFloat(value);
            workout.actualMiles = isNaN(miles) || miles < 0 ? null : miles;
        }
        saveWorkoutActuals(workoutId);
        updateProgress(); // Recalculate progress AND adjusted planned values
        renderTable(); // Re-render table to show potentially adjusted planned values
    }

    function handleGoalToggleChange() {
        // Update multiplier based on the CHECKBOX state
        goalMultiplier = goalToggleInput.checked ? 1.0 : 0.5;
        console.log("Goal toggled. New Multiplier:", goalMultiplier);
        saveState(); // Save the new multiplier state
        updateProgress(); // Recalculate progress AND adjusted planned values
        renderTable(); // Redraw table with new planned values
    }
    // Add click listener to the container div to toggle the hidden checkbox
    if (goalToggleContainer) {
        goalToggleContainer.addEventListener('click', () => {
            goalToggleInput.checked = !goalToggleInput.checked;
            // Manually trigger the change event on the hidden checkbox
            goalToggleInput.dispatchEvent(new Event('change'));
        });
    }

    function updateProgress() {
        console.log("--- Running updateProgress ---");

        // 1. Determine Overall Target Distances
        const targetSwimMiles = fullIronmanDistances.swim * goalMultiplier;
        const targetBikeMiles = fullIronmanDistances.bike * goalMultiplier;
        const targetRunMiles = fullIronmanDistances.run * goalMultiplier;
        const targetSwimLaps = targetSwimMiles * LAPS_PER_MILE;

        // 2. Calculate ACTUAL completed totals
        let actualCompletedSwimLaps = 0;
        let actualCompletedBikeMiles = 0;
        let actualCompletedRunMiles = 0;
        workouts.forEach(w => {
            if (w.completed) {
                if (w.activity === 'SWIM') actualCompletedSwimLaps += w.actualLaps ?? 0;
                else if (w.activity === 'BIKE') actualCompletedBikeMiles += w.actualMiles ?? 0;
                else if (w.activity === 'RUN') actualCompletedRunMiles += w.actualMiles ?? 0;
            }
        });
        const actualCompletedSwimMiles = actualCompletedSwimLaps / LAPS_PER_MILE;

        // --- 3. DYNAMIC ADJUSTMENT of Future Planned Values ---
        let neededRemainingSwimLaps = Math.max(0, targetSwimLaps - actualCompletedSwimLaps);
        let neededRemainingBikeMiles = Math.max(0, targetBikeMiles - actualCompletedBikeMiles);
        let neededRemainingRunMiles = Math.max(0, targetRunMiles - actualCompletedRunMiles);

        let originalPlannedRemainingSwimLaps = 0;
        let originalPlannedRemainingBikeMiles = 0;
        let originalPlannedRemainingRunMiles = 0;

        // Calculate original planned remaining based on % and FULL distances
        workouts.forEach(w => {
            if (!w.completed) {
                if (w.activity === 'SWIM') originalPlannedRemainingSwimLaps += Math.ceil(w.plannedPercent * fullIronmanDistances.swim * LAPS_PER_MILE);
                else if (w.activity === 'BIKE') originalPlannedRemainingBikeMiles += w.plannedPercent * fullIronmanDistances.bike;
                else if (w.activity === 'RUN') originalPlannedRemainingRunMiles += w.plannedPercent * fullIronmanDistances.run;
            }
        });

        // Calculate adjustment factors
        const swimAdjustFactor = originalPlannedRemainingSwimLaps > 0 ? neededRemainingSwimLaps / originalPlannedRemainingSwimLaps : 1;
        const bikeAdjustFactor = originalPlannedRemainingBikeMiles > 0 ? neededRemainingBikeMiles / originalPlannedRemainingBikeMiles : 1;
        const runAdjustFactor = originalPlannedRemainingRunMiles > 0 ? neededRemainingRunMiles / originalPlannedRemainingRunMiles : 1;

        console.log("Adjustment Factors - Swim:", swimAdjustFactor.toFixed(3), "Bike:", bikeAdjustFactor.toFixed(3), "Run:", runAdjustFactor.toFixed(3));

        // Apply adjustment factors / set current planned values
        workouts.forEach(w => {
            if (!w.completed) { // Adjust INCOMPLETE workouts
                if (w.activity === 'SWIM') {
                    const originalLaps = Math.ceil(w.plannedPercent * fullIronmanDistances.swim * LAPS_PER_MILE);
                    w.currentPlannedLaps = Math.max(0, Math.ceil(originalLaps * swimAdjustFactor));
                    w.currentPlannedMiles = w.currentPlannedLaps / LAPS_PER_MILE;
                } else { // BIKE or RUN
                    const baseDist = w.activity === 'BIKE' ? fullIronmanDistances.bike : fullIronmanDistances.run;
                    const adjustFactor = w.activity === 'BIKE' ? bikeAdjustFactor : runAdjustFactor;
                    const originalMiles = w.plannedPercent * baseDist;
                    w.currentPlannedMiles = Math.max(0, originalMiles * adjustFactor);
                    w.currentPlannedLaps = null;
                }
            } else {
                // Set currentPlanned for COMPLETED workouts based on the TARGET for that workout under the CURRENT goal setting
                if (w.activity === 'SWIM') {
                    // Calculate the target laps for this specific workout based on current goal multiplier
                    const targetLapsForThisWorkout = Math.ceil(w.plannedPercent * fullIronmanDistances.swim * goalMultiplier * LAPS_PER_MILE);
                    w.currentPlannedLaps = targetLapsForThisWorkout; // Set currentPlanned to the calculated target
                    w.currentPlannedMiles = w.currentPlannedLaps / LAPS_PER_MILE; // Update corresponding miles
                } else { // BIKE or RUN
                    // Calculate the target miles for this specific workout based on current goal multiplier
                    const baseDist = w.activity === 'BIKE' ? fullIronmanDistances.bike : fullIronmanDistances.run;
                    const targetMilesForThisWorkout = w.plannedPercent * baseDist * goalMultiplier;
                    w.currentPlannedMiles = targetMilesForThisWorkout; // Set currentPlanned to the calculated target
                    w.currentPlannedLaps = null;
                }
            }
            // Add a check for NaN just in case
            if (isNaN(w.currentPlannedMiles) || isNaN(w.currentPlannedLaps)) {
                console.error(`NaN detected for workout ${w.id}! Miles: ${w.currentPlannedMiles}, Laps: ${w.currentPlannedLaps}`);
                w.currentPlannedMiles = w.currentPlannedMiles || 0;
                w.currentPlannedLaps = w.currentPlannedLaps || 0;
            }
        });
        // --- End Dynamic Adjustment ---


        // 4. Calculate Percentages based on ACTUALS vs OVERALL TARGET
        const swimPercent = Math.min(100, targetSwimMiles > 0 ? (actualCompletedSwimMiles / targetSwimMiles) * 100 : 0);
        const bikePercent = Math.min(100, targetBikeMiles > 0 ? (actualCompletedBikeMiles / targetBikeMiles) * 100 : 0);
        const runPercent = Math.min(100, targetRunMiles > 0 ? (actualCompletedRunMiles / targetRunMiles) * 100 : 0);
        const overallPercent = (swimPercent + bikePercent + runPercent) / 3;
        const totalActualMiles = Math.min(actualCompletedSwimMiles, targetSwimMiles) + Math.min(actualCompletedBikeMiles, targetBikeMiles) + Math.min(actualCompletedRunMiles, targetRunMiles);
        const totalTargetMiles = targetSwimMiles + targetBikeMiles + targetRunMiles;
        const overallPercentByMiles = Math.min(100, totalTargetMiles > 0 ? (totalActualMiles / totalTargetMiles) * 100 : 0);


        // 5. Update UI Elements
        // Update progress bar widths
        if (swimProgressBar) swimProgressBar.style.width = `${swimPercent}%`;
        if (bikeProgressBar) bikeProgressBar.style.width = `${bikePercent}%`;
        if (runProgressBar) runProgressBar.style.width = `${runPercent}%`;
        if (overallProgressBar) overallProgressBar.style.width = `${overallPercent}%`;

        // Update Goal Spans
        if (swimGoalSpan) swimGoalSpan.textContent = targetSwimMiles.toFixed(1);
        if (bikeGoalSpan) bikeGoalSpan.textContent = targetBikeMiles.toFixed(0);
        if (runGoalSpan) runGoalSpan.textContent = targetRunMiles.toFixed(1);
        if (swimLapsGoalSpan) swimLapsGoalSpan.textContent = targetSwimLaps.toFixed(0);

        // Update Progress Text Spans
        if (swimProgressText) swimProgressText.textContent = `(${actualCompletedSwimLaps} laps / ${swimPercent.toFixed(1)}%)`;
        if (bikeProgressText) bikeProgressText.textContent = `(${actualCompletedBikeMiles.toFixed(1)} mi / ${bikePercent.toFixed(1)}%)`;
        if (runProgressText) runProgressText.textContent = `(${actualCompletedRunMiles.toFixed(1)} mi / ${runPercent.toFixed(1)}%)`;
        if (overallProgressText) overallProgressText.textContent = `${overallPercent.toFixed(1)}% COMPLETE [Avg] / ${overallPercentByMiles.toFixed(1)}% COMPLETE [Miles]`;

        // Update Icon Positions
        if (swimIcon) swimIcon.style.left = `${swimPercent}%`;
        if (bikeIcon) bikeIcon.style.left = `${bikePercent}%`;
        if (runIcon) runIcon.style.left = `${runPercent}%`;

        shareTextOutput.value = '';
        console.log("--- updateProgress Finished ---");
    }

    // (generateShareText and generateImage functions remain the same)
    function generateShareText() {
        const targetSwimMiles = fullIronmanDistances.swim * goalMultiplier;
        const targetBikeMiles = fullIronmanDistances.bike * goalMultiplier;
        const targetRunMiles = fullIronmanDistances.run * goalMultiplier;
        const targetSwimLaps = targetSwimMiles * LAPS_PER_MILE;
        const goalName = goalMultiplier === 1.0 ? 'FULL' : 'HALF';

        let actualCompletedSwimLaps = 0;
        let actualCompletedBikeMiles = 0;
        let actualCompletedRunMiles = 0;
        workouts.forEach(w => {
            if (w.completed) {
                if (w.activity === 'SWIM') actualCompletedSwimLaps += w.actualLaps ?? 0;
                else if (w.activity === 'BIKE') actualCompletedBikeMiles += w.actualMiles ?? 0;
                else if (w.activity === 'RUN') actualCompletedRunMiles += w.actualMiles ?? 0;
            }
        });
        const actualCompletedSwimMiles = actualCompletedSwimLaps / LAPS_PER_MILE;

        const swimPercent = Math.min(100, targetSwimMiles > 0 ? (actualCompletedSwimMiles / targetSwimMiles) * 100 : 0);
        const bikePercent = Math.min(100, targetBikeMiles > 0 ? (actualCompletedBikeMiles / targetBikeMiles) * 100 : 0);
        const runPercent = Math.min(100, targetRunMiles > 0 ? (actualCompletedRunMiles / targetRunMiles) * 100 : 0);
        const overallPercent = (swimPercent + bikePercent + runPercent) / 3;

        const lastCompletedWorkout = workouts.slice().reverse().find(w => w.completed);
        let lastWorkoutText = '';
        if (lastCompletedWorkout) {
            const actualVal = lastCompletedWorkout.activity === 'SWIM' ? `${lastCompletedWorkout.actualLaps ?? '?'} laps` : `${(lastCompletedWorkout.actualMiles ?? 0).toFixed(1)} mi`;
            lastWorkoutText = `Just finished workout #${lastCompletedWorkout.id} (${lastCompletedWorkout.activity} - ${actualVal})! `;
        }

        const text = `MOCK IRONMAN UPDATE (${goalName} Goal)
${lastWorkoutText}

Progress:
🏊 Swim: ${actualCompletedSwimLaps} laps / ${targetSwimLaps.toFixed(0)} laps (${swimPercent.toFixed(1)}%)
🚴 Bike: ${actualCompletedBikeMiles.toFixed(1)} mi / ${targetBikeMiles.toFixed(0)} mi (${bikePercent.toFixed(1)}%)
🏃 Run: ${actualCompletedRunMiles.toFixed(1)} mi / ${targetRunMiles.toFixed(1)} mi (${runPercent.toFixed(1)}%)
🏁 Overall: ${overallPercent.toFixed(1)}% [Avg]
`;

        shareTextOutput.value = text;
        shareTextOutput.select();
    }
    function generateImage() {
        if (!progressCaptureArea || !html2canvas) {
            console.error("Required element or library not found.");
            alert("Error: Could not find the progress area or html2canvas library.");
            return;
        }
        generateImageBtn.disabled = true;
        generateImageBtn.textContent = 'Generating...';
        const options = {
            backgroundColor: '#1e1e1e',
            useCORS: true,
        };

        html2canvas(progressCaptureArea, options).then(canvas => {
            const imageDataURL = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = imageDataURL;
            const goalName = goalMultiplier === 1.0 ? 'full' : 'half';
            downloadLink.download = `mock-ironman-progress-${goalName}.png`; // Include goal in filename
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            generateImageBtn.disabled = false;
            generateImageBtn.textContent = 'Generate Progress Image';
        }).catch(error => {
            console.error('Error generating image with html2canvas:', error);
            alert('Sorry, an error occurred while generating the image.');
            generateImageBtn.disabled = false;
            generateImageBtn.textContent = 'Generate Progress Image';
        });
    }

    // --- Initialization ---
    loadState(); // Load saved state first
    updateProgress(); // Calculate initial progress
    renderTable(); // Build table based on loaded state

    // Add Event Listeners
    generateShareBtn.addEventListener('click', generateShareText);
    generateImageBtn.addEventListener('click', generateImage);
    goalToggleInput.addEventListener('change', handleGoalToggleChange); // Listener for goal toggle

});