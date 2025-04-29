document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const ironmanDistances = {
        swim: 2.4,
        bike: 112,
        run: 26.2
    };

    const workouts = [ // Using initial data + the pre-checked item
        { id: 1, activity: 'SWIM', miles: 0.2, laps: 7, completed: false },
        { id: 2, activity: 'BIKE', miles: 6, laps: null, completed: false },
        { id: 3, activity: 'RUN', miles: 1.5, laps: null, completed: true },
        { id: 4, activity: 'SWIM', miles: 0.3, laps: 10, completed: false },
        { id: 5, activity: 'BIKE', miles: 8, laps: null, completed: false },
        { id: 6, activity: 'RUN', miles: 2, laps: null, completed: false },
        { id: 7, activity: 'SWIM', miles: 0.3, laps: 10, completed: false },
        { id: 8, activity: 'BIKE', miles: 10, laps: null, completed: false },
        { id: 9, activity: 'RUN', miles: 2.5, laps: null, completed: false },
        { id: 10, activity: 'SWIM', miles: 0.3, laps: 10, completed: false },
        { id: 11, activity: 'BIKE', miles: 12, laps: null, completed: false },
        { id: 12, activity: 'RUN', miles: 3, laps: null, completed: false },
        { id: 13, activity: 'SWIM', miles: 0.3, laps: 10, completed: false },
        { id: 14, activity: 'BIKE', miles: 16, laps: null, completed: false },
        { id: 15, activity: 'RUN', miles: 3.5, laps: null, completed: false },
        { id: 16, activity: 'SWIM', miles: 0.3, laps: 10, completed: false },
        { id: 17, activity: 'BIKE', miles: 18, laps: null, completed: false },
        { id: 18, activity: 'RUN', miles: 4, laps: null, completed: false },
        { id: 19, activity: 'SWIM', miles: 0.3, laps: 10, completed: false },
        { id: 20, activity: 'BIKE', miles: 20, laps: null, completed: false },
        { id: 21, activity: 'RUN', miles: 4.5, laps: null, completed: false },
        { id: 22, activity: 'SWIM', miles: 0.4, laps: 11, completed: false },
        { id: 23, activity: 'BIKE', miles: 22, laps: null, completed: false },
        { id: 24, activity: 'RUN', miles: 5.2, laps: null, completed: false }
    ];

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

    const swimIcon = document.getElementById('swim-icon');
    const bikeIcon = document.getElementById('bike-icon');
    const runIcon = document.getElementById('run-icon');

    const generateShareBtn = document.getElementById('generate-share-text');
    const shareTextOutput = document.getElementById('share-text-output');

    const generateImageBtn = document.getElementById('generate-image-btn');
    const progressCaptureArea = document.getElementById('progress-capture-area');

    // --- Functions ---

    function loadState() {
        workouts.forEach(workout => {
            const savedState = localStorage.getItem(`workout_${workout.id}_completed`);
            workout.completed = savedState !== null ? JSON.parse(savedState) : workout.completed;
        });
    }

    function saveState(workoutId, isCompleted) {
        localStorage.setItem(`workout_${workoutId}_completed`, JSON.stringify(isCompleted));
    }

    function renderTable() {
        tableBody.innerHTML = '';
        workouts.forEach((workout, index) => {
            const row = tableBody.insertRow();
            row.id = `workout-row-${workout.id}`;
            if (workout.completed) {
                row.classList.add('completed');
            }

            const cellCheckbox = row.insertCell();
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = workout.completed;
            checkbox.dataset.workoutId = workout.id;
            checkbox.addEventListener('change', handleCheckboxChange);
            cellCheckbox.appendChild(checkbox);

            row.insertCell().textContent = workout.id;
            row.insertCell().textContent = workout.activity;
            row.insertCell().textContent = workout.miles.toFixed(1);
            row.insertCell().textContent = workout.laps !== null ? workout.laps : '-';
        });
    }

    function handleCheckboxChange(event) {
        const checkbox = event.target;
        const workoutId = parseInt(checkbox.dataset.workoutId);
        const isChecked = checkbox.checked;

        const workout = workouts.find(w => w.id === workoutId);
        if (workout) {
            workout.completed = isChecked;
            saveState(workoutId, isChecked);
        }

        const row = document.getElementById(`workout-row-${workoutId}`);
        if (isChecked) {
            row.classList.add('completed');
        } else {
            row.classList.remove('completed');
        }

        updateProgress();
    }

    function updateProgress() {
        let completedSwimMiles = 0;
        let completedBikeMiles = 0;
        let completedRunMiles = 0;

        workouts.forEach(workout => {
            if (workout.completed) {
                switch (workout.activity.toUpperCase()) {
                    case 'SWIM': completedSwimMiles += workout.miles; break;
                    case 'BIKE': completedBikeMiles += workout.miles; break;
                    case 'RUN': completedRunMiles += workout.miles; break;
                }
            }
        });

        const swimPercent = Math.min(100, (completedSwimMiles / ironmanDistances.swim) * 100);
        const bikePercent = Math.min(100, (completedBikeMiles / ironmanDistances.bike) * 100);
        const runPercent = Math.min(100, (completedRunMiles / ironmanDistances.run) * 100);
        const overallPercent = (swimPercent + bikePercent + runPercent) / 3;

        const totalCompletedMiles = completedSwimMiles + completedBikeMiles + completedRunMiles;
        const totalIronmanMiles = ironmanDistances.swim + ironmanDistances.bike + ironmanDistances.run;
        const overallPercentbyMiles = Math.min(100, (totalCompletedMiles / totalIronmanMiles) * 100);

        // Update progress bar widths
        swimProgressBar.style.width = `${swimPercent}%`;
        bikeProgressBar.style.width = `${bikePercent}%`;
        runProgressBar.style.width = `${runPercent}%`;
        overallProgressBar.style.width = `${overallPercent}%`;

        // Update the NEW progress text spans INSIDE the labels
        swimProgressText.textContent = `(${completedSwimMiles.toFixed(1)} mi / ${swimPercent.toFixed(1)}%)`;
        bikeProgressText.textContent = `(${completedBikeMiles.toFixed(0)} mi / ${bikePercent.toFixed(1)}%)`;
        runProgressText.textContent = `(${completedRunMiles.toFixed(1)} mi / ${runPercent.toFixed(1)}%)`;
        overallProgressText.textContent = `${overallPercent.toFixed(1)}% COMPLETE BY ACTIVITY (${overallPercentbyMiles.toFixed(1)}% COMPLETE BY MILEAGE)`;

        // Update goal display spans
        swimGoalSpan.textContent = ironmanDistances.swim;
        bikeGoalSpan.textContent = ironmanDistances.bike;
        runGoalSpan.textContent = ironmanDistances.run;

        // Ensure icons exist before setting style
        if (swimIcon) swimIcon.style.left = `${swimPercent}%`;
        if (bikeIcon) bikeIcon.style.left = `${bikePercent}%`;
        if (runIcon) runIcon.style.left = `${runPercent}%`;

        shareTextOutput.value = '';
    }

    function generateShareText() {
        const completedSwimMiles = workouts.filter(w => w.completed && w.activity === 'SWIM').reduce((sum, w) => sum + w.miles, 0);
        const completedBikeMiles = workouts.filter(w => w.completed && w.activity === 'BIKE').reduce((sum, w) => sum + w.miles, 0);
        const completedRunMiles = workouts.filter(w => w.completed && w.activity === 'RUN').reduce((sum, w) => sum + w.miles, 0);
        const swimPercent = Math.min(100, (completedSwimMiles / ironmanDistances.swim) * 100);
        const bikePercent = Math.min(100, (completedBikeMiles / ironmanDistances.bike) * 100);
        const runPercent = Math.min(100, (completedRunMiles / ironmanDistances.run) * 100);
        const totalCompletedMiles = completedSwimMiles + completedBikeMiles + completedRunMiles;
        const totalIronmanMiles = ironmanDistances.swim + ironmanDistances.bike + ironmanDistances.run;
        const overallPercent = Math.min(100, (totalCompletedMiles / totalIronmanMiles) * 100);
        const lastCompletedWorkout = workouts.slice().reverse().find(w => w.completed);
        const lastWorkoutText = lastCompletedWorkout ? `Just finished workout #${lastCompletedWorkout.id} (${lastCompletedWorkout.activity} ${lastCompletedWorkout.miles}mi)! ` : '';

        const text = `MOCK IRONMAN UPDATE
${lastWorkoutText}

Progress:
🏊 Swim: ${completedSwimMiles.toFixed(1)}/${ironmanDistances.swim} mi (${swimPercent.toFixed(1)}%)
🚴 Bike: ${completedBikeMiles.toFixed(0)}/${ironmanDistances.bike} mi (${bikePercent.toFixed(1)}%)
🏃 Run: ${completedRunMiles.toFixed(1)}/${ironmanDistances.run} mi (${runPercent.toFixed(1)}%)
🏁 Overall: ${overallPercent.toFixed(1)}%
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

        // Disable button while generating
        generateImageBtn.disabled = true;
        generateImageBtn.textContent = 'Generating...';

        progressCaptureArea.classList.add('capture-width');

        // Options for html2canvas (optional, but can help with quality/background)
        const options = {
            backgroundColor: '#1e1e1e', // Match the section background
            useCORS: true // Important if you ever use external images/fonts
        };

        // Allow a tiny delay for the browser to apply the class change before capturing
        // This might not always be necessary but can help prevent race conditions
        setTimeout(() => {
            html2canvas(progressCaptureArea, options).then(canvas => {
                // --- REMOVE CLASS AFTER CAPTURE (Success) ---
                progressCaptureArea.classList.remove('capture-width');
                // --- END REMOVE CLASS ---

                // Convert canvas to image data URL (PNG format)
                const imageDataURL = canvas.toDataURL('image/png');

                // Create a temporary link element
                const downloadLink = document.createElement('a');
                downloadLink.href = imageDataURL;
                downloadLink.download = 'mock-ironman-progress.png'; // Set the filename

                // Append link to body, click it, then remove it
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Re-enable button
                generateImageBtn.disabled = false;
                generateImageBtn.textContent = 'Generate Progress Image';

            }).catch(error => {
                // --- REMOVE CLASS AFTER CAPTURE (Error) ---
                // Ensure class is removed even if capture fails
                progressCaptureArea.classList.remove('capture-width');
                // --- END REMOVE CLASS ---

                console.error('Error generating image with html2canvas:', error);
                alert('Sorry, an error occurred while generating the image.');
                // Re-enable button even on error
                generateImageBtn.disabled = false;
                generateImageBtn.textContent = 'Generate Progress Image';
            });
        }, 50); // 50ms delay - adjust if needed, or remove if it works without
    }

    // --- Initialization ---
    loadState();
    renderTable();
    updateProgress();
    generateShareBtn.addEventListener('click', generateShareText);
    generateImageBtn.addEventListener('click', generateImage);
});
