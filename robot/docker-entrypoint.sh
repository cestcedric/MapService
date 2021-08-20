#!/bin/sh

# Slow start to avoid unnecessary congestion
if [ "$SLOW_START" = true ] ; then
    echo 'Slow start'
    sleep $((RANDOM % 10))
fi

# Start chunk manager
python "$PWD/src/main.py" --simulator true --file "$PWD/src/chunk_manager/map/map.pgm" --output-dir "$PWD/src/chunk_manager/map" --chunk-height ${CHUNK_HEIGHT} --chunk-width ${CHUNK_WIDTH} --debug true --meta src/chunk_manager/map/meta.json
