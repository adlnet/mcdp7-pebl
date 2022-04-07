/*
* ModuleConfig.js: Module that contains configuration options for Readium-js-viewer.
*/

define(['module'], function(module) {
        var HTTPServerRootFolder = '';
        if (typeof window !== "undefined") {
            var path = (window.location && window.location.pathname) ? window.location.pathname : '';

             // extracts path to index.html (or more generally: /PATH/TO/*.[x]html)
             path = path.replace(/(.*)\/.*\.[x]?html$/, "$1");

             // removes trailing slash
             path = path.charAt(path.length-1) == '/'
                  ? path.substr(0, path.length-1)
                  : path;

            HTTPServerRootFolder =
                 window.location ? (
                     window.location.protocol
                     + "//"
                     + window.location.hostname
                     + (window.location.port ? (':' + window.location.port) : '')
                     + path
                 ) : ''
             ;
        }

        var config = module.config();
        return {
            'imagePathPrefix': config.imagePathPrefix || "",

            'epubLibraryPath': config.epubLibraryPath || "epub_content/epub_library.json",

            'canHandleUrl': config.canHandleUrl || false,
            'canHandleDirectory': config.canHandleDirectory || false,


            'epubReadingSystemUrl': config.epubReadingSystemUrl || "/EPUBREADINGSYSTEM.js",

            'workerUrl': config.workerUrl || "scripts/readium-js-viewer_CLOUDAPP-WORKER.js",

            'annotationCSSUrl': config.annotationCSSUrl || HTTPServerRootFolder + '/css/annotations.css',
            'mathJaxUrl': config.mathJaxUrl || "scripts/mathjax/MathJax.js",
            'jsLibRoot': config.jsLibRoot || "scripts/zip/",

            //Fonts is a list of font objects.
            'fonts': config.fonts || [],

            'useSimpleLoader': config.useSimpleLoader || false

        };
});
