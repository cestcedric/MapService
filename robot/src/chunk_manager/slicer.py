import argparse
import fcntl
import json
import math
import os
import time
import zlib
import logging
import base64

class PGM:
    def __init__(self, payload, width, height, comment=None, max_brightness=255):
        self.payload = payload
        self.width = width
        self.height = height
        self.comment = comment
        self.max_brightness = max_brightness
        self.CHUNK_ROWS = 0
        self.CHUNK_COLS = 0
        self.CHUNK_WIDTH = 0
        self.CHUNK_HEIGHT = 0

    def init_chunk_params(self, chunk_width, chunk_height):
        if self.width % chunk_width != 0:
            raise ValueError("The width of the PGM needs to be divisible without rest by the chunk_width")

        if self.height % chunk_height != 0:
            raise ValueError("The height of the PGM needs to be divisible without rest by the chunk_height")

        self.CHUNK_ROWS = int(math.floor(self.height / chunk_height))
        self.CHUNK_COLS = int(math.floor(self.width / chunk_width))
        self.CHUNK_WIDTH = chunk_height
        self.CHUNK_HEIGHT = chunk_width

def read_pgm_header(i,raw_bytes):
    line = ""
    while raw_bytes[i] != b"\n":
        line += raw_bytes[i].decode("utf-8")
        i += 1
    return line,i


def read_file(file_path):
    path=os.getcwd()+"/"+file_path
    with open(file_path, "rb") as raw_pgm:
        raw_bytes = []
        byte = raw_pgm.read(1)
        while byte:
            raw_bytes.append(byte)
            byte = raw_pgm.read(1)

        # Read magic number
        magic_number = None
        dimension = None
        comment = None
       	max_brightness = None
	
	#read magic_number
        i = 0
        magic_number,i = read_pgm_header(i,raw_bytes)

	#check comment read dimension
        i += 1
        if raw_bytes[i].decode("utf-8") == '#':
            comment,i = read_pgm_header(i,raw_bytes)
            i += 1
            dimension,i = read_pgm_header(i,raw_bytes)
        else:
            comment = None
            dimension,i = read_pgm_header(i,raw_bytes)
        i += 1
        width, height = dimension.split(" ")
        width, height = int(width), int(height)

	#read max_brightness
        max_brightness,i = read_pgm_header(i,raw_bytes)

        i += 1

        payload = raw_bytes[i:-1]
        return PGM(payload, width, height, comment, max_brightness)


# TODO: Refactor this into separate function
def write_file(file_path, payload):
    #print(file_path)
    with open(file_path, "wb") as file:
        while True:
            try:
                fcntl.flock(file, fcntl.LOCK_EX | fcntl.LOCK_NB)
                file.write(payload)
                fcntl.flock(file, fcntl.LOCK_UN)
                break
            except IOError as e:
                # Raise other errors
                if e.errno != 11:
                    raise e
                else:
                    time.sleep(0.10)


def compress(b):
    return zlib.compress(b, 7)


def slice(pgm, output_dir):
    """
    This method traverses the 1D list of pixel brightness values from the PGM. It creates a list that holds the pixel
    information that go into each chunk. It traverses the input array and processes the chunks in rows.
    """

    write_meta_from_pgm(output_dir, pgm)

    CHUNK_ROWS = pgm.CHUNK_ROWS
    CHUNK_COLS = pgm.CHUNK_COLS
    CHUNK_WIDTH = pgm.CHUNK_WIDTH
    CHUNK_HEIGHT = pgm.CHUNK_HEIGHT

    uncompressed_files = [[] for i in range(CHUNK_ROWS * CHUNK_COLS)]
    
    for row in range(CHUNK_ROWS):
        row_offset = row * CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_COLS
        for line in range(CHUNK_HEIGHT):
            line_offset = CHUNK_WIDTH * CHUNK_COLS * line
            for col in range(CHUNK_COLS):
                begin = row_offset + line_offset + CHUNK_WIDTH * col
                end = begin + CHUNK_WIDTH
                pixel = pgm.payload[begin: end]

                chunk_id = row * CHUNK_COLS + col
                uncompressed_files[chunk_id] += pixel

    uncompressed_file_dict = []
    for row in range(CHUNK_ROWS):
        for col in range(CHUNK_COLS):
            uncompressed_file_dict.append({"chunk":uncompressed_files[CHUNK_COLS*row+col],"row":row,"column":col})

    return uncompressed_file_dict


def compress_chunk(c):
    raw_bytes = b""
    if type(c) == type(raw_bytes):
        raw_bytes += c
    else:
        for byte_list in c:
            # TODO: Refactor this into two methods ( the if case is called from the publish method from main.py)
            if type(byte_list) is list:
                for b in byte_list:
                    raw_bytes += b
            else:
                raw_bytes += byte_list

    raw_bytes += bytes([255])  # FIXME: somehow the last byte is always missing?
    return compress(raw_bytes)


def export_files(output_dir, uncompressed_files):
    for chunk in uncompressed_files:
        compressed_bytes = compress_chunk(chunk["chunk"])
        out_file = os.path.join(output_dir, "out-r{}_c{}".format(chunk["row"],chunk["column"]))
        write_file(out_file, compressed_bytes)

def export_files1(output_dir, uncompressed_files):
    for chunk_id, e in enumerate(uncompressed_files):
        compressed_bytes = compress_chunk(e)
        out_file = os.path.join(output_dir, "out-{}".format(chunk_id))
        write_file(out_file, compressed_bytes)


def write_meta_from_pgm(output_dir, pgm):
    # FIXME: Directly export as json with json.dumps() (ofc without the payload!)
    meta_data = {
        "width": pgm.width,
        "height": pgm.height,
        "comment": pgm.comment,
        "max_brightness": pgm.max_brightness,
        "CHUNK_WIDTH": pgm.CHUNK_WIDTH,
        "CHUNK_HEIGHT": pgm.CHUNK_HEIGHT,
        "CHUNK_ROWS": pgm.CHUNK_ROWS,
        "CHUNK_COLS": pgm.CHUNK_COLS
    }

    write_meta(output_dir, meta_data)


def write_meta(output_dir, meta_data):
    meta_str = json.dumps(meta_data).encode("utf-8")
    meta_file = os.path.join(output_dir, "meta.json")
    write_file(meta_file, meta_str)
    


if __name__ == "__main__":
    print("Slicer v0.1")
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", dest="map_file", required=True)
    parser.add_argument("--output-dir", dest="output_dir", required=True)
    parser.add_argument("--chunk-width", type=int, dest="chunk_width", required=True)
    parser.add_argument("--chunk-height", type=int, dest="chunk_height", required=True)

    args = parser.parse_args()
    OUTPUT_DIR = args.output_dir
    CHUNK_HEIGHT = args.chunk_height
    CHUNK_WIDTH = args.chunk_width

    pgm = read_file(args.map_file)
    pgm.init_chunk_params(CHUNK_WIDTH, CHUNK_HEIGHT)

    uncompressed_files = slice(pgm, OUTPUT_DIR)
    export_files(OUTPUT_DIR, uncompressed_files)
