let fs = require("fs");
let Terser = require("terser");

// let path = "dist/cloud-reader/scripts/PeBLCore.js";
// // let minPath = "dist/cloud-reader/scripts/PeBLCore.min.js";
// let result = Terser.minify(fs.readFileSync(path, "utf8"));
// // fs.writeFileSync(minPath, result.code);
// fs.writeFileSync(path, result.code);

// path = "dist/cloud-reader/scripts/pebl-login-widget.js";
// // minPath = "dist/cloud-reader/scripts/pebl-login-widget.min.js";
// result = Terser.minify(fs.readFileSync(path, "utf8"));
// // fs.writeFileSync(minPath, result.code);
// fs.writeFileSync(path, result.code);

// path = "dist/cloud-reader/scripts/readium-js-viewer_all.js";
// // minPath = "dist/cloud-reader/scripts/readium-js-viewer_all.min.js";
// result = Terser.minify(fs.readFileSync(path, "utf8"));
// // fs.writeFileSync(minPath, result.code);
// fs.writeFileSync(path, result.code);

// path = "dist/cloud-reader/scripts/readium-js-viewer_CLOUDAPP-WORKER.js";
// // minPath = "dist/cloud-reader/scripts/readium-js-viewer_CLOUDAPP-WORKER.min.js";
// result = Terser.minify(fs.readFileSync(path, "utf8"));
// // fs.writeFileSync(minPath, result.code);
// fs.writeFileSync(path, result.code);

// path = "dist/cloud-reader/scripts/mathjax/MathJax.js";
// // minPath = "dist/cloud-reader/scripts/mathjax/MathJax.min.js";
// result = Terser.minify(fs.readFileSync(path, "utf8"));
// // fs.writeFileSync(minPath, result.code);
// fs.writeFileSync(path, result.code);

if (process.env.MINIMIZE === "true") {
    console.log("Minifing");
    let path = "dist/cloud-reader/scripts/pack.js";
    let result = Terser.minify(fs.readFileSync(path, "utf8"));
    fs.writeFileSync(path, result.code);

    path = "dist/cloud-reader/scripts/readium-js-viewer_CLOUDAPP-WORKER.js";
    result = Terser.minify(fs.readFileSync(path, "utf8"));
    fs.writeFileSync(path, result.code);

    path = "dist/cloud-reader/peblSW.js";
    result = Terser.minify(fs.readFileSync(path, "utf8"));
    fs.writeFileSync(path, result.code);
}
