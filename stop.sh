#!/bin/bash
echo "Running shell script"

ps aux | grep 'watch' | grep -v grep | awk '{print $2}' | xargs kill
ps aux | grep 'chokidar' | grep -v grep | awk '{print $2}' | xargs kill
ps aux | grep 'tsx' | grep -v grep | awk '{print $2}' | xargs kill
ps aux | grep 'vite' | grep -v grep | awk '{print $2}' | xargs kill
rm src/_data/*.json