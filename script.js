//  ATTENDANCE COUNT LOGIC
function updateCounts(row) {
  // Get all checkboxes for this student
  const presentCheckboxes = row.querySelectorAll('.present');
  const participatedCheckboxes = row.querySelectorAll('.participated');

  // Total number of sessions
  const totalSessions = presentCheckboxes.length;

  // Count checked "present"
  let presentCount = 0;
  presentCheckboxes.forEach(cb => {
    if (cb.checked) presentCount++;
  });

  // Absences = total sessions - number of presents
  const absCount = totalSessions - presentCount;

  // Count checked "participated"
  let parCount = 0;
  participatedCheckboxes.forEach(cb => {
    if (cb.checked) parCount++;
  });

  // Update displayed counts
  row.querySelector('.abs-count').textContent = absCount + " Abs";
  row.querySelector('.par-count').textContent = parCount + " Par";

  // Change color based on absences
  if (absCount < 3) {
    row.style.backgroundColor = "lightgreen";
  } else if (absCount >= 3 && absCount <= 4) {
    row.style.backgroundColor = "khaki";
  } else {
    row.style.backgroundColor = "lightcoral";
  }

  // Set message based on attendance and participation
  const messageCell = row.querySelector('td:last-child'); // last column
  let message = "";
  if (absCount < 3 && parCount >= 4) {
    message = "Good attendance / Excellent participation";
  } else if (absCount >= 3 && absCount <= 4) {
    message = "Warning / attendance low / You need to participate more";
  } else if (absCount >= 5) {
    message = "Excluded / too many absences / You need to participate more";
  } else {
    message = "Keep improving!";
  }
  messageCell.textContent = message;
}

// FORM VALIDATION
function validateForm() {
  const studentID = document.getElementById("studentID").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const email = document.getElementById("email").value.trim();

  const idPattern = /^[0-9]+$/;
  const namePattern = /^[A-Za-z]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (studentID === "" || !idPattern.test(studentID)) {
    alert("!!! Student ID must contain only numbers.");
    return false;
  }
  if (!namePattern.test(lastName)) {
    alert("!!! Last Name must contain only letters.");
    return false;
  }
  if (!namePattern.test(firstName)) {
    alert("!!! First Name must contain only letters.");
    return false;
  }
  if (!emailPattern.test(email)) {
    alert("!!! Please enter a valid email address (e.g., name@example.com).");
    return false;
  }

  return true;
}

// ON PAGE LOAD
document.addEventListener("DOMContentLoaded", function () {
  const rows = document.querySelectorAll('tbody tr');
  rows.forEach(row => {
    updateCounts(row);
    row.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => updateCounts(row));
    });
  });

  // ADD NEW STUDENT FUNCTIONALITY
  const form = document.getElementById("studentForm");
  const tableBody = document.querySelector("table tbody");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const id = document.getElementById("studentID").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const firstName = document.getElementById("firstName").value.trim();

    // Build a new table row exactly like existing ones
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${id}</td>
      <td>${lastName}</td>
      <td>${firstName}</td>
      ${Array(6)
        .fill(`<td><input type="checkbox" class="present"></td>
               <td><input type="checkbox" class="participated"></td>`)
        .join('')}
      <td class="abs-count">Abs</td>
      <td class="par-count">Par</td>
      <td></td>
    `;

    tableBody.appendChild(newRow);

    // Attach listeners to new checkboxes
    newRow.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => updateCounts(newRow));
    });

    // Initialize counts for the new row
    updateCounts(newRow);
    form.reset();

    alert("Student added successfully!");
  });
});
