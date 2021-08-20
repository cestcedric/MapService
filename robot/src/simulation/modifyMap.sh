#!/usr/bin/env bash
export INPUT_PGM=$1
export X=$2
export Y=$3
export MAP_PGM=$4
# Lock the map file before applying any changes
flock $MAP_PGM sh -c 'pnmpaste $INPUT_PGM $X $Y $MAP_PGM > temp.pgm;
mv temp.pgm $MAP_PGM;'
# sed -i "2i # Modified by map_simulator.py" temp.pgm;