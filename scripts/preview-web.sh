#!/usr/bin/env bash
# Wrapper so the preview tool launches the frontend under Node 22 (not the shell default).
set -e
export PATH="$HOME/.nvm/versions/node/v22.17.0/bin:$PATH"
cd /Users/madhukarmudunuru/work/RND/swara/frontend
exec npm run dev
