#!/bin/bash
PORT=9999

PIDS=$(lsof -ti tcp:$PORT 2>/dev/null)
if [ -n "$PIDS" ]; then
  kill $PIDS 2>/dev/null
  echo "Moco stopped."
  exit 0
fi

# 兜底：按进程名结束
if pkill -f "moco-runner.jar" 2>/dev/null; then
  echo "Moco stopped."
else
  echo "Moco is not running on port $PORT."
fi
