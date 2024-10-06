import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import {SERVER_PORT} from './env.js';
import https from './interfaces/https.js';
import Worker from './worker/worker.js'

const server = express();

server.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
server.use(bodyParser.text({ type: 'text/html' }));
server.use(bodyParser.json({ type: 'application/json', limit: '20480kb' }));
server.use(cors());

server.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method' )
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
    res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')

    next();
});



await Worker.start();
https.register(server);


console.log('----start', SERVER_PORT);
server.listen(SERVER_PORT);
