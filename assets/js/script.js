// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;
const titleInput = $("#taskTitle");
const dateInput = $("#taskDeadline");
const descInput = $("#taskDescription");
const taskForm = $("#taskForm");
// Generates a unique task id and updates it in localStorage
function generateTaskId() {
  const id = nextId++;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return id;
}
// Creates a task card element and appends it to the applicable column
function createTaskCard(task) {
  const card = $("<div>")
    .addClass("card mb-2 task-card")
    .attr("data-task-id", task.id)
    .addClass(task.status);
  const cardBody = $("<div>").addClass("card-body");
  const cardTitle = $("<div>").addClass("card-title").text(task.title);
  const cardDate = $("<div>").addClass("card-subtitle").text(task.date);
  const cardDesc = $("<div>").addClass("card-text").text(task.desc);
  const cardDelete = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  // Determines if the task is overdue or near the deadline and color codes it
  const dueDate = dayjs(task.date);
  const today = dayjs().startOf("day");
  const overdue = dueDate.isBefore(today, "day");
  const nearDeadline = dueDate.isSame(today, "day");
  if (overdue) {
    card.addClass("bg-danger text-white");
  } else if (nearDeadline) {
    card.addClass("bg-warning text-dark");
  } else {
    card.addClass("bg-white text-dark");
  }
  cardBody.append(cardTitle, cardDate, cardDesc, cardDelete);
  card.append(cardBody);
  // Appends the task card to the applicable column based on status
  if (task.status === "to-do") {
    card.appendTo("#todo-cards");
  } else if (task.status === "in-progress") {
    card.appendTo("#in-progress-cards");
  } else if (task.status === "done") {
    card.appendTo("#done-cards");
  }
}
// Renders all task cards and makes them draggable
function renderTaskList() {
  console.log("Rendering task list...");
  console.log(taskList);
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();
  taskList.forEach(function (task) {
    createTaskCard(task);
  });
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    zIndex: 100,
  });
}
// Function that handles adding a new task from the form input
function handleAddTask(event) {
  event.preventDefault();
  const title = titleInput.val();
  const date = dateInput.val();
  const desc = descInput.val();
  const newTask = {
    id: generateTaskId(),
    title: title,
    date: dayjs(date).format("YYYY-MM-DD"),
    desc: desc,
    status: "to-do",
  };
  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  // Reset form after adding task card
  titleInput.val("");
  dateInput.val("");
  descInput.val("");
  $("#formModal").modal("hide");
}
// function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).data("task-id");
  // Removes task from list and updates local storage
  taskList = taskList.filter(function (task) {
    return task.id != taskId;
  });
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}
// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  event.preventDefault();
  const taskId = ui.draggable.data("task-id");
  const newStatus = $(this).parent().attr("id");
  // Updates the status of the task and saves the updated task list to local storage
  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].id == taskId) {
      taskList[i].status = newStatus;
    }
  }
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}
// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // initialize the date picker for the deadline input
  dateInput.datepicker({
    dateFormat: "yy-mm-dd",
  });
  //  Sets up form submit
  taskForm.on("submit", handleAddTask);
  // Sets up click event for task delete buttons
  $(document).on("click", ".delete", handleDeleteTask);
  // Makes tasks droppable
  $(".card-body").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });
  // Renders the task list
  renderTaskList();
});
