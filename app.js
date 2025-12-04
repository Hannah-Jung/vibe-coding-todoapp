// Import Firebase functions
import { database } from "./firebase-config.js";
import {
  ref,
  push,
  set,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// DOM Elements
const todoInput = document.getElementById("todoInput");
const todoTitleInputForm = document.getElementById("todoTitleInputForm");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const searchEmptyState = document.getElementById("searchEmptyState");
const todoDetailModal = document.getElementById("todoDetailModal");
const todoTitleInput = document.getElementById("todoTitleInput");
const todoTextInput = document.getElementById("todoTextInput");
const lastEditedTime = document.getElementById("lastEditedTime");
const backBtn = document.getElementById("backBtn");
const pinBtn = document.getElementById("pinBtn");
const deleteBtn = document.getElementById("deleteBtn");
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
const deleteCancelBtn = document.getElementById("deleteCancelBtn");
const editModal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeBtn = document.querySelector(".close");

let currentEditId = null;
let currentViewId = null;
let currentPinnedStatus = false;
let saveTimeout = null;
let searchQuery = "";
let allTodos = [];

// Reference to todos in database
const todosRef = ref(database, "todos");

// Show title input when todoInput is clicked
todoInput.addEventListener("focus", () => {
  todoTitleInputForm.style.display = "block";
});

// Hide title input when clicking outside (optional)
document.addEventListener("click", (e) => {
  if (!e.target.closest(".todo-form")) {
    if (todoTitleInputForm.value.trim() === "") {
      todoTitleInputForm.style.display = "none";
    }
  }
});

// Add Todo
addBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});
todoTitleInputForm.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    todoInput.focus();
  }
});

function addTodo() {
  const todoText = todoInput.value.trim();
  const todoTitle = todoTitleInputForm.value.trim();

  if (todoText === "") {
    alert("Please enter a task!");
    return;
  }

  // Add to Realtime Database
  const newTodoRef = push(todosRef);
  set(newTodoRef, {
    title: todoTitle || "Untitled",
    text: todoText,
    createdAt: Date.now(),
    pinned: false,
  })
    .then(() => {
      todoInput.value = "";
      todoTitleInputForm.value = "";
      todoTitleInputForm.style.display = "none";
      todoInput.focus();
    })
    .catch((error) => {
      console.error("Error adding todo: ", error);
      alert("Error adding task. Please try again.");
    });
}

// Show Delete Confirmation Modal
function showDeleteConfirm() {
  deleteConfirmModal.classList.add("show");
}

// Close Delete Confirmation Modal
function closeDeleteConfirm() {
  deleteConfirmModal.classList.remove("show");
}

// Delete Todo
function deleteTodo(id) {
  const todoRef = ref(database, `todos/${id}`);
  remove(todoRef)
    .then(() => {
      closeDeleteConfirm();
      closeTodoDetailModal();
    })
    .catch((error) => {
      console.error("Error deleting todo: ", error);
      alert("Error deleting task. Please try again.");
    });
}

// Adjust textarea height dynamically based on content
function adjustTextareaHeight() {
  const textarea = todoTextInput;
  if (!textarea) return;
  
  // Reset height to auto to get accurate scrollHeight
  textarea.style.height = 'auto';
  
  // Get computed styles
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
  const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop);
  const paddingBottom = parseFloat(getComputedStyle(textarea).paddingBottom);
  const padding = paddingTop + paddingBottom;
  
  // Calculate min and max heights
  const minHeight = lineHeight * 3 + padding; // 3 lines
  const maxHeight = window.innerHeight * 0.35; // 35vh
  
  // Get content height
  const scrollHeight = textarea.scrollHeight;
  
  if (scrollHeight < minHeight) {
    // Content is less than 3 lines: use min-height
    textarea.style.height = minHeight + 'px';
    textarea.style.overflowY = 'hidden';
  } else if (scrollHeight <= maxHeight) {
    // Content is between min and max: auto resize to content
    textarea.style.height = scrollHeight + 'px';
    textarea.style.overflowY = 'hidden';
  } else {
    // Content exceeds max: use max-height with scroll
    textarea.style.height = maxHeight + 'px';
    textarea.style.overflowY = 'auto';
  }
}

// Toggle Pin Status (from modal)
function togglePin() {
  if (!currentViewId) return;
  
  const todoRef = ref(database, `todos/${currentViewId}`);
  const newPinnedStatus = !currentPinnedStatus;
  
  update(todoRef, {
    pinned: newPinnedStatus,
  })
    .then(() => {
      currentPinnedStatus = newPinnedStatus;
      updatePinButton(newPinnedStatus);
    })
    .catch((error) => {
      console.error("Error toggling pin: ", error);
      alert("Error updating pin status. Please try again.");
    });
}

// Toggle Pin Status (from list)
function togglePinFromList(id, currentPinned) {
  const todoRef = ref(database, `todos/${id}`);
  const newPinnedStatus = !currentPinned;
  
  update(todoRef, {
    pinned: newPinnedStatus,
  }).catch((error) => {
    console.error("Error toggling pin: ", error);
    alert("Error updating pin status. Please try again.");
  });
}

// Format relative time
function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  
  const now = new Date();
  const edited = new Date(timestamp);
  const diffMs = now - edited;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Same day - show time
  if (diffDays === 0) {
    // Less than 1 hour - show minutes ago
    if (diffMins < 60) {
      if (diffMins < 1) {
        return "Edited just now";
      }
      return `Edited ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    // Today - show time
    const timeStr = edited.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `Edited ${timeStr}`;
  }
  
  // Same year - show month and day
  if (edited.getFullYear() === now.getFullYear()) {
    const monthStr = edited.toLocaleDateString('en-US', { month: 'short' });
    const day = edited.getDate();
    return `Edited ${monthStr} ${day}`;
  }
  
  // Different year - show full date
  const monthStr = edited.toLocaleDateString('en-US', { month: 'short' });
  const day = edited.getDate();
  const year = edited.getFullYear();
  return `Edited ${monthStr} ${day}, ${year}`;
}

// Update Pin Button Icon
function updatePinButton(pinned) {
  const pinIcon = pinBtn.querySelector("i");
  if (pinned) {
    pinIcon.style.color = "#6c75e0";
    pinBtn.title = "Unpin";
  } else {
    pinIcon.style.color = "#999";
    pinBtn.title = "Pin";
  }
}

// Show Todo Detail Modal
function showTodoDetail(id, todo) {
  currentViewId = id;
  currentPinnedStatus = todo.pinned || false;
  todoTitleInput.value = todo.title || "Untitled";
  todoTextInput.value = todo.text || "";
  todoTitleInput.readOnly = true;
  
  // Update pin button state
  updatePinButton(currentPinnedStatus);
  
  // Update last edited time
  if (todo.updatedAt) {
    lastEditedTime.textContent = formatRelativeTime(todo.updatedAt);
    lastEditedTime.style.display = "block";
  } else if (todo.createdAt) {
    lastEditedTime.textContent = formatRelativeTime(todo.createdAt);
    lastEditedTime.style.display = "block";
  } else {
    lastEditedTime.style.display = "none";
  }
  
  // Reset textarea scroll to top before opening modal
  todoTextInput.scrollTop = 0;
  
  todoDetailModal.classList.add("show");
  
  // Adjust textarea height after modal is shown
  setTimeout(() => {
    adjustTextareaHeight();
    // Ensure scroll is at top after height adjustment
    todoTextInput.scrollTop = 0;
  }, 100);
}

// Enable title editing on click
function enableTitleEdit() {
  if (todoTitleInput.readOnly) {
    todoTitleInput.readOnly = false;
    todoTitleInput.focus();
    todoTitleInput.select();
  }
}

// Close Todo Detail Modal
function closeTodoDetailModal() {
  // Save any pending changes before closing
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTodoChanges();
  }
  todoDetailModal.classList.remove("show");
  currentViewId = null;
}

// Save todo changes (debounced)
function saveTodoChanges() {
  if (!currentViewId) return;

  const title = todoTitleInput.value.trim();
  const text = todoTextInput.value.trim();

  if (title === "" && text === "") {
    return; // Don't save empty todos
  }

  const todoRef = ref(database, `todos/${currentViewId}`);
  const updateData = {
    title: title || "Untitled",
    text: text,
    updatedAt: Date.now(),
  };

  update(todoRef, updateData)
    .then(() => {
      // Update last edited time display
      lastEditedTime.textContent = formatRelativeTime(updateData.updatedAt);
      lastEditedTime.style.display = "block";
    })
    .catch((error) => {
      console.error("Error updating todo: ", error);
    });
}

// Debounced save function
function debounceSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveTodoChanges();
  }, 500); // Save after 500ms of no typing
}

// Edit Todo (legacy - for direct edit)
function editTodo(id, currentText) {
  currentEditId = id;
  editInput.value = currentText;
  editModal.classList.add("show");
  editInput.focus();
}

// Save edited Todo
function saveEditedTodo() {
  const newText = editInput.value.trim();

  if (newText === "") {
    alert("Please enter a task!");
    return;
  }

  if (currentEditId) {
    const todoRef = ref(database, `todos/${currentEditId}`);
    update(todoRef, {
      text: newText,
    })
      .then(() => {
        closeEditModal();
      })
      .catch((error) => {
        console.error("Error updating todo: ", error);
        alert("Error updating task. Please try again.");
      });
  }
}

saveBtn.addEventListener("click", saveEditedTodo);

// Save on Enter key press in edit input
editInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    saveEditedTodo();
  }
});

// Todo Detail Modal Event Listeners
backBtn.addEventListener("click", closeTodoDetailModal);
pinBtn.addEventListener("click", togglePin);
deleteBtn.addEventListener("click", () => {
  if (currentViewId) {
    showDeleteConfirm();
  }
});

// Delete Confirmation Modal Event Listeners
deleteConfirmBtn.addEventListener("click", () => {
  if (currentViewId) {
    deleteTodo(currentViewId);
  }
});
deleteCancelBtn.addEventListener("click", closeDeleteConfirm);

// Enable title editing on click
todoTitleInput.addEventListener("click", enableTitleEdit);

// Real-time save on input changes
todoTitleInput.addEventListener("input", () => {
  debounceSave();
  // Keep editing enabled after input
  todoTitleInput.readOnly = false;
});
todoTextInput.addEventListener("input", () => {
  debounceSave();
  adjustTextareaHeight();
});

// Adjust textarea height on window resize
window.addEventListener("resize", () => {
  if (todoDetailModal.classList.contains("show")) {
    adjustTextareaHeight();
  }
});

// Disable title editing when clicking outside
todoTitleInput.addEventListener("blur", () => {
  todoTitleInput.readOnly = true;
});

// Close todo detail modal when clicking outside
todoDetailModal.addEventListener("click", (e) => {
  if (e.target === todoDetailModal) {
    closeTodoDetailModal();
  }
});

// Close delete confirm modal when clicking outside
deleteConfirmModal.addEventListener("click", (e) => {
  if (e.target === deleteConfirmModal) {
    closeDeleteConfirm();
  }
});

// Cancel edit
cancelBtn.addEventListener("click", closeEditModal);
closeBtn.addEventListener("click", closeEditModal);

// Close modal when clicking outside
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (deleteConfirmModal.classList.contains("show")) {
      closeDeleteConfirm();
    } else if (todoDetailModal.classList.contains("show")) {
      closeTodoDetailModal();
    } else if (editModal.classList.contains("show")) {
      closeEditModal();
    }
  }
});

function closeEditModal() {
  editModal.classList.remove("show");
  currentEditId = null;
  editInput.value = "";
}

// Render Todo Item
function renderTodo(id, todo) {
  const li = document.createElement("li");
  li.className = "todo-item-wrapper";
  li.setAttribute("data-id", id);
  li.style.cursor = "pointer";

  const title = todo.title || "Untitled";
  const text = todo.text || "";
  const pinned = todo.pinned || false;
  const completed = todo.completed || false;

  // Add completed class if todo is completed
  if (completed) {
    li.classList.add("completed");
  }

  li.innerHTML = `
        <div class="todo-item ${completed ? 'completed' : ''}">
            <div class="todo-content">
                <span class="todo-title">${escapeHtml(title)}</span>
                ${
                  text
                    ? `<span class="todo-text">${escapeHtml(text)}</span>`
                    : ""
                }
            </div>
            <div class="todo-actions">
                <input type="checkbox" class="todo-checkbox" ${completed ? 'checked' : ''} onclick="event.stopPropagation(); toggleComplete('${id}', ${completed})" title="${completed ? 'Mark as incomplete' : 'Mark as complete'}">
                <div class="todo-pin-indicator ${pinned ? 'pinned' : 'unpinned'}" onclick="event.stopPropagation(); togglePinFromList('${id}', ${pinned})" title="${pinned ? 'Unpin' : 'Pin'}">
                    <i class="fas fa-thumbtack"></i>
                </div>
            </div>
        </div>
    `;

  // Add click event to show detail modal
  li.addEventListener("click", () => {
    showTodoDetail(id, todo);
  });

  todoList.appendChild(li);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Toggle Complete Status
function toggleComplete(id, currentCompleted) {
  const todoRef = ref(database, `todos/${id}`);
  const newCompletedStatus = !currentCompleted;
  
  update(todoRef, {
    completed: newCompletedStatus,
  }).catch((error) => {
    console.error("Error toggling complete: ", error);
    alert("Error updating task status. Please try again.");
  });
}

// Make functions globally available for inline onclick handlers (legacy support)
window.deleteTodo = deleteTodo;
window.editTodo = editTodo;
window.togglePinFromList = togglePinFromList;
window.toggleComplete = toggleComplete;

// Filter todos based on search query
function filterTodos(todosArray) {
  if (!searchQuery.trim()) {
    return todosArray;
  }

  const query = searchQuery.toLowerCase().trim();
  return todosArray.filter((todo) => {
    const title = (todo.title || "").toLowerCase();
    const text = (todo.text || "").toLowerCase();
    return title.includes(query) || text.includes(query);
  });
}

// Render todos
function renderTodos(todosArray) {
  // Clear current list
  todoList.innerHTML = "";

  // Filter todos based on search query
  let filteredTodos = filterTodos(todosArray);

  // If searching and no results
  if (searchQuery.trim() && filteredTodos.length === 0) {
    emptyState.classList.remove("show");
    searchEmptyState.style.display = "block";
    return;
  }

  // Hide search empty state
  searchEmptyState.style.display = "none";

  // If no todos at all
  if (filteredTodos.length === 0) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  // Sort: incomplete first, then completed
  // Within incomplete: pinned first, then by createdAt (newest first)
  // Within completed: by createdAt (newest first)
  filteredTodos.sort((a, b) => {
    const aCompleted = a.completed || false;
    const bCompleted = b.completed || false;
    
    // Incomplete items first
    if (!aCompleted && bCompleted) return -1;
    if (aCompleted && !bCompleted) return 1;
    
    // Within same completion status
    if (!aCompleted && !bCompleted) {
      // Both incomplete: pinned first, then by createdAt
      const aPinned = a.pinned || false;
      const bPinned = b.pinned || false;
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      return (b.createdAt || 0) - (a.createdAt || 0);
    } else {
      // Both completed: sort by createdAt (newest first)
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  // Render each todo
  filteredTodos.forEach(({ id, ...todo }) => {
    renderTodo(id, todo);
  });
}

// Real-time listener for todos
onValue(
  todosRef,
  (snapshot) => {
    const data = snapshot.val();

    // Store all todos
    if (!data || Object.keys(data).length === 0) {
      allTodos = [];
      renderTodos([]);
    } else {
      allTodos = Object.entries(data).map(([id, todo]) => ({ id, ...todo }));
      renderTodos(allTodos);
    }
  },
  (error) => {
    console.error("Error getting todos: ", error);
  }
);

// Search input event listener
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderTodos(allTodos);
});
