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

  function renderWeeks(workoutData, workoutProgram) {
    const weeksContainer = document.getElementById("weeks");
    const weeks = [];

    workoutProgram.workout_program.forEach((program, index) => {
      const weekIndex = Math.floor(index / 7);
      if (!weeks[weekIndex]) {
        weeks[weekIndex] = [];
      }
      weeks[weekIndex].push(program);
    });

    weeks.forEach((week, weekIndex) => {
      const weekDiv = document.createElement("div");
      weekDiv.classList.add("week");
      weekDiv.innerHTML = `<h3>Week ${weekIndex + 1}</h3>`;
      const weekUl = document.createElement("ul");
      week.forEach((day) => {
        const dayLi = document.createElement("li");
        dayLi.classList.add("day");
        dayLi.onclick = () => {
          window.location.href = `day_workout.html?day=${day.day}`;
        };
        if (day.type === "rest") {
          dayLi.innerHTML = `<h4>Day ${day.day}</h4><p>Rest Day</p><img src="assets/rest.jpg" alt="Rest Day Image" class="thumbnail">`;
        } else {
          let dayContent = `<h4>Day ${day.day}</h4>
                                      <ul class="day-thumbnails">`;
          day.workouts_ids.forEach((workout_id) => {
            const workoutDetails = getWorkoutDetails(workout_id, workoutData);
            dayContent += `<li>
                            <a href="${workoutDetails.video_url}" target="_blank" class="thumbnail-container">
                                <img src="https://img.youtube.com/vi/${workoutDetails.video_id}/mqdefault.jpg" alt="${workoutDetails.title} thumbnail" class="thumbnail">
                                <div class="overlay">
                                    <div class="play-button"></div>
                                </div>
                            </a></li>`;
          });
          dayContent += `</ul>`;
          dayLi.innerHTML = dayContent;
        }
        weekUl.appendChild(dayLi);
      });
      weekDiv.appendChild(weekUl);
      weeksContainer.appendChild(weekDiv);
    });
  }

  async function loadWorkoutData() {
    const workoutData = await fetchData("workouts_youtube.json");
    const workoutProgram = await fetchData("workouts.json");
    renderWeeks(workoutData, workoutProgram);
  }

  // Call loadWorkoutData once DOM is loaded
  loadWorkoutData();
});
