const navLinks = document.querySelectorAll(".nav-link");

const sections = {
  "#all-recipes-section": document.getElementById("all-recipes-section"),
  "#products-section": document.getElementById("products-section"),
  "#foodlog-section": document.getElementById("foodlog-section"),
};

const allSections = [
  document.getElementById("search-filters-section"),
  document.getElementById("meal-categories-section"),
  document.getElementById("all-recipes-section"),
  document.getElementById("meal-details"),
  document.getElementById("products-section"),
  document.getElementById("foodlog-section"),
];

const meals = document.getElementById("recipes-grid");
const recipesGrid = document.getElementById("recipes-grid");
const backBtn = document.getElementById("back-to-meals-btn");
const gridView = document.getElementById("grid-view-btn");
const listView = document.getElementById("list-view-btn");
const categoriesGrid = document.getElementById("categories-grid");
const areasGrid = document.getElementById("areasGrid");
const recipesCount = document.getElementById("recipes-count");
const heroCalories = document.getElementById("hero-calories");

const productSearchInput = document.getElementById("product-search-input");
const searchProductBtn = document.getElementById("search-product-btn");
const barCode = document.getElementById("barcode-input");
const lookupBarcodeBtn = document.getElementById("lookup-barcode-btn");
const productCategories = document.getElementById("product-categories");

let selectedCategory = "";
let selectedArea = "";
let searchValue = "";
let currentView = "grid";

navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.forEach(function (btn) {
      btn.classList.remove("bg-emerald-50", "text-emerald-700");
      btn.classList.add("text-gray-600", "hover:bg-gray-50");
    });

    link.classList.remove("text-gray-600", "hover:bg-gray-50");
    link.classList.add("bg-emerald-50", "text-emerald-700");

    allSections.forEach(function (section) {
      if (section) section.style.display = "none";
    });

    const target = link.getAttribute("href");

    if (target === "#all-recipes-section") {
      document.getElementById("search-filters-section").style.display = "block";
      document.getElementById("meal-categories-section").style.display =
        "block";
      document.getElementById("all-recipes-section").style.display = "block";
    } else if (sections[target]) {
      sections[target].style.display = "block";
    }

    history.pushState(null, "", target);
  });
});

function openMealsSection() {
  allSections.forEach(function (section) {
    if (section) section.style.display = "none";
  });

  document.getElementById("search-filters-section").style.display = "block";
  document.getElementById("meal-categories-section").style.display = "block";
  document.getElementById("all-recipes-section").style.display = "block";

  history.pushState(null, "", "#all-recipes-section");
}

function openProductsSection() {
  allSections.forEach(function (section) {
    if (section) section.style.display = "none";
  });

  document.getElementById("products-section").style.display = "block";

  history.pushState(null, "", "#products-section");

  if (barCode) {
    setTimeout(function () {
      barCode.focus();
    }, 100);
  }
}

let foodLog = JSON.parse(localStorage.getItem("nutriplan_food_log")) || [];

function saveFoodLog() {
  localStorage.setItem("nutriplan_food_log", JSON.stringify(foodLog));
}

const dailyNeeds = {
  protein: 50,
  carbs: 200,
  fat: 65,
  fiber: 25,
  sugar: 50,
};

async function getMeals() {
  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/meals/random?count=25",
  );

  const data = await response.json();

  displayMeals(data.results);
}

function displayMeals(mealList) {
  if (!mealList || mealList.length === 0) {
    recipesCount.textContent = "Showing 0 recipes";

    meals.innerHTML = `
      <p class="col-span-full text-center text-gray-500 py-10">
        No meals found.
      </p>
    `;

    return;
  }

  let temp = "";

  for (let i = 0; i < mealList.length; i++) {
    const meal = mealList[i];

    temp += `
      <div
        class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        data-meal-id="${meal.id}"
      >
        <div class="relative overflow-hidden h-48">
          <img
            class="w-full object-cover group-hover:scale-110 transition-transform duration-500 h-full"
            src="${meal.thumbnail}"
            alt="${meal.name}"
            loading="lazy"
          >

          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-tag mr-1 text-emerald-600"></i>
              ${meal.category}
            </span>

            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-globe mr-1 text-blue-600"></i>
              ${meal.area || "Unknown"}
            </span>
          </div>
        </div>

        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${meal.name}
          </h3>

          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            Delicious recipe to try!
          </p>

          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${meal.category}
            </span>

            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${meal.area || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  recipesCount.textContent = `Showing ${mealList.length} recipes`;
  meals.innerHTML = temp;

  applyCurrentView();

  document.querySelectorAll(".recipe-card").forEach(function (card) {
    card.addEventListener("click", function () {
      getMealDetails(card.getAttribute("data-meal-id"));
    });
  });
}

async function filterMeals() {
  let url = "https://nutriplan-api.vercel.app/api/meals/filter?page=1&limit=20";

  if (selectedCategory) {
    url += "&category=" + encodeURIComponent(selectedCategory);
  }

  if (selectedArea) {
    url += "&area=" + encodeURIComponent(selectedArea);
  }

  const response = await fetch(url);
  const data = await response.json();

  displayMeals(data.results || []);
}

async function searchMeals() {
  if (!searchValue.trim()) {
    loadMeals();
    return;
  }

  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/meals/search?q=" +
      encodeURIComponent(searchValue) +
      "&page=1&limit=25",
  );

  const data = await response.json();

  let result = data.results || [];

  if (selectedCategory) {
    result = result.filter(function (meal) {
      return meal.category === selectedCategory;
    });
  }

  if (selectedArea) {
    result = result.filter(function (meal) {
      return meal.area === selectedArea;
    });
  }

  displayMeals(result);
}

const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.addEventListener("input", function () {
    searchValue = searchInput.value;
    searchMeals();
  });
}

function loadMeals() {
  if (searchValue.trim()) {
    searchMeals();
  } else if (selectedCategory || selectedArea) {
    filterMeals();
  } else {
    getMeals();
  }
}

async function getCategories() {
  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/meals/categories",
  );

  const data = await response.json();
  const categories = data.results.slice(0, 12);

  let temp = "";

  for (let i = 0; i < categories.length; i++) {
    temp += `
      <div
        class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
        data-category="${categories[i].name}"
      >
        <div class="flex items-center gap-2.5">
          <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="fa-solid fa-drumstick-bite"></i>
          </div>

          <h3 class="text-sm font-bold text-gray-900">
            ${categories[i].name}
          </h3>
        </div>
      </div>
    `;
  }

  categoriesGrid.innerHTML = temp;

  document.querySelectorAll(".category-card").forEach(function (button) {
    button.addEventListener("click", function () {
      const category = button.getAttribute("data-category");

      if (selectedCategory === category) {
        selectedCategory = "";
      } else {
        selectedCategory = category;
      }

      updateCategoryButtons();
      loadMeals();
    });
  });
}

function updateCategoryButtons() {
  document.querySelectorAll(".category-card").forEach(function (button) {
    const active = button.getAttribute("data-category") === selectedCategory;

    button.classList.toggle("border-emerald-500", active);
    button.classList.toggle("bg-emerald-100", active);
    button.classList.toggle("shadow-md", active);
  });
}

async function getAreas() {
  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/meals/areas",
  );

  const data = await response.json();

  let temp = `
    <button
      class="area-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
      data-area=""
    >
      All Cuisines
    </button>
  `;

  const areas = data.results.slice(0, 10);

  for (let i = 0; i < areas.length; i++) {
    temp += `
      <button
        class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
        data-area="${areas[i].name}"
      >
        ${areas[i].name}
      </button>
    `;
  }

  areasGrid.innerHTML = temp;

  document.querySelectorAll(".area-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      selectedArea = button.getAttribute("data-area");

      updateAreaButtons();
      loadMeals();
    });
  });
}

function updateAreaButtons() {
  document.querySelectorAll(".area-btn").forEach(function (button) {
    const active = button.getAttribute("data-area") === selectedArea;

    button.classList.toggle("bg-emerald-600", active);
    button.classList.toggle("text-white", active);
    button.classList.toggle("bg-gray-100", !active);
    button.classList.toggle("text-gray-700", !active);
  });
}

async function getMealDetails(id) {
  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/meals/" + id,
  );

  const data = await response.json();
  const meal = data.result;

  document.getElementById("meal-details-image").src = meal.thumbnail;
  document.getElementById("meal-details-image").alt = meal.name;

  setText("meal-details-name", meal.name);
  setText("meal-details-category", meal.category || "");
  setText("meal-details-area", meal.area || "Unknown");

  let tags = "";

  if (meal.tags) {
    for (let i = 0; i < meal.tags.length; i++) {
      let color = "bg-purple-500";

      if (i === 0) color = "bg-emerald-500";
      if (i === 1) color = "bg-blue-500";

      tags += `
        <span class="px-3 py-1 ${color} text-white text-sm font-semibold rounded-full">
          ${meal.tags[i]}
        </span>
      `;
    }
  }

  document.getElementById("meal-tags").innerHTML = tags;

  let ingredients = "";

  for (let i = 0; i < meal.ingredients.length; i++) {
    ingredients += `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
        <input
          type="checkbox"
          class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
        >

        <span class="text-gray-700">
          <span class="font-medium text-gray-900">
            ${meal.ingredients[i].measure}
          </span>
          ${meal.ingredients[i].ingredient}
        </span>
      </div>
    `;
  }

  document.getElementById("meal-ingredients").innerHTML = ingredients;

  setText("ingredients-count", meal.ingredients.length + " items");

  let instructions = "";

  for (let i = 0; i < meal.instructions.length; i++) {
    instructions += `
      <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
          ${i + 1}
        </div>

        <p class="text-gray-700 leading-relaxed pt-2">
          ${meal.instructions[i]}
        </p>
      </div>
    `;
  }

  document.getElementById("meal-instructions").innerHTML = instructions;

  if (meal.youtube) {
    const videoId = meal.youtube.split("v=")[1];

    if (videoId) {
      document.getElementById("meal-video").src =
        "https://www.youtube.com/embed/" + videoId;
    }
  }

  document.getElementById("log-meal-btn").dataset.mealId = meal.id;

  window.currentMeal = meal;

  getNutrition(meal);
  showMealDetails();
}

function showMealDetails() {
  allSections.forEach(function (section) {
    if (section) section.style.display = "none";
  });

  document.getElementById("meal-details").style.display = "block";
}

async function getNutrition(meal) {
  let ingredients = [];

  for (let i = 0; i < meal.ingredients.length; i++) {
    ingredients.push(
      meal.ingredients[i].measure + " " + meal.ingredients[i].ingredient,
    );
  }

  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/nutrition/analyze",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "8CacSjqfnwpu0DSLfedeln7sPBUs54JF2re2hMre",
      },
      body: JSON.stringify({
        recipeName: meal.name,
        ingredients: ingredients,
      }),
    },
  );

  const result = await response.json();

  if (result.success) {
    displayNutrition(result.data);
  }
}

function displayNutrition(nutrition) {
  const perServing = nutrition.perServing || {};
  const totals = nutrition.totals || {};

  setText("nutrition-calories", Math.round(perServing.calories || 0));

  setText(
    "nutrition-total-calories",
    "Total: " + Math.round(totals.calories || 0) + " cal",
  );

  setText("nutrition-protein", Math.round(perServing.protein || 0) + "g");
  setText("nutrition-carbs", Math.round(perServing.carbs || 0) + "g");
  setText("nutrition-fat", Math.round(perServing.fat || 0) + "g");
  setText("nutrition-fiber", Math.round(perServing.fiber || 0) + "g");
  setText("nutrition-sugar", Math.round(perServing.sugar || 0) + "g");

  heroCalories.textContent =
    Math.round(perServing.calories || 0) + " cal/serving";

  setWidth("protein-bar", perServing.protein, dailyNeeds.protein);
  setWidth("carbs-bar", perServing.carbs, dailyNeeds.carbs);
  setWidth("fat-bar", perServing.fat, dailyNeeds.fat);
  setWidth("fiber-bar", perServing.fiber, dailyNeeds.fiber);
  setWidth("sugar-bar", perServing.sugar, dailyNeeds.sugar);

  setText(
    "nutrition-vitamin-a",
    Math.round(perServing.vitaminA || perServing.vitamin_a || 0) + "%",
  );

  setText(
    "nutrition-vitamin-c",
    Math.round(perServing.vitaminC || perServing.vitamin_c || 0) + "%",
  );

  setText("nutrition-calcium", Math.round(perServing.calcium || 0) + "%");

  setText("nutrition-iron", Math.round(perServing.iron || 0) + "%");
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function setWidth(id, value, max) {
  const element = document.getElementById(id);

  if (!element) return;

  const number = Number(value) || 0;

  element.style.width = Math.min((number / max) * 100, 100) + "%";
}

if (backBtn) {
  backBtn.addEventListener("click", function () {
    allSections[3].style.display = "none";
    allSections[2].style.display = "block";
    allSections[0].style.display = "block";
    allSections[1].style.display = "block";
  });
}

if (listView) {
  listView.addEventListener("click", function () {
    currentView = "list";
    applyCurrentView();
  });
}

if (gridView) {
  gridView.addEventListener("click", function () {
    currentView = "grid";
    applyCurrentView();
  });
}

function applyCurrentView() {
  const cards = document.querySelectorAll(".recipe-card");

  if (!recipesGrid) return;

  if (currentView === "list") {
    recipesGrid.style.gridTemplateColumns = "1fr";

    cards.forEach(function (card) {
      const imageContainer = card.querySelector(".relative");
      const image = card.querySelector("img");
      const badges = card.querySelector(".absolute");

      card.classList.add("flex", "flex-row", "h-40");

      if (imageContainer) {
        imageContainer.classList.remove("h-48");
        imageContainer.classList.add("w-48", "h-full", "shrink-0");
      }

      if (image) image.classList.add("h-full");
      if (badges) badges.classList.add("hidden");
    });
  } else {
    recipesGrid.style.gridTemplateColumns = "repeat(4,minmax(0,1fr))";

    cards.forEach(function (card) {
      const imageContainer = card.querySelector(".relative");
      const image = card.querySelector("img");
      const badges = card.querySelector(".absolute");

      card.classList.remove("flex", "flex-row", "h-40");

      if (imageContainer) {
        imageContainer.classList.remove("w-48", "h-full", "shrink-0");

        imageContainer.classList.add("h-48");
      }

      if (image) image.classList.add("h-full");
      if (badges) badges.classList.remove("hidden");
    });
  }
}

const logMealBtn = document.getElementById("log-meal-btn");
const logMealModal = document.getElementById("log-meal-modal");
const cancelLogMeal = document.getElementById("cancel-log-meal");
const confirmLogMeal = document.getElementById("confirm-log-meal");
const decreaseServings = document.getElementById("decrease-servings");
const increaseServings = document.getElementById("increase-servings");
const mealServings = document.getElementById("meal-servings");

let currentMealNutrition = null;

function setMealModalLoading() {
  setText("modal-calories", "Loading...");
  setText("modal-protein", "Loading...");
  setText("modal-carbs", "Loading...");
  setText("modal-fat", "Loading...");

  confirmLogMeal.disabled = true;
  confirmLogMeal.classList.add("opacity-50", "cursor-not-allowed");
}

function updateMealModalNutrition() {
  if (!currentMealNutrition) return;

  const servings = Number(mealServings.value) || 1;

  setText(
    "modal-calories",
    Math.round((currentMealNutrition.calories || 0) * servings),
  );

  setText(
    "modal-protein",
    Math.round((currentMealNutrition.protein || 0) * servings) + "g",
  );

  setText(
    "modal-carbs",
    Math.round((currentMealNutrition.carbs || 0) * servings) + "g",
  );

  setText(
    "modal-fat",
    Math.round((currentMealNutrition.fat || 0) * servings) + "g",
  );
}

async function loadMealModalNutrition(meal) {
  setMealModalLoading();

  let ingredients = [];

  for (let i = 0; i < meal.ingredients.length; i++) {
    ingredients.push(
      meal.ingredients[i].measure + " " + meal.ingredients[i].ingredient,
    );
  }

  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/nutrition/analyze",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "8CacSjqfnwpu0DSLfedeln7sPBUs54JF2re2hMre",
      },
      body: JSON.stringify({
        recipeName: meal.name,
        ingredients: ingredients,
      }),
    },
  );

  const result = await response.json();

  if (!result.success || !result.data) {
    setText("modal-calories", "N/A");
    setText("modal-protein", "N/A");
    setText("modal-carbs", "N/A");
    setText("modal-fat", "N/A");
    return;
  }

  currentMealNutrition = result.data.perServing || {};

  updateMealModalNutrition();

  confirmLogMeal.disabled = false;

  confirmLogMeal.classList.remove("opacity-50", "cursor-not-allowed");
}

async function openMealLogModal() {
  const meal = window.currentMeal;

  if (!meal || !logMealModal) return;

  mealServings.value = 1;
  currentMealNutrition = null;

  const image = logMealModal.querySelector("img");
  const name = logMealModal.querySelector("p.text-gray-500");

  if (image) {
    image.src = meal.thumbnail;
    image.alt = meal.name;
  }

  if (name) {
    name.textContent = meal.name;
  }

  logMealModal.classList.remove("hidden");

  await loadMealModalNutrition(meal);
}

if (logMealBtn) {
  logMealBtn.addEventListener("click", openMealLogModal);
}

if (decreaseServings) {
  decreaseServings.addEventListener("click", function () {
    let value = Number(mealServings.value) || 1;

    value -= 0.5;

    if (value < 0.5) value = 0.5;

    mealServings.value = value;

    updateMealModalNutrition();
  });
}

if (increaseServings) {
  increaseServings.addEventListener("click", function () {
    let value = Number(mealServings.value) || 1;

    value += 0.5;

    if (value > 10) value = 10;

    mealServings.value = value;

    updateMealModalNutrition();
  });
}

if (mealServings) {
  mealServings.addEventListener("input", function () {
    let value = Number(mealServings.value);

    if (!value || value < 0.5) value = 0.5;
    if (value > 10) value = 10;

    mealServings.value = value;

    updateMealModalNutrition();
  });
}

if (cancelLogMeal) {
  cancelLogMeal.addEventListener("click", function () {
    logMealModal.classList.add("hidden");
  });
}

if (confirmLogMeal) {
  confirmLogMeal.addEventListener("click", function () {
    if (!window.currentMeal || !currentMealNutrition) return;

    const meal = window.currentMeal;
    const servings = Number(mealServings.value) || 1;

    const nutrition = {
      calories: (currentMealNutrition.calories || 0) * servings,
      protein: (currentMealNutrition.protein || 0) * servings,
      carbs: (currentMealNutrition.carbs || 0) * servings,
      fat: (currentMealNutrition.fat || 0) * servings,
      fiber: (currentMealNutrition.fiber || 0) * servings,
      sugar: (currentMealNutrition.sugar || 0) * servings,
    };

    foodLog.push({
      id: meal.id + "-" + Date.now(),
      mealId: meal.id,
      name: meal.name,
      thumbnail: meal.thumbnail,
      servings: servings,
      nutrition: nutrition,
      type: "meal",
    });

    saveFoodLog();
    updateFoodLog();

    logMealModal.classList.add("hidden");

    showSuccessAlert(meal.name + " added to your food log!");
  });
}

function showSuccessAlert(message) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "success",
      title: "Added Successfully!",
      text: message,
      timer: 1800,
      showConfirmButton: false,
      position: "center",
    });
  } else {
    alert(message);
  }
}

function updateFoodLog() {
  const list = document.getElementById("logged-items-list");

  if (!list) return;

  const count = document.querySelector("#foodlog-today-section h4");

  if (count) {
    count.textContent = "Logged Items (" + foodLog.length + ")";
  }

  if (foodLog.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>

        <p class="font-medium">
          No meals logged today
        </p>

        <p class="text-sm">
          Add meals from the Meals page or scan products
        </p>
      </div>
    `;

    updateFoodLogSummary();
    return;
  }

  let temp = "";

  for (let i = 0; i < foodLog.length; i++) {
    const item = foodLog[i];
    const servings = item.servings || 1;

    temp += `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">

        <div class="flex items-center gap-3">
          <img
            src="${item.thumbnail || ""}"
            class="w-14 h-14 rounded-lg object-cover"
          >

          <div>
            <p class="font-semibold text-gray-900">
              ${item.name}
            </p>

            <p class="text-xs text-gray-500">
              ${Math.round(item.nutrition?.calories || 0)} kcal
              •
              ${Math.round(item.nutrition?.protein || 0)}g protein
              ${
                item.type === "meal"
                  ? " • " + servings + " serving" + (servings !== 1 ? "s" : "")
                  : ""
              }
            </p>
          </div>
        </div>

        <button
          onclick="removeFood(${i})"
          class="text-red-500 hover:text-red-600"
        >
          <i class="fa-solid fa-trash"></i>
        </button>

      </div>
    `;
  }

  list.innerHTML = temp;

  updateFoodLogSummary();
}

function removeFood(index) {
  foodLog.splice(index, 1);

  saveFoodLog();
  updateFoodLog();
}

function updateFoodLogSummary() {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (let i = 0; i < foodLog.length; i++) {
    calories += Number(foodLog[i].nutrition?.calories) || 0;
    protein += Number(foodLog[i].nutrition?.protein) || 0;
    carbs += Number(foodLog[i].nutrition?.carbs) || 0;
    fat += Number(foodLog[i].nutrition?.fat) || 0;
  }

  updateProgress("Calories", calories, 2000);
  updateProgress("Protein", protein, 50);
  updateProgress("Carbs", carbs, 200);
  updateProgress("Fat", fat, 65);
}

function updateProgress(name, value, max) {
  const boxes = document.querySelectorAll(
    "#foodlog-today-section .bg-emerald-50," +
      "#foodlog-today-section .bg-blue-50," +
      "#foodlog-today-section .bg-amber-50," +
      "#foodlog-today-section .bg-purple-50",
  );

  let box = null;

  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].textContent.trim().startsWith(name)) {
      box = boxes[i];
      break;
    }
  }

  if (!box) return;

  const text = box.querySelector(".text-gray-500");
  const bar = box.querySelector(".h-2\\.5");

  if (text) {
    text.textContent =
      Math.round(value) + " / " + max + (name === "Calories" ? " kcal" : " g");
  }

  if (bar) {
    bar.style.width = Math.min((value / max) * 100, 100) + "%";
  }
}

document
  .querySelectorAll("#log-a-meal-btn, .log-a-meal-btn")
  .forEach(function (button) {
    button.addEventListener("click", function () {
      openMealsSection();
    });
  });

document
  .querySelectorAll("#scan-barcode-btn, .scan-barcode-btn")
  .forEach(function (button) {
    button.addEventListener("click", function () {
      openProductsSection();
    });
  });

document.querySelectorAll(".quick-log-btn").forEach(function (button) {
  button.addEventListener("click", function () {
    openProductsSection();
  });
});

window.removeFood = removeFood;

let currentProducts = [];
let selectedProductCategory = "";
let selectedNutriScore = "";

async function searchProduct() {
  if (!productSearchInput) return;

  const value = productSearchInput.value.trim();

  if (!value) return;

  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/products/search?q=" +
      encodeURIComponent(value) +
      "&page=1&limit=24",
  );

  const data = await response.json();

  currentProducts = data.results || [];
  selectedProductCategory = "";
  selectedNutriScore = "";

  displaySearch(currentProducts);
}

if (searchProductBtn) {
  searchProductBtn.addEventListener("click", searchProduct);
}

async function barcodeSearch() {
  if (!barCode) return;

  const value = barCode.value.trim();

  if (!value) return;

  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/products/barcode/" + value,
  );

  const data = await response.json();

  const product = data.result || (data.results && data.results[0]);

  if (!product) {
    displaySearch([]);
    return;
  }

  currentProducts = [product];
  selectedProductCategory = "";
  selectedNutriScore = "";

  displaySearch(currentProducts);
}

if (lookupBarcodeBtn) {
  lookupBarcodeBtn.addEventListener("click", barcodeSearch);
}

function displaySearch(products) {
  const productsGrid = document.getElementById("products-grid");

  if (!productsGrid) return;

  if (!products || products.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fa-solid fa-box-open text-5xl text-gray-300 mb-4"></i>

        <p class="text-gray-500 font-medium">
          No products found
        </p>
      </div>
    `;

    return;
  }

  let temp = "";

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const nutrients = product.nutrients || {};

    const calories = Number(nutrients.calories) || 0;
    const protein = Number(nutrients.protein) || 0;
    const carbs = Number(nutrients.carbs) || 0;
    const fat = Number(nutrients.fat) || 0;
    const sugar = Number(nutrients.sugar) || 0;

    const score = String(product.nutritionGrade || "unknown").toLowerCase();

    temp += `
      <div
        class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        data-barcode="${product.barcode || ""}"
      >

        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">

          <img
            class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            src="${product.image || ""}"
            alt="${product.name || "Product"}"
            loading="lazy"
          >

          <div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
            Nutri-Score ${score === "unknown" ? "N/A" : score}
          </div>

          <div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            ${product.novaGroup || "N/A"}
          </div>

        </div>

        <div class="p-4">

          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
            ${product.brand || "Unknown Brand"}
          </p>

          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${product.name || "Unknown Product"}
          </h3>

          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span>
              <i class="fa-solid fa-fire mr-1"></i>
              ${calories.toFixed(1)} kcal/100g
            </span>
          </div>

          <div class="grid grid-cols-4 gap-1 text-center">

            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">
                ${protein.toFixed(1)}g
              </p>
              <p class="text-[10px] text-gray-500">Protein</p>
            </div>

            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">
                ${carbs.toFixed(1)}g
              </p>
              <p class="text-[10px] text-gray-500">Carbs</p>
            </div>

            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">
                ${fat.toFixed(1)}g
              </p>
              <p class="text-[10px] text-gray-500">Fat</p>
            </div>

            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">
                ${sugar.toFixed(1)}g
              </p>
              <p class="text-[10px] text-gray-500">Sugar</p>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  productsGrid.innerHTML = temp;
}

document.addEventListener("click", function (e) {
  const card = e.target.closest(".product-card");

  if (!card) return;

  const barcode = card.getAttribute("data-barcode");

  if (!barcode) return;

  let product = null;

  for (let i = 0; i < currentProducts.length; i++) {
    if (String(currentProducts[i].barcode) === String(barcode)) {
      product = currentProducts[i];
      break;
    }
  }

  if (product) {
    openProductModal(product);
  }
});

function openProductModal(product) {
  const modal = document.getElementById("product-detail-modal");

  if (!modal) return;

  document.getElementById("modal-product-image").src = product.image || "";

  document.getElementById("modal-product-image").alt =
    product.name || "Product";

  setProductModalText("modal-product-brand", product.brand || "Unknown Brand");

  setProductModalText("modal-product-name", product.name || "Unknown Product");

  const score = String(product.nutritionGrade || "unknown").toLowerCase();

  let scoreColor = "#9ca3af";
  let scoreText = "Unknown";

  if (score === "a") {
    scoreColor = "#038141";
    scoreText = "Excellent";
  } else if (score === "b") {
    scoreColor = "#85bb2f";
    scoreText = "Good";
  } else if (score === "c") {
    scoreColor = "#fecb02";
    scoreText = "Average";
  } else if (score === "d") {
    scoreColor = "#ee8100";
    scoreText = "Poor";
  } else if (score === "e") {
    scoreColor = "#e63e11";
    scoreText = "Bad";
  }

  const scoreLetter = document.getElementById("modal-nutri-score-letter");

  const scoreDescription = document.getElementById(
    "modal-nutri-score-description",
  );

  const scoreBox = document.getElementById("modal-nutri-score");

  scoreLetter.textContent = score === "unknown" ? "?" : score.toUpperCase();

  scoreLetter.style.backgroundColor = scoreColor;
  scoreDescription.textContent = scoreText;
  scoreBox.style.backgroundColor = scoreColor + "20";

  const nova = Number(product.novaGroup) || 0;

  let novaColor = "#9ca3af";
  let novaText = "Unknown";

  if (nova === 1) {
    novaColor = "#16a34a";
    novaText = "Unprocessed";
  } else if (nova === 2) {
    novaColor = "#eab308";
    novaText = "Processed ingredients";
  } else if (nova === 3) {
    novaColor = "#f97316";
    novaText = "Processed";
  } else if (nova === 4) {
    novaColor = "#e63e11";
    novaText = "Ultra-processed";
  }

  document.getElementById("modal-nova-number").textContent = nova || "N/A";

  document.getElementById("modal-nova-number").style.backgroundColor =
    novaColor;

  document.getElementById("modal-nova-description").textContent = novaText;

  document.getElementById("modal-nova").style.backgroundColor =
    novaColor + "20";

  const nutrients = product.nutrients || {};

  const calories = Number(nutrients.calories) || 0;
  const protein = Number(nutrients.protein) || 0;
  const carbs = Number(nutrients.carbs) || 0;
  const fat = Number(nutrients.fat) || 0;
  const sugar = Number(nutrients.sugar) || 0;
  const fiber = Number(nutrients.fiber) || 0;
  const sodium = Number(nutrients.sodium) || 0;

  setProductModalText("modal-calories", calories.toFixed(1));
  setProductModalText("modal-protein", protein.toFixed(1) + "g");
  setProductModalText("modal-carbs", carbs.toFixed(1) + "g");
  setProductModalText("modal-fat", fat.toFixed(1) + "g");
  setProductModalText("modal-sugar", sugar.toFixed(1) + "g");
  setProductModalText("modal-fiber", fiber.toFixed(1) + "g");
  setProductModalText("modal-sodium", sodium.toFixed(3) + "g");

  document.getElementById("modal-protein-bar").style.width =
    Math.min((protein / 50) * 100, 100) + "%";

  document.getElementById("modal-carbs-bar").style.width =
    Math.min((carbs / 100) * 100, 100) + "%";

  document.getElementById("modal-fat-bar").style.width =
    Math.min((fat / 65) * 100, 100) + "%";

  document.getElementById("modal-sugar-bar").style.width =
    Math.min((sugar / 50) * 100, 100) + "%";

  const logButton = modal.querySelector(".add-product-to-log");

  if (logButton) {
    logButton.dataset.barcode = product.barcode || "";
  }

  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function setProductModalText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

document.addEventListener("click", function (e) {
  const button = e.target.closest(".close-product-modal");

  if (!button) return;

  const modal = document.getElementById("product-detail-modal");

  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
});

document.addEventListener("click", function (e) {
  const modal = document.getElementById("product-detail-modal");

  if (modal && e.target === modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
});

async function displayCategories() {
  const response = await fetch(
    "https://nutriplan-api.vercel.app/api/products/categories",
  );

  const data = await response.json();

  let temp = "";

  for (let i = 0; i < 10; i++) {
    if (!data.results[i]) continue;

    temp += `
      <button
        class="product-category-btn px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-200 transition-all"
        data-id="${data.results[i].id}"
      >
        ${data.results[i].name}
      </button>
    `;
  }

  productCategories.innerHTML = temp;

  document.querySelectorAll(".product-category-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const category = btn.getAttribute("data-id");

      if (selectedProductCategory === category) {
        selectedProductCategory = "";
      } else {
        selectedProductCategory = category;
      }

      updateProductCategoryButtons();
      applyProductFilters();
    });
  });
}

function updateProductCategoryButtons() {
  document.querySelectorAll(".product-category-btn").forEach(function (btn) {
    const active = btn.getAttribute("data-id") === selectedProductCategory;

    btn.classList.toggle("bg-emerald-600", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("bg-emerald-100", !active);
    btn.classList.toggle("text-emerald-700", !active);
  });
}

document.addEventListener("click", function (e) {
  const button = e.target.closest(".nutri-score-btn");

  if (!button) return;

  const score = button.getAttribute("data-score");

  if (!score) return;

  if (selectedNutriScore === score.toLowerCase()) {
    selectedNutriScore = "";
  } else {
    selectedNutriScore = score.toLowerCase();
  }

  updateNutriScoreButtons();
  applyProductFilters();
});

function updateNutriScoreButtons() {
  document.querySelectorAll(".nutri-score-btn").forEach(function (button) {
    const score = (button.getAttribute("data-score") || "").toLowerCase();

    const active = score === selectedNutriScore;

    button.classList.toggle("ring-2", active);
    button.classList.toggle("ring-emerald-600", active);
    button.classList.toggle("scale-105", active);
  });
}

async function applyProductFilters() {
  let products = currentProducts.slice();

  if (selectedProductCategory) {
    const response = await fetch(
      "https://nutriplan-api.vercel.app/api/products/category/" +
        selectedProductCategory,
    );

    const data = await response.json();
    const categoryProducts = data.results || [];

    products = products.filter(function (product) {
      for (let i = 0; i < categoryProducts.length; i++) {
        if (
          product.barcode &&
          product.barcode === categoryProducts[i].barcode
        ) {
          return true;
        }
      }

      return false;
    });
  }

  if (selectedNutriScore) {
    products = products.filter(function (product) {
      const grade = String(product.nutritionGrade || "").toLowerCase();

      return grade === selectedNutriScore;
    });
  }

  displaySearch(products);
}

document.addEventListener("click", function (e) {
  const button = e.target.closest(".add-product-to-log");

  if (!button) return;

  const barcode = button.getAttribute("data-barcode");

  if (!barcode) return;

  let product = null;

  for (let i = 0; i < currentProducts.length; i++) {
    if (String(currentProducts[i].barcode) === String(barcode)) {
      product = currentProducts[i];
      break;
    }
  }

  if (!product) return;

  const nutrients = product.nutrients || {};

  const nutrition = {
    calories: Number(nutrients.calories) || 0,
    protein: Number(nutrients.protein) || 0,
    carbs: Number(nutrients.carbs) || 0,
    fat: Number(nutrients.fat) || 0,
    sugar: Number(nutrients.sugar) || 0,
    fiber: Number(nutrients.fiber) || 0,
    sodium: Number(nutrients.sodium) || 0,
  };

  foodLog.push({
    id: product.barcode + "-" + Date.now(),
    barcode: product.barcode,
    name: product.name || "Unknown Product",
    thumbnail: product.image || "",
    nutrition: nutrition,
    type: "product",
  });

  saveFoodLog();
  updateFoodLog();

  const modal = document.getElementById("product-detail-modal");

  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  showSuccessAlert((product.name || "Product") + " added to your food log!");
});

getMeals();
getCategories();
getAreas();
displayCategories();
updateFoodLog();
