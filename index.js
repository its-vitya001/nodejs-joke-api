const http = require("http");
const fs = require("fs");
const path = require("path")

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

const server = http.createServer((request, response) => {
    if (request.url == "/jokes" && request.method == "GET") {
        getAllJokes(request, response);
    } else if (request.url == "/addJoke" && request.method == "POST") {
        addJoke(request, response);
    }
})

server.listen(3000, () => {
    console.log("server on: http://localhost:3000");
})