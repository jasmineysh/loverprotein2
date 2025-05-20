let foodData = []; // Store the food items from your JSON file

// --- Load food data from JSON file ---
fetch('foods.json')
  .then(response => response.json())
  .then(data => {
    foodData = data;
  })
  .catch(error => {
    console.error('Error loading food data:', error);
  });

// Initialize the Clarifai API client with your API key
/*const clarifaiApp = new Clarifai.App({
  apiKey: '7245ee8d40ab441ebd102cbd3ca9eb7e'  // Replace with your Clarifai API key
});*/
var predictImage = "";
const fileInput = document.getElementById("mealImage");

  fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];

      if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();

          reader.onload = function (e) {
              const base64Image = e.target.result;
              console.log("Image base64 data:", base64Image);

              // Optional: Display the image preview
              const imgPreview = document.getElementById("imagePreview");
              imgPreview.src = base64Image;
              imgPreview.style.display = "block";
              predictImage = base64Image;
          };
          
           
          reader.readAsDataURL(file);
      } else {
          alert("Please select a valid image file.");
      }
  });
// --- Analyze Image with Clarifai ---
function analyzeImage() {
  

  const PAT = '7245ee8d40ab441ebd102cbd3ca9eb7e';
// Specify the correct user_id/app_id pairings
// Since you're making inferences outside your app's scope
const USER_ID = 'clarifai';       
const APP_ID = 'main';
// Change these to whatever model and image URL you want to use
const MODEL_ID = 'food-item-recognition';
const MODEL_VERSION_ID = '1d5fd481e0cf4826aa72ec3ff049e044';    
const IMAGE_BYTES_STRING = predictImage;

const raw = JSON.stringify({
  "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID
  },
  "inputs": [
      {
          "data": {
              "image": {
                  "base64": IMAGE_BYTES_STRING
              }
          }
      }
  ]
});

const requestOptions = {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Authorization': 'Key ' + PAT
  },
  body: raw
};

// NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
// https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
// this will default to the latest version_id

fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

}

// Function to calculate protein values based on detected food items
function calculateProteinForDetectedFoods(detectedFoods) {
  let totalProtein = 0;
  const mealTableBody = document.getElementById('mealTableBody');
  mealTableBody.innerHTML = '';  // Clear previous rows

  detectedFoods.forEach(foodName => {
    // Search for the food in your JSON data
    const food = foodData.find(item => item.name.toLowerCase() === foodName.toLowerCase());

    if (food) {
      // Calculate protein (assuming 100g serving size by default)
      const protein = (food.protein_per_100g * 100) / 100; // You can adjust the weight as needed

      totalProtein += protein;

      // Add a row to the meal table with the food info
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${food.name}</td>
        <td>100g</td>
        <td>${protein.toFixed(2)}g</td>
        <td><button class="cta-button remove-btn" onclick="removeRow(this)">Remove</button></td>
      `;
      mealTableBody.appendChild(row);
    }
  });

  // Update total protein value
  document.getElementById('totalProtein').textContent = totalProtein.toFixed(2);
  updateProgressBar(totalProtein);
  updateRemainingProteinMessage(totalProtein);
  renderProteinChart();  // If you want to render a chart based on the detected foods
}

// --- Progress Bar Update ---
function updateProgressBar(totalProtein) {
  if (storedProteinGoal && !isNaN(storedProteinGoal)) {
    const progress = Math.min((totalProtein / storedProteinGoal) * 100, 100);
    document.getElementById('proteinProgress').style.width = `${progress}%`;
  }
}

// --- Update Remaining Protein Message ---
function updateRemainingProteinMessage(totalProtein) {
  const container = document.getElementById('results');
  let remainingEl = document.getElementById('remainingProtein');

  if (!remainingEl) {
    remainingEl = document.createElement('p');
    remainingEl.id = 'remainingProtein';
    remainingEl.style.fontWeight = 'bold';
    remainingEl.style.marginTop = '1em';
    container.appendChild(remainingEl);
  }

  if (storedProteinGoal && !isNaN(storedProteinGoal)) {
    const remaining = storedProteinGoal - totalProtein;

    if (remaining > 0) {
      remainingEl.textContent = `💪Nice! You need ${remaining.toFixed(2)}g more protein today. Let's get going!`;
      remainingEl.style.color = '#a8632d'; // brown-ish
    } else {
      remainingEl.textContent = `🎉 Great job! You've met your protein goal!`;
      remainingEl.style.color = '#2E8B57'; // green
    }
  } else {
    remainingEl.textContent = '';
  }
}

// Remove row from table
function removeRow(button) {
  const row = button.closest('tr');
  row.remove();
  updateProteinValues();  // Recalculate protein after row is removed
}

