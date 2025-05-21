let foodData = [];
let storedProteinGoal = 0;
let predictImage = "";

// Load food data
fetch('foods.json')
  .then(response => response.json())
  .then(data => {
    foodData = data;
  })
  .catch(error => {
    console.error('Error loading food data:', error);
  });

// Image upload preview
const fileInput = document.getElementById("mealImage");
fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      predictImage = e.target.result;
      const imgPreview = document.getElementById("imagePreview");
      imgPreview.src = predictImage;
      imgPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please select a valid image file.");
  }
});

// Simulate image analysis
function analyzeImage() {
  if (!predictImage) {
    alert("Please upload an image first.");
    return;
  }

  const mockDetectedFoods = [
    { name: "Chicken Breast, skinless, cooked", weight: 150 },
    { name: "Broccoli, cooked", weight: 40 },
    { name: "Rice, White, cooked", weight: 50 }
  ];

  renderDetectedFoodRows(mockDetectedFoods);
}

// Render detected food rows
function renderDetectedFoodRows(detectedFoods) {
  const mealTableBody = document.getElementById('mealTableBody');
  mealTableBody.innerHTML = ''; // Clear old rows

  detectedFoods.forEach(foodItem => {
    addRow(foodItem.name, foodItem.weight);
  });

  updateProteinValues();
}

// Add a row (used by detection or manual)
function addRow(selectedFood = "", weightValue = "") {
  if (foodData.length === 0) {
    alert("Food data is still loading. Please wait.");
    return;
  }

  const mealTableBody = document.getElementById('mealTableBody');
  const row = document.createElement('tr');

  const foodOptions = foodData
    .map(food => `<option value="${food.name}" ${food.name === selectedFood ? 'selected' : ''}>${food.name}</option>`)
    .join('');

  row.innerHTML = `
    <td>
      <select class="food-select">
        <option value="">Select food</option>
        ${foodOptions}
      </select>
    </td>
    <td>
      <input type="number" class="weight-input" placeholder="grams" min="0" value="${weightValue}" />
    </td>
    <td class="protein-cell">0g</td>
    <td><button class="cta-button remove-btn" onclick="removeRow(this)">Remove</button></td>
  `;

  mealTableBody.appendChild(row);

  row.querySelector('.food-select').addEventListener('change', updateProteinValues);
  row.querySelector('.weight-input').addEventListener('input', updateProteinValues);
}

// Remove a row
function removeRow(button) {
  const row = button.closest('tr');
  row.remove();
  updateProteinValues();
}

// Recalculate protein values and update display
function updateProteinValues() {
  let totalProtein = 0;
  const rows = document.querySelectorAll('#mealTableBody tr');

  rows.forEach(row => {
    const foodName = row.querySelector('.food-select')?.value;
    const weight = parseFloat(row.querySelector('.weight-input')?.value);
    const proteinCell = row.querySelector('.protein-cell');

    if (!foodName || isNaN(weight)) {
      proteinCell.textContent = "0g";
      return;
    }

    const food = foodData.find(item => item.name.toLowerCase() === foodName.toLowerCase());
    if (food) {
      const protein = (food.protein_per_100g * weight) / 100;
      proteinCell.textContent = `${protein.toFixed(2)}g`;
      totalProtein += protein;
    } else {
      proteinCell.textContent = "0g";
    }
  });

  document.getElementById('totalProtein').textContent = totalProtein.toFixed(2);
  updateProgressBar(totalProtein);
  updateRemainingProteinMessage(totalProtein);
}

// Set goal
function setGoal() {
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const activityFactor = parseFloat(document.getElementById('activity').value);

  if (isNaN(age) || isNaN(weight) || isNaN(activityFactor)) {
    alert("Please fill in all required fields.");
    return;
  }

  storedProteinGoal = weight * activityFactor;
  document.getElementById('proteinGoal').textContent = `Recommended Daily Protein: ${storedProteinGoal.toFixed(2)} g`;

  updateProteinValues();
}

// Update progress bar
function updateProgressBar(totalProtein) {
  if (storedProteinGoal && !isNaN(storedProteinGoal)) {
    const progress = Math.min((totalProtein / storedProteinGoal) * 100, 100);
    document.getElementById('proteinProgress').style.width = `${progress}%`;
  }
}

// Update message
function updateRemainingProteinMessage(totalProtein) {
  const container = document.getElementById('results');
  let remainingEl = document.getElementById('remainingProtein');

  if (!remainingEl) {
    remainingEl = document.createElement('p');
    remainingEl.id = 'remainingProtein';
    container.appendChild(remainingEl);
  }

  if (storedProteinGoal && !isNaN(storedProteinGoal)) {
    const remaining = storedProteinGoal - totalProtein;

    if (remaining > 0) {
      remainingEl.textContent = `💪 Need ${remaining.toFixed(2)}g more protein today — you’ve got this!`;
      remainingEl.style.color = '#85602e';
    } else {
      remainingEl.textContent = `🎉 Great job! You've met your protein goal!`;
      remainingEl.style.color = '#2E8B57';
    }
  } else {
  
    remainingEl.textContent = '';
  }
}




