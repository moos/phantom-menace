#!/bin/bash

# usage: run.sh phantom|chrome [count|10]

P=`dirname "$0"`
phantom="$P/../node_modules/.bin/phantomjs $P/runner-phantom.js"
chrome="node $P/runner-chrome.js"
test="${!1} $P/passing.html"
repeat=${2-10}

echo "Running $test $repeat times"

for n in $(seq 1 $repeat)
do
  echo "[$n]"
  $test
done


