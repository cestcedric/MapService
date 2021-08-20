import argparse
import json
import logging
import os
import zlib

def read_meta(file_path):
    with open(file_path) as jsonfile:
        data = json.load(jsonfile)
        return data
    
def read_chunk(file_path):
    with open(file_path, "rb") as raw_chunk:
        compressed_chunk_str = raw_chunk.read()
        chunk_str = zlib.decompress(compressed_chunk_str)
        return chunk_str


def export_file(meta, stitch_file, res):
    with open(stitch_file, "wb") as stitch:
        stitch.write("P5\n".encode("utf-8"))
        stitch.write("{}\n".format(meta["comment"]).encode("utf-8"))
        stitch.write("{} {}\n".format(meta["width"], meta["height"]).encode("utf-8"))
        stitch.write("{}\n".format(meta["max_brightness"]).encode("utf-8"))
        for r in res:
            stitch.write(bytes(r))

        logging.debug("Exported map file to {}".format(stitch_file))


def load_chunk_list_from_disk(meta, working_dir):
    chunk_list = []
    CHUNK_COUNT = meta["CHUNK_ROWS"] * meta["CHUNK_COLS"]
    logging.info("CHUNK_COUNT: {}".format(CHUNK_COUNT))
    chunklist = []
    for row in range(meta["CHUNK_ROWS"]):
        for column in range(meta["CHUNK_COLS"]):
            chunk = None
            for f in os.listdir(working_dir): 
                if "out-r"+str(row)+"_c"+str(column) == f:
                  chunk = f
                  break
            chunklist.append(chunk)
    for c in chunklist:
        chunk_path = os.path.join(working_dir, c)
        chunk = read_chunk(chunk_path)
        chunk_list.append(chunk)
    return chunk_list


def load_chunk_list_from_memory():
    raise NotImplementedError


def stitch_chunks(meta, chunk_list):
    CHUNK_ROWS = meta["CHUNK_ROWS"]
    CHUNK_COLS = meta["CHUNK_COLS"]
    CHUNK_HEIGHT = meta["CHUNK_HEIGHT"]
    CHUNK_WIDTH = meta["CHUNK_WIDTH"]

    res = []
    for row in range(CHUNK_ROWS):
        for i in range(CHUNK_HEIGHT):
            offset = i * CHUNK_WIDTH
            for col in range(CHUNK_COLS):

                pixel = chunk_list[row * CHUNK_COLS + col][offset: offset + CHUNK_WIDTH]
                res.append(pixel)

    return res


if __name__ == "__main__":
    print("Stitcher v0.1")
    parser = argparse.ArgumentParser()
    parser.add_argument('--working-dir', dest='working_dir', required=True, default="output")
    args = parser.parse_args()

    WORKING_DIR = args.working_dir
    meta_file = os.path.join(WORKING_DIR, "meta.json")
    m = read_meta(meta_file)

    chunk_list = load_chunk_list_from_disk(m, WORKING_DIR)
    res = stitch_chunks(m, chunk_list)

    stitch_file = os.path.join(WORKING_DIR, "map.pgm")
    export_file(m, stitch_file, res)
