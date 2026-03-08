const http = require("http");
const fs = require("fs");
const path = require("path");

const jokesDataPath = path.join(__dirname, "Data")
const jokesDataDirectory = fs.readdirSync(jokesDataPath);

const rootDir = path.join(__dirname, "public"); 

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function serveStaticFile(filePath, response) {
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
        if (err) {
            response.writeHead(404);
            return response.end("404 Not Found");
        }
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content);
    });
}

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
        joke.likes = 0;
        joke.dislikes = 0;

        const filePath = path.join(jokesDataPath, `${jokesDataDirectory.length}.json`);
        const file = fs.writeFileSync(filePath, JSON.stringify(joke));
        response.end()
    });
}

function reactToJoke (request, response, reaction) {
    const baseUrl = `http://localhost:3000`;
    const mainUrl = new URL(request.url, baseUrl);
    const id = mainUrl.searchParams.get("id");

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

        fileContent.id = id;

        return response.end(JSON.stringify(fileContent))
    }
    response.end()
}

const server = http.createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");

    if (request.url == "/jokes" && request.method == "GET") {
        return getAllJokes(request, response);
    } else if (request.url == "/addJoke" && request.method == "POST") {
       return addJoke(request, response);
    }

    if (request.url.startsWith("/like")) {
        return reactToJoke(request, response, "like");
    } else if (request.url.startsWith("/unlike")) {
        return reactToJoke(request, response, "unlike");
    }

    if (request.url.startsWith("/dislike")) {
        return reactToJoke(request, response, "dislike")
    } else if (request.url.startsWith("/undislike")) {
        return reactToJoke(request, response, "undislike");
    }

    let urlPath = request.url === "/" ? "/index.html" : request.url;
    let filePath = path.join(rootDir, urlPath);
    serveStaticFile(filePath, response);
})

server.listen(3000, () => {
    console.log("server on: http://localhost:3000");
})