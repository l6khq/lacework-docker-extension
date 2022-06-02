#!/bin/bash
if [ $1 = "reset" ]; then
  lw-scanner configure reset
  exit
fi
export LW_SCANNER_DISABLE_UPDATES=true
export LW_ACCOUNT_NAME=$1
export LW_ACCESS_TOKEN=$2
echo "" | $(dirname "$0")/lw-scanner configure auth