document.addEventListener("DOMContentLoaded", function () {
  const burgers = Array.from(document.querySelectorAll(".navbar-burger"));

  burgers.forEach(function (burger) {
    burger.addEventListener("click", function () {
      const targetId = burger.dataset.target;
      const target = document.getElementById(targetId);
      const isActive = burger.classList.toggle("is-active");

      if (target) {
        target.classList.toggle("is-active");
      }

      burger.setAttribute("aria-expanded", String(isActive));
    });
  });

  const qualitativeVideos = {
    stack: {
      conditions: [
        {value: "colors-switched", label: "Colors switched"},
        {value: "no-wrist-camera", label: "No wrist camera"},
        {value: "novel-viewpoint", label: "Novel viewpoint"}
      ],
      videos: {
        "colors-switched": {
          base: "./static/videos/qualitative/stack/colors-switched/base.mp4",
          cbg: "./static/videos/qualitative/stack/colors-switched/cbg.mp4",
          refract: "./static/videos/qualitative/stack/colors-switched/refract.mp4"
        },
        "no-wrist-camera": {
          base: "./static/videos/qualitative/stack/no-wrist-camera/base.mp4",
          cbg: "./static/videos/qualitative/stack/no-wrist-camera/cbg.mp4",
          refract: "./static/videos/qualitative/stack/no-wrist-camera/refract.mp4"
        },
        "novel-viewpoint": {
          base: "./static/videos/qualitative/stack/novel-viewpoint/base.mp4",
          cbg: "./static/videos/qualitative/stack/novel-viewpoint/cbg.mp4",
          refract: "./static/videos/qualitative/stack/novel-viewpoint/refract.mp4"
        }
      }
    },
    square: {
      conditions: [
        {value: "distractor", label: "Distractor"},
        {value: "no-wrist-camera", label: "No wrist camera"},
        {value: "novel-viewpoint", label: "Novel viewpoint"}
      ],
      videos: {
        "distractor": {
          base: "./static/videos/qualitative/square/distractor/base.mp4",
          cbg: "./static/videos/qualitative/square/distractor/cbg.mp4",
          refract: "./static/videos/qualitative/square/distractor/refract.mp4"
        },
        "no-wrist-camera": {
          base: "./static/videos/qualitative/square/no-wrist-camera/base.mp4",
          cbg: "./static/videos/qualitative/square/no-wrist-camera/cbg.mp4",
          refract: "./static/videos/qualitative/square/no-wrist-camera/refract.mp4"
        },
        "novel-viewpoint": {
          base: "./static/videos/qualitative/square/novel-viewpoint/base.mp4",
          cbg: "./static/videos/qualitative/square/novel-viewpoint/cbg.mp4",
          refract: "./static/videos/qualitative/square/novel-viewpoint/refract.mp4"
        }
      }
    }
  };

  const taskButtons = Array.from(document.querySelectorAll("#simulation-qualitative .task-toggle-button"));
  const simulationConditionToggle = document.getElementById("qualitative-condition-toggle");
  const conditionNote = document.getElementById("qualitative-condition-note");
  const simulationVideoCards = Array.from(document.querySelectorAll("#simulation-qualitative .qualitative-video-card"));
  let activeTask = "stack";
  let activeCondition = qualitativeVideos[activeTask].conditions[0].value;

  function loadVideoCard(card, path) {
    const video = card.querySelector("video");
    const placeholder = card.querySelector(".qualitative-video-placeholder");
    const placeholderMessage = placeholder && placeholder.querySelector("span");
    const pathLabel = card.querySelector(".placeholder-path");

    if (!video || !placeholder || !pathLabel) {
      return;
    }

    placeholderMessage.textContent = "Video placeholder";
    pathLabel.textContent = path;
    placeholder.hidden = false;
    video.pause();
    video.onloadeddata = function () {
      placeholder.hidden = true;
      video.play().catch(function () {});
    };
    video.onerror = function () {
      placeholder.hidden = false;
    };
    video.src = path;
    video.load();
  }

  function updateSimulationVideos() {
    const paths = qualitativeVideos[activeTask].videos[activeCondition];

    if (conditionNote) {
      conditionNote.hidden = activeCondition !== "no-wrist-camera";
    }

    simulationVideoCards.forEach(function (card) {
      const method = card.dataset.method;
      loadVideoCard(card, paths[method]);
    });
  }

  function renderSimulationConditions() {
    if (!simulationConditionToggle) {
      return;
    }

    simulationConditionToggle.replaceChildren();
    qualitativeVideos[activeTask].conditions.forEach(function (condition) {
      const button = document.createElement("button");
      const isActive = condition.value === activeCondition;
      button.type = "button";
      button.className = "condition-toggle-button";
      button.textContent = condition.label;
      button.dataset.condition = condition.value;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.addEventListener("click", function () {
        activeCondition = condition.value;
        Array.from(simulationConditionToggle.children).forEach(function (candidate) {
          const candidateIsActive = candidate === button;
          candidate.classList.toggle("is-active", candidateIsActive);
          candidate.setAttribute("aria-pressed", String(candidateIsActive));
        });
        updateSimulationVideos();
      });
      simulationConditionToggle.appendChild(button);
    });
    updateSimulationVideos();
  }

  taskButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeTask = button.dataset.task;
      taskButtons.forEach(function (candidate) {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      activeCondition = qualitativeVideos[activeTask].conditions[0].value;
      renderSimulationConditions();
    });
  });

  if (simulationConditionToggle) {
    renderSimulationConditions();
  }

  const liberoConditionButtons = Array.from(document.querySelectorAll("#libero-condition-toggle .condition-toggle-button"));
  const liberoTaskSelect = document.getElementById("libero-task-select");
  const liberoRolloutContainer = document.getElementById("libero-rollout-results");

  if (liberoRolloutContainer) {
    const templateRow = liberoRolloutContainer.querySelector(".libero-rollout-row");
    for (let index = 1; index < 3; index += 1) {
      const row = templateRow.cloneNode(true);
      row.dataset.rolloutIndex = String(index);
      row.querySelectorAll(".qualitative-video-card h4").forEach(function (heading) {
        heading.remove();
      });
      liberoRolloutContainer.appendChild(row);
    }
  }

  const liberoRolloutRows = Array.from(document.querySelectorAll("#multitask-qualitative .libero-rollout-row"));
  const liberoOutcomes = window.liberoRolloutResults || {};
  const liberoMediaVersion = "20260930-2";
  let activeLiberoCondition = "background-textures";

  function updateRolloutStatus(card, outcome) {
    const status = card.querySelector(".rollout-status");
    if (!status) {
      return;
    }

    if (typeof outcome !== "boolean") {
      status.hidden = true;
      return;
    }

    status.hidden = false;
    status.textContent = outcome ? "Success" : "Failure";
    status.classList.toggle("is-success", outcome);
    status.classList.toggle("is-failure", !outcome);
  }

  function updateLiberoVideos() {
    if (!liberoTaskSelect) {
      return;
    }

    const selection = activeLiberoCondition + "/" + liberoTaskSelect.value;
    const selectedOutcomes = liberoOutcomes[selection] || [];

    liberoRolloutRows.forEach(function (row, rowIndex) {
      const rollout = "rollout-" + String(rowIndex + 1).padStart(2, "0");
      const outcomes = selectedOutcomes[rowIndex] || {};
      const cards = Array.from(row.querySelectorAll(".qualitative-video-card"));

      cards.forEach(function (card) {
        const role = card.dataset.videoRole;
        const outcomeKey = role === "base-id" ? "baseId" : role === "base-ood" ? "baseOod" : "refract";
        const path = "./static/videos/qualitative/libero-10/" + selection + "/" + rollout + "/" + role + ".mp4?v=" + liberoMediaVersion;
        loadVideoCard(card, path);
        updateRolloutStatus(card, outcomes[outcomeKey]);
      });
    });
  }

  liberoConditionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeLiberoCondition = button.dataset.condition;
      liberoConditionButtons.forEach(function (candidate) {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      updateLiberoVideos();
    });
  });

  if (liberoTaskSelect) {
    liberoTaskSelect.addEventListener("change", updateLiberoVideos);
    updateLiberoVideos();
  }

  const failureCaseDescriptions = {
    "robot-initial-states": "REFRACT fails under novel initial states because success requires novel behavior outside the base policy’s training distribution.",
    "task-aliasing": "Tasks 5 and 6 present visually similar observations but require different actions, whereas the remaining LIBERO-10 tasks have more visually distinct observations. REFRACT’s unified embedding diffusion model can confuse these two tasks and steer toward the wrong task embedding, causing failure."
  };
  const failureCaseButtons = Array.from(document.querySelectorAll("#failure-case-toggle .condition-toggle-button"));
  const failureCaseDescription = document.getElementById("failure-case-description");
  const failureRolloutContainer = document.getElementById("failure-rollout-results");
  let activeFailureMode = "robot-initial-states";

  if (failureRolloutContainer) {
    const templateRow = failureRolloutContainer.querySelector(".failure-rollout-row");
    for (let index = 1; index < 3; index += 1) {
      const row = templateRow.cloneNode(true);
      row.dataset.rolloutIndex = String(index);
      row.querySelectorAll(".qualitative-video-card h4").forEach(function (heading) {
        heading.remove();
      });
      failureRolloutContainer.appendChild(row);
    }
  }

  const failureRolloutRows = Array.from(document.querySelectorAll("#failure-cases .failure-rollout-row"));

  function updateFailureCaseVideos() {
    if (failureCaseDescription) {
      failureCaseDescription.textContent = failureCaseDescriptions[activeFailureMode];
    }

    failureRolloutRows.forEach(function (row, rowIndex) {
      const rollout = "rollout-" + String(rowIndex + 1).padStart(2, "0");
      const cards = Array.from(row.querySelectorAll(".qualitative-video-card"));

      cards.forEach(function (card) {
        const role = card.dataset.videoRole;
        const path = "./static/videos/failure-cases/" + activeFailureMode + "/" + rollout + "/" + role + ".mp4?v=20261001";
        loadVideoCard(card, path);
      });
    });
  }

  failureCaseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFailureMode = button.dataset.failureMode;
      failureCaseButtons.forEach(function (candidate) {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      updateFailureCaseVideos();
    });
  });

  if (failureRolloutContainer) {
    updateFailureCaseVideos();
  }
});
