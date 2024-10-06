#! /bin/bash

pm2 start server.js --name chainbridge -o ./logs/server.info.log -e ./logs/server.err.log