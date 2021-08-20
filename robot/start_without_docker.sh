export MQTT_BROKER=35.185.9.59
export MQTT_PORT=1883
export API_HOST=35.185.9.59
export API_PORT=8081
export CHUNK_WIDTH=100
export CHUNK_HEIGHT=100
export UPDATE_FREQUENCY=0.5
export SLOW_START=true
export HOSTNAME=robot

if [ "$SLOW_START" = true ] ; then
    echo 'Slow start'
    sleep $((RANDOM % 10))
fi

# Start chunk manager
python "$PWD/src/main.py" --simulator true --file "$PWD/src/chunk_manager/map/map.pgm" --output-dir "$PWD/src/chunk_manager/map" --chunk-height ${CHUNK_HEIGHT} --chunk-width ${CHUNK_WIDTH} --debug true --meta src/chunk_manager/map/meta.json
