import http from "node:http";

// Create a local server to send data to the client
const server = http.createServer((req, res) => {
    if (req.url?.split('?')[0] === ("/health")) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            ok: true,
        }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Not Found',
        }));
    }
});


server.listen(3000);