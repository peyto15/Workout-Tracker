// peyton
document.addEventListener("DOMContentLoaded", function () {
    let currentWorkout = null;
    let currentExercise = null;
    let currentSetNumber = 1;
    let workoutData = [];

    // Load workout data from local storage when the page loads
    function loadWorkoutData() {
        const savedData = localStorage.getItem('workoutData');
        if (savedData) {
            workoutData = JSON.parse(savedData);
            updateWorkoutLog(); // Update the UI with the loaded data
        }
    }

    // Save the workout data to local storage
    function saveWorkoutData() {
        localStorage.setItem('workoutData', JSON.stringify(workoutData));
    }

    loadWorkoutData();

    // Handle custom workout name visibility
    const workoutNameDropdown = document.getElementById('workoutNameDropdown');
    const customWorkoutName = document.getElementById('customWorkoutName');

    if (workoutNameDropdown) {
        workoutNameDropdown.addEventListener('change', function () {
            if (this.value === 'custom' && customWorkoutName) {
                customWorkoutName.style.display = 'block';
            } else if (customWorkoutName) {
                customWorkoutName.style.display = 'none';
            }
        });
    } else {
        console.error("Element 'workoutNameDropdown' not found.");
    }

    const setWorkoutNameButton = document.getElementById('setWorkoutName');
    const setExerciseNameButton = document.getElementById('setExerciseName');
    const currentWorkoutSection = document.getElementById('currentWorkoutSection');
    const setExerciseDiv = document.getElementById('setExerciseDiv');
    const workoutForm = document.getElementById('workoutForm');
    const addSetAndNextExerciseButton = document.getElementById('addSetAndNextExercise');
    const finishWorkoutButton = document.getElementById('finishWorkout');
    const addSetButton = document.getElementById('addSetButton');

    // Hide unnecessary sections after setting the workout
    function hideFormSections() {
        if (workoutForm) workoutForm.classList.add('hidden');
        if (addSetAndNextExerciseButton) addSetAndNextExerciseButton.style.display = 'none';
        if (finishWorkoutButton) finishWorkoutButton.style.display = 'none';
    }

    if (setWorkoutNameButton) {
        setWorkoutNameButton.addEventListener('click', function () {
            let workoutName = workoutNameDropdown.value;
            const workoutDate = document.getElementById('workoutDate').value;

            if (workoutName === 'custom') {
                workoutName = customWorkoutName.value;
            }

            if (workoutName.trim() !== '' && workoutDate.trim() !== '') {
                currentWorkout = {
                    name: workoutName,
                    date: workoutDate,
                    exercises: []
                };
                document.getElementById('currentWorkoutName').textContent = workoutName;
                document.getElementById('currentWorkoutDate').textContent = new Date(workoutDate).toLocaleDateString();
                document.getElementById('setWorkoutDiv').style.display = 'none';
                
                if (currentWorkoutSection) currentWorkoutSection.classList.remove('hidden');
                if (setExerciseDiv) setExerciseDiv.style.display = 'block';

                hideFormSections(); // Hide form sections to only show exercise name input
            }
        });
    } else {
        console.error("Element 'setWorkoutName' not found.");
    }

    if (setExerciseNameButton) {
        setExerciseNameButton.addEventListener('click', function () {
            const exerciseName = document.getElementById('exerciseName').value;

            if (exerciseName.trim() !== '') {
                currentExercise = {
                    name: exerciseName,
                    sets: []
                };
                currentSetNumber = 1; // Reset the set number for the new exercise
                document.getElementById('currentExerciseName').textContent = exerciseName;
                setExerciseDiv.style.display = 'none';
                if (workoutForm) workoutForm.classList.remove('hidden');
                if (addSetAndNextExerciseButton) addSetAndNextExerciseButton.style.display = 'block';
                if (finishWorkoutButton) finishWorkoutButton.style.display = 'block';
                document.getElementById('set').value = currentSetNumber; // Set the initial set number
            }
        });
    } else {
        console.error("Element 'setExerciseName' not found.");
    }

    // Add Set to Exercise
    if (addSetButton) {
        addSetButton.addEventListener('click', function (e) {
            e.preventDefault();

            const reps = document.getElementById('reps').value;
            const weight = document.getElementById('weight').value;

            if (reps.trim() !== '' && weight.trim() !== '') {
                currentExercise.sets.push({
                    set: currentSetNumber,
                    reps,
                    weight
                });

                displayCurrentWorkout(); // Update the table after adding a set
                currentSetNumber++;
                document.getElementById('set').value = currentSetNumber; // Increment set number
                document.getElementById('reps').value = '';
                document.getElementById('weight').value = '';
            }
        });
    }

    // Add Set and Go to Next Exercise
    if (addSetAndNextExerciseButton) {
        addSetAndNextExerciseButton.addEventListener('click', function () {
            const reps = document.getElementById('reps').value;
            const weight = document.getElementById('weight').value;

            if (reps.trim() !== '' && weight.trim() !== '') {
                currentExercise.sets.push({
                    set: currentSetNumber,
                    reps,
                    weight
                });

                displayCurrentWorkout(); // Update the table after adding a set

                currentWorkout.exercises.push(currentExercise);
                saveWorkoutData(); // Save the workout data
                updateWorkoutLog(); // Update the workout log after completing the exercise

                currentExercise = null;
                document.getElementById('currentExerciseName').textContent = '';
                if (setExerciseDiv) setExerciseDiv.style.display = 'block';
                if (workoutForm) workoutForm.classList.add('hidden');
                if (addSetAndNextExerciseButton) addSetAndNextExerciseButton.style.display = 'none';
                if (finishWorkoutButton) finishWorkoutButton.style.display = 'none';

                // Reset form fields
                document.getElementById('reps').value = '';
                document.getElementById('weight').value = '';
                currentSetNumber = 1;
                document.getElementById('set').value = currentSetNumber;
            }
        });
    } else {
        console.error("Element 'addSetAndNextExercise' not found.");
    }

    // Finish Workout
    if (finishWorkoutButton) {
        finishWorkoutButton.addEventListener('click', function () {
            if (currentWorkout) {
                const reps = document.getElementById('reps').value;
                const weight = document.getElementById('weight').value;

                // Check if the last set fields are populated and save them
                if (reps.trim() !== '' && weight.trim() !== '') {
                    currentExercise.sets.push({
                        set: currentSetNumber,
                        reps,
                        weight
                    });
                    displayCurrentWorkout(); // Update the table with the last set
                }

                // Push the last exercise if it exists
                if (currentExercise) {
                    currentWorkout.exercises.push(currentExercise);
                }

                workoutData.push(currentWorkout);
                saveWorkoutData(); // Save the workout data
                updateWorkoutLog(); // Update the workout log after finishing the workout
                resetForm();
            }
        });
    } else {
        console.error("Element 'finishWorkout' not found.");
    }

    // Display the current workout in the table
    function displayCurrentWorkout() {
        const tableBody = document.getElementById('workoutTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Clear the table before adding new rows

        currentExercise.sets.forEach(entry => {
            const newRow = tableBody.insertRow();

            newRow.insertCell(0).appendChild(document.createTextNode(currentExercise.name));
            newRow.insertCell(1).appendChild(document.createTextNode(entry.set));
            newRow.insertCell(2).appendChild(document.createTextNode(entry.reps));
            newRow.insertCell(3).appendChild(document.createTextNode(entry.weight));
        });
    }

    // Update the workout log after each exercise or when the workout is finished
    function updateWorkoutLog() {
        const workoutLog = document.getElementById('workoutLog');
        workoutLog.innerHTML = '<h2>Workout Log</h2>';

        workoutData.forEach((workout, index) => {
            const workoutDiv = document.createElement('div');
            const workoutHeader = document.createElement('div');
            const workoutDetails = document.createElement('div');

            workoutHeader.classList.add('workout-header');
            workoutHeader.innerHTML = `<h4>${workout.name} (${new Date(workout.date).toLocaleDateString()})</h4><span class="toggle-icon">+</span>`;

            // Create a delete button for each workout
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
            deleteButton.style.marginLeft = '10px';
            deleteButton.addEventListener('click', function () {
                deleteWorkout(index);
            });

            workoutHeader.appendChild(deleteButton);

            workoutDetails.classList.add('workout-details');

            workout.exercises.forEach(exercise => {
                const table = document.createElement('table');
                table.classList.add('table', 'table-striped', 'table-bordered');
                table.innerHTML = `
                    <thead class="thead-dark">
                        <tr>
                            <th>Exercise</th>
                            <th>Set #</th>
                            <th>Reps</th>
                            <th>Weight (lbs)</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;

                exercise.sets.forEach(entry => {
                    const newRow = table.getElementsByTagName('tbody')[0].insertRow();

                    newRow.insertCell(0).appendChild(document.createTextNode(exercise.name));
                    newRow.insertCell(1).appendChild(document.createTextNode(entry.set));
                    newRow.insertCell(2).appendChild(document.createTextNode(entry.reps));
                    newRow.insertCell(3).appendChild(document.createTextNode(entry.weight));
                });

                workoutDetails.appendChild(table);
            });

            workoutDiv.appendChild(workoutHeader);
            workoutDiv.appendChild(workoutDetails);
            workoutLog.appendChild(workoutDiv);

            // Toggle workout details visibility
            workoutHeader.addEventListener('click', function () {
                const icon = this.querySelector('.toggle-icon');
                if (workoutDetails.style.display === 'none' || workoutDetails.style.display === '') {
                    workoutDetails.style.display = 'block';
                    icon.textContent = '-';
                } else {
                    workoutDetails.style.display = 'none';
                    icon.textContent = '+';
                }
            });
        });
    }

    // Delete a workout
    function deleteWorkout(index) {
        workoutData.splice(index, 1); // Remove the workout from the array
        saveWorkoutData(); // Save the updated workout data
        updateWorkoutLog(); // Refresh the workout log display
    }

    // Reset the form after finishing a workout
    function resetForm() {
        currentWorkout = null;
        currentExercise = null;
        currentSetNumber = 1;
        document.getElementById('currentWorkoutName').textContent = '';
        document.getElementById('currentWorkoutDate').textContent = '';
        document.getElementById('currentExerciseName').textContent = '';
        document.getElementById('workoutTable').getElementsByTagName('tbody')[0].innerHTML = '';
        document.getElementById('setWorkoutDiv').style.display = 'block';
        if (setExerciseDiv) setExerciseDiv.style.display = 'none';
        if (currentWorkoutSection) currentWorkoutSection.classList.add('hidden');
        if (workoutForm) workoutForm.classList.add('hidden');
        if (customWorkoutName) customWorkoutName.style.display = 'none';
        workoutNameDropdown.value = '';
        customWorkoutName.value = '';
    }
});
