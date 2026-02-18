function showSection(id) {
  // Oculta todas las secciones
  document.querySelectorAll("main section").forEach(sec => {
    sec.classList.add("hidden");
  });
  // Muestra solo la sección seleccionada
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove("hidden");
  }
}

function addMovie() {
  const title = document.getElementById("movieTitle").value;
  const link = document.getElementById("movieLink").value;
  if (!title || !link) return;
  let movies = JSON.parse(localStorage.getItem("movies")) || [];
  movies.push({title, link});
  localStorage.setItem("movies", JSON.stringify(movies));
  renderMovies();
}

function addBatch() {
  const url = document.getElementById("batchUrl").value;
  if (!url) return;
  let movies = JSON.parse(localStorage.getItem("movies")) || [];
  for (let i=1; i<=5; i++) {
    movies.push({title: "Peli lote " + i, link: url + "/movie" + i});
  }
  localStorage.setItem("movies", JSON.stringify(movies));
  renderMovies();
}

function renderMovies() {
  const grid = document.getElementById("movieGrid");
  grid.innerHTML = "";
  let movies = JSON.parse(localStorage.getItem("movies")) || [];
  movies.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${m.title}</h3>
      <button onclick="playMovie('${m.link}')">Play</button>
      <button onclick="addFav('${m.title}','${m.link}')">Favorito</button>
      <button onclick="deleteMovie(${i})">Borrar</button>
    `;
    grid.appendChild(card);
  });
}

function playMovie(link) {
  const player = window.open(link, "_blank");
  player.focus();
}

function addFav(title, link) {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  favs.push({title, link});
  localStorage.setItem("favs", JSON.stringify(favs));
  renderFavs();
}

function renderFavs() {
  const list = document.getElementById("favList");
  list.innerHTML = "";
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  favs.forEach(f => {
    const li = document.createElement("li");
    li.textContent = f.title + " - " + f.link;
    list.appendChild(li);
  });
}

function deleteMovie(index) {
  let movies = JSON.parse(localStorage.getItem("movies")) || [];
  movies.splice(index, 1);
  localStorage.setItem("movies", JSON.stringify(movies));
  renderMovies();
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

function downloadJSON() {
  const data = {
    movies: JSON.parse(localStorage.getItem("movies")) || [],
    favs: JSON.parse(localStorage.getItem("favs")) || []
  };
  const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vicomedia.json";
  a.click();
}

function uploadJSON(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    const data = JSON.parse(e.target.result);
    localStorage.setItem("movies", JSON.stringify(data.movies));
    localStorage.setItem("favs", JSON.stringify(data.favs));
    renderMovies();
    renderFavs();
  };
  reader.readAsText(file);
}

function sendChat()
