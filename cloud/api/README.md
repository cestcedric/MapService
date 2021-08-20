# API

The cloud component offers its API over MQTT and HTTP (REST API). HTTP is preferred for synchronous communication while MQTT is favored for asynchronous tasks.

**[GET]**, **[POST]** and **[DELETE]** refer to REST API requests. **[MQTT]** refers to a mqtt topic.

## Chunk Service

The chunk service stores map chunks and allows to query them. Chunks are uniquely identified by their `row`, `column` and `timestamp` attributes. They are stored either as Strings that are pgm B64 encoded and compressed. Or as B64 encoded png strings.

### Meta Data (unchanged)

The endpoint `/api/chunk-service/meta` supports multiple HTTP methods. It is used to globally determine the number of rows, columns etc. of the Map.

##### [GET] /api/chunk-service/meta

Returns the stored `meta.json`. This has typically the following form:

```json
{
   "comment":"# CREATOR: GIMP PNM Filter Version 1.1",
   "width":4800,
   "CHUNK_HEIGHT":100,
   "max_brightness":"255",
   "CHUNK_ROWS":32,
   "CHUNK_COLS":48,
   "CHUNK_WIDTH":100,
   "height":3200
}
```

##### [POST] /api/chunk-service/meta

This endpoint is used by the robots to store a `meta.json` file. To do this, a robot first checks if there is one available already. If no `meta.json` is stored, it POSTS/PUTS its own version to this endpoint.

##### [DELETE] /api/chunk-service/meta

This endpoint is mainly used for administrative purposes and deletes an existing `meta.json`.

### Chunk REST Interface

##### [POST] /api/chunk-service/chunks

Accepts a raw body formatted in `json/application`. Example:

```json
{
  "pgmB64compressedData": "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=",
  "row": 3,
  "column": 2,
  "timestamp": "2018-12-20T23:34:33",
  "robotId": "lkjlkj"
}
```

Responds a json like this:

```json
{
  "_index": "chunks",
  "_type": "chunk",
  "_id": "row:3_column:2_2018-12-20T23:34:33",
  "_version": 1,
  "result": "created",
  "forced_refresh": true,
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 0,
  "_primary_term": 15
}
```

##### [GET] /api/chunk-service/chunks

This endpoint lets you query chunks. It accepts the following [query string parameters](https://idratherbewriting.com/learnapidoc/docapis_doc_parameters.html#query_string_parameters):

- `row` (number)
- `column` (number)
- `timestamp` ([utc iso string](https://en.wikipedia.org/wiki/ISO_8601))
- `updatedSince` ([utc iso string](https://en.wikipedia.org/wiki/ISO_8601)) returns only chunks with timestamps younger than the given iso string
- `updatedBefore` ([utc iso string](https://en.wikipedia.org/wiki/ISO_8601)) returns only chunks with timestamps older than thr given iso string
- `sort` (string) defaults to `'timestamp:desc'`, also supported: `timestamp:asc`, `row:asc`, etc.
- `latest` (boolean) returns only the latest chunk for each combination of `row` and `column` **defaults to false**
- `reduced` (boolean) **defaults to false**, reduces the amount of data returned by omitting the attributes `chunk` and `type` in the results
- `type` (string) **defaults to pgm_base64_compressed** can also be set to `png` to return png base64 strings in the chunk attribute
- `limit` (number) limits the maximum number of returned chunks, **defaults to 10**
- `skip` (number) allows pagination, being combined with `limit`, **defaults to 0**
- `robotId` (string)

Every filter parameter is optional. Therefore, it is possible to query all chunks of one row, for example.

**Note:** Combining the `latest` and the `updatedBefore` flag returns the complete map at the specified point in time.

The endpoint returns an array of chunks:

```json
[
  {
    "row": 3,
    "column": 2,
    "timestamp": "2018-12-20T23:34:33",
    "chunk": "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=",
    "type": "pgm_base64_compressed",
    "id": "row:3_column:2_2018-12-20T23:34:33",
    "robotId": "lkjlkj"
  },
  {
    "row": 3,
    "column": 2,
    "timestamp": "2018-12-14T23:34:33",
    "chunk": "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=",
    "type": "pgm_base64_compressed",
    "id": "row:3_column:2_2018-12-14T23:34:33",
    "robotId": "lkjlkj"
  }
]
```

##### [DELETE] /api/chunk-service/chunks

Allows to delete the chunk database.

##### [GET] /api/chunk-service/chunks/id/{id}

Returns the chunk information for one chunk. The id will be returned as `_id` in the creation response.

Example:

```json
{
  "row": 3,
  "column": 2,
  "timestamp": "2018-12-20T23:34:33",
  "chunk": "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=",
  "type": "pgm_base64_compressed",
  "id": "row:3_column:2_2018-12-20T23:34:33",
  "robotId": "lkjlkj"
}
```

This endpoint is used by the _robots_ to access the map chunk data in the same format that is also given by the robots. The endpoint should be used by the robots to download the chunks of the entire map on startup.

Also, the _frontend_ can query the history of chunks here.

##### [GET] /api/chunk-service/chunks/id/{id}/png

Returns the respective chunk as png.

This endpoint is used by the frontend clients to access PNG formatted chunks that at a certain index.
The endpoint should be used by the frontend client to download the chunks of the entire map on startup.

However: if the frontend could process the pgm B64 compressed format on its own, this endpoint could be removed.

### Chunk MQTT Interface

##### [MQTT] iot/chunks/create

This endpoint is used by robots to create new chunks. The endpoint expects json strings in
the following form:

```json
{
  "pgmB64compressedData": "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=",
  "row": 3,
  "column": 2,
  "timestamp": "2018-12-20T23:34:33",
  "robotId": "lkjlkj"
}
```

The `chunk`field contains a DEFLATE compressed binary string that is encoded using base64.
The `msg_id` is unique for every message while the `robotId`can be used to identify a particular
robot.

##### [MQTT] iot/chunks/advertisement

This endpoint is used by the cloud component to advertise new map chunks to frontend clients or robots.

```json
{
  "row": 3,
  "column": 2,
  "robotId": "robotId",
  "chunk": "pgm_base_64_encoded_compressed_chunk",
  "png": "png_base_64",
  "timestamp": "2018-12-20T23:34:33",
  "id": "row:3_column:2_2018-12-20T23:34:33",
  "chunkUrl": "/api/chunk-service/chunks/id/row:3_column:2_2018-12-20T23:34:33",
  "pngUrl": "/api/chunk-service/chunks/id/row:3_column:2_2018-12-20T23:34:33/png"
}
```

The `chunkUrl` points to the REST API endpoint returning information about the chunk. Add a `/png` to the string and it returns a png file.

## Co-ordinate Service

Robots publish their current information via MQTT (topic `iot/coordinates`). The coordinate service listens to this topic and stores the information in elastic search. The data is queryable via the REST API.

##### [MQTT] iot/coordinates/{robotId}

The MQTT topic accepts messages of the following form:

```json
{
  "robotId": "blabla",
  "timestamp": "2018-12-20T23:34:33",
  "pose": {
    "position": {
      "x": 10,
      "y": 20,
      "z": 0
    },
    "orientation": {
      "x": 0,
      "y": 0,
      "z": 0,
      "w": 1
    }
  },
  "status": {
    "battery": {
      "battery_level": 3,
      "charging": "sdf"
    },
    "loaded": "dfs"
  }
}
```

##### [GET] /api/coordinate-service/robots

This endpoint lets you query robot information. It accepts the following [query string parameters](https://idratherbewriting.com/learnapidoc/docapis_doc_parameters.html#query_string_parameters):

- `robotId` (string)
- `timestamp` ([utc iso string](https://en.wikipedia.org/wiki/ISO_8601))
- `updatedSince` ([utc iso string](https://en.wikipedia.org/wiki/ISO_8601)) returns only chunks with timestamps younger than the given iso string
- `updatedBefore` ([utc iso string](https://en.wikipedia.org/wiki/ISO_8601)) returns only chunks with timestamps older than thr given iso string
- `sort` (string) defaults to `'timestamp:desc'`, also supported: `timestamp:asc`, `row:asc`, etc.
- `latest` (boolean) returns only the latest information for each robotId **defaults to false**
- `limit` (number) limits the maximum number of returned chunks, **defaults to 10**
- `skip` (number) allows pagination, being combined with `limit`, **defaults to 0**

Every filter parameter is optional.

**Note:** Combining the `latest` and the `updatedBefore` flag returns the position of each robot at the specified point in time.

The endpoint returns an array with robot data:

```json
[
  {
    "robotId": "blabla",
    "timestamp": "2018-12-20T23:34:33",
    "pose": {
      "position": {
        "x": 10,
        "y": 20,
        "z": 0
      },
      "orientation": {
        "x": 30,
        "y": 40,
        "z": 0,
        "w": 0
      }
    },
    "status": {
      "battery": {
        "battery_level": 3,
        "charging": "sdf"
      },
      "loaded": "dfs"
    },
    "_id": "robotId:blabla_2018-12-20T23:34:33"
  }
]
```

## Configuration

You can configure the following values by manipulating the process environment values. The following values are the defaults.

```
REST_PORT = 8080 // port of this application
MQTT = 'test.mosquitto.org'
ES_HOST = '127.0.0.1'
ES_PORT = 9200
SHARE_PREFIX = '$share/bmw/' // this is only needed for a vernmq cluster 
CREATE_CHUNK_TOPIC = 'iot/chunks/create'
PUBLISH_CHUNK_TOPIC = 'iot/chunks/publish'
NEW_CHUNK_ADVERTISEMENT_TOPIC = 'iot/chunks/advertisement'
COORDINATE_TOPIC = "iot/coordinates/#"
PUBLISH_COORDINATE_TOPIC = "iot/coordinates-frontend"
```

## Development

### npm link

The directory `./common` contains the functionality that is required by both the chunk-service an the coordinate-service. It implements a node module that can be required if it is installed. For development we make use of `npm link` because this reflects any changes made in the common folder immediatelly in the other projects. For more information on npm link see [here](https://medium.com/@alexishevia/the-magic-behind-npm-link-d94dcb3a81af).

So, for development in the chunk-service run the following commands. Same applies for the coordinate-service.

```bash
cd api/common
npm install
sudo npm link
cd ../chunk-service
npm install
npm link common-api-files
```

### Linting

If you are using Visual Studio Code, it is recommended to install the extension *ESLint* (dbaeumer.vscode-eslint). Made sure to install the node dependencies as described in the section above and open one Visual Studio Code window for each directory: chunk-service, coordinate-service, common

### Testing the chunk service

You can run tests for the chunk service as follows:

1. Run elasticsearch and the mqtt broker with the following script:
  ```bash
  cd ..
  ./run-communication.sh
  ```
2. Open a new terminal and install the dependencies, if not already done:
  ```bash
  cd api/common
  npm install
  sudo npm link
  cd ../chunk-service
  npm install
  npm link common-api-files
  ```
3. Run `npm run test`
