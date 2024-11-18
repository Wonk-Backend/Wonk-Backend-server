// Requests are not actively verified here, all requests are handled by "Requests.wonk.app" and any injection from any other source will be blocked by the firewall.
const http = require('http')
const url = require('url');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'your-rds-endpoint',
    user: 'your-username',
    password: 'your-password',
    database: 'your-database-name'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

const server = http.createServer((req, res) => {
    const queryObject = url.parse(req.url, true).query;
    const fileName = queryObject.file;

    if (fileName) {
        const filePath = path.join(__dirname, `${fileName}.js`);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                exec(`node ${filePath}`, (error, stdout, stderr) => {
                    if (error) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end(`Error executing file: ${stderr}`);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end(stdout);
                    }
                });
            }
        });
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Cannot locate function in query.');
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

