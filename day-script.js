document.addEventListener("DOMContentLoaded", () => {
    window.loadNav();
  async function fetchData(file) {
    const response = await fetch(`json_data/${file}`);
    return response.json();
  }

  function getVideoId(url) {
    const urlObj = new URL(url);
    const videoId =
      urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
    return videoId;
  }

  function getWorkoutDetails(id, workoutData) {
    const videoData = workoutData.data.find((video) => video.video_id === id);
    if (videoData) {
      const videoId = getVideoId(videoData.video_url);
      return { ...videoData, video_id: videoId };
    } else {
      return { title: "Unknown", video_url: "#", video_id: "" };
    }
  }

  async function renderDayDetails(dayId) {
    const workoutData = await fetchData("workouts_youtube.json");
    const workoutProgram = await fetchData("workouts.json");
    const equipmentData = await fetchData("equipments.json");
    const intensityData = await fetchData("intensity.json");
    const workoutTypesData = await fetchData("workout_types.json");

    const dayProgram = workoutProgram.workout_program.find(
      (day) => day.day == dayId
    );

    // Set Day Title
    document.getElementById(
      "day-title"
    ).textContent = `Day ${dayProgram.day}: Workout & Warm-up Details`;

    // Render Warm-up Video
    const warmUpDetails = getWorkoutDetails(dayProgram.warm_up_id, workoutData);
    document.getElementById("warm-up-video").innerHTML = `
            <div class="thumbnail-container">
                <img src="https://img.youtube.com/vi/${warmUpDetails.video_id}/mqdefault.jpg" alt="${warmUpDetails.title} thumbnail" class="thumbnail">
                <div class="overlay">
                    <div class="play-button"></div>
                </div>
            </div>`;

    const equipmentList = [];
    const intensityList = [];
    const workoutTypeList = [];

    // Render Workout Videos and Collect Details
    const workoutsContainer = document.getElementById("workouts-videos");
    workoutsContainer.innerHTML = "";
    dayProgram.workouts_ids.forEach((workout_id) => {
      const workoutDetails = getWorkoutDetails(workout_id, workoutData);
      const intensityLevel = intensityData.intensity_levels.find(
        (level) =>
          level.intensity_level_id === workoutDetails.intensity_level_id
      );
      const workoutType = workoutTypesData.workout_types.find(
        (type) => type.workout_type_id === workoutDetails.workout_type_id
      );

      workoutsContainer.innerHTML += `
                <div class="workout-details">
                    <div class="thumbnail-container">
                        <a href="${workoutDetails.video_url}" target="_blank">
                            <img src="https://img.youtube.com/vi/${workoutDetails.video_id}/mqdefault.jpg" alt="${workoutDetails.title} thumbnail" class="thumbnail">
                            <div class="overlay">
                                <div class="play-button"></div>
                            </div>
                        </a>
                    </div>
                    <p>Intensity Level: ${intensityLevel.intensity_level}</p>
                    <p>Workout Type: ${workoutType.workout_type}</p>
                </div>`;

      // Collect Equipment, Intensity, and Workout Type
      workoutDetails.equipment_needed_ids.forEach((equipment_id) => {
        const equipment = equipmentData.equipment.find(
          (e) => e.equipment_id === equipment_id
        );
        if (equipment && !equipmentList.includes(equipment.equipment_name)) {
          equipmentList.push(equipment.equipment_name);
        }
      });
      intensityList.push(intensityLevel.intensity_level);
      workoutTypeList.push(workoutType.workout_type);
    });

    // Render Equipment Details
    const equipmentUL = document.getElementById("equipment-list");
    equipmentUL.innerHTML = equipmentList
      .map((item) => `<li>${item}</li>`)
      .join("");

    // Render Combined Intensity and Workout Types
    document.getElementById(
      "intensity-level"
    ).innerHTML = `<strong>Intensity Levels:</strong> ${[
      ...new Set(intensityList),
    ].join(", ")}`;
    document.getElementById(
      "workout-type"
    ).innerHTML = `<strong>Workout Types:</strong> ${[
      ...new Set(workoutTypeList),
    ].join(", ")}`;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const dayId = urlParams.get("day");
  if (dayId) {
    renderDayDetails(dayId);
  } else {
    document.getElementById("day-title").textContent = "Day not found";
  }
});
