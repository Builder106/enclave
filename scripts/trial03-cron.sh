#!/bin/sh
# Trial 03 runner: retries daily ONLY until the one-time 50-doc Bedrock
# measurement completes, then removes its own schedule. Each fire measures
# just the eval docs still lacking a clean run (--resume) and aborts early
# on quota throttles — so the daily cadence is a retry loop for AWS's
# new-account quota ramp, not a recurring job.
#
# Installed via ~/Library/LaunchAgents/com.enclave.trial03.plist
#   status:  launchctl list | grep enclave
#   logs:    ~/Library/Logs/enclave-trial03.log
#   manual removal (self-removal handles the normal case):
#            launchctl bootout "gui/$(id -u)/com.enclave.trial03"

# launchd provides no shell profile; pin the fnm-resolved node explicitly.
NODE_BIN="$HOME/.fnm/node-versions/v24.16.0/installation/bin"
export PATH="$NODE_BIN:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

cd "/Users/yinkavaughan/My Drive (yvaughan@wesleyan.edu)/CS/Projects/AI_ML/Enclave" || exit 1

echo "── trial03 cron run: $(date) ──"
OUT=$(npx tsx scripts/measure.ts --provider bedrock --seed 1 --resume 2>&1)
STATUS=$?
echo "$OUT"

case "$OUT" in
  *"coverage already complete"* | *"coverage: 50/50"*)
    echo "Trial 03 complete — removing the scheduled job and plist"
    rm -f "$HOME/Library/LaunchAgents/com.enclave.trial03.plist"
    launchctl bootout "gui/$(id -u)/com.enclave.trial03"
    ;;
esac

exit "$STATUS"
