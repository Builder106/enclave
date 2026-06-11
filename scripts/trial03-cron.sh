#!/bin/sh
# Daily Trial 03 runner: measures only the eval docs still lacking a clean
# Bedrock run (--resume), aborting early on quota throttles. Re-running after
# coverage completes is a no-op, so the job is safe to leave loaded.
#
# Installed via ~/Library/LaunchAgents/com.enclave.trial03.plist
#   status:  launchctl list | grep enclave
#   logs:    ~/Library/Logs/enclave-trial03.log
#   remove:  launchctl unload ~/Library/LaunchAgents/com.enclave.trial03.plist

# launchd provides no shell profile; pin the fnm-resolved node explicitly.
NODE_BIN="$HOME/.fnm/node-versions/v24.16.0/installation/bin"
export PATH="$NODE_BIN:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

cd "/Users/yinkavaughan/My Drive (yvaughan@wesleyan.edu)/CS/Projects/AI_ML/Enclave" || exit 1

echo "── trial03 cron run: $(date) ──"
exec npx tsx scripts/measure.ts --provider bedrock --seed 1 --resume
