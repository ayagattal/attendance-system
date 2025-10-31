function updateCounts(row) {
  // Select checkboxes in that row
  const presents = row.querySelectorAll('.present');
  const participations = row.querySelectorAll('.participated');

  // Count absences
  let absCount = 0;
  presents.forEach(cb => {
    if (!cb.checked) absCount++;
  });

  // Count participations
  let parCount = 0;
  participations.forEach(cb => {
    if (cb.checked) parCount++;
  });

  // Update the Absences and Participation cells
  row.querySelector('.abs-count').textContent = absCount + " Abs";
  row.querySelector('.par-count').textContent = parCount + " Par";

  // Highlight the row according to number of absences
  if (absCount < 3) {
    row.style.backgroundColor = "lightgreen"; //good attendance
  } else if (absCount >= 3 && absCount <= 4) {
    row.style.backgroundColor = "khaki"; //  warning
  } else {
    row.style.backgroundColor = "lightcoral"; // too many absences
  }

  //  Set message based on attendance and participation
  const messageCell = row.querySelector('td:last-child'); // last column
  let message = "";

  if (absCount < 3 && parCount >= 4) {
    message = "Good attendance – Excellent participation";
  } else if (absCount >= 3 && absCount <= 4) {
    message = "Warning – attendance low – You need to participate more";
  } else if (absCount >= 5) {
    message = "Excluded – too many absences – You need to participate more";
  } else {
    message = "Keep improving!";
  }

  messageCell.textContent = message;
}

// Run this when the page is loaded
document.addEventListener("DOMContentLoaded", function() {
  // Apply logic to each row
  document.querySelectorAll('tbody tr').forEach(row => {
    updateCounts(row); // Initial calculation

    // Detect checkbox changes
    row.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => updateCounts(row));
    });
  });
});
