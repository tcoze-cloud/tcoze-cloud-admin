#!/bin/bash
cd "$(dirname "$0")"

PORT=9999
if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  echo "Port $PORT is already in use."
  exit 1
fi

nohup java -Dfile.encoding=utf-8 -jar moco-runner.jar http -p $PORT -g config.json > moco.log 2>&1 &
echo "Moco started on port $PORT (PID $!). Log: moco.log"
