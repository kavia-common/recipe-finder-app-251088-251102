#!/bin/bash
cd /home/kavia/workspace/code-generation/recipe-finder-app-251088-251102/frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

