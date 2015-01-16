#!/bin/bash

set -eu

rm -rf vendor
mkdir vendor

cd vendor

echo " [*] Clone Closure Library..."
git clone https://github.com/google/closure-library.git closure-library
