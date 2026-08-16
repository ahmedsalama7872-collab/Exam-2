/**
 * NutriPlan - Main Entry Point
 */

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
const productCategoryBtn = document.querySelectorAll(".product-category-btn");

let selectedCategory = "";
let selectedArea = "";
let searchValue = "";
let foodLog = [];
let currentView = "grid";

const dailyNeeds = {
  protein: 50,
  carbs: 200,
  fat: 65,
  fiber: 25,
  sugar: 50,
};

// **************************** Navigation ****************************

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((btn) => {
      btn.classList.remove("bg-emerald-50", "text-emerald-700");
      btn.classList.add("text-gray-600", "hover:bg-gray-50");
    });

    link.classList.remove("text-gray-600", "hover:bg-gray-50");
    link.classList.add("bg-emerald-50", "text-emerald-700");

    allSections.forEach((section) => {
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

// **************************** Get Meals ****************************

async function getMeals() {
  try {
    const response = await fetch(
      "https://nutriplan-api.vercel.app/api/meals/random?count=25",
    );
    const data = await response.json();
    displayMeals(data.results);
  } catch (error) {
    console.log("Meals Error:", error);
  }
}

// **************************** Display Meals ****************************

function displayMeals(mealList) {
  if (!mealList || mealList.length === 0) {
    recipesCount.textContent = "Showing 0 recipes";
    meals.innerHTML = `
      <p class="col-span-full text-center text-gray-500 py-10">
        No meals found.
      </p>`;
    return;
  }

  let temp = "";

  for (let i = 0; i < mealList.length; i++) {
    temp += `
      <div
        class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        data-meal-id="${mealList[i].id}"
      >

        <div class="relative overflow-hidden h-48">

          <img
            class="w-full object-cover group-hover:scale-110 transition-transform duration-500 h-full"
            src="${mealList[i].thumbnail}"
            alt="${mealList[i].name}"
            loading="lazy"
          >

          <div class="absolute bottom-3 left-3 flex gap-2">

            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-tag mr-1 text-emerald-600"></i>
              ${mealList[i].category}
            </span>

            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-globe mr-1 text-blue-600"></i>
              ${mealList[i].area || "Unknown"}
            </span>

          </div>

        </div>

        <div class="p-4">

          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${mealList[i].name}
          </h3>

          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            Delicious recipe to try!
          </p>

          <div class="flex items-center justify-between text-xs">

            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${mealList[i].category}
            </span>

            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${mealList[i].area || "Unknown"}
            </span>

          </div>

        </div>

      </div>`;
  }

  recipesCount.textContent = `Showing ${mealList.length} recipes`;
  meals.innerHTML = temp;
  applyCurrentView();

  document.querySelectorAll(".recipe-card").forEach((card) => {
    card.addEventListener("click", function () {
      getMealDetails(card.getAttribute("data-meal-id"));
    });
  });
}

// **************************** Filter Meals ****************************

async function filterMeals() {
  try {
    let url =
      "https://nutriplan-api.vercel.app/api/meals/filter?page=1&limit=20";

    if (selectedCategory)
      url += `&category=${encodeURIComponent(selectedCategory)}`;

    if (selectedArea) url += `&area=${encodeURIComponent(selectedArea)}`;

    const response = await fetch(url);
    const data = await response.json();

    displayMeals(data.results || []);
  } catch (error) {
    console.log("Filter Error:", error);
  }
}

// **************************** Search Meals ****************************

async function searchMeals() {
  if (!searchValue.trim()) {
    selectedCategory || selectedArea ? filterMeals() : getMeals();
    return;
  }

  try {
    const response = await fetch(
      `https://nutriplan-api.vercel.app/api/meals/search?q=${encodeURIComponent(searchValue)}&page=1&limit=25`,
    );

    const data = await response.json();
    let result = data.results || [];

    if (selectedCategory)
      result = result.filter((meal) => meal.category === selectedCategory);

    if (selectedArea)
      result = result.filter((meal) => meal.area === selectedArea);

    displayMeals(result);
  } catch (error) {
    console.log("Search Error:", error);
  }
}

// **************************** Search Input ****************************

const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.addEventListener("input", function () {
    searchValue = searchInput.value;
    searchMeals();
  });
}

// **************************** Categories ****************************

async function getCategories() {
  try {
    const response = await fetch(
      "https://nutriplan-api.vercel.app/api/meals/categories",
    );

    const data = await response.json();
    let temp = "";
    const categories = data.results.slice(0, 12);

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

            <div>
              <h3 class="text-sm font-bold text-gray-900">
                ${categories[i].name}
              </h3>
            </div>

          </div>

        </div>`;
    }

    categoriesGrid.innerHTML = temp;

    document.querySelectorAll(".category-card").forEach((button) => {
      button.addEventListener("click", function () {
        const category = button.getAttribute("data-category");

        selectedCategory = selectedCategory === category ? "" : category;

        updateCategoryButtons();
        loadMeals();
      });
    });
  } catch (error) {
    console.log("Categories Error:", error);
  }
}

// **************************** Update Category Buttons ****************************

function updateCategoryButtons() {
  document.querySelectorAll(".category-card").forEach((button) => {
    const active = button.getAttribute("data-category") === selectedCategory;

    button.classList.toggle("border-emerald-500", active);
    button.classList.toggle("bg-emerald-100", active);
    button.classList.toggle("shadow-md", active);
  });
}

// **************************** Areas ****************************

async function getAreas() {
  try {
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
      </button>`;

    const areas = data.results.slice(0, 10);

    for (let i = 0; i < areas.length; i++) {
      temp += `
        <button
          class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
          data-area="${areas[i].name}"
        >
          ${areas[i].name}
        </button>`;
    }

    areasGrid.innerHTML = temp;

    document.querySelectorAll(".area-btn").forEach((button) => {
      button.addEventListener("click", function () {
        selectedArea = button.getAttribute("data-area");

        updateAreaButtons();
        loadMeals();
      });
    });
  } catch (error) {
    console.log("Areas Error:", error);
  }
}

// **************************** Update Area Buttons ****************************

function updateAreaButtons() {
  document.querySelectorAll(".area-btn").forEach((button) => {
    const active = button.getAttribute("data-area") === selectedArea;

    button.classList.toggle("bg-emerald-600", active);
    button.classList.toggle("text-white", active);
    button.classList.toggle("bg-gray-100", !active);
    button.classList.toggle("text-gray-700", !active);
  });
}

// **************************** Load Meals ****************************

function loadMeals() {
  if (searchValue.trim()) searchMeals();
  else if (selectedCategory || selectedArea) filterMeals();
  else getMeals();
}

// **************************** Show Meal Details ****************************

function showMealDetails() {
  allSections.forEach((section) => {
    if (section) section.style.display = "none";
  });

  document.getElementById("meal-details").style.display = "block";
}

// **************************** Get Meal Details ****************************

async function getMealDetails(id) {
  try {
    const response = await fetch(
      `https://nutriplan-api.vercel.app/api/meals/${id}`,
    );

    const data = await response.json();
    const meal = data.result;

    document.getElementById("meal-details-image").src = meal.thumbnail;
    document.getElementById("meal-details-image").alt = meal.name;
    document.getElementById("meal-details-name").textContent = meal.name;

    const category = document.getElementById("meal-details-category");
    if (category) category.textContent = meal.category || "";

    const area = document.getElementById("meal-details-area");
    if (area) area.textContent = meal.area || "Unknown";

    let tags = "";

    if (meal.tags) {
      for (let i = 0; i < meal.tags.length; i++) {
        let tagColor = "bg-purple-500";

        if (i === 0) tagColor = "bg-emerald-500";
        if (i === 1) tagColor = "bg-blue-500";

        tags += `
          <span class="px-3 py-1 ${tagColor} text-white text-sm font-semibold rounded-full">
            ${meal.tags[i]}
          </span>`;
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
          />

          <span class="text-gray-700">
            <span class="font-medium text-gray-900">
              ${meal.ingredients[i].measure}
            </span>
            ${meal.ingredients[i].ingredient}
          </span>

        </div>`;
    }

    document.getElementById("meal-ingredients").innerHTML = ingredients;

    document.getElementById("ingredients-count").textContent =
      `${meal.ingredients.length} items`;

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

        </div>`;
    }

    document.getElementById("meal-instructions").innerHTML = instructions;

    if (meal.youtube) {
      const videoId = meal.youtube.split("v=")[1];

      if (videoId)
        document.getElementById("meal-video").src =
          `https://www.youtube.com/embed/${videoId}`;
    }

    document.getElementById("log-meal-btn").dataset.mealId = meal.id;

    getNutrition(meal);
    showMealDetails();
  } catch (error) {
    console.log("Meal Details Error:", error);
  }
}

// **************************** Nutrition ****************************

async function getNutrition(meal) {
  try {
    let ingredients = [];

    for (let i = 0; i < meal.ingredients.length; i++) {
      ingredients.push(
        `${meal.ingredients[i].measure} ${meal.ingredients[i].ingredient}`,
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

    console.log("Nutrition:", result);

    if (result.success) displayNutrition(result.data);
  } catch (error) {
    console.log("Nutrition Error:", error);
  }
}

// **************************** Display Nutrition ****************************

function displayNutrition(nutrition) {
  const perServing = nutrition.perServing || {};
  const totals = nutrition.totals || {};

  setText("nutrition-calories", Math.round(perServing.calories || 0));

  setText(
    "nutrition-total-calories",
    `Total: ${Math.round(totals.calories || 0)} cal`,
  );

  setText("nutrition-protein", `${Math.round(perServing.protein || 0)}g`);
  setText("nutrition-carbs", `${Math.round(perServing.carbs || 0)}g`);
  setText("nutrition-fat", `${Math.round(perServing.fat || 0)}g`);
  setText("nutrition-fiber", `${Math.round(perServing.fiber || 0)}g`);
  setText("nutrition-sugar", `${Math.round(perServing.sugar || 0)}g`);

  if (heroCalories)
    heroCalories.textContent = `${Math.round(perServing.calories || 0)} cal/serving`;

  setWidth("protein-bar", perServing.protein, dailyNeeds.protein);
  setWidth("carbs-bar", perServing.carbs, dailyNeeds.carbs);
  setWidth("fat-bar", perServing.fat, dailyNeeds.fat);
  setWidth("fiber-bar", perServing.fiber, dailyNeeds.fiber);
  setWidth("sugar-bar", perServing.sugar, dailyNeeds.sugar);

  setText(
    "nutrition-vitamin-a",
    `${Math.round(perServing.vitaminA || perServing.vitamin_a || 0)}%`,
  );

  setText(
    "nutrition-vitamin-c",
    `${Math.round(perServing.vitaminC || perServing.vitamin_c || 0)}%`,
  );

  setText("nutrition-calcium", `${Math.round(perServing.calcium || 0)}%`);

  setText("nutrition-iron", `${Math.round(perServing.iron || 0)}%`);
}

// **************************** Helpers ****************************

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) element.textContent = value;
}

function setWidth(id, value, dailyMaximum) {
  const element = document.getElementById(id);

  if (!element) return;

  const number = Number(value) || 0;

  const percentage = Math.min((number / dailyMaximum) * 100, 100);

  element.style.width = `${percentage}%`;
}

// **************************** Back Button ****************************

backBtn.addEventListener("click", function () {
  allSections[3].style.display = "none";
  allSections[2].style.display = "block";
  allSections[0].style.display = "block";
  allSections[1].style.display = "block";
});

// **************************** Views ****************************

listView.addEventListener("click", function () {
  currentView = "list";
  applyCurrentView();
});

gridView.addEventListener("click", function () {
  currentView = "grid";
  applyCurrentView();
});

function applyCurrentView() {
  const cards = document.querySelectorAll(".recipe-card");

  if (currentView === "list") {
    recipesGrid.style.gridTemplateColumns = "1fr";

    cards.forEach((card) => {
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

    cards.forEach((card) => {
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

// **************************** Food Log ****************************

const logMealBtn = document.getElementById("log-meal-btn");

if (logMealBtn) {
  logMealBtn.addEventListener("click", async function () {
    const mealId = logMealBtn.dataset.mealId;

    if (!mealId) return;

    try {
      const response = await fetch(
        `https://nutriplan-api.vercel.app/api/meals/${mealId}`,
      );

      const data = await response.json();
      const meal = data.result;
      const nutrition = await getNutritionData(meal);

      foodLog.push({
        id: meal.id,
        name: meal.name,
        thumbnail: meal.thumbnail,
        nutrition: nutrition,
      });

      updateFoodLog();

      alert("Meal added successfully!");
    } catch (error) {
      console.log("Log Meal Error:", error);
    }
  });
}

// **************************** Get Nutrition Data ****************************

async function getNutritionData(meal) {
  try {
    let ingredients = [];

    for (let i = 0; i < meal.ingredients.length; i++) {
      ingredients.push(
        `${meal.ingredients[i].measure} ${meal.ingredients[i].ingredient}`,
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

    return result.success ? result.data.perServing : {};
  } catch (error) {
    console.log("Food Log Nutrition Error:", error);

    return {};
  }
}

// **************************** Update Food Log ****************************

function updateFoodLog() {
  const list = document.getElementById("logged-items-list");

  if (!list) return;

  const count = document.querySelector("#foodlog-today-section h4");

  if (count) count.textContent = `Logged Items (${foodLog.length})`;

  if (foodLog.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium">No meals logged today</p>
        <p class="text-sm">Add meals from the Meals page or scan products</p>
      </div>`;

    updateFoodLogSummary();
    return;
  }

  let temp = "";

  for (let i = 0; i < foodLog.length; i++) {
    temp += `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">

        <div class="flex items-center gap-3">

          <img
            src="${foodLog[i].thumbnail}"
            class="w-14 h-14 rounded-lg object-cover"
          >

          <div>

            <p class="font-semibold text-gray-900">
              ${foodLog[i].name}
            </p>

            <p class="text-xs text-gray-500">
              ${Math.round(foodLog[i].nutrition.calories || 0)} kcal
              •
              ${Math.round(foodLog[i].nutrition.protein || 0)}g protein
            </p>

          </div>

        </div>

        <button
          onclick="removeFood(${i})"
          class="text-red-500 hover:text-red-600"
        >
          <i class="fa-solid fa-trash"></i>
        </button>

      </div>`;
  }

  list.innerHTML = temp;

  updateFoodLogSummary();
}

// **************************** Remove Food ****************************

function removeFood(index) {
  foodLog.splice(index, 1);
  updateFoodLog();
}

// **************************** Food Log Summary ****************************

function updateFoodLogSummary() {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (let i = 0; i < foodLog.length; i++) {
    calories += Number(foodLog[i].nutrition.calories) || 0;
    protein += Number(foodLog[i].nutrition.protein) || 0;
    carbs += Number(foodLog[i].nutrition.carbs) || 0;
    fat += Number(foodLog[i].nutrition.fat) || 0;
  }

  updateProgress("Calories", calories, 2000);
  updateProgress("Protein", protein, 50);
  updateProgress("Carbs", carbs, 200);
  updateProgress("Fat", fat, 65);
}

// **************************** Food Log Progress ****************************

function updateProgress(name, value, max) {
  const boxes = document.querySelectorAll(
    "#foodlog-today-section .bg-emerald-50,#foodlog-today-section .bg-blue-50,#foodlog-today-section .bg-amber-50,#foodlog-today-section .bg-purple-50",
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
    text.textContent = `${Math.round(value)} / ${max}${name === "Calories" ? " kcal" : " g"}`;
  }

  if (bar) {
    bar.style.width = `${Math.min((value / max) * 100, 100)}%`;
  }
}

// **************************** Global ****************************

window.removeFood = removeFood;

// **************************** Start App ****************************

getMeals();
getCategories();
getAreas();

async function searchProduct() {
  const response = await fetch(
    `https://nutriplan-api.vercel.app/api/products/search?q=${productSearchInput.value}&page=1&limit=24`,
  );

  const data = await response.json();
  displaySearch(data);
  console.log(data);
}

searchProductBtn.addEventListener("click", searchProduct);

async function barcodeSearch() {
  const response = await fetch(
    `https://nutriplan-api.vercel.app/api/products/barcode/${barCode.value}`,
  );

  const data = await response.json();
  console.log(data);

  displaySearch(data);
}
lookupBarcodeBtn.addEventListener("click", barcodeSearch);

function displaySearch(data) {
  let products = data.results || [data.result];
  let temp = "";

  for (let i = 0; i < products.length; i++) {
    temp += `
      <div 
        class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" 
        data-barcode="${products[i].barcode || ""}" 
      >

        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">

          <img 
            class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
            src="${products[i].image || ""}" 
            alt="${products[i].product_name || "Product"}" 
            loading="lazy" 
          >

          <div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
            Nutri-Score ${products[i].nutritionGrade || "N/A"}
          </div>

          <div 
            class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" 
            title="NOVA ${products[i].novaGroup || "N/A"}"
          >
            ${products[i].novaGroup || "N/A"}
          </div>

        </div>


        <div class="p-4">

          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
            ${products[i].brand || "Unknown Brand"}
          </p>

          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${products[i].name || "Unknown Product"}
          </h3>


          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">

           

            <span>
              <i class="fa-solid fa-fire mr-1"></i>
              ${products[i].nutrients?.calories?.toFixed(1) || "0.0"} kcal/100g
            </span>

          </div>


          <div class="grid grid-cols-4 gap-1 text-center">

            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">
                ${products[i].nutrients?.protein?.toFixed(1) || "0.0"}g
              </p>
              <p class="text-[10px] text-gray-500">
                Protein
              </p>
            </div>


            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">
                ${products[i].nutrients?.carbs?.toFixed(1) || "0.0"}g
              </p>
              <p class="text-[10px] text-gray-500">
                Carbs
              </p>
            </div>


            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">
                ${products[i].nutrients?.fat?.toFixed(1) || "0.0"}g
              </p>
              <p class="text-[10px] text-gray-500">
                Fat
              </p>
            </div>


            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">
                ${products[i].nutrients?.sugar?.toFixed(1) || "0.0"}g
              </p>
              <p class="text-[10px] text-gray-500">
                Sugar
              </p>
            </div>

          </div>

        </div>

      </div>
    `;
  }

  document.getElementById("products-grid").innerHTML = temp;
}
async function displayCategories() {
  const response = await fetch(
    `https://nutriplan-api.vercel.app/api/products/categories`,
  );

  const data = await response.json();

  var temp = ``;

  for (var i = 0; i < 10; i++) {
    temp += `
      <button 
        class="product-category-btn px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-200 transition-all"
        data-id="${data.results[i].id}"
      >
        <i class="mr-1.5">
          <svg 
            class="svg-inline--fa fa-cookie" 
            data-prefix="fas" 
            data-icon="${data.results[i].id}" 
            role="img" 
            viewBox="0 0 512 512" 
            aria-hidden="true"
          >
            <path 
              fill="currentColor" 
              d="M247.2 17c-22.1-3.1-44.6 .9-64.4 11.4l-74 39.5C89.1 78.4 73.2 94.9 63.4 115L26.7 190.6c-9.8 20.1-13 42.9-9.1 64.9l14.5 82.8c3.9 22.1 14.6 42.3 30.7 57.9l60.3 58.4c16.1 15.6 36.6 25.6 58.7 28.7l83 11.7c22.1 3.1 44.6-.9 64.4-11.4l74-39.5c19.7-10.5 35.6-27 45.4-47.2l36.7-75.5c9.8-20.1 13-42.9 9.1-64.9l-14.6-82.8c-3.9-22.1-14.6-42.3-30.7-57.9L388.9 57.5c-16.1-15.6-36.6-25.6-58.7-28.7L247.2 17zM208 144a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM144 336a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm224-64a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
            ></path>
          </svg>
        </i>

        ${data.results[i].name}
      </button>
    `;
  }

  productCategories.innerHTML = temp;


  // لازم نجيب الـ buttons بعد ما اتعملت
  const productCategoryBtn = document.querySelectorAll(".product-category-btn");

  productCategoryBtn.forEach((btn) => {

    btn.addEventListener("click", function () {

      var cat = btn.getAttribute("data-id");

      console.log(cat);

      displayByCat(cat);

    });

  });
}


displayCategories();


async function displayByCat(cate) {

  const response = await fetch(
    `https://nutriplan-api.vercel.app/api/products/category/${cate}`
  );

  const data = await response.json();

  console.log(data);

  displaySearch(data);
}