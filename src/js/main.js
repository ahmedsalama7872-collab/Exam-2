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
const backBtn = document.getElementById("back-to-meals-btn");
const recipesGrid = document.getElementById("recipes-grid");
const gridView = document.getElementById("grid-view-btn");
const listView = document.getElementById("list-view-btn");


// **************************** Buttons and Sections ****************************

navLinks.forEach((link) => {

  link.addEventListener("click", function () {

    navLinks.forEach((btn) => {

      btn.classList.remove(
        "bg-emerald-50",
        "text-emerald-700"
      );

      btn.classList.add(
        "text-gray-600",
        "hover:bg-gray-50"
      );

    });


    link.classList.remove(
      "text-gray-600",
      "hover:bg-gray-50"
    );

    link.classList.add(
      "bg-emerald-50",
      "text-emerald-700"
    );


    allSections.forEach((section) => {

      if (section) {
        section.style.display = "none";
      }

    });


    const target = link.getAttribute("href");


    if (target === "#all-recipes-section") {

      document.getElementById("search-filters-section").style.display = "block";

      document.getElementById("meal-categories-section").style.display = "block";

      document.getElementById("all-recipes-section").style.display = "block";

    } else {

      if (sections[target]) {
        sections[target].style.display = "block";
      }

    }


    history.pushState(null, "", target);

  });

});


// **************************** Get Meals ****************************

async function getMeals() {



    const response = await fetch(
      "https://nutriplan-api.vercel.app/api/meals/random?count=25"
    );

    const data = await response.json();

    let temp = "";


    for (let i = 0; i < data.results.length; i++) {

      temp += `
        <div 
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          data-meal-id="${data.results[i].id}"
        >

          <div class="relative h-48 overflow-hidden">

            <img
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              src="${data.results[i].thumbnail}"
              alt="${data.results[i].name}"
              loading="lazy"
            >

            <div class="absolute bottom-3 left-3 flex gap-2">

              <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
                ${data.results[i].category}
              </span>

              <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
                ${data.results[i].area}
              </span>

            </div>

          </div>


          <div class="p-4">

            <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
              ${data.results[i].name}
            </h3>

            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              Delicious recipe to try!
            </p>

            <div class="flex items-center justify-between text-xs">

              <span class="font-semibold text-gray-900">

                <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>

                ${data.results[i].category}

              </span>

              <span class="font-semibold text-gray-500">

                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>

                ${data.results[i].area}

              </span>

            </div>

          </div>

        </div>
      `;

    }


    meals.innerHTML = temp;

    const recipeCards = document.querySelectorAll(".recipe-card");


    recipeCards.forEach((card) => {

      card.addEventListener("click", function () {

        const mealId = card.getAttribute("data-meal-id");

        getMealDetails(mealId);

      });

    });

  } 




getMeals();


// **************************** Show Meal Details ****************************

function showMealDetails() {

  allSections.forEach((section) => {

    if (section) {
      section.style.display = "none";
    }

  });


  document.getElementById("meal-details").style.display = "block";

}


// **************************** Get Meal Details ****************************

async function getMealDetails(id) {

  const response = await fetch(
    `https://nutriplan-api.vercel.app/api/meals/${id}`
  );

  const data = await response.json();

  const meal = data.result;


  document.getElementById("meal-details-image").src = meal.thumbnail;

  document.getElementById("meal-details-image").alt = meal.name;


  document.getElementById("meal-details-name").textContent =
    meal.name;


  let tags = "";

  if (meal.tags) {

    for (let i = 0; i < meal.tags.length; i++) {

      let tagColor = "bg-purple-500";

      if (i === 0) {
        tagColor = "bg-emerald-500";
      }

      if (i === 1) {
        tagColor = "bg-blue-500";
      }

      tags += `
        <span
          class="px-3 py-1 ${tagColor} text-white text-sm font-semibold rounded-full"
        >
          ${meal.tags[i]}
        </span>
      `;

    }

  }

  document.getElementById("meal-tags").innerHTML = tags;


  let ingredients = "";

  for (let i = 0; i < meal.ingredients.length; i++) {

    ingredients += `
      <div
        class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
      >

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

      </div>
    `;

  }

  document.getElementById("meal-ingredients").innerHTML =
    ingredients;


  document.getElementById("ingredients-count").textContent =
    `${meal.ingredients.length} items`;


  let instructions = "";

  for (let i = 0; i < meal.instructions.length; i++) {

    instructions += `
      <div
        class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
      >

        <div
          class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
        >
          ${i + 1}
        </div>

        <p class="text-gray-700 leading-relaxed pt-2">
          ${meal.instructions[i]}
        </p>

      </div>
    `;

  }

  document.getElementById("meal-instructions").innerHTML =
    instructions;


  if (meal.youtube) {

    const videoId = meal.youtube.split("v=")[1];

    if (videoId) {

      document.getElementById("meal-video").src =
        `https://www.youtube.com/embed/${videoId}`;

    }

  }


  document.getElementById("log-meal-btn").dataset.mealId =
    meal.id;


  showMealDetails();

}

backBtn.addEventListener("click", function(){
    allSections[3].style.display="none"
allSections[2].style.display="block"
})




listView.addEventListener("click",function(){
      
    recipesGrid.classList.add("grid-cols-2","gap-4")
    recipesGrid.classList.remove("grid-cols-4","gap-5")
})





