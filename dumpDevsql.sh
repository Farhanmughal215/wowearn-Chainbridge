#! /bin/bash

shellDir=$(pwd)
echo pwd is 12345678
cd /usr/local/mysql/bin 
./mysqldump -uroot -p chainbridge > ${shellDir}/db.sql

echo completed
