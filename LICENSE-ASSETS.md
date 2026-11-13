# Figure assets

`assets/body-front.webp`, `assets/body-back.webp` and `figure-masks.js` are renders of
[Z-Anatomy](https://www.z-anatomy.com/) by Gauthier Kervyn, licensed
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Z-Anatomy builds on
[BodyParts3D](https://lifesciencedb.jp/bp3d/), © The Database Center for Life Science,
licensed [CC BY-SA 2.1 JP](https://creativecommons.org/licenses/by-sa/2.1/jp/).

Changes: rendered in Blender with a clay matcap (front and back, orthographic), and
reduced to a per-pixel muscle-group mask. The abdominal-wall aponeuroses are cut where
they cover the rectus abdominis, in the mask only. `tools/build-figure.sh` reproduces both.

These files are shared under CC BY-SA 4.0. The rest of the project is not covered by this notice.

## Movement photos

`assets/demos/` holds two frames of each movement, from the [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) by Nathan Clark, dedicated to the public domain under the Unlicense. The page crossfades the two frames.
