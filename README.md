# THREE AR

## Introduction

THREE AR aims to provide a simple to use Augmented Reality API for the web, leveraging three.js's 3D capabilities. THREE AR is written in [TypeScript](https://www.typescriptlang.org/).


## Aims

  - Provide a simple Augmented Reality API for three.js
  - No expected external ambient dependencies (except three.js)
  - Available on npm as a UMD module
  - Can be used with modern build tools/bundlers like Webpack, Rollup etc
  - Provide documentation and examples

## Usage

THREE AR works with npm and also as a CDN. For npm you can install in the following manner:

```
npm install threear
```

using a CDN you can include a script tag from unpkg like so:

```html
<script src="https://unpkg.com/threear"></script>
```

## Demo and Examples

The examples folder features [a basic demo](https://jamesmilneruk.github.io/THREEAR/examples/basic.html), you can open it on a mobile device and point your camera at the following marker:

<p align="center">
  <img width="400px" alt="Hiro Marker" src="./data/hiro.jpg"/>
</p>

You can see a full list of demos of the [GitHub pages page for THREE AR](https://jamesmilneruk.github.io/THREEAR/).


## Development and Contribution

Please see the [development guide](./DEVELOPMENT.md). If you are interested in contributing, it may be a good starting point to see the list of open issues on our [GitHub issues page](https://github.com/JamesMilnerUK/THREEAR/issues). Please take a moment to read the [code of conduct](./CODE_OF_CONDUCT.md).


## Acknowledgements

 - [ar.js](https://github.com/jeromeetienne/AR.js) on which this library is based
 - [jsartoolkit](https://github.com/artoolkitx/jsartoolkit5) the Emscripten library from the C code for artoolkit, on which this library is underpinned
 

## License

All files within the `src/artoolkit` folder are licensed LGPLv3

All other files are MIT Licensed and are adapted from the [work of Jerome Etienne](https://github.com/jeromeetienne/AR.js/blob/master/LICENSE.txt) 
