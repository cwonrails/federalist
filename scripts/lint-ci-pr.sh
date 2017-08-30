#!/bin/bash

set -eu

if [ -z "$CI_PULL_REQUEST" ]; then
  echo "Not in a pull request. Exiting."
  exit 0
fi;

DIFF_TARGET_BRANCH="$CIRCLE_BRANCH" ./scripts/lint-diff.sh
