const sortButton = document.getElementById("sort-btn");
const searchInput = document.getElementById("search-input");
const buttonContainer = document.getElementById("btn-container");
const buttonAll = document.getElementById("btn-all");
const videoContainer = document.getElementById("video-container");
const loader = document.getElementById("loader");
const modal = document.getElementById("modal");

const showLoader = () => {
  videoContainer.classList.remove("block");
  videoContainer.classList.add("hidden");
  loader.classList.remove("hidden");
  loader.classList.add("block");
};

const hideLoader = () => {
  loader.classList.remove("block");
  loader.classList.add("hidden");
  videoContainer.classList.remove("hidden");
  videoContainer.classList.add("block");
};

const fetchAllCategories = () => {
  showLoader();
  fetch("https://openapi.programming-hero.com/api/phero-tube/categories")
    .then((res) => res.json())
    .then((object) => {
      hideLoader();
      displayCategoryButtons(object.categories);
    });
};

const displayCategoryButtons = (categoryObjects) => {
  categoryObjects.forEach((categoryObject) => {
    const button = document.createElement("button");
    button.id = `btn-${categoryObject.category_id}`;
    button.classList.add(
      "btn",
      "btn-neutral",
      "bg-opacity-15",
      "border-none",
      "text-base",
      "px-5",
      "rounded-md",
      "h-8",
      "min-h-9",
      "font-medium",
      "non-active-btn"
    );
    button.innerText = categoryObject.category;
    buttonContainer.appendChild(button);

    button.addEventListener("click", (event) => {
      searchInput.value = "";
      removeActiveButtons();
      button.classList.remove("non-active-btn");
      button.classList.add("active-btn");
      fetchCategoryVideos(categoryObject.category_id);
    });
  });
};

const fetchAllVideos = (sorted = false) => {
  searchInput.value = "";
  removeActiveButtons();
  buttonAll.classList.remove("non-active-btn");
  buttonAll.classList.add("active-btn");
  showLoader();
  fetch(`https://openapi.programming-hero.com/api/phero-tube/videos`)
    .then((res) => res.json())
    .then((object) => {
      if (sorted) {
        object.videos.sort(
          (a, b) => parseFloat(b.others.views) - parseFloat(a.others.views)
        );
      }
      hideLoader();
      displayVideos(object.videos);
    });
};

const fetchCategoryVideos = (categoryId, sorted = false) => {
  showLoader();
  fetch(
    `https://openapi.programming-hero.com/api/phero-tube/category/${categoryId}`
  )
    .then((res) => res.json())
    .then((object) => {
      if (sorted) {
        object.category.sort(
          (a, b) => parseFloat(b.others.views) - parseFloat(a.others.views)
        );
      }
      hideLoader();
      displayVideos(object.category);
    });
};

const fetchSearchVideos = (input) => {
  removeActiveButtons();
  showLoader();
  fetch(
    `https://openapi.programming-hero.com/api/phero-tube/videos?title=${input}`
  )
    .then((res) => res.json())
    .then((object) => {
      hideLoader();
      displayVideos(object.videos);
    });
};

const displayVideos = (videoObjects) => {
  videoContainer.innerHTML = "";

  if (videoObjects.length === 0) {
    videoContainer.innerHTML = `
      <div class="col-span-full place-self-center flex flex-col justify-center items-center gap-4 mb-16">
        <img src="./assets/icon.png" loading="lazy" alt="Icon" class="w-28">
        <h2 class="text-center text-secondary-black text-3xl font-bold">Oops!! Sorry, there is no<br>content here.</h2>
      </div>
    `;
    return;
  }

  videoObjects.forEach((videoObject) => {
    let day, hour, min;

    if (videoObject.others.posted_date != "") {
      day = parseInt(videoObject.others.posted_date / 86400);
      hour = parseInt((videoObject.others.posted_date % 86400) / 3600);
      min = parseInt(((videoObject.others.posted_date % 86400) % 3600) / 60);
    }

    const div = document.createElement("div");
    div.classList.add(
      "card",
      "card-compact",
      "rounded-lg",
      "hover:cursor-pointer"
    );
    div.innerHTML = `
      <figure class="relative hover:opacity-80">
        <img src="${videoObject.thumbnail}" loading="lazy" alt="Thumbnail"
              class="rounded-lg h-48 lg:h-[11.5rem] w-full object-cover" />
        <p class="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-primary-black text-white ${
          day === undefined ? "hidden" : "block"
        }"><span class="${
      hour <= 0 ? "hidden" : "inline"
    }">${hour} hr </span>${min} min ago</p>
      </figure>
      <div class="py-5 flex justify-between">
        <div class="flex gap-3">
          <div class="avatar">
            <div class="w-12 h-12 rounded-full">
              <img src="${
                videoObject.authors[0].profile_picture
              }" loading="lazy" alt="Author" />
            </div>
          </div>
          <div>
            <h4 class="text-secondary-black font-bold text-base">${
              videoObject.title
            }</h4>
            <div class="text-secondary-black text-sm mt-1 flex gap-1 items-center">
              <p class="opacity-60">${videoObject.authors[0].profile_name}</p>
                ${
                  videoObject.authors[0].verified === true
                    ? `<img src="./assets/verified.png" loading="lazy" alt="Verified" class="w-4 h-4">`
                    : ``
                }
            </div>
            <p class="text-secondary-black opacity-60 text-sm">${
              videoObject.others.views
            } views</p>
          </div>
        </div>
        <button onclick="showVideoDetails('${
          videoObject.video_id
        }')" class="btn btn-ghost btn-circle btn-sm">
          <img src="./assets/menu.png" loading="lazy" alt="Menu" class="h-6" />
        </button>
      </div>
    `;
    videoContainer.appendChild(div);
  });
};

const removeActiveButtons = () => {
  const activeButtons = document.getElementsByClassName("active-btn");

  for (const activeButton of activeButtons) {
    activeButton.classList.remove("active-btn");
    activeButton.classList.add("non-active-btn");
  }
};

const showVideoDetails = (videoId) => {
  fetch(`https://openapi.programming-hero.com/api/phero-tube/video/${videoId}`)
    .then((res) => res.json())
    .then((object) => {
      document.getElementById("modal-box").innerHTML = `
        <figure>
          <img
            src="${object.video.thumbnail}" loading="lazy"
            alt="Thumbnail" class="w-full object-cover" />
        </figure>
        <div class="card-body gap-1 mt-2">
          <h3 class="card-title text-secondary-black font-bold text-xl">${object.video.title}</h3>
          <p class="">${object.video.description}</p>
        </div>
      `;
      document.body.classList.remove("overflow-y-scroll");
      document.body.classList.add("overflow-y-auto");
      modal.showModal();
    });
};

searchInput.addEventListener("focus", (event) => {
  sortButton.disabled = true;
  removeActiveButtons();
});

searchInput.addEventListener("keyup", (event) => {
  fetchSearchVideos(event.target.value);
});

searchInput.addEventListener("blur", (event) => {
  if (event.target.value == "") {
    sortButton.disabled = false;
    buttonAll.classList.remove("non-active-btn");
    buttonAll.classList.add("active-btn");
  }
});

sortButton.addEventListener("click", (event) => {
  const categoryId = document
    .getElementsByClassName("active-btn")[0]
    .id.split("-")[1];

  if (categoryId === "all") {
    fetchAllVideos(true);
  } else {
    fetchCategoryVideos(categoryId, true);
  }
});

modal.addEventListener("close", (event) => {
  document.body.classList.remove("overflow-y-auto");
  document.body.classList.add("overflow-y-scroll");
});

fetchAllCategories();
fetchAllVideos();
