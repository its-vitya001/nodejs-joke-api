const jokesContainer = document.getElementById("jokes_container");
const jokeForm = document.getElementById("joke_form");

const SERVER_LINK = "http://localhost:3000"

let currentLength = 0;

const xhr = new XMLHttpRequest();
xhr.open("GET", `${SERVER_LINK}/jokes`);
xhr.send();
xhr.responseType = 'json';
xhr.onload = () =>  {
    const jokes = xhr.response;
    if (jokes.length) {
        jokes.forEach(joke => {
            jokesContainer.innerHTML += getJokeHTML(joke);
        });
        currentLength = jokes.length;
    }
}

function getJokeHTML (joke) {
    console.log(joke)
    return `
    <div class="joke" id="joke${joke.id}">
                <div class="joke_content">
                    ${joke.content}
                </div>
                <div class="joke_footer">
                    <div class="joke_likes">
                        <span>${joke.likes}</span>
                        <button class="joke_btn" onclick="like(${joke.id})">
                            <span class="material-symbols-outlined">
                                thumb_up
                            </span>
                        </button>
                    </div>
                    <div class="joke_likes">
                        <span>${joke.dislikes}</span>
                        <button class="joke_btn" onclick="dislike(${joke.id})">
                            <span class="material-symbols-outlined">
                                thumb_down
                            </span>
                        </button>
                    </div>
                </div>
            </div>
    `;
}

jokeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const joke = {content: "", likes: 0, dislikes: 0, id: currentLength};
    const addJokeXhr = new XMLHttpRequest();
    addJokeXhr.open("GET", `${SERVER_LINK}/jokes`);
    addJokeXhr.send(JSON.stringify(joke));
    addJokeXhr.onload = () => {
        jokesContainer.innerHTML = getJokeHTML(joke);
        currentLength++
    }
})

function like(id) {
    const likeXhr = new XMLHttpRequest();
    likeXhr.open("GET", `${SERVER_LINK}/like?id=${id}`);
    likeXhr.send();
    likeXhr.responseType = "json";
    likeXhr.onload = () => {
        const joke = likeXhr.response;
        document.getElementById("joke"+id).outerHTML = getJokeHTML(joke);
    }
}

function dislike (id) {
    const likeXhr = new XMLHttpRequest();
    likeXhr.open("GET", `${SERVER_LINK}/dislike?id=${id}`);
    likeXhr.send();
    likeXhr.responseType = "json";
    likeXhr.onload = () => {
        const joke = likeXhr.response;
        document.getElementById("joke"+id).outerHTML = getJokeHTML(joke);
    }
}