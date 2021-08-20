# Slicer + Stitcher

## Usage
### Slicer
The slicer program takes a PGM file such as a ROS Map as input. 
Furthermore, it needs two parameters that define the width and height
of the resulting slices ("chunks"). Keep in mind that the width and height
parameters have to divide the PGM width or height without rest,
e.g. PGM size 400 x 400 could be divided into 100 x 100 or 200 x 50 sized chunks
but 37 * 50 would not be allowed.

Example:

`python slicer.py --file someROSMap.pgm --output-dir /home/user/output --chunk-width 100 --chunk-height 80`

### Stitcher
The stitcher takes a directory with a `meta.json` file and the corresponding `out`
files as input parameter. With the information from the `meta.json` file it stitches
together the chunks into a single file named `map.pgm`.

Example:

`python stitcher.py --working-dir /home/user/output`

## Known Bugs and Limitations
- Currently relative paths are only partially supported.
- Parsing is highly adapted to the PGM format as exported by ROS. (and therefore a bit fragile)
