// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const card = $('<div class="card task-card mb-3"></div>').attr(
    "data-id",
    task.id
  );
  const cardBody = $('<div class="card-body"></div>').appendTo(card);
  $('<h5 class="card-title"></h5>').text(task.title).appendTo(cardBody);
  $('<p class="card-text"></p>').text(task.description).appendTo(cardBody);
  const deadline = dayjs(task.deadline);
  const today = dayjs();
  let colorClass = "";

  if (deadline.isBefore(today, "day")) {
    colorClass = "bg-danger text-white";
  } else if (deadline.diff(today, "day") <= 2) {
    colorClass = "bg-warning text-dark";
  }

  if (colorClass) {
    card.addClass(colorClass);
  }

  const deleteButton = $(
    '<button class="btn btn-danger btn-sm">Delete</button>'
  ).appendTo(cardBody);
  deleteButton.on("click", function () {
    handleDeleteTask(task.id);
  });

  return card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();
  taskList.forEach((task) => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
  });

  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const deadline = $("#taskDeadline").val();
  const newTask = {
    id: generateTaskId(),
    title,
    description,
    deadline,
    status: "todo",
  };

  taskList.push(newTask);
  saveTasks();
  renderTaskList();
  $("#formModal").modal("hide");
  $("#taskForm")[0].reset();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).data("task-id");
  taskList = taskList.filter((task) => task.id !== taskId);
  saveTasks();
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("task-id");
  const newStatus = $(this).attr("id").replace("-cards", "");
  const taskIndex = taskList.findIndex((task) => task.id === taskId);

  if (taskIndex !== -1) {
    // Update task status
    taskList[taskIndex].status = newStatus;
    saveTasks();
    renderTaskList();
  }
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  function renderTaskList() {
    $("#todo-cards, #in-progress-cards, #done-cards").empty();
    taskList.forEach((task) => {
      $(`#${task.status}-cards`).append(createTaskCard(task));
    });

    $(".task-card").draggable({
      revert: "invalid",
      helper: "clone",
    });

    $(".delete-task").click(handleDeleteTask);
  }

  // Event handler for adding a new task
  function handleAddTask(event) {
    event.preventDefault();
    const taskTitle = $("#taskTitle").val();
    const taskDescription = $("#taskDescription").val();
    const taskDueDate = $("#taskDueDate").val();

    const newTask = {
      id: generateTaskId(),
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      status: "to-do",
    };

    taskList.push(newTask);
    saveTasks();
    renderTaskList();
    $("#formModal").modal("hide");
    $("#taskForm")[0].reset();
  }

  // Event handler for deleting a task
  function handleDeleteTask(event) {
    const taskId = $(this).data("task-id");
    taskList = taskList.filter((task) => task.id !== taskId);
    saveTasks();
    renderTaskList();
  }

  // Initialize date picker
  $("#taskDueDate").datepicker();

  // Load tasks and nextId from localStorage
  let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

  // Save tasks and nextId to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }

  // Generate unique task ID
  function generateTaskId() {
    return "task-" + nextId++;
  }

  // Event listener for submitting the task form
  $("#taskForm").submit(handleAddTask);

  // Make lanes droppable for drag-and-drop functionality
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });

  // Initial rendering of the task list
  renderTaskList();
});
