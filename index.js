const http = require("http");
const fs = require("fs");
const path = require("path");

const jokesDataPath = path.join(__dirname, "Data")
const jokesDataDirectory = fs.readdirSync(jokesDataPath);

function getAllJokes (request, response) {
    let jokes = [];
    
    for (let i = 0; i < jokesDataDirectory.length; i++) {
        const file = fs.readFileSync(path.join(jokesDataPath, `${i}.json`));
        const joke = JSON.parse(Buffer.from(file).toString());
        joke.id = i;
        jokes.push(joke);
    }

    response.writeHead(200, {"content-type": "application/json"})
    response.end(JSON.stringify(jokes))
}

function addJoke (request, response) {
    let data = "";

    request.on("data", (chunk) => {
        data += chunk;
    });

    request.on("end", () => {
        const joke = JSON.parse(data);
        joke.like, joke.dislike = 0;

        const filePath = path.join(jokesDataPath, `${jokesDataDirectory.length}.json`);
        const file = fs.writeFileSync(filePath, JSON.stringify(joke));
        response.end()
    });
}

function reactToJoke (request, response, reaction) {
    const baseUrl = `http://${request.headers.host}`;
    const mainUrl = new URL(request.url, baseUrl);
    const id = mainUrl.searchParams.get("joke-id");

    if (id) {
        const filePath = path.join(__dirname, "Data", `${id}.json`);
        const file = fs.readFileSync(filePath);
        let fileContent = JSON.parse(Buffer.from(file).toString());
        
        if (reaction == "like") {
            fileContent.likes >= 0 ? fileContent.likes += 1 : fileContent.likes;
        } else if (reaction == "unlike") {
            fileContent.likes > 0 ? fileContent.likes -= 1 : fileContent.likes;
        } 

        if (reaction == "dislike") {
            fileContent.dislikes >= 0 ? fileContent.dislikes += 1 : fileContent.dislikes;
        } else if (reaction == "undislike") {
            fileContent.dislikes > 0 ? fileContent.dislikes -= 1 : fileContent.dislikes;
        }

        fs.writeFileSync(filePath, JSON.stringify(fileContent));
    }
    response.end()
}

const server = http.createServer((request, response) => {
    if (request.url == "/jokes" && request.method == "GET") {
        getAllJokes(request, response);
    } else if (request.url == "/addJoke" && request.method == "POST") {
        addJoke(request, response);
    }

    if (request.url.startsWith("/like")) {
        reactToJoke(request, response, "like");
    } else if (request.url.startsWith("/unlike")) {
        reactToJoke(request, response, "unlike");
    }

    if (request.url.startsWith("/dislike")) {
        reactToJoke(request, response, "dislike")
    } else if (request.url.startsWith("/undislike")) {
        reactToJoke(request, response, "undislike");
    }

    if (request.url == "/") {
        response.end(fs.readFileSync("index.html", "utf-8"));
    }
})

server.listen(3000, () => {
    console.log("server on: http://localhost:3000");
})