const express = require('express');
const http = require('http');
const path = require('path');

const _app_folder = __dirname + '/dist/frontend';

const app = express();

const port = process.env.PORT || 3001;

// ---- SERVE STATIC FILES ---- //
app.get('*.*', express.static(_app_folder, {maxAge: '1y'}));

// ---- SERVE APLICATION PATHS ---- //
app.all('*', function (req, res) {
  res.status(200).sendFile(`/`, {root: _app_folder});
});

const server = http.createServer(app);

server.listen(port, () => console.log(`App running on: http://localhost:${port}`));
