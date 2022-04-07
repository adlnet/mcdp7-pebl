/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');

function _has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// String encode/decode helpers



var utils = __webpack_require__(0);


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new utils.Buf8(256);
for (var q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
exports.string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new utils.Buf8(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // On Chrome, the arguments in a function call that are allowed is `65534`.
  // If the length of the buffer is smaller than that, we can use this optimization,
  // otherwise we will take a slower path.
  if (len < 65534) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for (var i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
exports.buf2binstring = function (buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
exports.binstring2buf = function (str) {
  var buf = new utils.Buf8(str.length);
  for (var i = 0, len = buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
exports.buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
exports.utf8border = function (buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Top level file is just a mixin of submodules & constants


var assign    = __webpack_require__(0).assign;

var deflate   = __webpack_require__(8);
var inflate   = __webpack_require__(11);
var constants = __webpack_require__(6);

var pako = {};

assign(pako, deflate, inflate, constants);

module.exports = pako;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var zlib_deflate = __webpack_require__(9);
var utils        = __webpack_require__(0);
var strings      = __webpack_require__(4);
var msg          = __webpack_require__(1);
var ZStream      = __webpack_require__(5);

var toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

var Z_NO_FLUSH      = 0;
var Z_FINISH        = 4;

var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_SYNC_FLUSH    = 2;

var Z_DEFAULT_COMPRESSION = -1;

var Z_DEFAULT_STRATEGY    = 0;

var Z_DEFLATED  = 8;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array|Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param)  or if you
 * push a chunk with explicit flush (call [[Deflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate(options) {
  if (!(this instanceof Deflate)) return new Deflate(options);

  this.options = utils.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY,
    to: ''
  }, options || {});

  var opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new ZStream();
  this.strm.avail_out = 0;

  var status = zlib_deflate.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK) {
    throw new Error(msg[status]);
  }

  if (opt.header) {
    zlib_deflate.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    var dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = zlib_deflate.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK) {
      throw new Error(msg[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Deflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the compression context.
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * array format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;

  if (this.ended) { return false; }

  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = zlib_deflate.deflate(strm, _mode);    /* no bad return value */

    if (status !== Z_STREAM_END && status !== Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }
    if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {
      if (this.options.to === 'string') {
        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
      } else {
        this.onData(utils.shrinkBuf(strm.output, strm.next_out));
      }
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

  // Finalize on the last chunk.
  if (_mode === Z_FINISH) {
    status = zlib_deflate.deflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === Z_SYNC_FLUSH) {
    this.onEnd(Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate(input, options) {
  var deflator = new Deflate(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg || msg[deflator.err]; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate(input, options);
}


exports.Deflate = Deflate;
exports.deflate = deflate;
exports.deflateRaw = deflateRaw;
exports.gzip = gzip;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils   = __webpack_require__(0);
var trees   = __webpack_require__(10);
var adler32 = __webpack_require__(2);
var crc32   = __webpack_require__(3);
var msg     = __webpack_require__(1);

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS      = 256;
/* number of literal bytes 0..255 */
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES       = 30;
/* number of distance codes */
var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
var MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only(s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);
  this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
        );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
function deflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var s;
  var str, n;
  var wrap;
  var avail;
  var next;
  var input;
  var tmpDict;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  s = strm.state;
  wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    tmpDict = new utils.Buf8(s.w_size);
    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  avail = strm.avail_in;
  next = strm.next_in;
  input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    str = s.strstart;
    n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK;
}


exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

/* eslint-disable space-unary-ops */

var utils = __webpack_require__(0);

/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES + 2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


var static_l_desc;
var static_d_desc;
var static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short(s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n * 2;
  var _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize - 1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var zlib_inflate = __webpack_require__(12);
var utils        = __webpack_require__(0);
var strings      = __webpack_require__(4);
var c            = __webpack_require__(6);
var msg          = __webpack_require__(1);
var ZStream      = __webpack_require__(5);
var GZheader     = __webpack_require__(15);

var toString = Object.prototype.toString;

/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
 * push a chunk with explicit flush (call [[Inflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate(options) {
  if (!(this instanceof Inflate)) return new Inflate(options);

  this.options = utils.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new ZStream();
  this.strm.avail_out = 0;

  var status  = zlib_inflate.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== c.Z_OK) {
    throw new Error(msg[status]);
  }

  this.header = new GZheader();

  zlib_inflate.inflateGetHeader(this.strm, this.header);

  // Setup dictionary
  if (opt.dictionary) {
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) { //In raw mode we need to set the dictionary early
      status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== c.Z_OK) {
        throw new Error(msg[status]);
      }
    }
  }
}

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the decompression context.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var dictionary = this.options.dictionary;
  var status, _mode;
  var next_out_utf8, tail, utf8str;

  // Flag to properly process Z_BUF_ERROR on testing inflate call
  // when we check that all output data was flushed.
  var allowBufError = false;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */

    if (status === c.Z_NEED_DICT && dictionary) {
      status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
    }

    if (status === c.Z_BUF_ERROR && allowBufError === true) {
      status = c.Z_OK;
      allowBufError = false;
    }

    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }

    // When no more input data, we should check that internal inflate buffers
    // are flushed. The only way to do it when avail_out = 0 - run one more
    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
    // Here we set flag to process this error properly.
    //
    // NOTE. Deflate does not return error in this case and does not needs such
    // logic.
    if (strm.avail_in === 0 && strm.avail_out === 0) {
      allowBufError = true;
    }

  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);

  if (status === c.Z_STREAM_END) {
    _mode = c.Z_FINISH;
  }

  // Finalize on the last chunk.
  if (_mode === c.Z_FINISH) {
    status = zlib_inflate.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === c.Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === c.Z_SYNC_FLUSH) {
    this.onEnd(c.Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === c.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 aligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg || msg[inflator.err]; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip  = inflate;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils         = __webpack_require__(0);
var adler32       = __webpack_require__(2);
var crc32         = __webpack_require__(3);
var inflate_fast  = __webpack_require__(13);
var inflate_table = __webpack_require__(14);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function zswap32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0;           /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }
        state.dmax = 1 << len;
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Array(state.head.extra_len);
              }
              utils.arraySet(
                state.head.extra,
                input,
                next,
                // extra field is limited to 65536 bytes
                // - no need for additional size check
                copy,
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          utils.arraySet(output, input, next, copy, put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inflate_fast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK;
}

exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window;               /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = __webpack_require__(0);

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

module.exports = GZheader;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <https://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': 'Edge' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      { 'label': 'Samsung Internet', 'pattern': 'SamsungBrowser' },
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Waterfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      { 'label': 'Galaxy S5', 'pattern': 'SM-G900' },
      { 'label': 'Galaxy S6', 'pattern': 'SM-G920' },
      { 'label': 'Galaxy S6 Edge', 'pattern': 'SM-G925' },
      { 'label': 'Galaxy S7', 'pattern': 'SM-G930' },
      { 'label': 'Galaxy S7 Edge', 'pattern': 'SM-G935' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch(e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }
          if (!name) {
            name = 'Rhino';
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }
          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (true) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return platform;
    }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else {}
}.call(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(17)(module), __webpack_require__(18)))

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 18 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "install", function() { return /* binding */ install; });

// CONCATENATED MODULE: ./src/xapi.ts
const NAMESPACE_USER_MESSAGES = "user-";
const PREFIX_PEBL_THREAD = "peblThread://";
const PREFIX_PEBL = "pebl://";
const PREFIX_PEBL_EXTENSION = "https://www.peblproject.com/definitions.html#";
// -------------------------------
class XApiStatement {
    constructor(raw) {
        this.id = raw.id;
        this.actor = raw.actor;
        this.verb = raw.verb;
        this.context = raw.context;
        this.stored = raw.stored;
        this.timestamp = raw.timestamp;
        this.result = raw.result;
        this["object"] = raw.object;
        this.attachments = raw.attachments;
        if (this["object"].definition) {
            let extensions = this["object"].definition.extensions;
            this.browserName = extensions[PREFIX_PEBL_EXTENSION + "browserName"];
            this.browserVersion = extensions[PREFIX_PEBL_EXTENSION + "browserVersion"];
            this.osName = extensions[PREFIX_PEBL_EXTENSION + "osName"];
            this.osVersion = extensions[PREFIX_PEBL_EXTENSION + "osVersion"];
            this.contextOrigin = extensions[PREFIX_PEBL_EXTENSION + "contextOrigin"];
            this.contextUrl = extensions[PREFIX_PEBL_EXTENSION + "contextUrl"];
            this.currentTeam = extensions[PREFIX_PEBL_EXTENSION + "currentTeam"];
            this.currentClass = extensions[PREFIX_PEBL_EXTENSION + "currentClass"];
        }
    }
    toXAPI() {
        return new XApiStatement(this);
    }
    getActorId() {
        return this.actor.mbox || this.actor.openid ||
            (this.actor.account && this.actor.account.name);
    }
    static is(x) {
        if (x.verb)
            return true;
        else
            return false;
    }
}
// -------------------------------
class Reference extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.thread = this["object"].id;
        if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);
        this.name = this.object.definition.name["en-US"];
        let extensions = this["object"].definition.extensions;
        this.book = extensions[PREFIX_PEBL_EXTENSION + "book"];
        this.docType = extensions[PREFIX_PEBL_EXTENSION + "docType"];
        this.location = extensions[PREFIX_PEBL_EXTENSION + "location"];
        this.card = extensions[PREFIX_PEBL_EXTENSION + "card"];
        this.url = extensions[PREFIX_PEBL_EXTENSION + "url"];
        this.target = extensions[PREFIX_PEBL_EXTENSION + "target"];
        this.externalURL = extensions[PREFIX_PEBL_EXTENSION + "externalURL"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "pushed") || (verb == "pulled");
    }
}
// -------------------------------
class Annotation extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.title = this.object.definition.name && this.object.definition.name["en-US"];
        this.text = this.object.definition.description && this.object.definition.description["en-US"];
        this.book = this.object.id;
        if (this.book.indexOf(PREFIX_PEBL) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
        else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);
        this.owner = this.getActorId();
        let extensions = this.object.definition.extensions;
        this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
        this.cfi = extensions[PREFIX_PEBL_EXTENSION + "cfi"];
        this.idRef = extensions[PREFIX_PEBL_EXTENSION + "idRef"];
        this.style = extensions[PREFIX_PEBL_EXTENSION + "style"];
        if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
            this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
        this.pinned = raw.pinned;
        this.pinMessage = raw.pinMessage;
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "commented") || (verb == "bookmarked") || (verb == "annotated");
    }
}
// -------------------------------
class SharedAnnotation extends Annotation {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        if (extensions) {
            this.groupId = extensions[PREFIX_PEBL_EXTENSION + 'groupId'];
        }
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "shared");
    }
}
// -------------------------------
class Action extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.activityId = this.object.id;
        this.action = this.verb.display["en-US"];
        this.book = this.object.id;
        if (this.book.indexOf(PREFIX_PEBL) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
        else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);
        if (this.object.definition) {
            this.name = this.object.definition.name && this.object.definition.name["en-US"];
            this.description = this.object.definition.description && this.object.definition.description["en-US"];
            let extensions = this.object.definition.extensions;
            if (extensions) {
                this.target = extensions[PREFIX_PEBL_EXTENSION + "target"];
                this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
                this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
                this.cfi = extensions[PREFIX_PEBL_EXTENSION + "cfi"];
                if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
                    this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
            }
        }
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "preferred") || (verb == "morphed") || (verb == "interacted") || (verb == "experienced") || (verb == "disliked") ||
            (verb == "liked") || (verb == "accessed") || (verb == "hid") || (verb == "showed") || (verb == "displayed") || (verb == "undisplayed") ||
            (verb == "searched") || (verb == "selected") || (verb == "unbookmarked") || (verb == "discarded") || (verb == "unshared") || (verb == "unannotated") ||
            (verb == "submitted");
    }
}
// -------------------------------
class Navigation extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.type = this.verb.display["en-US"];
        this.activityId = this.object.id;
        this.book = this.object.id;
        if (this.book.indexOf(PREFIX_PEBL) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
        else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);
        let extensions = this.object.definition.extensions;
        if (extensions) {
            this.firstCfi = extensions[PREFIX_PEBL_EXTENSION + "firstCfi"];
            this.lastCfi = extensions[PREFIX_PEBL_EXTENSION + "lastCfi"];
            if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
                this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
        }
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "paged-next") || (verb == "paged-prev") || (verb == "paged-jump") || (verb == "interacted") ||
            (verb == "completed");
    }
}
// -------------------------------
class Message extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.thread = this.object.id;
        if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);
        this.prompt = this.object.definition.name["en-US"];
        this.name = this.actor.name;
        this.direct = this.thread == (NAMESPACE_USER_MESSAGES + this.getActorId());
        this.text = this.result ? this.result.response : this.object.definition.description['en-US'];
        let extensions = this.object.definition.extensions;
        if (extensions) {
            this.access = extensions[PREFIX_PEBL_EXTENSION + "access"];
            this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
            this.replyThread = extensions[PREFIX_PEBL_EXTENSION + "replyThread"];
            this.groupId = extensions[PREFIX_PEBL_EXTENSION + "groupId"];
            this.isPrivate = extensions[PREFIX_PEBL_EXTENSION + "isPrivate"];
            this.book = extensions[PREFIX_PEBL_EXTENSION + "book"];
            this.cfi = extensions[PREFIX_PEBL_EXTENSION + "cfi"];
            this.idRef = extensions[PREFIX_PEBL_EXTENSION + "idRef"];
            this.peblAction = extensions[PREFIX_PEBL_EXTENSION + "peblAction"];
            if (extensions[PREFIX_PEBL_EXTENSION + "thread"])
                this.thread = extensions[PREFIX_PEBL_EXTENSION + "thread"];
        }
        this.pinned = raw.pinned;
        this.pinMessage = raw.pinMessage;
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "responded") || (verb == "noted");
    }
}
// -------------------------------
class Voided extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.thread = (this.context && this.context.contextActivities && this.context.contextActivities.parent) ? this.context.contextActivities.parent[0].id : "";
        if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);
        this.target = this.object.id;
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "voided");
    }
}
// -------------------------------
class Question extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.book = this.object.id;
        if (this.book.indexOf(PREFIX_PEBL) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
        else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);
        this.score = this.result.score.raw;
        this.min = this.result.score.min;
        this.max = this.result.score.max;
        this.completion = this.result.completion;
        this.success = this.result.success;
        this.response = this.result.response;
        this.prompt = this.object.definition.description["en-US"];
        this.activityId = this.object.id;
        let choices = this.object.definition.choices;
        this.answers = [];
        for (let key of Object.keys(choices))
            this.answers.push(choices[key].description["en-US"]);
        let extensions = this.object.definition.extensions;
        if (extensions) {
            if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
                this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
        }
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "attempted");
    }
}
// -------------------------------
class Quiz extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.book = this.object.id;
        if (this.book.indexOf(PREFIX_PEBL) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
        else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);
        this.score = this.result.score.raw;
        this.min = this.result.score.min;
        this.max = this.result.score.max;
        this.completion = this.result.completion;
        this.success = this.result.success;
        this.activityId = this.object.id;
        let extensions = this.object.definition.extensions;
        if (extensions) {
            if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
                this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
        }
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "failed") || (verb == "passed");
    }
}
// -------------------------------
class Session extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.activityId = this.object.id;
        if (this.object.definition) {
            this.activityName = this.object.definition.name && this.object.definition.name["en-US"];
            this.activityDescription = this.object.definition.description && this.object.definition.description["en-US"];
        }
        this.book = this.object.id;
        if (this.book.indexOf(PREFIX_PEBL) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
        else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);
        this.type = this.verb.display["en-US"];
        let extensions = this.object.definition.extensions;
        if (extensions) {
            if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
                this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
        }
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "entered") || (verb == "exited") || (verb == "logged-in") ||
            (verb == "logged-out") || (verb == "terminated") || (verb == "initialized") || (verb == "launched");
    }
}
// -------------------------------
class Membership extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.thread = this.object.id;
        if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);
        this.membershipId = this.object.definition.name["en-US"];
        this.description = this.object.definition.description && this.object.definition.description["en-US"];
        let extensions = this.object.definition.extensions;
        this.role = extensions[PREFIX_PEBL_EXTENSION + "role"];
        this.activityType = extensions[PREFIX_PEBL_EXTENSION + "activityType"];
        this.organization = extensions[PREFIX_PEBL_EXTENSION + "organization"];
        this.organizationName = extensions[PREFIX_PEBL_EXTENSION + "organizationName"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "joined");
    }
}
// -------------------------------
class Artifact extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.thread = this.object.id;
        if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
            this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);
        this.artifactId = this.object.definition.name["en-US"];
        this.artifactDescription = this.object.definition.description && this.object.definition.description["en-US"];
        let extensions = this.object.definition.extensions;
        this.body = extensions[PREFIX_PEBL_EXTENSION + "body"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "artifactCreated");
    }
}
// -------------------------------
class Invitation extends XApiStatement {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.token = this.object.definition.name["en-US"];
        this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "invited");
    }
}
// -------------------------------
class ProgramAction extends XApiStatement {
    constructor(raw) {
        super(raw);
        this.thread = this.object.id;
        let extensions = this.object.definition.extensions;
        this.programId = this.object.definition.name["en-US"];
        this.previousValue = extensions[PREFIX_PEBL_EXTENSION + "previousValue"];
        this.newValue = extensions[PREFIX_PEBL_EXTENSION + "newValue"];
        this.action = extensions[PREFIX_PEBL_EXTENSION + "action"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "programLevelUp") || (verb == "programLevelDown") || (verb == "programInvited") || (verb == "programUninvited")
            || (verb == "programExpelled") || (verb == "programJoined") || (verb == "programActivityLaunched")
            || (verb == "programActivityCompleted") || (verb == "programActivityTeamCompleted") || (verb == "programModified")
            || (verb == "programDeleted") || (verb == "programCompleted") || (verb == "programCopied") || (verb == "programDiscussed");
    }
}
// -------------------------------
class CompatibilityTest extends XApiStatement {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.readerName = extensions[PREFIX_PEBL_EXTENSION + "readerName"];
        this.osName = extensions[PREFIX_PEBL_EXTENSION + "osName"];
        this.osVersion = extensions[PREFIX_PEBL_EXTENSION + "osVersion"];
        this.browserName = extensions[PREFIX_PEBL_EXTENSION + "browserName"];
        this.browserVersion = extensions[PREFIX_PEBL_EXTENSION + "browserVersion"];
        this.userAgent = extensions[PREFIX_PEBL_EXTENSION + "userAgent"];
        this.appVersion = extensions[PREFIX_PEBL_EXTENSION + "appVersion"];
        this.platform = extensions[PREFIX_PEBL_EXTENSION + "platform"];
        this.vendor = extensions[PREFIX_PEBL_EXTENSION + "vendor"];
        this.testResults = JSON.parse(extensions[PREFIX_PEBL_EXTENSION + "testResults"]);
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "compatibilityTested");
    }
}
// -------------------------------
class ModuleEvent extends XApiStatement {
    constructor(raw) {
        super(raw);
    }
}
class ModuleRating extends ModuleEvent {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.rating = this.object.definition.name["en-US"];
        this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
        this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "moduleRating");
    }
}
class ModuleFeedback extends ModuleEvent {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.feedback = this.object.definition.name["en-US"];
        this.willingToDiscuss = extensions[PREFIX_PEBL_EXTENSION + "willingToDiscuss"];
        this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
        this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "moduleFeedback");
    }
}
class ModuleExample extends ModuleEvent {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.example = this.object.definition.name["en-US"];
        this.description = this.object.definition.description["en-US"];
        this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
        this.youtubeUrl = extensions[PREFIX_PEBL_EXTENSION + "youtubeUrl"];
        this.imageUrl = extensions[PREFIX_PEBL_EXTENSION + "imageUrl"];
        this.websiteUrl = extensions[PREFIX_PEBL_EXTENSION + "websiteUrl"];
        this.quotedPerson = extensions[PREFIX_PEBL_EXTENSION + "quotedPerson"];
        this.quotedTeam = extensions[PREFIX_PEBL_EXTENSION + "quotedTeam"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "moduleExample");
    }
}
class ModuleExampleRating extends ModuleEvent {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.rating = this.object.definition.name["en-US"];
        this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
        this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
        this.exampleId = extensions[PREFIX_PEBL_EXTENSION + "exampleId"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "moduleExampleRating");
    }
}
class ModuleExampleFeedback extends ModuleEvent {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.feedback = this.object.definition.name["en-US"];
        this.willingToDiscuss = extensions[PREFIX_PEBL_EXTENSION + "willingToDiscuss"];
        this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
        this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
        this.exampleId = extensions[PREFIX_PEBL_EXTENSION + "exampleId"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "moduleExampleFeedback");
    }
}
class ModuleRemovedEvent extends ModuleEvent {
    constructor(raw) {
        super(raw);
        let extensions = this.object.definition.extensions;
        this.idref = this.object.definition.name["en-US"];
        this.eventId = this.object.definition.description["en-US"];
        this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
    }
    static is(x) {
        let verb = x.verb.display["en-US"];
        return (verb == "moduleRemovedEvent");
    }
}
class Notification extends XApiStatement {
}

// CONCATENATED MODULE: ./src/models.ts
// -------------------------------
class UserProfile {
    constructor(raw) {
        this.identity = raw.identity;
        this.name = raw.name;
        this.homePage = raw.homePage;
        this.preferredName = raw.preferredName;
        if (raw.registryEndpoint)
            this.registryEndpoint = new Endpoint(raw.registryEndpoint);
        this.currentTeam = raw.currentTeam;
        this.currentTeamName = raw.currentTeamName;
        this.currentClass = raw.currentClass;
        this.currentClassName = raw.currentClassName;
        this.memberships = raw.memberships;
        this.role = raw.role;
        this.groups = raw.groups;
        this.endpoints = [];
        this.metadata = raw.metadata;
        if (raw.endpoints)
            for (let endpointObj of raw.endpoints)
                this.endpoints.push(new Endpoint(endpointObj));
        if (this.homePage == null)
            this.homePage = "acct:keycloak-server";
        if (raw.firstName)
            this.firstName = raw.firstName;
        if (raw.lastName)
            this.lastName = raw.lastName;
        if (raw.avatar)
            this.avatar = raw.avatar;
        if (raw.email)
            this.email = raw.email;
        if (raw.phoneNumber)
            this.phoneNumber = raw.phoneNumber;
        if (raw.streetAddress)
            this.streetAddress = raw.streetAddress;
        if (raw.city)
            this.city = raw.city;
        if (raw.state)
            this.state = raw.state;
        if (raw.zipCode)
            this.zipCode = raw.zipCode;
        if (raw.country)
            this.country = raw.country;
    }
    toObject() {
        let urls = {};
        for (let e of this.endpoints)
            urls[e.url] = e.toObject();
        let obj = {
            "identity": this.identity,
            "name": this.name,
            "homePage": this.homePage,
            "preferredName": this.preferredName,
            "lrsUrls": urls,
            "metadata": {},
            "registryEndpoint": this.registryEndpoint,
            "currentTeam": this.currentTeam,
            "currentTeamName": this.currentTeamName,
            "currentClass": this.currentClass,
            "currentClassName": this.currentClassName,
            "memberships": this.memberships,
            "firstName": this.firstName,
            "lastName": this.lastName,
            "avatar": this.avatar,
            "email": this.email,
            "phoneNumber": this.phoneNumber,
            "streetAddress": this.streetAddress,
            "city": this.city,
            "state": this.state,
            "zipCode": this.zipCode,
            "country": this.country
        };
        if (this.metadata)
            obj.metadata = this.metadata;
        return obj;
    }
}
// -------------------------------
class Endpoint {
    constructor(raw) {
        this.url = raw.url;
        this.username = raw.username;
        this.password = raw.password;
        this.token = raw.token;
        if (!this.token) {
            this.token = btoa(this.username + ":" + this.password);
        }
        this.lastSyncedBooksMine = {};
        this.lastSyncedBooksShared = {};
        this.lastSyncedThreads = {};
        this.lastSyncedActivityEvents = {};
        this.lastSyncedModules = {};
    }
    toObject(urlPrefix = "") {
        return {
            url: urlPrefix + this.url,
            username: this.username,
            password: this.password,
            token: this.token,
            lastSyncedThreads: this.lastSyncedThreads,
            lastSyncedBooksMine: this.lastSyncedBooksMine,
            lastSyncedBooksShared: this.lastSyncedBooksMine,
            lastSyncedActivityEvents: this.lastSyncedActivityEvents,
            lastSyncedModules: this.lastSyncedModules
        };
    }
}
// -------------------------------
class TempMembership {
    constructor(raw) {
        this.id = raw.id;
        this.identity = raw.identity;
        this.actor = raw.actor;
        this.inviteId = raw.inviteId;
        this.inviteLink = raw.inviteLink;
        this.status = raw.status;
        this.role = raw.role;
        this.inviteRole = raw.inviteRole;
    }
    static is(x) {
        if (x.id && x.identity && x.actor && x.actor.name && x.inviteLink && x.status && x.role && x.inviteRole)
            return true;
        else
            return false;
    }
}

// CONCATENATED MODULE: ./src/activity.ts
// import { PEBL } from "./pebl";



class Activity {
    constructor(raw) {
        this.isNew = false;
        this.dirtyEdits = {};
        if (!raw.id) {
            /*!
              Excerpt from: Math.uuid.js (v1.4)
              http://www.broofa.com
              mailto:robert@broofa.com
              Copyright (c) 2010 Robert Kieffer
              Dual licensed under the MIT and GPL licenses.
            */
            this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            this.isNew = true;
        }
        else {
            this.id = raw.id;
            this.isNew = false;
        }
        this.timestamp = (typeof (raw.timestamp) === "string") ? new Date(Date.parse(raw.timestamp)) : new Date();
        this.etag = raw.etag;
        this.type = raw.type;
        this.delete = raw.delete;
    }
    static is(raw) {
        return (raw.id && raw.type) != null;
    }
    clearDirtyEdits() {
        this.dirtyEdits = {};
    }
    toTransportFormat() {
        return {
            type: this.type,
            timestamp: this.timestamp ? this.timestamp.toISOString() : (new Date()).toISOString(),
            id: this.id
        };
    }
    ;
    static merge(oldActivity, newActivity) {
        let mergedActivity = {};
        let oldKeys = Object.keys(oldActivity);
        let newKeys = Object.keys(newActivity);
        for (let key of oldKeys) {
            mergedActivity[key] = oldActivity[key];
        }
        for (let key of newKeys) {
            // Null properties were set for a reason and should not be changed.
            if (mergedActivity[key] == null) {
                // Leave it
            }
            else {
                mergedActivity[key] = newActivity[key];
            }
        }
        // If either is flagged for deletion, that should not be changed.
        if ((oldActivity.delete && oldActivity.delete == true) || (newActivity.delete && newActivity.delete == true)) {
            mergedActivity.delete = true;
        }
        // If either is flagged as completed, that should not be changed.
        if ((oldActivity.completed && oldActivity.completed == true) || (newActivity.completed && newActivity.completed == true)) {
            mergedActivity.completed = true;
        }
        return mergedActivity;
    }
}
class Learnlet extends Activity {
    constructor(raw) {
        raw.type = "learnlet";
        super(raw);
        this._cfi = raw.cfi;
        this._level = raw.level;
        this.programTitle = raw.name;
        this._description = raw.description;
    }
    get name() { return this.programTitle; }
    get description() { return this._description; }
    get level() { return this._level; }
    get cfi() { return this._cfi; }
    set name(arg) {
        this.dirtyEdits["name"] = true;
        this.programTitle = arg;
    }
    set description(arg) {
        this.dirtyEdits["description"] = true;
        this._description = arg;
    }
    set level(arg) {
        this.dirtyEdits["level"] = true;
        this._level = arg;
    }
    set cfi(arg) {
        this.dirtyEdits["cfi"] = true;
        this._cfi = arg;
    }
    static is(raw) {
        return raw.type == "learnlet";
    }
    toTransportFormat() {
        let sObj = super.toTransportFormat();
        let obj = {};
        if (this.dirtyEdits["name"] || this.isNew)
            sObj.name = this.programTitle;
        if (this.dirtyEdits["description"] || this.isNew)
            sObj.description = this._description;
        if (this.dirtyEdits["description"] || this.isNew)
            sObj.description = this._description;
        if (this.dirtyEdits["cfi"] || this.isNew)
            sObj.cfi = this._cfi;
        if (this.dirtyEdits["level"] || this.isNew)
            sObj.level = this._level;
        obj[this.id] = sObj;
        return obj;
    }
}
// -------------------------------
class activity_Program extends Activity {
    constructor(raw) {
        raw.type = "program";
        super(raw);
        let self = this;
        // Translate legacy member format to new format
        let members = [];
        if (raw.members)
            members = typeof (raw.members) === "string" ? JSON.parse(decodeURIComponent(raw.members)) : (raw.members ? raw.members : []);
        if (members.length > 0) {
            for (let member of members) {
                self.addMember(member);
            }
        }
        let rawKeys = Object.keys(raw);
        for (let key of rawKeys) {
            if (key.indexOf('member-') !== -1) {
                let member = typeof (raw[key]) === "string" ? JSON.parse(decodeURIComponent(raw[key])) : (raw[key] ? raw[key] : null);
                if (member == null || (XApiStatement.is(member) && Membership.is(member)) || TempMembership.is(member)) {
                    self[key] = member;
                }
            }
        }
        this.programLevelStepsComplete = raw.programLevelStepsComplete || 0;
        this.programLevels = raw.programLevels || [];
        this.programTitle = raw.programTitle || "";
        this.programShortDescription = raw.programShortDescription || "";
        this.programLongDescription = raw.programLongDescription || "";
        this.programLevel = raw.programLevel || 0;
        this.programIssues = raw.programIssues ? raw.programIssues : [];
        this.programCommunities = raw.programCommunities ? raw.programCommunities : [];
        this.programInstitutions = raw.programInstitutions ? raw.programInstitutions : [];
        this.programAvatar = raw.programAvatar;
        this.programTeamName = raw.programTeamName;
        this.programFocus = raw.programFocus;
        this.completed = raw.completed ? new Date(raw.completed) : undefined;
        this.created = raw.created ? new Date(raw.created) : undefined;
        // Estimate created time to backfill older programs, find oldest member and use their timestamp
        if (!this.created) {
            if (this.isNew) {
                this.created = new Date();
            }
            else {
                let oldestMember = null;
                let keys = Object.keys(this);
                for (let key of keys) {
                    if (key.indexOf('member-') !== -1) {
                        let member = typeof (this[key]) === "string" ? JSON.parse(decodeURIComponent(this[key])) : (this[key] ? this[key] : null);
                        if (member && XApiStatement.is(member) && Membership.is(member)) {
                            if (!oldestMember || (new Date(member.timestamp) < new Date(oldestMember.timestamp)))
                                oldestMember = member;
                        }
                    }
                }
                if (oldestMember)
                    this.created = new Date(oldestMember.timestamp);
            }
        }
        this.members = typeof (raw.members) === "string" ? JSON.parse(decodeURIComponent(raw.members)) : (raw.members ? raw.members : []);
    }
    static is(raw) {
        return raw.type == "program";
    }
    toTransportFormat() {
        let obj = super.toTransportFormat();
        let self = this;
        let keys = Object.keys(this);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1) {
                if (self[key] == null) {
                    obj[key] = self[key];
                }
                else if ((XApiStatement.is(self[key]) && Membership.is(self[key])) || TempMembership.is(self[key])) {
                    obj[key] = encodeURIComponent(JSON.stringify(self[key]));
                }
            }
        }
        obj.programLevelStepsComplete = this.programLevelStepsComplete;
        obj.programLevels = this.programLevels;
        obj.programTitle = this.programTitle;
        obj.programShortDescription = this.programShortDescription;
        obj.programLongDescription = this.programLongDescription;
        obj.programLevel = this.programLevel;
        obj.programIssues = this.programIssues;
        obj.programAvatar = this.programAvatar;
        obj.programTeamName = this.programTeamName;
        obj.programFocus = this.programFocus;
        obj.programCommunities = this.programCommunities;
        obj.programInstitutions = this.programInstitutions;
        obj.completed = this.completed ? this.completed.toISOString() : undefined,
            obj.created = this.created ? this.created.toISOString() : undefined,
            obj.members = encodeURIComponent(JSON.stringify(this.members));
        return obj;
    }
    addMember(membership) {
        this['member-' + membership.id] = membership;
    }
    static iterateMembers(program, callback) {
        let keys = Object.keys(program);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1 && program[key]) {
                if (XApiStatement.is(program[key]) && Membership.is(program[key])) {
                    callback(key, program[key]);
                }
                else if (TempMembership.is(program[key])) {
                    callback(key, program[key]);
                }
            }
        }
    }
    static getMembers(program) {
        let members = [];
        let keys = Object.keys(program);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1 && program[key]) {
                if (XApiStatement.is(program[key]) && Membership.is(program[key])) {
                    members.push(program[key]);
                }
            }
        }
        return members;
    }
    static isMember(program, userIdentity) {
        let isMember = false;
        let keys = Object.keys(program);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1 && program[key]) {
                if (program[key].identity === userIdentity) {
                    isMember = true;
                }
            }
        }
        return isMember;
    }
    static isNew(program) {
        let isNew = true;
        let keys = Object.keys(program);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1) {
                isNew = false;
            }
        }
        return isNew;
    }
}
class activity_Institution extends Activity {
    constructor(raw) {
        raw.type = "institution";
        super(raw);
        let self = this;
        let rawKeys = Object.keys(raw);
        for (let key of rawKeys) {
            if (key.indexOf('member-') !== -1) {
                let member = typeof (raw[key]) === "string" ? JSON.parse(decodeURIComponent(raw[key])) : (raw[key] ? raw[key] : null);
                if (member == null || (XApiStatement.is(member) && Membership.is(member)) || TempMembership.is(member)) {
                    self[key] = member;
                }
            }
            else if (key.indexOf('program-') !== -1) {
                let program = typeof (raw[key]) === "string" ? JSON.parse(decodeURIComponent(raw[key])) : (raw[key] ? raw[key] : null);
                if (program == null || (activity_Program.is(program))) {
                    self[key] = program;
                }
            }
        }
        this.institutionName = raw.institutionName || "";
        this.institutionDescription = raw.institutionDescription || "";
        this.institutionAvatar = raw.institutionAvatar;
    }
    static is(raw) {
        return raw.type == "institution";
    }
    toTransportFormat() {
        let obj = super.toTransportFormat();
        let self = this;
        let keys = Object.keys(this);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1) {
                if (self[key] == null) {
                    obj[key] = self[key];
                }
                else if ((XApiStatement.is(self[key]) && Membership.is(self[key])) || TempMembership.is(self[key])) {
                    obj[key] = encodeURIComponent(JSON.stringify(self[key]));
                }
            }
            else if (key.indexOf('program-') !== -1) {
                if (self[key] == null) {
                    obj[key] = self[key];
                }
                else if (activity_Program.is(self[key])) {
                    obj[key] = encodeURIComponent(JSON.stringify(self[key]));
                }
            }
        }
        obj.institutionName = this.institutionName;
        obj.institutionDescription = this.institutionDescription;
        obj.institutionAvatar = this.institutionAvatar;
        return obj;
    }
    addMember(membership) {
        this['member-' + membership.id] = membership;
    }
    addProgram(program) {
        this['program-' + program.id] = program;
    }
    static iterateMembers(institution, callback) {
        let keys = Object.keys(institution);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1 && institution[key]) {
                if (XApiStatement.is(institution[key]) && Membership.is(institution[key])) {
                    callback(key, institution[key]);
                }
                else if (TempMembership.is(institution[key])) {
                    callback(key, institution[key]);
                }
            }
        }
    }
    static isMember(institution, userIdentity) {
        let isMember = false;
        let keys = Object.keys(institution);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1 && institution[key]) {
                if (institution[key].identity === userIdentity) {
                    isMember = true;
                }
            }
        }
        return isMember;
    }
    static iteratePrograms(institution, callback) {
        let keys = Object.keys(institution);
        for (let key of keys) {
            if (key.indexOf('program-') !== -1 && institution[key]) {
                if (activity_Program.is(institution[key])) {
                    callback(key, institution[key]);
                }
            }
        }
    }
    static isProgram(institution, programId) {
        let isProgram = false;
        let keys = Object.keys(institution);
        for (let key of keys) {
            if (key.indexOf('program-') !== -1 && institution[key]) {
                if (institution[key].id === programId) {
                    isProgram = true;
                }
            }
        }
        return isProgram;
    }
    static isNew(institution) {
        let isNew = true;
        let keys = Object.keys(institution);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1) {
                isNew = false;
            }
        }
        return isNew;
    }
}
class activity_System extends Activity {
    constructor(raw) {
        raw.type = "system";
        super(raw);
        let self = this;
        let rawKeys = Object.keys(raw);
        for (let key of rawKeys) {
            if (key.indexOf('member-') !== -1) {
                let member = typeof (raw[key]) === "string" ? JSON.parse(decodeURIComponent(raw[key])) : (raw[key] ? raw[key] : null);
                if (member == null || (XApiStatement.is(member) && Membership.is(member)) || TempMembership.is(member)) {
                    self[key] = member;
                }
            }
        }
        this.systemName = raw.systemName || "";
        this.systemDescription = raw.systemDescription || "";
    }
    static is(raw) {
        return raw.type == "system";
    }
    toTransportFormat() {
        let obj = super.toTransportFormat();
        let self = this;
        let keys = Object.keys(this);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1) {
                if (self[key] == null) {
                    obj[key] = self[key];
                }
                else if ((XApiStatement.is(self[key]) && Membership.is(self[key])) || TempMembership.is(self[key])) {
                    obj[key] = encodeURIComponent(JSON.stringify(self[key]));
                }
            }
        }
        obj.systemName = this.systemName;
        obj.systemDescription = this.systemDescription;
        return obj;
    }
    addMember(membership) {
        this['member-' + membership.id] = membership;
    }
    static iterateMembers(system, callback) {
        let keys = Object.keys(system);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1 && system[key]) {
                if (XApiStatement.is(system[key]) && Membership.is(system[key])) {
                    callback(key, system[key]);
                }
                else if (TempMembership.is(system[key])) {
                    callback(key, system[key]);
                }
            }
        }
    }
    static isMember(system, userIdentity) {
        let isMember = false;
        let keys = Object.keys(system);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1 && system[key]) {
                if (system[key].identity === userIdentity) {
                    isMember = true;
                }
            }
        }
        return isMember;
    }
    static isNew(system) {
        let isNew = true;
        let keys = Object.keys(system);
        for (let key of keys) {
            if (key.indexOf('member-') !== -1) {
                isNew = false;
            }
        }
        return isNew;
    }
}
// -------------------------------
class Presence extends Activity {
    static is(raw) {
        return raw.type == "presence";
    }
}
// -------------------------------
function toActivity(obj) {
    let act = null;
    if (activity_Program.is(obj)) {
        act = new activity_Program(obj);
    }
    else if (Learnlet.is(obj)) {
        act = new Learnlet(obj);
    }
    else if (Learnlet.is(obj)) {
        act = new Presence(obj);
    }
    else if (activity_Institution.is(obj)) {
        act = new activity_Institution(obj);
    }
    else if (activity_System.is(obj)) {
        act = new activity_System(obj);
    }
    else
        new Error("Unknown activity type");
    return act;
}

// CONCATENATED MODULE: ./src/build.ts
const DEBUG_MODE = false;
function consoleLog(...vars) {
    if (DEBUG_MODE)
        console.log(...vars);
}
function consoleError(...vars) {
    if (DEBUG_MODE)
        console.error(...vars);
}

// CONCATENATED MODULE: ./src/storage.ts



const MASTER_INDEX = "master";
const CURRENT_BOOK = "peblCurrentBook";
const CURRENT_BOOK_TITLE = "peblCurrentBookTitle";
const CURRENT_BOOK_ID = "peblCurrentBookId";
const CURRENT_USER = "peblCurrentUser";
// const VERB_INDEX = "verbs";
class storage_IndexedDBStorageAdapter {
    constructor(pebl, callback) {
        this.invocationQueue = [];
        let request = window.indexedDB.open("pebl", 28);
        let self = this;
        this.pebl = pebl;
        request.onupgradeneeded = function () {
            let db = request.result;
            let objectStores = db.objectStoreNames;
            for (let i = 0; i < objectStores.length; i++)
                db.deleteObjectStore(objectStores[i]);
            let eventStore = db.createObjectStore("events", { keyPath: ["identity", "id"] });
            let annotationStore = db.createObjectStore("annotations", { keyPath: ["identity", "id"] });
            let competencyStore = db.createObjectStore("competencies", { keyPath: ["url", "identity"] });
            let generalAnnotationStore = db.createObjectStore("sharedAnnotations", { keyPath: ["identity", "id"] });
            let outgoingXApiStore = db.createObjectStore("outgoingXApi", { keyPath: ["identity", "id"] });
            let outgoingActivityStore = db.createObjectStore("outgoingActivity", { keyPath: ["identity", "id"] });
            let messageStore = db.createObjectStore("messages", { keyPath: ["identity", "id"] });
            let groupStore = db.createObjectStore("groups", { keyPath: ["identity", "id"] });
            db.createObjectStore("user", { keyPath: "identity" });
            db.createObjectStore("state", { keyPath: "id" });
            db.createObjectStore("assets");
            db.createObjectStore("variables");
            let queuedReferences = db.createObjectStore("queuedReferences", { keyPath: ["identity", "id"] });
            let notificationStore = db.createObjectStore("notifications", { keyPath: ["identity", "id"] });
            let tocStore = db.createObjectStore("tocs", { keyPath: ["identity", "book", "section", "pageKey"] });
            db.createObjectStore("lrsAuth", { keyPath: "id" });
            let activityStore = db.createObjectStore("activity", { keyPath: ["identity", "type", "id"] });
            let activityEventStore = db.createObjectStore("activityEvents", { keyPath: ["id", "programId"] });
            let moduleEventStore = db.createObjectStore("moduleEvents", { keyPath: ["id", "idref"] });
            activityStore.createIndex(MASTER_INDEX, ["identity", "type"]);
            activityEventStore.createIndex(MASTER_INDEX, ["programId"]);
            moduleEventStore.createIndex(MASTER_INDEX, ["idref"]);
            eventStore.createIndex(MASTER_INDEX, ["identity", "book"]);
            annotationStore.createIndex(MASTER_INDEX, ["identity", "book"]);
            competencyStore.createIndex(MASTER_INDEX, "identity");
            generalAnnotationStore.createIndex(MASTER_INDEX, "book");
            outgoingActivityStore.createIndex(MASTER_INDEX, "identity");
            outgoingXApiStore.createIndex(MASTER_INDEX, "identity");
            groupStore.createIndex(MASTER_INDEX, "identity");
            messageStore.createIndex(MASTER_INDEX, ["identity", "thread"]);
            queuedReferences.createIndex(MASTER_INDEX, ["identity", "book"]);
            notificationStore.createIndex(MASTER_INDEX, "identity");
            tocStore.createIndex(MASTER_INDEX, ["identity", "book"]);
        };
        request.onsuccess = function () {
            self.db = request.result;
            callback();
            for (let i = 0; i < self.invocationQueue.length; i++)
                self.invocationQueue[i]();
            self.invocationQueue = [];
        };
        request.onerror = function (event) {
            consoleError("error opening indexeddb", event);
        };
    }
    getAll(index, query, callback) {
        let request = index.openCursor(query);
        let result = [];
        request.onerror = function (e) {
            consoleError("Error", query, e);
        };
        request.onsuccess = function () {
            let r = request.result;
            if (result) {
                if (r) {
                    result.push(r.value);
                    r.continue();
                }
                else if (callback != null)
                    callback(result);
            }
            else {
                if (callback != null) {
                    if (r != null)
                        callback(r.value);
                    else
                        callback([]);
                }
            }
        };
    }
    cleanRecord(r) {
        let recordType = typeof (r);
        if (r && (recordType == "object")) {
            let rec = r;
            for (let p of Object.keys(r)) {
                let v = rec[p];
                let t = typeof (v);
                if (t == "function")
                    delete rec[p];
                else if (t == "array")
                    for (let i = 0; i < v.length; i++)
                        this.cleanRecord(v[i]);
                else if (t == "object")
                    this.cleanRecord(v);
            }
        }
        else if (recordType == "array") {
            let rec = r;
            for (let i = 0; i < rec.length; i++)
                this.cleanRecord(rec[i]);
        }
        return r;
    }
    // -------------------------------
    saveSharedAnnotations(userProfile, stmts, callback) {
        if (this.db) {
            if (stmts instanceof SharedAnnotation) {
                let ga = stmts;
                ga.identity = userProfile.identity;
                let request = this.db.transaction(["sharedAnnotations"], "readwrite").objectStore("sharedAnnotations").put(ga);
                request.onerror = function (e) {
                    consoleError(e);
                };
                request.onsuccess = function () {
                    if (callback)
                        callback();
                };
            }
            else {
                let objectStore = this.db.transaction(["sharedAnnotations"], "readwrite").objectStore("sharedAnnotations");
                let stmtsCopy = stmts.slice(0);
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let ga = record;
                        ga.identity = userProfile.identity;
                        let request = objectStore.put(ga);
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveSharedAnnotations(userProfile, stmts, callback);
            });
        }
    }
    getSharedAnnotations(userProfile, book, callback) {
        if (this.db) {
            let index = this.db.transaction(["sharedAnnotations"], "readonly").objectStore("sharedAnnotations").index(MASTER_INDEX);
            let param = book;
            this.getAll(index, IDBKeyRange.only(param), callback);
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getSharedAnnotations(userProfile, book, callback);
            });
        }
    }
    removeSharedAnnotation(userProfile, id, callback) {
        if (this.db) {
            let request = this.db.transaction(["sharedAnnotations"], "readwrite").objectStore("sharedAnnotations").delete(IDBKeyRange.only([userProfile.identity, id]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeSharedAnnotation(userProfile, id, callback);
            });
        }
    }
    // -------------------------------
    getAnnotations(userProfile, book, callback) {
        if (this.db) {
            let index = this.db.transaction(["annotations"], "readonly").objectStore("annotations").index(MASTER_INDEX);
            let param = [userProfile.identity, book];
            this.getAll(index, IDBKeyRange.only(param), callback);
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getAnnotations(userProfile, book, callback);
            });
        }
    }
    saveAnnotations(userProfile, stmts, callback) {
        if (this.db) {
            if (stmts instanceof Annotation) {
                let ga = stmts;
                ga.identity = userProfile.identity;
                let request = this.db.transaction(["annotations"], "readwrite").objectStore("annotations").put(ga);
                request.onerror = function (e) {
                    consoleError(e);
                };
                request.onsuccess = function () {
                    if (callback)
                        callback();
                };
            }
            else {
                let objectStore = this.db.transaction(["annotations"], "readwrite").objectStore("annotations");
                let stmtsCopy = stmts.slice(0);
                let self = this;
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let clone = record;
                        clone.identity = userProfile.identity;
                        let request = objectStore.put(self.cleanRecord(clone));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveAnnotations(userProfile, stmts, callback);
            });
        }
    }
    removeAnnotation(userProfile, id, callback) {
        if (this.db) {
            let request = this.db.transaction(["annotations"], "readwrite").objectStore("annotations").delete(IDBKeyRange.only([userProfile.identity, id]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeAnnotation(userProfile, id, callback);
            });
        }
    }
    // -------------------------------
    removeCurrentUser(callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").delete(IDBKeyRange.only(CURRENT_USER));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeCurrentUser(callback);
            });
        }
    }
    saveCurrentUser(userProfile, callback) {
        let pack = {
            id: CURRENT_USER,
            value: userProfile.identity
        };
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").put(this.cleanRecord(pack));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveCurrentUser(userProfile, callback);
            });
        }
    }
    getCurrentUser(callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readonly").objectStore("state").get(CURRENT_USER);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                let r = request.result;
                if (r != null)
                    callback(r.value);
                else
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getCurrentUser(callback);
            });
        }
    }
    // -------------------------------
    getUserProfile(userIdentity, callback) {
        if (this.db) {
            let request = this.db.transaction(["user"], "readonly").objectStore("user").get(userIdentity);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                let r = request.result;
                if (r != null)
                    callback(r);
                else
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getUserProfile(userIdentity, callback);
            });
        }
    }
    saveUserProfile(userProfile, callback) {
        if (this.db) {
            let request = this.db.transaction(["user"], "readwrite").objectStore("user").put(this.cleanRecord(userProfile));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveUserProfile(userProfile, callback);
            });
        }
    }
    // -------------------------------
    saveCurrentActivity(book, callback) {
        let pack = {
            value: book,
            id: CURRENT_BOOK
        };
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").put(this.cleanRecord(pack));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveCurrentActivity(book, callback);
            });
        }
    }
    getCurrentActivity(callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readonly").objectStore("state").get(CURRENT_BOOK);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                let r = request.result;
                if (callback != null) {
                    if (r != null)
                        callback(r.value);
                    else
                        callback();
                }
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getCurrentActivity(callback);
            });
        }
    }
    removeCurrentActivity(callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").delete(IDBKeyRange.only(CURRENT_BOOK));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeCurrentActivity(callback);
            });
        }
    }
    // -------------------------------
    saveCurrentBook(book, callback) {
        let pack = {
            value: book,
            id: CURRENT_BOOK
        };
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").put(this.cleanRecord(pack));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveCurrentBook(book, callback);
            });
        }
    }
    getCurrentBook(callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readonly").objectStore("state").get(CURRENT_BOOK);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                let r = request.result;
                if (callback != null) {
                    if (r != null)
                        callback(r.value);
                    else
                        callback();
                }
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getCurrentBook(callback);
            });
        }
    }
    // -------------------------------
    saveCurrentBookTitle(book, callback) {
        let pack = {
            value: book,
            id: CURRENT_BOOK_TITLE
        };
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").put(this.cleanRecord(pack));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveCurrentBookTitle(book, callback);
            });
        }
    }
    getCurrentBookTitle(callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readonly").objectStore("state").get(CURRENT_BOOK_TITLE);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                let r = request.result;
                if (callback != null) {
                    if (r != null)
                        callback(r.value);
                    else
                        callback();
                }
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getCurrentBookTitle(callback);
            });
        }
    }
    // -------------------------------
    saveCurrentBookId(book, callback) {
        let pack = {
            value: book,
            id: CURRENT_BOOK_ID
        };
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").put(this.cleanRecord(pack));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveCurrentBookId(book, callback);
            });
        }
    }
    getCurrentBookId(callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readonly").objectStore("state").get(CURRENT_BOOK_ID);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                let r = request.result;
                if (callback != null) {
                    if (r != null)
                        callback(r.value);
                    else
                        callback();
                }
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getCurrentBookId(callback);
            });
        }
    }
    // -------------------------------
    saveSyncTimestamps(identity, key, data, callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").put({
                id: identity + key,
                data: data
            });
            request.onerror = function (e) {
                consoleError(e);
                callback(false);
            };
            request.onsuccess = function () {
                callback(true);
            };
        }
        else {
            this.invocationQueue.push(() => {
                this.saveSyncTimestamps(identity, key, data, callback);
            });
        }
    }
    getSyncTimestamps(identity, key, callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readonly").objectStore("state").get(identity + key);
            request.onerror = function (e) {
                consoleError(e);
                callback(-1);
            };
            request.onsuccess = function () {
                if (request.result) {
                    callback(request.result.data);
                }
                else {
                    callback(-1);
                }
            };
        }
        else {
            this.invocationQueue.push(() => {
                this.getSyncTimestamps(identity, key, callback);
            });
        }
    }
    saveCompoundSyncTimestamps(identity, key, data, callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readwrite").objectStore("state").put({
                id: identity + key,
                data: data
            });
            request.onerror = function (e) {
                consoleError(e);
                callback(false);
            };
            request.onsuccess = function () {
                callback(true);
            };
        }
        else {
            this.invocationQueue.push(() => {
                this.saveCompoundSyncTimestamps(identity, key, data, callback);
            });
        }
    }
    getCompoundSyncTimestamps(identity, key, callback) {
        if (this.db) {
            let request = this.db.transaction(["state"], "readonly").objectStore("state").get(identity + key);
            request.onerror = function (e) {
                consoleError(e);
                callback({});
            };
            request.onsuccess = function () {
                if (request.result)
                    callback(request.result.data);
                else
                    callback({});
            };
        }
        else {
            this.invocationQueue.push(() => {
                this.getCompoundSyncTimestamps(identity, key, callback);
            });
        }
    }
    // -------------------------------
    saveEvent(userProfile, events, callback) {
        if (this.db) {
            if (events instanceof XApiStatement) {
                let ga = events;
                ga.identity = userProfile.identity;
                let request = this.db.transaction(["events"], "readwrite").objectStore("events").put(ga);
                request.onerror = function (e) {
                    consoleError(e);
                };
                request.onsuccess = function () {
                    if (callback)
                        callback();
                };
            }
            else {
                let objectStore = this.db.transaction(["events"], "readwrite").objectStore("events");
                let stmtsCopy = events.slice(0);
                let self = this;
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let clone = record;
                        clone.identity = userProfile.identity;
                        let request = objectStore.put(self.cleanRecord(clone));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveEvent(userProfile, events, callback);
            });
        }
    }
    getEvents(userProfile, book, callback) {
        if (this.db) {
            let index = this.db.transaction(["events"], "readonly").objectStore("events").index(MASTER_INDEX);
            let param = [userProfile.identity, book];
            let self = this;
            self.getAll(index, IDBKeyRange.only(param), callback);
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getEvents(userProfile, book, callback);
            });
        }
    }
    // -------------------------------
    getCompetencies(userProfile, callback) {
        if (this.db) {
            let os = this.db.transaction(["competencies"], "readonly").objectStore("competencies");
            let index = os.index(MASTER_INDEX);
            let param = userProfile.identity;
            let self = this;
            this.getAll(index, IDBKeyRange.only(param), function (arr) {
                if (arr.length == 0)
                    self.getAll(index, IDBKeyRange.only([param]), callback);
                else
                    callback(arr);
            });
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getCompetencies(userProfile, callback);
            });
        }
    }
    saveCompetencies(userProfile, competencies, callback) {
        if (this.db) {
            let os = this.db.transaction(["competencies"], "readwrite").objectStore("competencies");
            for (let p of Object.keys(competencies)) {
                let c = competencies[p];
                c.url = p;
                c.identity = userProfile.identity;
                competencies.push(c);
            }
            let self = this;
            let processCallback = function () {
                if (competencies.length > 0) {
                    let record = competencies.pop();
                    let request = os.put(self.cleanRecord(record));
                    request.onerror = processCallback;
                    request.onsuccess = processCallback;
                }
                else {
                    if (callback)
                        callback();
                }
            };
            processCallback();
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveCompetencies(userProfile, competencies, callback);
            });
        }
    }
    // -------------------------------
    saveOutgoingXApi(userProfile, stmt, callback) {
        if (this.db) {
            let clone = stmt;
            clone.identity = userProfile.identity;
            let request = this.db.transaction(["outgoingXApi"], "readwrite").objectStore("outgoingXApi").put(this.cleanRecord(clone));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveOutgoingXApi(userProfile, stmt, callback);
            });
        }
    }
    getOutgoingXApi(userProfile, callback) {
        if (this.db) {
            let os = this.db.transaction(["outgoingXApi"], "readonly").objectStore("outgoingXApi");
            let index = os.index(MASTER_INDEX);
            let param = userProfile.identity;
            let self = this;
            this.getAll(index, IDBKeyRange.only(param), function (arr) {
                if (arr.length == 0)
                    self.getAll(index, IDBKeyRange.only([param]), callback);
                else
                    callback(arr);
            });
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getOutgoingXApi(userProfile, callback);
            });
        }
    }
    removeOutgoingXApi(userProfile, toClear, callback) {
        if (this.db) {
            let objectStore = this.db.transaction(["outgoingXApi"], "readwrite").objectStore("outgoingXApi");
            let toClearCopy = toClear.slice(0);
            let processCallback = function () {
                if (toClear.length > 0) {
                    let record = toClearCopy.pop();
                    if (record) {
                        let request = objectStore.delete(IDBKeyRange.only([userProfile.identity, record.id]));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                }
            };
            processCallback();
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeOutgoingXApi(userProfile, toClear, callback);
            });
        }
    }
    // -------------------------------
    saveMessages(userProfile, stmts, callback) {
        if (this.db) {
            if (stmts instanceof Message) {
                let clone = stmts;
                clone.identity = userProfile.identity;
                if (clone.isPrivate)
                    clone.thread += '_user-' + userProfile.identity;
                else if (clone.groupId)
                    clone.thread += '_group-' + clone.groupId;
                let request = this.db.transaction(["messages"], "readwrite").objectStore("messages").put(this.cleanRecord(clone));
                request.onerror = function (e) {
                    consoleError(e);
                };
                request.onsuccess = function () {
                    if (callback)
                        callback();
                };
            }
            else {
                let objectStore = this.db.transaction(["messages"], "readwrite").objectStore("messages");
                let stmtsCopy = stmts.slice(0);
                let self = this;
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let clone = record;
                        clone.identity = userProfile.identity;
                        if (clone.isPrivate)
                            clone.thread += '_user-' + userProfile.identity;
                        else if (clone.groupId)
                            clone.thread += '_group-' + clone.groupId;
                        let request = objectStore.put(self.cleanRecord(clone));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else if (callback)
                        callback();
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveMessages(userProfile, stmts, callback);
            });
        }
    }
    removeMessage(userProfile, id, callback) {
        if (this.db) {
            let request = this.db.transaction(["messages"], "readwrite").objectStore("messages").delete(IDBKeyRange.only([userProfile.identity, id]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeMessage(userProfile, id, callback);
            });
        }
    }
    getMessages(userProfile, thread, callback) {
        if (this.db) {
            let index = this.db.transaction(["messages"], "readonly").objectStore("messages").index(MASTER_INDEX);
            this.getAll(index, IDBKeyRange.only([userProfile.identity, thread]), callback);
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getMessages(userProfile, thread, callback);
            });
        }
    }
    // -------------------------------
    saveAsset(id, data, callback) {
        if (this.db) {
            let request = this.db.transaction(["assets"], "readwrite").objectStore("assets").put(data, id);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function (e) {
                if (callback)
                    callback(id);
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveAsset(id, data, callback);
            });
        }
    }
    getAsset(assetId) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (this.db) {
                let request = this.db.transaction(["assets"], "readonly").objectStore("assets").get(assetId);
                request.onerror = function (e) {
                    consoleError(e);
                    reject();
                };
                request.onsuccess = function () {
                    if (request.result)
                        resolve(request.result);
                    else
                        self.pebl.network.fetchAsset(assetId).then((file) => {
                            resolve(file);
                        }).catch(() => {
                            reject();
                        });
                };
            }
            else {
                let self = this;
                this.invocationQueue.push(function () {
                    resolve(self.getAsset(assetId));
                });
            }
        });
    }
    // -------------------------------
    saveVariable(id, data, callback) {
        if (this.db) {
            let request = this.db.transaction(["variables"], "readwrite").objectStore("variables").put(data, id);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function (e) {
                if (callback)
                    callback(id);
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveAsset(id, data, callback);
            });
        }
    }
    getVariable(id) {
        return new Promise((resolve, reject) => {
            if (this.db) {
                let request = this.db.transaction(["variables"], "readonly").objectStore("variables").get(id);
                request.onerror = function (e) {
                    consoleError(e);
                    reject();
                };
                request.onsuccess = function () {
                    if (request.result !== undefined)
                        resolve(request.result);
                    else
                        reject();
                };
            }
            else {
                let self = this;
                this.invocationQueue.push(function () {
                    resolve(self.getVariable(id));
                });
            }
        });
    }
    // -------------------------------
    saveQueuedReference(userProfile, ref, callback) {
        if (this.db) {
            ref.identity = userProfile.identity;
            let request = this.db.transaction(["queuedReferences"], "readwrite").objectStore("queuedReferences").put(this.cleanRecord(ref));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveQueuedReference(userProfile, ref, callback);
            });
        }
    }
    getQueuedReference(userProfile, currentBook, callback) {
        if (this.db) {
            let os = this.db.transaction(["queuedReferences"], "readonly").objectStore("queuedReferences");
            let index = os.index(MASTER_INDEX);
            let request = index.openCursor(IDBKeyRange.only([userProfile.identity, currentBook]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (request.result == null) {
                    let req = index.openCursor(IDBKeyRange.only([userProfile.identity, currentBook]));
                    req.onerror = function (e) {
                        consoleError(e);
                    };
                    req.onsuccess = function () {
                        if (callback && request.result)
                            callback(request.result.value);
                        else
                            callback();
                    };
                }
                else if (callback && request.result)
                    callback(request.result.value);
                else
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getQueuedReference(userProfile, currentBook, callback);
            });
        }
    }
    removeQueuedReference(userProfile, refId, callback) {
        if (this.db) {
            let request = this.db.transaction(["queuedReferences"], "readwrite").objectStore("queuedReferences").delete(IDBKeyRange.only([userProfile.identity, refId]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeQueuedReference(userProfile, refId, callback);
            });
        }
    }
    // -------------------------------
    saveToc(userProfile, book, data, callback) {
        if (this.db) {
            data.identity = userProfile.identity;
            data.book = book;
            let request = this.db.transaction(["tocs"], "readwrite").objectStore("tocs").put(this.cleanRecord(data));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveToc(userProfile, book, data, callback);
            });
        }
    }
    getToc(userProfile, book, callback) {
        //TODO Remove me
        if (book == null) {
            callback([]);
            return;
        }
        if (this.db) {
            let os = this.db.transaction(["tocs"], "readonly").objectStore("tocs");
            let index = os.index(MASTER_INDEX);
            this.getAll(index, IDBKeyRange.only([userProfile.identity, book]), callback);
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getToc(userProfile, book, callback);
            });
        }
    }
    removeToc(userProfile, book, section, id, callback) {
        if (this.db) {
            let request = this.db.transaction(["tocs"], "readwrite").objectStore("tocs").delete(IDBKeyRange.only([userProfile.identity, book, section, id]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeToc(userProfile, book, section, id, callback);
            });
        }
    }
    // -------------------------------
    saveNotification(userProfile, notification, callback) {
        if (this.db) {
            notification.identity = userProfile.identity;
            let request = this.db.transaction(["notifications"], "readwrite").objectStore("notifications").put(this.cleanRecord(notification));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveNotification(userProfile, notification, callback);
            });
        }
    }
    getNotification(userProfile, notificationId, callback) {
        if (this.db) {
            let request = this.db.transaction(["notifications"], "readwrite").objectStore("notifications").get(IDBKeyRange.only([userProfile.identity, notificationId]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                callback(request.result);
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getNotification(userProfile, notificationId, callback);
            });
        }
    }
    getNotifications(userProfile, callback) {
        if (this.db) {
            let os = this.db.transaction(["notifications"], "readonly").objectStore("notifications");
            let index = os.index(MASTER_INDEX);
            let param = userProfile.identity;
            let self = this;
            this.getAll(index, IDBKeyRange.only(param), function (arr) {
                if (arr.length == 0)
                    self.getAll(index, IDBKeyRange.only([param]), callback);
                else
                    callback(arr);
            });
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getNotifications(userProfile, callback);
            });
        }
    }
    removeNotification(userProfile, notificationId, callback) {
        if (this.db) {
            let request = this.db.transaction(["notifications"], "readwrite").objectStore("notifications").delete(IDBKeyRange.only([userProfile.identity, notificationId]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeNotification(userProfile, notificationId, callback);
            });
        }
    }
    // -------------------------------
    saveGroupMembership(userProfile, stmts, callback) {
        if (this.db) {
            if (stmts instanceof Membership) {
                let ga = stmts;
                ga.identity = userProfile.identity;
                let request = this.db.transaction(["groups"], "readwrite").objectStore("groups").put(ga);
                request.onerror = function (e) {
                    consoleError(e);
                };
                request.onsuccess = function () {
                    if (callback)
                        callback();
                };
            }
            else {
                let objectStore = this.db.transaction(["groups"], "readwrite").objectStore("groups");
                let stmtsCopy = stmts.slice(0);
                let self = this;
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let clone = record;
                        clone.identity = userProfile.identity;
                        let request = objectStore.put(self.cleanRecord(clone));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveGroupMembership(userProfile, stmts, callback);
            });
        }
    }
    getGroupMembership(userProfile, callback) {
        if (this.db) {
            let os = this.db.transaction(["groups"], "readonly").objectStore("groups");
            let index = os.index(MASTER_INDEX);
            let param = userProfile.identity;
            let self = this;
            this.getAll(index, IDBKeyRange.only(param), function (arr) {
                if (arr.length == 0)
                    self.getAll(index, IDBKeyRange.only([param]), callback);
                else
                    callback(arr);
            });
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getGroupMembership(userProfile, callback);
            });
        }
    }
    removeGroupMembership(userProfile, xId, callback) {
        if (this.db) {
            let request = this.db.transaction(["groups"], "readwrite").objectStore("groups").delete(IDBKeyRange.only([userProfile.identity, xId]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeGroupMembership(userProfile, xId, callback);
            });
        }
    }
    // -------------------------------
    getActivityEvent(programId, callback) {
        if (this.db) {
            let os = this.db.transaction(["activityEvents"], "readonly").objectStore("activityEvents");
            let index = os.index(MASTER_INDEX);
            let param = programId;
            let self = this;
            this.getAll(index, IDBKeyRange.only(param), function (arr) {
                if (arr.length == 0)
                    self.getAll(index, IDBKeyRange.only([param]), callback);
                else
                    callback(arr);
            });
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getActivityEvent(programId, callback);
            });
        }
    }
    saveActivityEvent(userProfile, stmts, callback) {
        if (this.db) {
            if (stmts instanceof ProgramAction) {
                let ga = stmts;
                ga.identity = ga.actor.account.name;
                let request = this.db.transaction(["activityEvents"], "readwrite").objectStore("activityEvents").put(ga);
                request.onerror = function (e) {
                    consoleError(e);
                };
                request.onsuccess = function () {
                    if (callback)
                        callback();
                };
            }
            else {
                let objectStore = this.db.transaction(["activityEvents"], "readwrite").objectStore("activityEvents");
                let stmtsCopy = stmts.slice(0);
                let self = this;
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let clone = record;
                        clone.identity = clone.actor.account.name;
                        let request = objectStore.put(self.cleanRecord(clone));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveActivityEvent(userProfile, stmts, callback);
            });
        }
    }
    // -------------------------------
    getModuleEvent(idref, callback) {
        if (this.db) {
            let os = this.db.transaction(["moduleEvents"], "readonly").objectStore("moduleEvents");
            let index = os.index(MASTER_INDEX);
            let param = idref;
            let self = this;
            this.getAll(index, IDBKeyRange.only(param), function (arr) {
                if (arr.length == 0)
                    self.getAll(index, IDBKeyRange.only([param]), callback);
                else
                    callback(arr);
            });
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getModuleEvent(idref, callback);
            });
        }
    }
    saveModuleEvent(userProfile, stmts, callback) {
        if (this.db) {
            if (stmts instanceof ModuleEvent) {
                let ga = stmts;
                ga.identity = ga.actor.account.name;
                let request = this.db.transaction(["moduleEvents"], "readwrite").objectStore("moduleEvents").put(ga);
                request.onerror = function (e) {
                    consoleError(e);
                };
                request.onsuccess = function () {
                    if (callback)
                        callback();
                };
            }
            else {
                let objectStore = this.db.transaction(["moduleEvents"], "readwrite").objectStore("moduleEvents");
                let stmtsCopy = stmts.slice(0);
                let self = this;
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let clone = record;
                        clone.identity = clone.actor.account.name;
                        let request = objectStore.put(self.cleanRecord(clone));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveModuleEvent(userProfile, stmts, callback);
            });
        }
    }
    removeModuleEvent(idref, xId, callback) {
        if (this.db) {
            let request = this.db.transaction(["moduleEvents"], "readwrite").objectStore("moduleEvents").delete(IDBKeyRange.only([xId, idref]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeModuleEvent(idref, xId, callback);
            });
        }
    }
    // -------------------------------
    saveActivity(userProfile, stmts, callback) {
        if (this.db) {
            if ((stmts instanceof Activity) || Activity.is(stmts)) {
                let ga = (stmts instanceof Activity) ? stmts : toActivity(stmts);
                if (ga) {
                    ga.identity = userProfile.identity;
                    let request = this.db.transaction(["activity"], "readwrite").objectStore("activity").put(ga);
                    request.onerror = function (e) {
                        consoleError(e);
                    };
                    request.onsuccess = function () {
                        if (callback)
                            callback();
                    };
                }
            }
            else {
                let objectStore = this.db.transaction(["activity"], "readwrite").objectStore("activity");
                let stmtsCopy = stmts.slice(0);
                let self = this;
                let processCallback = function () {
                    let record = stmtsCopy.pop();
                    if (record) {
                        let clone = record;
                        clone.identity = userProfile.identity;
                        let request = objectStore.put(self.cleanRecord(clone));
                        request.onerror = processCallback;
                        request.onsuccess = processCallback;
                    }
                    else {
                        if (callback)
                            callback();
                    }
                };
                processCallback();
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveActivity(userProfile, stmts, callback);
            });
        }
    }
    getActivity(userProfile, activityType, callback) {
        if (this.db) {
            let os = this.db.transaction(["activity"], "readonly").objectStore("activity");
            let index = os.index(MASTER_INDEX);
            let param = [userProfile.identity, activityType];
            let self = this;
            self.getAll(index, IDBKeyRange.only(param), callback);
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getActivity(userProfile, activityType, callback);
            });
        }
    }
    getActivityById(userProfile, activityType, activityId, callback) {
        if (this.db) {
            let param = [userProfile.identity, activityType, activityId];
            let request = this.db.transaction(["activity"], "readonly").objectStore("activity").get(param);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                let r = request.result;
                if (r != null)
                    callback(r);
                else
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getActivityById(userProfile, activityType, activityId, callback);
            });
        }
    }
    removeActivity(userProfile, xId, activityType, callback) {
        if (this.db) {
            let request = this.db.transaction(["activity"], "readwrite").objectStore("activity").delete(IDBKeyRange.only([userProfile.identity, activityType, xId]));
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeActivity(userProfile, xId, activityType, callback);
            });
        }
    }
    // -------------------------------
    saveOutgoingActivity(userProfile, stmt, callback) {
        if (this.db) {
            let clone = stmt;
            clone.identity = userProfile.identity;
            let request = this.db.transaction(["outgoingActivity"], "readwrite").objectStore("outgoingActivity").put(clone);
            request.onerror = function (e) {
                consoleError(e);
            };
            request.onsuccess = function () {
                if (callback)
                    callback();
            };
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.saveOutgoingActivity(userProfile, stmt, callback);
            });
        }
    }
    getOutgoingActivity(userProfile, callback) {
        if (this.db) {
            let os = this.db.transaction(["outgoingActivity"], "readonly").objectStore("outgoingActivity");
            let index = os.index(MASTER_INDEX);
            let param = userProfile.identity;
            let self = this;
            this.getAll(index, IDBKeyRange.only(param), function (arr) {
                if (arr.length == 0)
                    self.getAll(index, IDBKeyRange.only([param]), callback);
                else
                    callback(arr);
            });
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.getOutgoingActivity(userProfile, callback);
            });
        }
    }
    removeOutgoingActivity(userProfile, toClear, callback) {
        if (this.db) {
            let objectStore = this.db.transaction(["outgoingActivity"], "readwrite").objectStore("outgoingActivity");
            let request = objectStore.delete(IDBKeyRange.only([userProfile.identity, toClear.id]));
            if (callback) {
                request.onerror = callback;
                request.onsuccess = callback;
            }
        }
        else {
            let self = this;
            this.invocationQueue.push(function () {
                self.removeOutgoingActivity(userProfile, toClear, callback);
            });
        }
    }
}

// CONCATENATED MODULE: ./src/user.ts
class User {
    constructor(pebl) {
        this.pebl = pebl;
    }
    isLoggedIn(callback) {
        this.pebl.storage.getCurrentUser(function (currentUser) {
            callback(currentUser != null);
        });
    }
    getUser(callback) {
        let self = this;
        this.pebl.storage.getCurrentUser(function (currentUser) {
            if (currentUser) {
                self.pebl.storage.getUserProfile(currentUser, function (userProfile) {
                    if (userProfile)
                        callback(userProfile);
                    else
                        callback();
                });
            }
            else
                callback();
        });
    }
}

// CONCATENATED MODULE: ./src/constants.ts
const SYNC_ANNOTATIONS = "annotations";
const SYNC_SHARED_ANNOTATIONS = "sharedAnnotations";
const SYNC_THREAD = "threads";
const SYNC_PRIVATE_THREAD = "privateThreads";
const SYNC_GROUP_THREAD = "groupThreads";
const SYNC_REFERENCES = "references";
const SYNC_NOTIFICATIONS = "notifications";
function generateGroupSharedAnnotationsSyncTimestampsKey(groupId) {
    return SYNC_SHARED_ANNOTATIONS + '_' + groupId;
}

// CONCATENATED MODULE: ./src/syncing.ts
const USER_PREFIX = "_user-";
const GROUP_PREFIX = "_group-";



class syncing_LLSyncAction {
    constructor(pebl) {
        this.DEFAULT_RECONNECTION_BACKOFF = 1000;
        this.notificationTimestamps = {};
        this.clearedNotifications = {};
        var self = this;
        this.serverReady = false;
        this.pebl = pebl;
        this.reconnectionBackoff = this.DEFAULT_RECONNECTION_BACKOFF;
        this.active = false;
        consoleLog(this.pebl.config && this.pebl.config.PeBLServicesWSURL);
        this.messageHandlers = {};
        this.messageHandlers.serverReady = (userProfile, payload) => {
            this.serverReady = true;
            // this.pullNotifications();
            this.pullAnnotations();
            this.pullSharedAnnotations();
            this.pullReferences();
            this.pullSubscribedThreads();
        };
        this.messageHandlers.setLastNotifiedDates = (userProfile, payload) => {
            for (let k in payload.clearedTimestamps) {
                this.notificationTimestamps[k] = parseInt(payload.clearedTimestamps[k]);
            }
            for (let key of payload.clearedNotifications) {
                this.clearedNotifications[key] = true;
            }
        };
        this.messageHandlers.removeClearedNotifications = (userProfile, payload) => {
            for (let k of payload.clearedTimestamps) {
                this.notificationTimestamps[k] = payload.clearedTimestamps[k];
            }
            for (let key of payload.clearedNotifications) {
                delete this.clearedNotifications[key];
            }
        };
        this.messageHandlers.getReferences = (userProfile, payload) => {
            this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_REFERENCES, (timestamp) => {
                for (let stmt of payload.data) {
                    if (Voided.is(stmt)) {
                        //TODO
                        consoleLog('TODO');
                    }
                    else {
                        let ref = new Reference(stmt);
                        self.pebl.storage.saveQueuedReference(userProfile, ref);
                        let stored = new Date(ref.stored).getTime();
                        if ((!this.clearedNotifications[ref.id]) &&
                            (stored >= (this.notificationTimestamps["r" + ref.book] || 0))) {
                            self.pebl.storage.saveNotification(userProfile, ref, () => { });
                            this.pebl.emitEvent(this.pebl.events.incomingNotifications, [ref]);
                        }
                        if (stored > timestamp)
                            timestamp = stored;
                    }
                }
                this.pebl.storage.saveSyncTimestamps(userProfile.identity, SYNC_REFERENCES, timestamp, () => { });
            });
        };
        this.messageHandlers.newReference = (userProfile, payload) => {
            this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_REFERENCES, (timestamp) => {
                if (Voided.is(payload.data)) {
                    //TODO
                    consoleLog('TODO');
                }
                else {
                    let ref = new Reference(payload.data);
                    self.pebl.storage.saveQueuedReference(userProfile, ref);
                    let stored = new Date(ref.stored).getTime();
                    if ((!this.clearedNotifications[ref.id]) &&
                        (stored >= (this.notificationTimestamps["r" + ref.book] || 0))) {
                        self.pebl.storage.saveNotification(userProfile, ref, () => { });
                        this.pebl.emitEvent(this.pebl.events.incomingNotifications, [ref]);
                    }
                    if (stored > timestamp)
                        timestamp = stored;
                    this.pebl.storage.saveSyncTimestamps(userProfile.identity, SYNC_REFERENCES, timestamp, () => { });
                }
            });
        };
        // this.messageHandlers.getNotifications = (userProfile, payload) => {
        //     this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_NOTIFICATIONS, (timestamp: number) => {
        //         let stmts = payload.data.map((stmt: any) => {
        //             if (Voided.is(stmt)) {
        //                 let voided = new Voided(stmt);
        //                 self.pebl.storage.removeNotification(userProfile, voided.target);
        //                 let stored = new Date(voided.stored).getTime();
        //                 if (stored > timestamp)
        //                     timestamp = stored;
        //                 return voided;
        //             } else {
        //                 let n;
        //                 if (Reference.is(stmt))
        //                     n = new Reference(stmt);
        //                 else if (Message.is(stmt))
        //                     n = new Message(stmt);
        //                 else if (SharedAnnotation.is(stmt))
        //                     n = new SharedAnnotation(stmt);
        //                 else
        //                     n = new Notification(stmt);
        //                 self.pebl.storage.saveNotification(userProfile, n);
        //                 let stored = new Date(n.stored).getTime();
        //                 if (stored > timestamp)
        //                     timestamp = stored;
        //                 return n;
        //             }
        //         });
        //         this.pebl.storage.saveSyncTimestamps(userProfile.identity, SYNC_NOTIFICATIONS, timestamp, () => {
        //             this.pebl.emitEvent(self.pebl.events.incomingNotifications, stmts);
        //         });
        //     });
        // }
        this.messageHandlers.getThreadedMessages = (userProfile, payload) => {
            let threads;
            if (payload.data instanceof Array) {
                threads = payload.data;
            }
            else {
                threads = [payload.data];
            }
            this.pebl.utils.getThreadTimestamps(userProfile.identity, (threadSyncTimestamps, privateThreadSyncTimestamps, groupThreadSyncTimestamps) => {
                threads.forEach((payload) => {
                    let groupId = payload.options && payload.options.groupId;
                    let isPrivate = payload.options && payload.options.isPrivate;
                    let thread = payload.thread;
                    for (let stmt of payload.data) {
                        if (groupId) {
                            this.handleGroupMessage(userProfile, stmt, thread, groupId, groupThreadSyncTimestamps);
                        }
                        else if (isPrivate) {
                            this.handlePrivateMessage(userProfile, stmt, thread, privateThreadSyncTimestamps);
                        }
                        else {
                            this.handleMessage(userProfile, stmt, thread, threadSyncTimestamps);
                        }
                    }
                });
                this.pebl.utils.saveThreadTimestamps(userProfile.identity, threadSyncTimestamps, privateThreadSyncTimestamps, groupThreadSyncTimestamps, () => { });
            });
        };
        this.messageHandlers.newThreadedMessage = (userProfile, payload) => {
            let groupId = payload.options && payload.options.groupId;
            let isPrivate = payload.options && payload.options.isPrivate;
            let thread = payload.thread;
            this.pebl.utils.getThreadTimestamps(userProfile.identity, (threadSyncTimestamps, privateThreadSyncTimestamps, groupThreadSyncTimestamps) => {
                if (groupId) {
                    this.handleGroupMessage(userProfile, payload.data, thread, groupId, groupThreadSyncTimestamps);
                }
                else if (isPrivate) {
                    this.handlePrivateMessage(userProfile, payload.data, thread, privateThreadSyncTimestamps);
                }
                else {
                    this.handleMessage(userProfile, payload.data, thread, threadSyncTimestamps);
                }
                this.pebl.utils.saveThreadTimestamps(userProfile.identity, threadSyncTimestamps, privateThreadSyncTimestamps, groupThreadSyncTimestamps, () => { });
            });
        };
        this.messageHandlers.getSubscribedThreads = (userProfile, payload) => {
            if (self.websocket && self.websocket.readyState === 1) {
                this.pebl.utils.getThreadTimestamps(userProfile.identity, (threadSyncTimestamps, privateThreadSyncTimestamps, groupThreadSyncTimestamps) => {
                    let messageSet = [];
                    for (let thread of payload.data.threads) {
                        let message = {
                            thread: thread,
                            options: {},
                            timestamp: threadSyncTimestamps[thread] ? threadSyncTimestamps[thread] : 1
                        };
                        messageSet.push(message);
                    }
                    for (let thread of payload.data.privateThreads) {
                        let message = {
                            thread: thread,
                            options: { isPrivate: true },
                            timestamp: privateThreadSyncTimestamps[thread] ? privateThreadSyncTimestamps[thread] : 1
                        };
                        messageSet.push(message);
                    }
                    for (let groupId in payload.data.groupThreads) {
                        for (let thread of payload.data.groupThreads[groupId]) {
                            let groupTime;
                            if (groupThreadSyncTimestamps[groupId]) {
                                groupTime = groupThreadSyncTimestamps[groupId][thread];
                            }
                            else {
                                groupTime = 1;
                            }
                            let message = {
                                thread: thread,
                                options: { groupId: groupId },
                                timestamp: groupTime
                            };
                            messageSet.push(message);
                        }
                    }
                    if (this.websocket) {
                        this.websocket.send(JSON.stringify({
                            requestType: "getThreadedMessages",
                            identity: userProfile.identity,
                            requests: messageSet
                        }));
                    }
                });
            }
        };
        this.messageHandlers.getAnnotations = (userProfile, payload) => {
            this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_ANNOTATIONS, (timestamp) => {
                let stmts = payload.data.map((stmt) => {
                    if (Voided.is(stmt)) {
                        let voided = new Voided(stmt);
                        this.pebl.storage.removeAnnotation(userProfile, voided.target);
                        let stored = new Date(voided.stored).getTime();
                        if (stored > timestamp)
                            timestamp = stored;
                        return voided;
                    }
                    else {
                        let a = new Annotation(stmt);
                        this.pebl.storage.saveAnnotations(userProfile, [a]);
                        let stored = new Date(a.stored).getTime();
                        if (stored > timestamp)
                            timestamp = stored;
                        return a;
                    }
                });
                this.pebl.storage.saveSyncTimestamps(userProfile.identity, SYNC_ANNOTATIONS, timestamp, () => {
                    this.pebl.emitEvent(this.pebl.events.incomingAnnotations, stmts);
                });
            });
        };
        this.messageHandlers.getSharedAnnotations = (userProfile, payload) => {
            for (let stmt of payload.data) {
                this.pebl.storage.getSyncTimestamps(userProfile.identity, generateGroupSharedAnnotationsSyncTimestampsKey(stmt.groupId), (timestamp) => {
                    let annotation;
                    if (Voided.is(stmt)) {
                        annotation = new Voided(stmt);
                        self.pebl.storage.removeSharedAnnotation(userProfile, annotation.target);
                        self.pebl.storage.removeNotification(userProfile, annotation.target);
                        this.pebl.emitEvent(this.pebl.events.incomingNotifications, [annotation]);
                        let stored = new Date(annotation.stored).getTime();
                        if (stored > timestamp)
                            timestamp = stored;
                    }
                    else {
                        annotation = new SharedAnnotation(stmt);
                        self.pebl.storage.saveSharedAnnotations(userProfile, [annotation]);
                        let stored = new Date(annotation.stored).getTime();
                        if ((stored >= (this.notificationTimestamps["sa" + annotation.book] || 0)) &&
                            (!this.clearedNotifications[annotation.id])) {
                            if (userProfile.identity !== annotation.getActorId()) {
                                this.pebl.storage.saveNotification(userProfile, annotation);
                                this.pebl.emitEvent(this.pebl.events.incomingNotifications, [annotation]);
                            }
                            else {
                                this.pebl.storage.saveOutgoingXApi(userProfile, {
                                    id: annotation.id,
                                    identity: userProfile.identity,
                                    requestType: "deleteNotification",
                                    records: [{
                                            id: annotation.id,
                                            type: "sharedAnnotation",
                                            location: annotation.book,
                                            stored: annotation.stored
                                        }]
                                });
                            }
                        }
                        if (stored > timestamp)
                            timestamp = stored;
                    }
                    this.pebl.storage.saveSyncTimestamps(userProfile.identity, generateGroupSharedAnnotationsSyncTimestampsKey(stmt.groupId), timestamp, () => {
                        self.pebl.emitEvent(self.pebl.events.incomingSharedAnnotations, [annotation]);
                    });
                });
            }
        };
        this.messageHandlers.newAnnotation = (userProfile, payload) => {
            let allAnnotations;
            if (payload.data instanceof Array) {
                allAnnotations = payload.data;
            }
            else {
                allAnnotations = [payload.data];
            }
            this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_ANNOTATIONS, (timestamp) => {
                let stmts = allAnnotations.map((a) => {
                    if (Voided.is(a)) {
                        a = new Voided(a);
                        self.pebl.storage.removeAnnotation(userProfile, a.target);
                    }
                    else {
                        a = new Annotation(a);
                        self.pebl.storage.saveAnnotations(userProfile, [a]);
                    }
                    let stored = new Date(a.stored).getTime();
                    if (stored > timestamp)
                        timestamp = stored;
                    return a;
                });
                this.pebl.storage.saveSyncTimestamps(userProfile.identity, SYNC_ANNOTATIONS, timestamp, () => {
                    self.pebl.emitEvent(self.pebl.events.incomingAnnotations, stmts);
                });
            });
        };
        this.messageHandlers.newSharedAnnotation = (userProfile, payload) => {
            let allSharedAnnotations;
            if (payload.data instanceof Array) {
                allSharedAnnotations = payload.data;
            }
            else {
                allSharedAnnotations = [payload.data];
            }
            for (let sa of allSharedAnnotations) {
                this.pebl.storage.getSyncTimestamps(userProfile.identity, generateGroupSharedAnnotationsSyncTimestampsKey(sa.groupId), (timestamp) => {
                    if (Voided.is(sa)) {
                        sa = new Voided(sa);
                        this.pebl.storage.removeSharedAnnotation(userProfile, sa.target);
                        this.pebl.storage.removeNotification(userProfile, sa.target);
                        this.pebl.emitEvent(this.pebl.events.incomingNotifications, [sa]);
                    }
                    else {
                        sa = new SharedAnnotation(sa);
                        this.pebl.storage.saveSharedAnnotations(userProfile, [sa]);
                    }
                    let stored = new Date(sa.stored).getTime();
                    if ((sa instanceof SharedAnnotation) &&
                        (stored >= (this.notificationTimestamps["sa" + sa.book] || 0)) &&
                        (!this.clearedNotifications[sa.id])) {
                        if (userProfile.identity !== sa.getActorId()) {
                            this.pebl.storage.saveNotification(userProfile, sa);
                            this.pebl.emitEvent(this.pebl.events.incomingNotifications, [sa]);
                        }
                        else {
                            this.pebl.storage.saveOutgoingXApi(userProfile, {
                                id: sa.id,
                                identity: userProfile.identity,
                                requestType: "deleteNotification",
                                records: [{
                                        id: sa.id,
                                        type: "sharedAnnotation",
                                        location: sa.book,
                                        stored: sa.stored
                                    }]
                            });
                        }
                    }
                    if (stored > timestamp)
                        timestamp = stored;
                    this.pebl.storage.saveSyncTimestamps(userProfile.identity, generateGroupSharedAnnotationsSyncTimestampsKey(sa.groupId), timestamp, () => {
                        this.pebl.emitEvent(this.pebl.events.incomingSharedAnnotations, [sa]);
                    });
                });
            }
        };
        this.messageHandlers.loggedOut = (userProfile, payload) => {
            if (window.PeBLConfig && window.PeBLConfig.guestLogin) {
                if (userProfile.identity === 'guest')
                    return;
            }
            self.pebl.storage.removeCurrentUser(() => {
                this.notificationTimestamps = {};
                this.clearedNotifications = {};
                self.pebl.emitEvent(self.pebl.events.eventRefreshLogin, null);
            });
        };
        this.messageHandlers.requestUpload = (userProfile, payload) => {
            this.pebl.network.uploadAsset(payload.filename, payload.activityId);
        };
        this.messageHandlers.error = (userProfile, payload) => {
            consoleLog("Message failed", payload);
        };
        this.messageHandlers.getChapterCompletionPercentages = (userProfile, payload) => {
            this.pebl.emitEvent(this.pebl.events.getChapterCompletionPercentages, payload.data);
        };
        this.messageHandlers.getMostAnsweredQuestions = (userProfile, payload) => {
            this.pebl.emitEvent(this.pebl.events.getMostAnsweredQuestions, payload.data);
        };
        this.messageHandlers.getLeastAnsweredQuestions = (userProfile, payload) => {
            this.pebl.emitEvent(this.pebl.events.getLeastAnsweredQuestions, payload.data);
        };
        this.messageHandlers.getQuizAttempts = (userProfile, payload) => {
            this.pebl.emitEvent(this.pebl.events.getQuizAttempts, payload.data);
        };
        this.messageHandlers.getReportedThreadedMessages = (userProfile, payload) => {
            this.pebl.emitEvent(this.pebl.events.getReportedThreadedMessages, payload.data);
        };
    }
    activate(callback) {
        if (!this.active) {
            this.active = true;
            this.reconnectionBackoff = this.DEFAULT_RECONNECTION_BACKOFF;
            let makeWebSocketConnection = () => {
                if (this.pebl.config && this.pebl.config.PeBLServicesWSURL) {
                    if (this.websocket) {
                        this.websocket.close();
                        this.websocket = undefined;
                    }
                    this.websocket = new WebSocket(this.pebl.config.PeBLServicesWSURL);
                    this.websocket.onopen = () => {
                        consoleLog('websocket opened');
                        this.reconnectionBackoffResetHandler = setTimeout(() => {
                            this.reconnectionBackoff = this.DEFAULT_RECONNECTION_BACKOFF;
                        }, this.DEFAULT_RECONNECTION_BACKOFF);
                    };
                    this.websocket.onclose = () => {
                        consoleLog("Web socket closed retrying in " + this.reconnectionBackoff, event);
                        this.serverReady = false;
                        if (this.active) {
                            if (this.reconnectionBackoffResetHandler) {
                                clearTimeout(this.reconnectionBackoffResetHandler);
                                this.reconnectionBackoffResetHandler = undefined;
                            }
                            if (this.reconnectionTimeoutHandler) {
                                clearTimeout(this.reconnectionTimeoutHandler);
                            }
                            this.reconnectionTimeoutHandler = setTimeout(() => {
                                makeWebSocketConnection();
                                this.reconnectionBackoff *= 2;
                                if (this.reconnectionBackoff > 60000) {
                                    this.reconnectionBackoff = 60000;
                                }
                            }, this.reconnectionBackoff);
                        }
                    };
                    this.websocket.onerror = (event) => {
                        consoleLog("Web socket error retrying in " + this.reconnectionBackoff, event);
                        this.serverReady = false;
                        if (this.active) {
                            if (this.reconnectionBackoffResetHandler) {
                                clearTimeout(this.reconnectionBackoffResetHandler);
                                this.reconnectionBackoffResetHandler = undefined;
                            }
                            if (this.reconnectionTimeoutHandler) {
                                clearTimeout(this.reconnectionTimeoutHandler);
                            }
                            this.reconnectionTimeoutHandler = setTimeout(() => {
                                makeWebSocketConnection();
                                this.reconnectionBackoff *= 2;
                                if (this.reconnectionBackoff > 60000) {
                                    this.reconnectionBackoff = 60000;
                                }
                            }, this.reconnectionBackoff);
                        }
                    };
                    this.websocket.onmessage = (message) => {
                        this.pebl.user.getUser((userProfile) => {
                            if (userProfile) {
                                consoleLog('message recieved');
                                var parsedMessage = JSON.parse(message.data);
                                if (this.messageHandlers[parsedMessage.requestType]) {
                                    this.messageHandlers[parsedMessage.requestType](userProfile, parsedMessage);
                                }
                                else {
                                    consoleLog("Unknown request type", parsedMessage.requestType, parsedMessage);
                                }
                            }
                        });
                    };
                }
            };
            makeWebSocketConnection();
        }
        if (callback) {
            callback();
        }
    }
    disable(callback) {
        if (this.active) {
            this.active = false;
            if (this.reconnectionTimeoutHandler) {
                clearTimeout(this.reconnectionTimeoutHandler);
                this.reconnectionTimeoutHandler = undefined;
            }
            if (this.websocket) {
                let processDisable = () => {
                    if (this.websocket) {
                        if (this.websocket.bufferedAmount > 0) {
                            setTimeout(processDisable, 50);
                        }
                        else {
                            this.websocket.close();
                            if (callback) {
                                callback();
                            }
                        }
                    }
                };
                processDisable();
            }
            else {
                if (callback)
                    callback();
            }
        }
        else {
            if (callback) {
                callback();
            }
        }
    }
    mergeRequests(outgoing) {
        let compressedOutgoing = [];
        let userRequestTypes = {};
        for (let i = 0; i < outgoing.length; i++) {
            let packet = outgoing[i];
            let requestTypes = userRequestTypes[packet.identity];
            if (!requestTypes) {
                requestTypes = {};
                userRequestTypes[packet.identity] = requestTypes;
            }
            if (!requestTypes[packet.requestType]) {
                requestTypes[packet.requestType] = [];
            }
            requestTypes[packet.requestType].push(packet);
        }
        for (let user in userRequestTypes) {
            let requestTypes = userRequestTypes[user];
            for (let requestType in requestTypes) {
                let objs = requestTypes[requestType];
                let mergedRequestType = {
                    requestType: requestType,
                    identity: user
                };
                for (let obj of objs) {
                    for (let key of Object.keys(obj)) {
                        if ((key !== "id") && (key !== "requestType") && (key !== "identity")) {
                            let val = obj[key];
                            if (!mergedRequestType[key])
                                mergedRequestType[key] = [];
                            if (val instanceof Array) {
                                mergedRequestType[key].push(...val);
                            }
                            else if ((typeof val === "string") || (typeof val === "number") || (val instanceof Object)) {
                                mergedRequestType[key].push(val);
                            }
                            else {
                                throw new Error("unknown merge type");
                            }
                        }
                    }
                }
                compressedOutgoing.push(mergedRequestType);
            }
        }
        return compressedOutgoing;
    }
    push(outgoing, callback) {
        this.pebl.user.getUser((userProfile) => {
            if (userProfile && this.serverReady && this.websocket && this.websocket.readyState === 1) {
                this.websocket.send(JSON.stringify({
                    requestType: "bulkPush",
                    identity: userProfile.identity,
                    data: this.mergeRequests(outgoing)
                }));
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    pushActivity(outgoing, callback) {
        this.pebl.user.getUser((userProfile) => {
            if (userProfile && this.serverReady && this.websocket && this.websocket.readyState === 1) {
                for (let message of outgoing) {
                    consoleLog(message);
                    this.websocket.send(JSON.stringify(message));
                }
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    // pullNotifications(): void {
    //     this.pebl.user.getUser((userProfile) => {
    //         if (userProfile && this.websocket && this.websocket.readyState === 1) {
    //             this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_NOTIFICATIONS, (timestamp: number) => {
    //                 let message = {
    //                     identity: userProfile.identity,
    //                     requestType: "getNotifications",
    //                     timestamp: timestamp + 1
    //                 }
    //                 if (this.websocket) {
    //                     this.websocket.send(JSON.stringify(message));
    //                 }
    //             });
    //         }
    //     });
    // }
    pullAnnotations() {
        this.pebl.user.getUser((userProfile) => {
            if (userProfile && this.websocket && this.websocket.readyState === 1) {
                this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_ANNOTATIONS, (timestamp) => {
                    let message = {
                        identity: userProfile.identity,
                        requestType: "getAnnotations",
                        timestamp: timestamp + 1
                    };
                    if (this.websocket) {
                        this.websocket.send(JSON.stringify(message));
                    }
                });
            }
        });
    }
    pullSharedAnnotations() {
        this.pebl.user.getUser((userProfile) => {
            if (userProfile && this.websocket && this.websocket.readyState === 1) {
                if (userProfile.groups) {
                    for (let groupId of userProfile.groups) {
                        ((groupId) => {
                            this.pebl.storage.getSyncTimestamps(userProfile.identity, generateGroupSharedAnnotationsSyncTimestampsKey(groupId), (timestamp) => {
                                let message = {
                                    identity: userProfile.identity,
                                    requestType: "getSharedAnnotations",
                                    timestamp: timestamp + 1,
                                    groupId: groupId
                                };
                                if (this.websocket) {
                                    this.websocket.send(JSON.stringify(message));
                                }
                            });
                            this.pebl.storage.saveOutgoingXApi(userProfile, {
                                id: this.pebl.utils.getUuid(),
                                identity: userProfile.identity,
                                requestType: "subscribeSharedAnnotations",
                                groupId: groupId
                            });
                        })(groupId);
                    }
                }
            }
        });
    }
    pullReferences() {
        this.pebl.user.getUser((userProfile) => {
            if (userProfile && this.websocket && this.websocket.readyState === 1) {
                this.pebl.storage.getSyncTimestamps(userProfile.identity, SYNC_REFERENCES, (timestamp) => {
                    let message = {
                        identity: userProfile.identity,
                        requestType: "getReferences",
                        timestamp: timestamp + 1
                    };
                    if (this.websocket) {
                        this.websocket.send(JSON.stringify(message));
                    }
                });
            }
        });
    }
    pullSubscribedThreads() {
        this.pebl.user.getUser((userProfile) => {
            if (userProfile && this.websocket && this.websocket.readyState === 1) {
                let message = {
                    identity: userProfile.identity,
                    requestType: "getSubscribedThreads"
                };
                this.websocket.send(JSON.stringify(message));
            }
        });
    }
    handlePrivateMessage(userProfile, message, thread, privateThreadSyncTimestamps) {
        let m;
        if (Voided.is(message)) {
            m = new Voided(message);
            this.pebl.storage.removeMessage(userProfile, m.target);
        }
        else {
            m = new Message(message);
            this.pebl.storage.saveMessages(userProfile, [m]);
        }
        let stored = new Date(m.stored).getTime();
        if (!privateThreadSyncTimestamps[thread])
            privateThreadSyncTimestamps[thread] = 1;
        if (stored > privateThreadSyncTimestamps[thread])
            privateThreadSyncTimestamps[thread] = stored;
        this.pebl.emitEvent(thread + USER_PREFIX + userProfile.identity, [m]);
    }
    handleGroupMessage(userProfile, message, thread, groupId, groupThreadSyncTimestamps) {
        let m;
        if (Voided.is(message)) {
            m = new Voided(message);
            this.pebl.storage.removeMessage(userProfile, m.target);
            this.pebl.storage.removeNotification(userProfile, m.target);
            this.pebl.emitEvent(this.pebl.events.incomingNotifications, [m]);
        }
        else {
            m = new Message(message);
            this.pebl.storage.saveMessages(userProfile, [m]);
        }
        let stored = new Date(m.stored).getTime();
        if ((m instanceof Message) &&
            (stored >= (this.notificationTimestamps[m.thread] || 0)) &&
            (!this.clearedNotifications[m.id])) {
            if (userProfile.identity !== m.getActorId()) {
                this.pebl.storage.saveNotification(userProfile, m);
                this.pebl.emitEvent(this.pebl.events.incomingNotifications, [m]);
            }
            else {
                this.pebl.storage.saveOutgoingXApi(userProfile, {
                    id: m.id,
                    identity: userProfile.identity,
                    requestType: "deleteNotification",
                    records: [{
                            id: m.id,
                            type: "message",
                            location: m.thread,
                            stored: m.stored
                        }]
                });
            }
        }
        if (!groupThreadSyncTimestamps[groupId])
            groupThreadSyncTimestamps[groupId] = {};
        if (!groupThreadSyncTimestamps[groupId][thread])
            groupThreadSyncTimestamps[groupId][thread] = 1;
        if (stored > groupThreadSyncTimestamps[groupId][thread])
            groupThreadSyncTimestamps[groupId][thread] = stored;
        this.pebl.emitEvent(thread + GROUP_PREFIX + groupId, [m]);
    }
    handleMessage(userProfile, message, thread, threadSyncTimestamps) {
        let m;
        if (Voided.is(message)) {
            m = new Voided(message);
            this.pebl.storage.removeMessage(userProfile, m.target);
            this.pebl.storage.removeNotification(userProfile, m.target);
        }
        else {
            m = new Message(message);
            this.pebl.storage.saveMessages(userProfile, [m]);
        }
        let stored = new Date(m.stored).getTime();
        //No notifications for general messages
        // if ((m instanceof Message) &&
        //     (stored >= (this.notificationTimestamps[m.thread] || 0)) &&
        //     (!this.clearedNotifications[m.id])) {
        //     if (userProfile.identity !== m.getActorId()) {
        //         this.pebl.storage.saveNotification(userProfile, m);
        //         this.pebl.emitEvent(this.pebl.events.incomingNotifications, [m]);
        //     } else {
        //         this.pebl.storage.saveOutgoingXApi(userProfile, {
        //             id: m.id,
        //             identity: userProfile.identity,
        //             requestType: "deleteNotification",
        //             records: [{
        //                 id: m.id,
        //                 type: "message",
        //                 location: m.thread,
        //                 stored: m.stored
        //             }]
        //         });
        //     }
        // }
        if (!threadSyncTimestamps[thread])
            threadSyncTimestamps[thread] = 1;
        if (stored > threadSyncTimestamps[thread])
            threadSyncTimestamps[thread] = stored;
        this.pebl.emitEvent(thread, [m]);
    }
}

// CONCATENATED MODULE: ./src/network.ts

// import { Activity } from "./activity";
class network_Network {
    constructor(pebl) {
        this.pushTimeout = undefined;
        this.pushActivityTimeout = undefined;
        this.pullAssetTimeout = undefined;
        this.pebl = pebl;
        this.running = false;
        this.syncingProcess = new syncing_LLSyncAction(pebl);
    }
    activate(callback) {
        if (!this.running) {
            this.running = true;
            this.syncingProcess.activate(() => {
                this.push();
                this.pushActivity();
                this.pullAsset();
                if (callback)
                    callback();
            });
        }
        else {
            if (callback)
                callback();
        }
    }
    queueReference(ref) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile)
                self.pebl.storage.saveQueuedReference(userProfile, ref, self.pullAsset.bind(self));
        });
    }
    retrievePresence() {
        // for (let sync of this.syncingProcess)
        //     sync.retrievePresence();
    }
    uploadAsset(assetId, activityId) {
        return new Promise((resolve, reject) => {
            this.pebl.storage.getAsset(assetId).then((file) => {
                if (this.pebl.config && this.pebl.config.PeBLServicesURL) {
                    let fd = new FormData();
                    fd.append('activityId', activityId);
                    fd.append('mediaId', assetId);
                    fd.append('media', file);
                    fetch(this.pebl.config.PeBLServicesURL + '/user/media', {
                        credentials: 'include',
                        method: 'POST',
                        body: fd
                    }).then((res) => {
                        console.log(res);
                        resolve(res.statusText);
                    }).catch((e) => {
                        console.error(e);
                        reject();
                    });
                }
            }).catch(() => {
                reject();
            });
        });
    }
    fetchAsset(assetId) {
        return new Promise((resolve, reject) => {
            if (this.pebl.config && this.pebl.config.PeBLServicesURL) {
                fetch(this.pebl.config.PeBLServicesURL + '/user/media?mediaId=' + assetId, {
                    credentials: 'include',
                    method: 'GET'
                }).then(res => res.blob()).then(blob => {
                    console.log(blob);
                    resolve(new File([blob], assetId));
                }).catch((e) => {
                    console.error(e);
                    reject();
                });
            }
        });
    }
    pullAsset() {
        this.pebl.user.getUser((userProfile) => {
            if (userProfile && userProfile.registryEndpoint) {
                this.pebl.storage.getCurrentBook((currentBook) => {
                    if (currentBook) {
                        this.pebl.storage.getQueuedReference(userProfile, currentBook, (ref) => {
                            if (ref) {
                                this.pebl.storage.getToc(userProfile, ref.book, (toc) => {
                                    //Wait to add resources until the static TOC has been initialized, otherwise it never gets intialized
                                    if (toc.length > 0) {
                                        // this.pebl.storage.saveNotification(userProfile, ref);
                                        let tocEntry = {
                                            "url": ref.url,
                                            "documentName": ref.name,
                                            "section": ref.location,
                                            "pageKey": ref.id,
                                            "docType": ref.docType,
                                            "card": ref.card,
                                            "externalURL": ref.externalURL
                                        };
                                        this.pebl.storage.saveToc(userProfile, ref.book, tocEntry);
                                        this.pebl.emitEvent(this.pebl.events.incomingNotification, ref);
                                        this.pebl.emitEvent(this.pebl.events.updatedToc, ref.book);
                                        this.pebl.storage.removeQueuedReference(userProfile, ref.id);
                                        if (this.running)
                                            this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
                                        // The below requires an API that is currently unavailable and also not needed at this time
                                        // let xhr = new XMLHttpRequest();
                                        // xhr.addEventListener("load", function() {
                                        //     this.pebl.storage.saveNotification(userProfile, ref);
                                        //     let tocEntry: { [key: string]: any } = {
                                        //         "url": ref.url,
                                        //         "documentName": ref.name,
                                        //         "section": ref.location,
                                        //         "pageKey": ref.id,
                                        //         "docType": ref.docType,
                                        //         "card": ref.card,
                                        //         "externalURL": ref.externalURL
                                        //     };
                                        //     this.pebl.storage.saveToc(userProfile, ref.book, tocEntry);
                                        //     this.pebl.emitEvent(this.pebl.events.incomingNotification, ref);
                                        //     this.pebl.storage.removeQueuedReference(userProfile, ref.id);
                                        //     if (this.running)
                                        //         this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
                                        // });
                                        // xhr.addEventListener("error", function() {
                                        //     this.pebl.storage.saveNotification(userProfile, ref);
                                        //     this.pebl.emitEvent(this.pebl.events.incomingNotification, ref);
                                        //     this.pebl.storage.removeQueuedReference(userProfile, ref.id);
                                        //     if (this.running)
                                        //         this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
                                        // });
                                        // let url = userProfile.registryEndpoint && userProfile.registryEndpoint.url;
                                        // if (url) {
                                        //     xhr.open("GET", url + ref.url);
                                        //     xhr.send();
                                        // } else if (this.running)
                                        //     this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
                                    }
                                    else {
                                        this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
                                    }
                                });
                            }
                            else {
                                if (this.running)
                                    this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
                            }
                        });
                    }
                    else if (this.running) {
                        this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
                    }
                });
            }
            else if (this.running)
                this.pullAssetTimeout = setTimeout(this.pullAsset.bind(this), 5000);
        });
    }
    disable(callback) {
        if (this.running) {
            this.running = false;
            if (this.pushTimeout)
                clearTimeout(this.pushTimeout);
            this.pushTimeout = undefined;
            if (this.pullAssetTimeout)
                clearTimeout(this.pullAssetTimeout);
            this.pullAssetTimeout = undefined;
            this.syncingProcess.disable(() => {
                if (callback)
                    callback();
            });
        }
        else {
            if (callback) {
                callback();
            }
        }
    }
    pushActivity(finished) {
        if (this.pushActivityTimeout) {
            clearTimeout(this.pushActivityTimeout);
            this.pushActivityTimeout = undefined;
        }
        this.pebl.user.getUser((userProfile) => {
            if (userProfile) {
                this.pebl.storage.getOutgoingActivity(userProfile, (stmts) => {
                    if (stmts.length > 0) {
                        this.syncingProcess.pushActivity(stmts, (success) => {
                            if (success)
                                this.pebl.storage.removeOutgoingActivity(userProfile, stmts);
                            if (this.running)
                                this.pushActivityTimeout = setTimeout(this.pushActivity.bind(this), 5000);
                            if (finished)
                                finished();
                        });
                    }
                    else {
                        if (this.running)
                            this.pushActivityTimeout = setTimeout(this.pushActivity.bind(this), 5000);
                        if (finished)
                            finished();
                    }
                });
            }
            else if (this.running)
                this.pushActivityTimeout = setTimeout(this.pushActivity.bind(this), 5000);
        });
    }
    push(finished) {
        if (this.pushTimeout) {
            clearTimeout(this.pushTimeout);
            this.pushTimeout = undefined;
        }
        this.pebl.user.getUser((userProfile) => {
            if (userProfile) {
                this.pebl.storage.getOutgoingXApi(userProfile, (stmts) => {
                    if (stmts.length > 0) {
                        this.syncingProcess.push(stmts, (success) => {
                            if (success)
                                this.pebl.storage.removeOutgoingXApi(userProfile, stmts);
                            if (this.running)
                                this.pushTimeout = setTimeout(this.push.bind(this), 2000);
                            if (finished)
                                finished();
                        });
                    }
                    else {
                        if (this.running)
                            this.pushTimeout = setTimeout(this.push.bind(this), 2000);
                        if (finished)
                            finished();
                    }
                });
            }
            else {
                if (this.running)
                    this.pushTimeout = setTimeout(this.push.bind(this), 2000);
                if (finished)
                    finished();
            }
        });
    }
}

// CONCATENATED MODULE: ./src/eventSet.ts
class EventSet {
    constructor() {
        this.incomingAnnotations = "incomingAnnotations";
        this.incomingSharedAnnotations = "incomingSharedAnnotations";
        this.incomingNotifications = "incomingNotifications";
        this.incomingAssets = "incomingAssets";
        this.incomingEvents = "incomingEvents";
        this.incomingPresence = "incomingPresence";
        this.incomingLearnlet = "incomingLearnlet";
        this.incomingProgram = "incomingProgram";
        this.incomingInstitution = "incomingInstitution";
        this.incomingSystem = "incomingSystem";
        this.incomingArtifact = "incomingArtifact";
        this.incomingMembership = "incomingMembership";
        this.incomingActivityEvents = "incomingActivityEvents";
        this.incomingModuleEvents = "incomingModuleEvents";
        this.incomingErrors = "incomingErrors";
        this.updatedToc = "updatedToc";
        this.saveProgram = "saveProgram";
        this.saveProgramConflict = "saveProgramConflict";
        this.saveProgramSuccess = "saveProgramSuccess";
        this.saveProgramError = "saveProgramError";
        this.saveInstitution = "saveInstitution";
        this.saveSystem = "saveSystem";
        this.newBookNoReset = "newBookNoReset";
        this.newLearnlet = "newLearnlet";
        this.newBook = "newBook";
        this.newMessage = "newMessage";
        this.newActivity = "newActivity";
        this.newAnnotation = "newAnnotation";
        this.newReference = "newReference";
        this.newPresence = "newPresence";
        this.newMembership = "newMembership";
        this.newSharedAnnotation = "newSharedAnnotation";
        this.newArtifact = "newArtifact";
        this.modifiedMembership = "modifiedMembership";
        this.pinnedMessage = "pinnedMessage";
        this.unpinnedMessage = "unpinnedMessage";
        this.pinnedAnnotation = "pinnedAnnotation";
        this.unpinnedAnnotation = "unpinnedAnnotation";
        this.reportedMessage = "reportedMessage";
        this.removedPresence = "removedPresence";
        this.removedMembership = "removedMembership";
        this.removedAnnotation = "removedAnnotation";
        this.removedSharedAnnotation = "removedSharedAnnotation";
        this.removedLearnlet = "removedLearnlet";
        this.removedProgram = "removedProgram";
        this.removedMessage = "removedMessage";
        this.eventRefreshLogin = "eventRefreshLogin";
        this.eventLoggedIn = "eventLoggedIn";
        this.eventLoggedOut = "eventLoggedOut";
        this.eventLogin = "eventLogin";
        this.eventLogout = "eventLogout";
        this.eventFinishedLogin = "eventFinishedLogin";
        this.eventSessionStart = "eventSessionStart";
        this.eventSessionStop = "eventSessionStop";
        this.eventNextPage = "eventNextPage";
        this.eventPrevPage = "eventPrevPage";
        this.eventJumpPage = "eventJumpPage";
        this.eventInitialized = "eventInitialized";
        this.eventTerminated = "eventTerminated";
        this.eventInteracted = "eventInteracted";
        this.eventAttempted = "eventAttempted";
        this.eventPassed = "eventPassed";
        this.eventFailed = "eventFailed";
        this.eventPreferred = "eventPreferred";
        this.eventContentMorphed = "eventContentMorphed";
        this.eventExperienced = "eventExperienced";
        this.eventDisliked = "eventDisliked";
        this.eventLiked = "eventLiked";
        this.eventAccessed = "eventAccessed";
        this.eventHid = "eventHid";
        this.eventShowed = "eventShowed";
        this.eventDisplayed = "eventDisplayed";
        this.eventUndisplayed = "eventUndisplayed";
        this.eventSelected = "eventSelected";
        this.eventDiscarded = "eventDiscarded";
        this.eventBookmarked = "eventBookmarked";
        this.eventUnbookmarked = "eventUnbookmarked";
        this.eventUnsharedAnnotation = "eventUnsharedAnnotation";
        this.eventAnnotated = "eventAnnotated";
        this.eventUnannotated = "eventUnannotated";
        this.eventNoted = "eventNoted";
        this.eventSearched = "eventSearched";
        this.eventCompleted = "eventCompleted";
        this.eventLaunched = "eventLaunched";
        this.eventCompatibilityTested = "eventCompatibilityTested";
        this.eventChecklisted = "eventChecklisted";
        this.eventHelped = "eventHelped";
        this.eventInvited = "eventInvited";
        this.eventUninvited = "eventUninvited";
        this.eventSubmitted = "eventSubmitted";
        this.eventUploadedMedia = "eventUploadedMedia";
        this.eventProgramLevelUp = "eventProgramLevelUp";
        this.eventProgramLevelDown = "eventProgramLevelDown";
        this.eventProgramInvited = "eventProgramInvited";
        this.eventProgramUninvited = "eventProgramUninvited";
        this.eventProgramJoined = "eventProgramJoined";
        this.eventProgramExpelled = "eventProgramExpelled";
        this.eventProgramActivityLaunched = "eventProgramActivityLaunched";
        this.eventProgramActivityCompleted = "eventProgramActivityCompleted";
        this.eventProgramActivityTeamCompleted = "eventProgramActivityTeamCompleted";
        this.eventProgramModified = "eventProgramModified";
        this.eventProgramDeleted = "eventProgramDeleted";
        this.eventProgramCompleted = "eventProgramCompleted";
        this.eventProgramCopied = "eventProgramCopied";
        this.eventProgramDiscussed = "eventProgramDiscussed";
        this.eventModuleRating = "eventModuleRating";
        this.eventModuleFeedback = "eventModuleFeedback";
        this.eventModuleExample = "eventModuleExample";
        this.eventModuleExampleRating = "eventModuleExampleRating";
        this.eventModuleExampleFeedback = "eventModuleExampleFeedback";
        this.moduleRemovedEvent = "moduleRemovedEvent";
        this.totalInstitutionActivities = "totalInstitutionActivities";
        this.getChapterCompletionPercentages = "getChapterCompletionPercentages";
        this.getMostAnsweredQuestions = "getMostAnsweredQuestions";
        this.getLeastAnsweredQuestions = "getLeastAnsweredQuestions";
        this.getQuizAttempts = "getQuizAttempts";
        this.getReportedThreadedMessages = "getReportedThreadedMessages";
    }
}

// CONCATENATED MODULE: ./src/utils.ts




let pako = __webpack_require__(7);
var utils_platform = __webpack_require__(16); //https://github.com/bestiejs/platform.
const stringObj = { "to": "string" };
class utils_Utils {
    constructor(pebl) {
        this.pebl = pebl;
    }
    getAnnotations(callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentBookId(function (book) {
                    if (book)
                        self.pebl.storage.getAnnotations(userProfile, book, callback);
                    else
                        callback([]);
                });
            }
            else
                callback([]);
        });
    }
    getSharedAnnotations(callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentBookId(function (book) {
                    if (book)
                        self.pebl.storage.getSharedAnnotations(userProfile, book, callback);
                    else
                        callback([]);
                });
            }
            else
                callback([]);
        });
    }
    initializeToc(data) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentBook(function (book) {
                    if (book) {
                        self.pebl.storage.getToc(userProfile, book, function (toc) {
                            if (toc.length == 0) {
                                for (let section in data) {
                                    let pages = data[section];
                                    for (let pageKey in pages) {
                                        let pageMetadata = pages[pageKey];
                                        if (pageKey == "DynamicContent") {
                                            let documents = pageMetadata["documents"];
                                            for (let dynamicPageKey in documents) {
                                                let documentMetadata = documents[dynamicPageKey];
                                                documentMetadata["pageKey"] = dynamicPageKey;
                                                self.pebl.storage.saveToc(userProfile, book, documentMetadata);
                                            }
                                        }
                                        else {
                                            pageMetadata["pageKey"] = pageKey;
                                            pageMetadata["section"] = section;
                                            self.pebl.storage.saveToc(userProfile, book, pageMetadata);
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    getToc(callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentBook(function (book) {
                    if (book)
                        self.pebl.storage.getToc(userProfile, book, function (entries) {
                            let toc = {};
                            for (let i = 0; i < entries.length; i++) {
                                let entry = entries[i];
                                let sectionKey = entry["section"];
                                if (toc[sectionKey] == null) {
                                    toc[sectionKey] = {};
                                }
                                let section = toc[sectionKey];
                                if (sectionKey == "DynamicContent") {
                                    if (section["documents"] == null) {
                                        section["location"] = entry["location"];
                                        section["documents"] = {};
                                    }
                                    let dynamicSection = section["documents"];
                                    dynamicSection[entry["pageKey"]] = entry;
                                }
                                else
                                    section[entry["pageKey"]] = entry;
                            }
                            callback(toc);
                        });
                    else
                        callback({});
                });
            }
            else
                callback({});
        });
    }
    removeToc(id, section) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile)
                self.pebl.storage.getCurrentBook(function (book) {
                    if (book)
                        self.pebl.storage.removeToc(userProfile, book, section, id);
                });
        });
    }
    pullProgram(programId, callback) {
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let network = self.pebl.network;
                if (network && network.syncingProcess && network.syncingProcess.length > 0) {
                    network.syncingProcess[0].pullActivity('program', programId, function (activity) {
                        if (activity) {
                            callback(activity);
                        }
                        else {
                            callback();
                        }
                    });
                }
            }
        });
    }
    mergePrograms(oldProgram, newProgram) {
        let mergedProgram = activity_Program.merge(oldProgram, newProgram);
        return mergedProgram;
    }
    mergeInstitutions(oldInstitution, newInstitution) {
        let mergedInstitution = activity_Institution.merge(oldInstitution, newInstitution);
        return mergedInstitution;
    }
    mergeSystems(oldSystem, newSystem) {
        let mergedSystem = activity_System.merge(oldSystem, newSystem);
        return mergedSystem;
    }
    getProgram(programId, callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getActivityById(userProfile, "program", programId, function (activity) {
                    if (activity)
                        callback(activity);
                    else
                        callback();
                });
            }
        });
    }
    getInstitution(institutionId, callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getActivityById(userProfile, "institution", institutionId, function (activity) {
                    if (activity)
                        callback(activity);
                    else
                        callback();
                });
            }
        });
    }
    getSystem(systemId, callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getActivityById(userProfile, "system", systemId, function (activity) {
                    if (activity)
                        callback(activity);
                    else
                        callback();
                });
            }
        });
    }
    isProgramMember(program, userIdentity) {
        return activity_Program.isMember(program, userIdentity);
    }
    isInstitutionMember(institution, userIdentity) {
        return activity_Institution.isMember(institution, userIdentity);
    }
    isProgramMemberOfInstitution(institution, programId) {
        return activity_Institution.isProgram(institution, programId);
    }
    isSystemMember(system, userIdentity) {
        return activity_System.isMember(system, userIdentity);
    }
    removeProgram(programId, callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.removeActivity(userProfile, programId, 'program', callback);
            }
        });
    }
    removeInstitution(institutionId, callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.removeActivity(userProfile, institutionId, 'institution', callback);
            }
        });
    }
    newEmptyProgram(callback) {
        callback(new activity_Program({}));
    }
    newEmptyInstitution(callback) {
        callback(new activity_Institution({}));
    }
    newEmptySystem(callback) {
        callback(new activity_System({}));
    }
    getGroupMemberships(callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getGroupMembership(userProfile, callback);
            }
            else
                callback([]);
        });
    }
    getSpecificGroupMembership(groupId, callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getGroupMembership(userProfile, function (memberships) {
                    let result = null;
                    for (let membership of memberships) {
                        if (membership.membershipId === groupId)
                            result = membership;
                    }
                    callback(result);
                });
            }
            else
                callback(null);
        });
    }
    removeGroupMembership(groupId, callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.removeGroupMembership(userProfile, groupId, callback);
            }
        });
    }
    getPrograms(callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getActivity(userProfile, "program", function (activities) {
                    callback(activities);
                });
            }
            else
                callback([]);
        });
    }
    getInstitutions(callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getActivity(userProfile, "institution", function (activities) {
                    callback(activities);
                });
            }
            else
                callback([]);
        });
    }
    getSystems(callback) {
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getActivity(userProfile, "system", function (activities) {
                    callback(activities);
                });
            }
            else
                callback([]);
        });
    }
    getUuid() {
        /*!
          Excerpt from: Math.uuid.js (v1.4)
          http://www.broofa.com
          mailto:robert@broofa.com
          Copyright (c) 2010 Robert Kieffer
          Dual licensed under the MIT and GPL licenses.
        */
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid;
    }
    getInviteToken(token, callback) {
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let xhr = new XMLHttpRequest();
                //TODO: multiple endpoints?
                var endpoint = userProfile.endpoints[0];
                var pipeline = [{
                        "$match": {
                            "$and": [{
                                    "statement.verb.id": {
                                        "$in": [
                                            "http://www.peblproject.com/definitions.html#invited"
                                        ]
                                    }
                                },
                                {
                                    "statement.object.definition.name.en-US": {
                                        "$in": [
                                            token
                                        ]
                                    }
                                }]
                        }
                    }];
                xhr.addEventListener("load", function () {
                    let result = JSON.parse(xhr.responseText);
                    for (let i = 0; i < result.length; i++) {
                        let rec = result[i];
                        if (!rec.voided)
                            result[i] = rec.statement;
                        else
                            result.splice(i, 1);
                    }
                    if (callback != null) {
                        callback(result);
                    }
                });
                xhr.addEventListener("error", function () {
                    callback([]);
                });
                xhr.open("GET", endpoint.url + "api/statements/aggregate?pipeline=" + encodeURIComponent(JSON.stringify(pipeline)), true);
                xhr.setRequestHeader("Authorization", "Basic " + endpoint.token);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send();
            }
        });
    }
    getProgramActivityEvents(programId, callback) {
        let self = this;
        this.pebl.storage.getActivityEvent(programId, function (events) {
            callback(events.sort(self.sortByTimestamp));
        });
    }
    sortByTimestamp(a, b) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    iterateProgramMembers(program, callback) {
        activity_Program.iterateMembers(program, callback);
    }
    getProgramMembers(program) {
        return activity_Program.getMembers(program);
    }
    iterateInstitutionMembers(institution, callback) {
        activity_Institution.iterateMembers(institution, callback);
    }
    iterateInstitutionPrograms(institution, callback) {
        activity_Institution.iteratePrograms(institution, callback);
    }
    iterateSystemMembers(system, callback) {
        activity_System.iterateMembers(system, callback);
    }
    newTempMember(obj, callback) {
        let tm = new TempMembership(obj);
        callback(tm);
    }
    getNotifications(callback) {
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getNotifications(userProfile, function (notifications) {
                    callback(notifications);
                });
            }
            else {
                callback([]);
            }
        });
    }
    removeNotification(notificationId) {
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getNotification(userProfile, notificationId, (stmt) => {
                    if (stmt) {
                        self.pebl.storage.removeNotification(userProfile, notificationId);
                        let xType;
                        let xLocation;
                        if (SharedAnnotation.is(stmt)) {
                            xType = "sharedAnnotation";
                            xLocation = stmt.book;
                        }
                        else if (Message.is(stmt)) {
                            xType = "message";
                            xLocation = stmt.thread;
                        }
                        else if (Reference.is(stmt)) {
                            xType = "reference";
                            xLocation = stmt.book;
                        }
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            id: self.pebl.utils.getUuid(),
                            identity: userProfile.identity,
                            requestType: "deleteNotification",
                            records: [{
                                    id: stmt.id,
                                    type: xType,
                                    location: xLocation,
                                    stored: stmt.stored
                                }]
                        });
                    }
                });
            }
        });
    }
    getMessages(thread, callback) {
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getMessages(userProfile, thread, function (messages) {
                    callback(messages);
                });
            }
            else {
                callback([]);
            }
        });
    }
    getModuleEvents(idref, callback, type) {
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getModuleEvent(idref, function (moduleEvents) {
                    if (type) {
                        callback(moduleEvents.filter(event => event.verb.display['en-US'] === type));
                    }
                    else {
                        callback(moduleEvents);
                    }
                });
            }
            else {
                callback([]);
            }
        });
    }
    removeModuleEvent(idref, id) {
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.removeModuleEvent(idref, id);
            }
        });
    }
    getEvents(callback) {
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentBook(function (book) {
                    if (book) {
                        self.pebl.storage.getEvents(userProfile, book, callback);
                    }
                    else {
                        callback([]);
                    }
                });
            }
            else {
                callback([]);
            }
        });
    }
    getThreadTimestamps(identity, callback) {
        this.pebl.storage.getCompoundSyncTimestamps(identity, SYNC_THREAD, (threadSyncTimestamps) => {
            this.pebl.storage.getCompoundSyncTimestamps(identity, SYNC_PRIVATE_THREAD, (privateThreadSyncTimestamps) => {
                this.pebl.storage.getCompoundSyncTimestamps(identity, SYNC_GROUP_THREAD, (groupThreadSyncTimestamps) => {
                    callback(threadSyncTimestamps, privateThreadSyncTimestamps, groupThreadSyncTimestamps);
                });
            });
        });
    }
    saveThreadTimestamps(identity, threads, privateThreads, groupThreads, callback) {
        this.pebl.storage.saveCompoundSyncTimestamps(identity, SYNC_THREAD, threads, () => {
            this.pebl.storage.saveCompoundSyncTimestamps(identity, SYNC_PRIVATE_THREAD, privateThreads, () => {
                this.pebl.storage.saveCompoundSyncTimestamps(identity, SYNC_GROUP_THREAD, groupThreads, () => {
                    callback();
                });
            });
        });
    }
}
function pakoInflate(data) {
    return pako.inflate(data, stringObj);
}
function pakoDeflate(data) {
    return pako.deflate(data, stringObj);
}
function getBrowserMetadata() {
    return utils_platform;
}

// CONCATENATED MODULE: ./src/xapiGenerator.ts
const xapiGenerator_PREFIX_PEBL_EXTENSION = "https://www.peblproject.com/definitions.html#";
const PEBL_ACTIVITY_PREFIX = "http://www.peblproject.com/activities/";

class xapiGenerator_XApiGenerator {
    addExtensions(extensions) {
        let result = {};
        for (let key of Object.keys(extensions)) {
            result[xapiGenerator_PREFIX_PEBL_EXTENSION + key] = extensions[key];
        }
        return result;
    }
    addResult(stmt, score, minScore, maxScore, complete, success, answered, duration, extensions) {
        if (!stmt.result)
            stmt.result = {};
        stmt.result.success = success;
        stmt.result.completion = complete;
        stmt.result.response = answered;
        if (!stmt.result.score)
            stmt.result.score = {};
        stmt.result.score.raw = score;
        stmt.result.score.duration = duration;
        stmt.result.score.scaled = (score - minScore) / (maxScore - minScore);
        stmt.result.score.min = minScore;
        stmt.result.score.max = maxScore;
        if (extensions) {
            if (!stmt.result.extensions)
                stmt.result.extensions = {};
            for (let key of Object.keys(extensions)) {
                stmt.result.extensions[key] = extensions[key];
            }
        }
        return stmt;
    }
    addResultResponse(stmt, response, complete, duration, extensions) {
        if (!stmt.result)
            stmt.result = {};
        stmt.result.response = response;
        stmt.result.completion = complete;
        if (duration)
            stmt.result.duration = duration;
        if (extensions) {
            if (!stmt.result.extensions)
                stmt.result.extensions = {};
            for (let key of Object.keys(extensions)) {
                stmt.result.extensions[key] = extensions[key];
            }
        }
        return stmt;
    }
    addObject(stmt, activityId, name, description, activityType, extensions) {
        if (!stmt.object)
            stmt.object = {};
        stmt.object.id = activityId;
        stmt.object.objectType = "Activity";
        if (!stmt.object.definition)
            stmt.object.definition = {};
        if (name) {
            if (!stmt.object.definition.name)
                stmt.object.definition.name = {};
            stmt.object.definition.name["en-US"] = name;
        }
        if (description) {
            if (!stmt.object.definition.description)
                stmt.object.definition.description = {};
            stmt.object.definition.description["en-US"] = description;
        }
        if (activityType)
            stmt.object.definition.type = activityType;
        if (extensions)
            stmt.object.definition.extensions = extensions;
        return stmt;
    }
    memberToIndex(x, arr) {
        for (let i = 0; i < arr.length; i++)
            if (x == arr[i])
                return i;
        return -1;
    }
    arrayToIndexes(arr, indexArr) {
        let clone = arr.slice(0);
        for (let i = 0; i < arr.length; i++) {
            clone[i] = this.memberToIndex(arr[i], indexArr).toString();
        }
        return clone;
    }
    addObjectInteraction(stmt, activityId, name, prompt, interaction, answers, correctAnswers, extensions) {
        if (!stmt.object)
            stmt.object = {};
        stmt.object.id = activityId;
        stmt.object.objectType = "Activity";
        if (!stmt.object.definition)
            stmt.object.definition = {};
        if (!stmt.object.definition.name)
            stmt.object.definition.name = {};
        stmt.object.definition.type = "http://adlnet.gov/expapi/activities/cmi.interaction";
        stmt.object.definition.interactionType = interaction;
        let answerArr = [];
        for (let corrrectAnswer of correctAnswers)
            answerArr.push(this.arrayToIndexes(corrrectAnswer, answers).join("[,]"));
        stmt.object.definition.correctResponsesPattern = answerArr;
        if (interaction == "choice") {
            stmt.object.definition.choices = [];
            let i = 0;
            for (let answer of answers) {
                stmt.object.definition.choices.push({
                    id: i.toString(),
                    description: {
                        "en-US": answer
                    }
                });
                i++;
            }
        }
        stmt.object.definition.name["en-US"] = name;
        if (!stmt.object.definition.description)
            stmt.object.definition.description = {};
        stmt.object.definition.description["en-US"] = prompt;
        if (extensions)
            stmt.object.definition.extensions = extensions;
        return stmt;
    }
    addVerb(stmt, url, name) {
        stmt.verb = {
            id: url,
            display: {
                "en-US": name
            }
        };
        return stmt;
    }
    addActorAccount(stmt, userProfile) {
        if (!stmt.actor)
            stmt.actor = {};
        stmt.actor.objectType = "Agent";
        stmt.actor.name = userProfile.name || userProfile.identity;
        stmt.actor.account = {
            homePage: userProfile.homePage,
            name: userProfile.identity
        };
        return stmt;
    }
    addActorMBox(stmt, userProfile) {
        if (!stmt.actor)
            stmt.actor = {};
        stmt.actor.objectType = "Agent";
        stmt.actor.name = userProfile.name;
        stmt.actor.mbox = userProfile.identity;
        return stmt;
    }
    addTimestamp(stmt) {
        if (!stmt.timestamp)
            stmt.timestamp = new Date().toISOString();
        return stmt;
    }
    addStatementRef(stmt, id) {
        if (!stmt.object)
            stmt.object = {};
        stmt.object.objectType = "StatementRef";
        stmt.object.id = id;
        return stmt;
    }
    addId(stmt) {
        /*!
          Excerpt from: Math.uuid.js (v1.4)
          http://www.broofa.com
          mailto:robert@broofa.com
          Copyright (c) 2010 Robert Kieffer
          Dual licensed under the MIT and GPL licenses.
        */
        stmt.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return stmt;
    }
    addContext(stmt, options) {
        stmt.context = options;
        return stmt;
    }
    addParentActivity(stmt, parentId) {
        if (!stmt.context)
            stmt.context = {};
        if (!stmt.context.contextActivities)
            stmt.context.contextActivities = {};
        if (!stmt.context.contextActivities.parent)
            stmt.context.contextActivities.parent = [];
        stmt.context.contextActivities.parent.push({
            objectType: "Activity",
            id: parentId
        });
        return stmt;
    }
    addPeblContextExtensions(obj, userProfile, bookTitle, bookId) {
        let platform = getBrowserMetadata();
        obj.browserName = platform.name;
        obj.browserVersion = platform.version;
        obj.osName = platform.os.family;
        obj.osVersion = platform.os.version;
        obj.contextOrigin = window.location.origin;
        obj.contextUrl = window.location.href;
        if (userProfile.currentTeam)
            obj.currentTeam = userProfile.currentTeam;
        if (userProfile.currentClass)
            obj.currentClass = userProfile.currentClass;
        if (bookTitle)
            obj.bookTitle = bookTitle;
        if (bookId)
            obj.bookId = bookId;
        return obj;
    }
    addPeblActivity(activityURI, activityType, activityId) {
        if (activityURI)
            return activityURI;
        if (activityType) {
            var peblActivity = PEBL_ACTIVITY_PREFIX + activityType;
            if (activityId)
                peblActivity += ('?id=' + activityId);
            return peblActivity;
        }
        return 'pebl://deprecated';
    }
    addAttachments(stmt, attachments) {
        if (!stmt.attachments)
            stmt.attachments = attachments;
        return stmt;
    }
}

// CONCATENATED MODULE: ./src/eventHandlers.ts
const PEBL_PREFIX = "";
// const PEBL_THREAD_PREFIX = "peblThread://";
const PEBL_THREAD_USER_PREFIX = "peblThread://user-";
// const PEBL_THREAD_ARTIFACT_PREFIX = "peblThread://artifact-";
const PEBL_THREAD_GROUP_PREFIX = "peblThread://group-";




class eventHandlers_PEBLEventHandlers {
    constructor(pebl) {
        this.pebl = pebl;
        this.xapiGen = new xapiGenerator_XApiGenerator();
    }
    // -------------------------------
    newBook(event) {
        let payload = event.detail;
        let book = payload.book;
        let bookTitle = payload.bookTitle;
        let bookId = payload.bookId;
        let self = this;
        // if (book.indexOf("/") != -1)
        //     book = book.substring(book.lastIndexOf("/") + 1);
        this.pebl.storage.getCurrentBook(function (currentBook) {
            if (currentBook != book) {
                if (currentBook)
                    self.pebl.emitEvent(self.pebl.events.eventTerminated, {
                        activityURI: currentBook,
                        activityType: 'book'
                    });
                self.pebl.storage.removeCurrentActivity();
                // self.pebl.emitEvent(self.pebl.events.eventInteracted, {
                //     activity: book
                // });
                self.pebl.unsubscribeAllEvents();
                self.pebl.unsubscribeAllThreads();
                self.pebl.storage.saveCurrentBook(book);
                self.pebl.storage.saveCurrentBookTitle(bookTitle);
                self.pebl.storage.saveCurrentBookId(bookId);
            }
            else {
                self.pebl.emitEvent(self.pebl.events.eventJumpPage, {});
            }
            self.pebl.emitEvent(self.pebl.events.eventLaunched, {
                activityType: 'book'
            });
        });
    }
    newBookNoReset(event) {
        let payload = event.detail;
        let book = payload.book;
        let bookTitle = payload.bookTitle;
        let bookId = payload.bookId;
        let self = this;
        // if (book.indexOf("/") != -1)
        //     book = book.substring(book.lastIndexOf("/") + 1);
        this.pebl.storage.getCurrentBook(function (currentBook) {
            if (currentBook != book) {
                if (currentBook)
                    self.pebl.emitEvent(self.pebl.events.eventTerminated, currentBook);
                self.pebl.storage.removeCurrentActivity();
                self.pebl.emitEvent(self.pebl.events.eventInteracted, {
                    activity: book,
                    target: book
                });
                self.pebl.storage.saveCurrentBook(book);
                self.pebl.storage.saveCurrentBookTitle(bookTitle);
                self.pebl.storage.saveCurrentBookId(bookId);
            }
            else {
                self.pebl.emitEvent(self.pebl.events.eventJumpPage, {});
            }
        });
    }
    newActivity(event) {
        let payload = event.detail;
        let self = this;
        this.pebl.storage.getCurrentActivity(function (currentActivity) {
            if (payload.activity != currentActivity) {
                if (currentActivity)
                    self.pebl.emitEvent(self.pebl.events.eventTerminated, currentActivity);
                self.pebl.emitEvent(self.pebl.events.eventInitialized, {
                    name: payload.name,
                    description: payload.description
                });
            }
            self.pebl.storage.saveCurrentActivity(payload.activity);
        });
    }
    newReference(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            docType: payload.docType,
            location: payload.location,
            card: payload.card,
            url: payload.url,
            book: payload.book,
            externalURL: payload.externalURL,
            target: payload.target
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                var pulled = userProfile.identity == payload.target;
                                if (pulled)
                                    self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#pulled", "pulled");
                                else
                                    self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#pushed", "pushed");
                                if (activity || book)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                let s = new Reference(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveReferences",
                                    references: [s]
                                });
                                self.pebl.storage.saveQueuedReference(userProfile, s);
                                if (pulled)
                                    self.pebl.emitEvent(PEBL_THREAD_USER_PREFIX + payload.target, [s]);
                            }
                        });
                    });
                });
            });
        });
    }
    newMessage(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            access: payload.access,
            type: payload.type,
            replyThread: payload.replyThread,
            groupId: payload.groupId,
            isPrivate: payload.isPrivate,
            book: payload.book,
            idRef: payload.idRef,
            cfi: payload.cfi,
            peblAction: payload.peblAction,
            thread: payload.thread
        };
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/responded", "responded");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.prompt, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addResultResponse(xapi, payload.text, true, payload.duration, payload.additionalResultData ? self.xapiGen.addExtensions(payload.additionalResultData) : undefined);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let message = new Message(xapi);
                                let clone = JSON.parse(JSON.stringify(message));
                                self.pebl.storage.saveMessages(userProfile, message);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: message.id,
                                    requestType: "saveThreadedMessage",
                                    message: clone
                                });
                                self.pebl.emitEvent(message.thread, [message]);
                            });
                        });
                    });
                });
            }
        });
    }
    reportedMessage(event) {
        let payload = event.detail;
        payload.message = new Message(payload.message);
        this.pebl.user.getUser((userProfile) => {
            if (userProfile) {
                let clone = JSON.parse(JSON.stringify(payload.message));
                this.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: payload.message.id,
                    requestType: "reportThreadedMessage",
                    message: clone
                });
            }
        });
    }
    pinnedMessage(event) {
        let payload = event.detail;
        payload.message.pinned = true;
        payload.message = new Message(payload.message);
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let clone = JSON.parse(JSON.stringify(payload.message));
                self.pebl.storage.saveMessages(userProfile, [payload.message]);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: payload.message.id,
                    requestType: "pinThreadedMessage",
                    message: clone
                });
            }
        });
    }
    unpinnedMessage(event) {
        let payload = event.detail;
        payload.message.pinned = false;
        payload.message = new Message(payload.message);
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let clone = JSON.parse(JSON.stringify(payload.message));
                self.pebl.storage.saveMessages(userProfile, [payload.message]);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: payload.message.id,
                    requestType: "unpinThreadedMessage",
                    message: clone
                });
            }
        });
    }
    eventNoted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            access: payload.access,
            type: payload.type,
            isPrivate: payload.isPrivate,
            book: payload.book,
            idRef: payload.idRef,
            cfi: payload.cfi,
            peblAction: payload.peblAction,
            thread: payload.thread
        };
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/noted", "noted");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.prompt, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addResultResponse(xapi, payload.text, true, payload.duration, payload.additionalResultData ? self.xapiGen.addExtensions(payload.additionalResultData) : undefined);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let message = new Message(xapi);
                                let clone = JSON.parse(JSON.stringify(message));
                                self.pebl.storage.saveMessages(userProfile, message);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: message.id,
                                    requestType: "saveThreadedMessage",
                                    message: clone
                                });
                                self.pebl.emitEvent(message.thread, [message]);
                            });
                        });
                    });
                });
            }
        });
    }
    removedMessage(event) {
        let payload = event.detail;
        payload.message = new Message(payload.message);
        let xapi = {};
        let self = this;
        let exts = {
            groupId: payload.message.groupId,
            isPrivate: payload.message.isPrivate,
            thread: payload.message.thread,
            messageId: payload.message.id
        };
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#removed", "removed");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.message.prompt, payload.message.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let clone = JSON.parse(JSON.stringify(payload.message));
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: payload.message.id,
                                    requestType: "deleteThreadedMessage",
                                    message: clone
                                });
                                self.pebl.storage.removeMessage(userProfile, payload.message.id);
                            });
                        });
                    });
                });
            }
        });
    }
    newLearnlet(event) {
        // let payload = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                // let exts = {
                //     cfi: payload.cfi
                // };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        // self.xapiGen.addId(xapi);
                        // self.xapiGen.addTimestamp(xapi);
                        // self.xapiGen.addActorAccount(xapi, userProfile);
                        // self.xapiGen.addObject(xapi, PEBL_THREAD_USER_PREFIX + payload.thread, payload.learnletId, payload.learnletDescription, exts);
                        // self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#learnletCreated", "learnletCreated");
                        // if (book || activity)
                        //     self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                        let m = new Learnlet(xapi);
                        self.pebl.storage.saveOutgoingActivity(userProfile, {
                            identity: userProfile.identity,
                            id: m.id,
                            requestType: "saveActivities",
                            activities: [m]
                        });
                        // self.pebl.storage.saveEvent(userProfile, m);
                    });
                });
            }
        });
    }
    saveProgram(event) {
        let payload = event.detail;
        let prog = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    role: "owner",
                    activityType: "program"
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        if (activity_Program.isNew(prog)) {
                            self.xapiGen.addId(xapi);
                            self.xapiGen.addTimestamp(xapi);
                            self.xapiGen.addActorAccount(xapi, userProfile);
                            self.xapiGen.addObject(xapi, PEBL_THREAD_USER_PREFIX + userProfile.identity, prog.id, prog.programShortDescription, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                            self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#joined", "joined");
                            if (book || activity)
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                            let m = new Membership(xapi);
                            prog.addMember(m);
                            self.pebl.storage.saveGroupMembership(userProfile, m);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: m.id,
                                requestType: "saveMemberships",
                                memberships: [m]
                            });
                        }
                        self.pebl.storage.saveOutgoingActivity(userProfile, {
                            identity: userProfile.identity,
                            id: prog.id,
                            requestType: "saveActivities",
                            activities: [prog]
                        });
                        self.pebl.storage.saveActivity(userProfile, prog);
                        self.pebl.emitEvent(self.pebl.events.incomingProgram, [prog]);
                    });
                });
            }
        });
    }
    saveInstitution(event) {
        let payload = event.detail;
        let inst = new activity_Institution(event.detail);
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    role: "owner",
                    activityType: "institution"
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        if (activity_Institution.isNew(inst)) {
                            self.xapiGen.addId(xapi);
                            self.xapiGen.addTimestamp(xapi);
                            self.xapiGen.addActorAccount(xapi, userProfile);
                            self.xapiGen.addObject(xapi, PEBL_THREAD_USER_PREFIX + userProfile.identity, inst.id, inst.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                            self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#joined", "joined");
                            if (book || activity)
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                            let m = new Membership(xapi);
                            inst.addMember(m);
                            self.pebl.storage.saveGroupMembership(userProfile, m);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: m.id,
                                requestType: "saveMemberships",
                                memberships: [m]
                            });
                        }
                        self.pebl.storage.saveOutgoingActivity(userProfile, {
                            identity: userProfile.identity,
                            id: inst.id,
                            requestType: "saveActivities",
                            activities: [inst]
                        });
                        self.pebl.storage.saveActivity(userProfile, inst);
                        self.pebl.emitEvent(self.pebl.events.incomingInstitition, [inst]);
                    });
                });
            }
        });
    }
    saveSystem(event) {
        let payload = event.detail;
        let system = new activity_System(event.detail);
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    role: "owner",
                    activityType: "system"
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        if (activity_System.isNew(system)) {
                            self.xapiGen.addId(xapi);
                            self.xapiGen.addTimestamp(xapi);
                            self.xapiGen.addActorAccount(xapi, userProfile);
                            self.xapiGen.addObject(xapi, PEBL_THREAD_USER_PREFIX + userProfile.identity, system.id, system.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                            self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#joined", "joined");
                            if (book || activity)
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                            let m = new Membership(xapi);
                            system.addMember(m);
                            self.pebl.storage.saveGroupMembership(userProfile, m);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: m.id,
                                requestType: "saveMemberships",
                                memberships: [m]
                            });
                        }
                        self.pebl.storage.saveOutgoingActivity(userProfile, {
                            identity: userProfile.identity,
                            id: system.id,
                            requestType: "saveActivities",
                            activities: [system]
                        });
                        self.pebl.storage.saveActivity(userProfile, system);
                        self.pebl.emitEvent(self.pebl.events.incomingSystem, [system]);
                    });
                });
            }
        });
    }
    // newArtifact(event: CustomEvent) {
    //     let payload = event.detail;
    //     let xapi = {};
    //     let self = this;
    //     this.pebl.user.getUser(function(userProfile) {
    //         if (userProfile) {
    //             let exts = {
    //                 role: payload.role
    //             };
    //             self.pebl.storage.getCurrentActivity(function(activity) {
    //                 self.pebl.storage.getCurrentBook(function(book) {
    //                     self.xapiGen.addId(xapi);
    //                     self.xapiGen.addTimestamp(xapi);
    //                     self.xapiGen.addActorAccount(xapi, userProfile);
    //                     self.xapiGen.addObject(xapi, PEBL_THREAD_ARTIFACT_PREFIX + payload.thread, payload.artifactId, payload.artifactDescription, self.xapiGen.addExtensions(exts));
    //                     self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#artifactCreated", "artifactCreated");
    //                     if (book || activity)
    //                         self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
    //                     let m = new Artifact(xapi);
    //                     self.pebl.storage.saveOutgoingXApi(userProfile, m);
    //                     self.pebl.storage.saveEvent(userProfile, m);
    //                 });
    //             });
    //         }
    //     });
    // }
    newMembership(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    role: payload.role,
                    activityType: payload.activityType,
                    organization: payload.organization,
                    organizationName: payload.organizationName
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, PEBL_THREAD_USER_PREFIX + payload.thread, payload.groupId, payload.groupDescription, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                        self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#joined", "joined");
                        if (book || activity)
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                        let m = new Membership(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: m.id,
                            requestType: "saveMemberships",
                            memberships: [m]
                        });
                        self.pebl.emitEvent(self.pebl.events.incomingMembership, [m]);
                        if (payload.thread == userProfile.identity)
                            self.pebl.storage.saveGroupMembership(userProfile, m);
                    });
                });
            }
        });
    }
    modifiedMembership(event) {
        let payload = event.detail;
        let oldMembership = payload.oldMembership;
        let newMembership = payload.newMembership;
        let xapiVoided = {};
        let xapiNew = {
            id: ''
        };
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let newUserProfile = new UserProfile({
                    identity: oldMembership.actor.account.name,
                    name: oldMembership.actor.name,
                    homePage: oldMembership.actor.account.homePage,
                    preferredName: oldMembership.actor.name
                });
                // First void the old membership
                self.xapiGen.addId(xapiVoided);
                self.xapiGen.addVerb(xapiVoided, "http://adlnet.gov/expapi/verbs/voided", "voided");
                self.xapiGen.addTimestamp(xapiVoided);
                self.xapiGen.addStatementRef(xapiVoided, oldMembership.id);
                self.xapiGen.addActorAccount(xapiVoided, newUserProfile);
                self.xapiGen.addParentActivity(xapiVoided, PEBL_PREFIX + oldMembership.id);
                let m = new Voided(xapiVoided);
                // If modifying my own membership
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: m.id,
                    xId: oldMembership.id,
                    requestType: "deleteMembership"
                });
                if (newUserProfile.identity === userProfile.identity)
                    self.pebl.storage.removeGroupMembership(newUserProfile, oldMembership.id);
                self.pebl.emitEvent(self.pebl.events.incomingMembership, [m]);
                // Then send out a new one
                if (newMembership) {
                    let exts = {
                        role: newMembership.role,
                        activityType: newMembership.activityType,
                        organization: newMembership.organization,
                        organizationName: newMembership.organizationName
                    };
                    self.pebl.storage.getCurrentActivity(function (activity) {
                        self.pebl.storage.getCurrentBook(function (book) {
                            xapiNew.id = newMembership.id;
                            self.xapiGen.addTimestamp(xapiNew);
                            self.xapiGen.addActorAccount(xapiNew, newUserProfile);
                            self.xapiGen.addObject(xapiNew, PEBL_THREAD_USER_PREFIX + newUserProfile.identity, newMembership.membershipId, newMembership.groupDescription, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                            self.xapiGen.addVerb(xapiNew, "http://www.peblproject.com/definitions.html#joined", "joined");
                            if (book || activity)
                                self.xapiGen.addParentActivity(xapiNew, PEBL_PREFIX + (book || activity));
                            let n = new Membership(xapiNew);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: n.id,
                                requestType: "saveMemberships",
                                memberships: [n]
                            });
                            self.pebl.emitEvent(self.pebl.events.incomingMembership, [n]);
                            if (newUserProfile.identity === userProfile.identity)
                                self.pebl.storage.saveGroupMembership(userProfile, n);
                        });
                    });
                }
            }
        });
    }
    removedMembership(event) {
        let xId = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/voided", "voided");
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addStatementRef(xapi, xId);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + xId);
                        let m = new Voided(xapi);
                        self.pebl.storage.removeGroupMembership(userProfile, xId);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: m.id,
                            xId: xId,
                            requestType: "deleteMembership"
                        });
                        self.pebl.emitEvent(self.pebl.events.incomingMembership, [m]);
                    });
                });
            }
        });
    }
    newAnnotation(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    type: payload.type,
                    cfi: payload.cfi,
                    idRef: payload.idRef,
                    style: payload.style
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/commented", "commented");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.title, payload.text, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let annotation = new Annotation(xapi);
                                self.pebl.storage.saveAnnotations(userProfile, annotation);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: annotation.id,
                                    requestType: "saveAnnotations",
                                    stmts: [annotation]
                                });
                                self.pebl.emitEvent(self.pebl.events.incomingAnnotations, [annotation]);
                            });
                        });
                    });
                });
            }
        });
    }
    eventBookmarked(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    type: payload.type,
                    cfi: payload.cfi,
                    idRef: payload.idRef,
                    style: payload.style
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#bookmarked", "bookmarked");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.title, payload.text, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let annotation = new Annotation(xapi);
                                self.pebl.storage.saveAnnotations(userProfile, annotation);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: annotation.id,
                                    requestType: "saveAnnotations",
                                    stmts: [annotation]
                                });
                                self.pebl.emitEvent(self.pebl.events.incomingAnnotations, [annotation]);
                            });
                        });
                    });
                });
            }
        });
    }
    eventUnbookmarked(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            idref: payload.idref,
            cfi: payload.cfi
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#unbookmarked", "unbookmarked");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventAnnotated(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    type: payload.type,
                    cfi: payload.cfi,
                    idRef: payload.idRef,
                    style: payload.style
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#annotated", "annotated");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.title, payload.text, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let annotation = new Annotation(xapi);
                                self.pebl.storage.saveAnnotations(userProfile, annotation);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: annotation.id,
                                    requestType: "saveAnnotations",
                                    stmts: [annotation]
                                });
                                self.pebl.emitEvent(self.pebl.events.incomingAnnotations, [annotation]);
                            });
                        });
                    });
                });
            }
        });
    }
    newSharedAnnotation(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    type: payload.type,
                    cfi: payload.cfi,
                    idRef: payload.idRef,
                    style: payload.style,
                    groupId: payload.groupId
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/shared", "shared");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.title, payload.text, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let annotation = new SharedAnnotation(xapi);
                                self.pebl.storage.saveSharedAnnotations(userProfile, annotation);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: annotation.id,
                                    requestType: "saveSharedAnnotations",
                                    stmts: [annotation]
                                });
                                self.pebl.emitEvent(self.pebl.events.incomingSharedAnnotations, [annotation]);
                            });
                        });
                    });
                });
            }
        });
    }
    pinnedAnnotation(event) {
        let payload = event.detail;
        payload.pinned = true;
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let clone = JSON.parse(JSON.stringify(payload));
                self.pebl.storage.saveSharedAnnotations(userProfile, [payload]);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: clone.id,
                    requestType: "pinSharedAnnotation",
                    annotation: clone
                });
            }
        });
    }
    unpinnedAnnotation(event) {
        let payload = event.detail;
        payload.pinned = false;
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let clone = JSON.parse(JSON.stringify(payload));
                self.pebl.storage.saveSharedAnnotations(userProfile, [payload]);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: clone.id,
                    requestType: "unpinSharedAnnotation",
                    annotation: clone
                });
            }
        });
    }
    eventUnsharedAnnotation(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    cfi: payload.cfi,
                    idRef: payload.idRef
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#unshared", "unshared");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            });
                        });
                    });
                });
            }
        });
    }
    eventUnannotated(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                let exts = {
                    cfi: payload.cfi,
                    idRef: payload.idRef
                };
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#unannotated", "unannotated");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            });
                        });
                    });
                });
            }
        });
    }
    removedAnnotation(event) {
        let xId = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                else
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + book);
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/voided", "voided");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addStatementRef(xapi, xId);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let annotation = new Voided(xapi);
                                self.pebl.storage.removeAnnotation(userProfile, xId);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: annotation.id,
                                    xId: xId,
                                    requestType: "deleteAnnotation"
                                });
                                self.pebl.emitEvent(self.pebl.events.incomingAnnotations, [annotation]);
                            });
                        });
                    });
                });
            }
        });
    }
    removedSharedAnnotation(event) {
        let sharedAnnotation = event.detail;
        let xapi = {};
        let self = this;
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/voided", "voided");
                self.xapiGen.addTimestamp(xapi);
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                else
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + book);
                                self.xapiGen.addStatementRef(xapi, sharedAnnotation.id);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                let voided = new Voided(xapi);
                                self.pebl.storage.removeSharedAnnotation(userProfile, sharedAnnotation.id);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: sharedAnnotation.id,
                                    annotation: sharedAnnotation,
                                    requestType: "deleteSharedAnnotation"
                                });
                                self.pebl.emitEvent(self.pebl.events.incomingSharedAnnotations, [voided]);
                            });
                        });
                    });
                });
            }
        });
    }
    // -------------------------------
    eventLoggedIn(event) {
        let userP = new UserProfile(event.detail);
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            self.pebl.storage.saveUserProfile(userP, function () {
                self.pebl.network.activate(() => {
                    if (!userProfile || (userProfile.identity !== userP.identity || userProfile.currentTeam !== userP.currentTeam || userProfile.currentClass !== userP.currentClass)) {
                        self.pebl.emitEvent(self.pebl.events.eventLogin, {
                            userProfile: userP,
                            activityType: 'login'
                        });
                    }
                });
            });
        });
    }
    eventLoggedOut(event) {
        let self = this;
        this.pebl.user.getUser(function (currentUser) {
            self.pebl.network.disable(function () {
                self.pebl.storage.removeCurrentUser(() => {
                    self.pebl.emitEvent(self.pebl.events.eventLogout, {
                        userProfile: currentUser,
                        activityType: 'login'
                    });
                });
            });
        });
    }
    // -------------------------------
    eventSessionStart(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#entered", "entered");
                                if (book || activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                                let s = new Session(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveSessions",
                                    sessions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            });
                        });
                    });
                });
            }
        });
    }
    eventSessionStop(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#exited", "exited");
                                if (book || activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                                let s = new Session(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveSessions",
                                    sessions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            });
                        });
                    });
                });
            }
        });
    }
    eventLaunched(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                            self.pebl.storage.getCurrentBookId(function (bookId) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#launched", "launched");
                                if (book || activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (book || activity));
                                let s = new Session(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveSessions",
                                    sessions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            });
                        });
                    });
                });
            }
        });
    }
    // -------------------------------
    eventTerminated(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.user.getUser(function (userProfile) {
            self.pebl.storage.getCurrentActivity(function (activity) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        if (userProfile) {
                            self.xapiGen.addId(xapi);
                            self.xapiGen.addTimestamp(xapi);
                            self.xapiGen.addActorAccount(xapi, userProfile);
                            self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                            self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/terminated", "terminated");
                            if (activity)
                                self.xapiGen.addParentActivity(xapi, activity);
                            let s = new Session(xapi);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: s.id,
                                requestType: "saveSessions",
                                sessions: [s]
                            });
                            self.pebl.storage.saveEvent(userProfile, s);
                        }
                    });
                });
            });
        });
    }
    eventInitialized(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    self.pebl.user.getUser(function (userProfile) {
                        if (userProfile && book) {
                            self.xapiGen.addId(xapi);
                            self.xapiGen.addTimestamp(xapi);
                            self.xapiGen.addActorAccount(xapi, userProfile);
                            self.xapiGen.addObject(xapi, book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                            self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/initialized", "initialized");
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + payload.activity);
                            let s = new Session(xapi);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: s.id,
                                requestType: "saveSessions",
                                sessions: [s]
                            });
                            self.pebl.storage.saveEvent(userProfile, s);
                        }
                    });
                });
            });
        });
    }
    eventInteracted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.user.getUser(function (userProfile) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    if (userProfile) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                        self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/interacted", "interacted");
                        self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + payload.activity);
                        let s = new Action(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: s.id,
                            requestType: "saveActions",
                            actions: [s]
                        });
                        self.pebl.storage.saveEvent(userProfile, s);
                    }
                });
            });
        });
    }
    eventJumpPage(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    self.pebl.storage.getCurrentActivity(function (activity) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#paged-jump", "paged-jump");
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Navigation(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveNavigations",
                                    navigations: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    // -------------------------------
    eventAttempted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObjectInteraction(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.prompt, "choice", payload.answers, payload.correctAnswers, self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addResult(xapi, payload.score, payload.minScore, payload.maxScore, payload.complete, payload.success, payload.answered);
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#attempted", "attempted");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                let s = new Question(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveQuestions",
                                    questions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventPassed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addResult(xapi, payload.score, payload.minScore, payload.maxScore, payload.complete, payload.success);
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/passed", "passed");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                let s = new Quiz(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveQuizes",
                                    quizes: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventFailed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addResult(xapi, payload.score, payload.minScore, payload.maxScore, payload.complete, payload.success);
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/failed", "failed");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                let s = new Quiz(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveQuizes",
                                    quizes: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    // -------------------------------
    eventPreferred(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/preferred", "preferred");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventUploadedMedia(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.mediaId
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#uploaded", "uploaded");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + (activity || book));
                                self.xapiGen.addAttachments(xapi, payload.attachments);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventContentMorphed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#morphed", "morphed");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventExperienced(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            idref: payload.idref,
            cfi: payload.cfi,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#experienced", "experienced");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventDisliked(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#disliked", "disliked");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventLiked(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#liked", "liked");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventAccessed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            idref: payload.idref,
            cfi: payload.cfi,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#accessed", "accessed");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventSubmitted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            idref: payload.idref,
            cfi: payload.cfi,
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#submitted", "submitted");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventHid(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#hid", "hid");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventShowed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#showed", "showed");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventDisplayed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#displayed", "displayed");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventUndisplayed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#undisplayed", "undisplayed");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventSearched(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#searched", "searched");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventSelected(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#selected", "selected");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventDiscarded(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            target: payload.target,
            type: payload.type
        };
        this.pebl.storage.getCurrentActivity(function (activity) {
            self.pebl.storage.getCurrentBook(function (book) {
                self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                    self.pebl.storage.getCurrentBookId(function (bookId) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#discarded", "discarded");
                                self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Action(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveActions",
                                    actions: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventNextPage(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            firstCfi: payload.firstCfi,
            lastCfi: payload.lastCfi
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    self.pebl.storage.getCurrentActivity(function (activity) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#paged-next", "paged-next");
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Navigation(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveNavigations",
                                    navigations: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventPrevPage(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            firstCfi: payload.firstCfi,
            lastCfi: payload.lastCfi
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    self.pebl.storage.getCurrentActivity(function (activity) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#paged-prev", "paged-prev");
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Navigation(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveNavigations",
                                    navigations: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventCompleted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    self.pebl.storage.getCurrentActivity(function (activity) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/completed", "completed");
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let s = new Navigation(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: s.id,
                                    requestType: "saveNavigations",
                                    navigations: [s]
                                });
                                self.pebl.storage.saveEvent(userProfile, s);
                            }
                        });
                    });
                });
            });
        });
    }
    eventCompatibilityTested(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            readerName: payload.readerName,
            osName: payload.osName,
            osVersion: payload.osVersion,
            browserName: payload.browserName,
            browserVersion: payload.browserVersion,
            userAgent: payload.userAgent,
            appVersion: payload.appVersion,
            platform: payload.platform,
            vendor: payload.vendor,
            testResults: payload.testResults
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    self.pebl.storage.getCurrentActivity(function (activity) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#compatibilityTested", "compatibilityTested");
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let test = new CompatibilityTest(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: test.id,
                                    requestType: "saveCompatibilityTests",
                                    tests: [test]
                                });
                            }
                        });
                    });
                });
            });
        });
    }
    eventChecklisted(event) {
    }
    eventHelped(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentActivity(function (activity) {
                self.pebl.user.getUser(function (userProfile) {
                    if (userProfile) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.name, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile)));
                        self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#helped", "helped");
                        if (activity)
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                        let s = new Navigation(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: s.id,
                            requestType: "saveNavigations",
                            navigations: [s]
                        });
                        self.pebl.storage.saveEvent(userProfile, s);
                    }
                });
            });
        });
    }
    eventInvited(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            programId: payload.programId,
            programRole: payload.programRole
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentActivity(function (activity) {
                self.pebl.user.getUser(function (userProfile) {
                    if (userProfile) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, PEBL_PREFIX + 'Harness', payload.token, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                        self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#invited", "invited");
                        if (activity)
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                        let invite = new Invitation(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: invite.id,
                            requestType: "saveInvites",
                            invites: [invite]
                        }); //TODO
                    }
                });
            });
        });
    }
    eventUninvited(event) {
        let xId = event.detail;
        let xapi = {};
        let self = this;
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/voided", "voided");
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addStatementRef(xapi, xId);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + 'Harness');
                        let uninvite = new Voided(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: uninvite.id,
                            xId: xId,
                            requestType: "deleteInvite"
                        });
                    });
                });
            }
        });
    }
    eventProgramLevelUp(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programLevelUp", "programLevelUp");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramLevelDown(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programLevelDown", "programLevelDown");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramInvited(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programInvited", "programInvited");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramUninvited(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programUninvited", "programUninvited");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramJoined(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programJoined", "programJoined");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramExpelled(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programExpelled", "programExpelled");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramActivityLaunched(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programActivityLaunched", "programActivityLaunched");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramActivityCompleted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programActivityCompleted", "programActivityCompleted");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramActivityTeamCompleted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programActivityTeamCompleted", "programActivityTeamCompleted");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramModified(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programModified", "programModified");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramDeleted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programDeleted", "programDeleted");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramCompleted(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programCompleted", "programCompleted");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramCopied(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programCopied", "programCopied");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    eventProgramDiscussed(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            previousValue: payload.previousValue,
            newValue: payload.newValue,
            action: payload.action
        };
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#programDiscussed", "programDiscussed");
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addActorAccount(xapi, userProfile);
                self.xapiGen.addObject(xapi, PEBL_THREAD_GROUP_PREFIX + payload.programId, payload.programId, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                let pa = new ProgramAction(xapi);
                self.pebl.storage.saveOutgoingXApi(userProfile, {
                    identity: userProfile.identity,
                    id: pa.id,
                    requestType: "saveActivityEvents",
                    events: [pa]
                });
            }
        });
    }
    // -------------------------------
    eventLogin(event) {
        let payload = event.detail;
        let userProfile = payload.userProfile;
        let xapi = {};
        let self = this;
        let exts = {};
        this.pebl.storage.saveCurrentUser(userProfile, function () {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/logged-in", "logged-in");
                self.pebl.storage.getCurrentBook(function (book) {
                    self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                        self.pebl.storage.getCurrentBookId(function (bookId) {
                            if (book)
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                            else
                                self.xapiGen.addObject(xapi, window.location.origin, undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile)));
                            self.xapiGen.addActorAccount(xapi, userProfile);
                            let session = new Session(xapi);
                            self.pebl.storage.saveEvent(userProfile, session);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: session.id,
                                requestType: "saveSessions",
                                sessions: [session]
                            });
                        });
                    });
                });
            }
        });
    }
    eventLogout(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {};
        self.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.xapiGen.addId(xapi);
                self.xapiGen.addTimestamp(xapi);
                self.xapiGen.addVerb(xapi, "http://adlnet.gov/expapi/verbs/logged-out", "logged-out");
                self.pebl.storage.getCurrentBook(function (book) {
                    self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                        self.pebl.storage.getCurrentBookId(function (bookId) {
                            if (book)
                                self.xapiGen.addObject(xapi, PEBL_PREFIX + book, undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                            else
                                self.xapiGen.addObject(xapi, window.location.origin, undefined, undefined, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile)));
                            self.xapiGen.addActorAccount(xapi, userProfile);
                            let session = new Session(xapi);
                            self.pebl.storage.saveEvent(userProfile, session);
                            self.pebl.storage.saveOutgoingXApi(userProfile, {
                                identity: userProfile.identity,
                                id: session.id,
                                requestType: "saveSessions",
                                sessions: [session]
                            });
                        });
                    });
                });
            }
        });
    }
    // -------------------------------
    eventModuleRating(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            idref: payload.idref,
            programId: payload.programId
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentActivity(function (activity) {
                self.pebl.user.getUser(function (userProfile) {
                    if (userProfile) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#moduleRating", "moduleRating");
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.rating, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile)));
                        if (activity)
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                        let mr = new ModuleRating(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: mr.id,
                            requestType: "saveModuleEvents",
                            events: [mr]
                        });
                    }
                });
            });
        });
    }
    eventModuleFeedback(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            willingToDiscuss: payload.willingToDiscuss,
            idref: payload.idref,
            programId: payload.programId
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentBookTitle(function (bookTitle) {
                self.pebl.storage.getCurrentBookId(function (bookId) {
                    self.pebl.storage.getCurrentActivity(function (activity) {
                        self.pebl.user.getUser(function (userProfile) {
                            if (userProfile) {
                                self.xapiGen.addId(xapi);
                                self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#moduleFeedback", "moduleFeedback");
                                self.xapiGen.addTimestamp(xapi);
                                self.xapiGen.addActorAccount(xapi, userProfile);
                                self.xapiGen.addObject(xapi, self.xapiGen.addPeblActivity(payload.activityURI, payload.activityType, payload.activityId), payload.feedback, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile, bookTitle, bookId)));
                                if (activity)
                                    self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                                let mf = new ModuleFeedback(xapi);
                                self.pebl.storage.saveOutgoingXApi(userProfile, {
                                    identity: userProfile.identity,
                                    id: mf.id,
                                    requestType: "saveModuleEvents",
                                    events: [mf]
                                });
                            }
                        });
                    });
                });
            });
        });
    }
    eventModuleExample(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            idref: payload.idref,
            youtubeUrl: payload.youtubeUrl,
            imageUrl: payload.imageUrl,
            websiteUrl: payload.websiteUrl,
            quotedPerson: payload.quotedPerson,
            quotedTeam: payload.quotedTeam
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentActivity(function (activity) {
                self.pebl.user.getUser(function (userProfile) {
                    if (userProfile) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#moduleExample", "moduleExample");
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.example, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(self.xapiGen.addPeblContextExtensions(exts, userProfile)));
                        if (activity)
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                        let me = new ModuleExample(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: me.id,
                            requestType: "saveModuleEvents",
                            events: [me]
                        });
                        self.pebl.emitEvent(self.pebl.events.incomingModuleEvents, [me]);
                    }
                });
            });
        });
    }
    eventModuleExampleRating(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            idref: payload.idref,
            programId: payload.programId,
            exampleId: payload.exampleId
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentActivity(function (activity) {
                self.pebl.user.getUser(function (userProfile) {
                    if (userProfile) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#moduleExampleRating", "moduleExampleRating");
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.rating, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                        if (activity)
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                        let mer = new ModuleExampleRating(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: mer.id,
                            requestType: "saveModuleEvents",
                            events: [mer]
                        });
                    }
                });
            });
        });
    }
    eventModuleExampleFeedback(event) {
        let payload = event.detail;
        let xapi = {};
        let self = this;
        let exts = {
            willingToDiscuss: payload.willingToDiscuss,
            idref: payload.idref,
            programId: payload.programId,
            exampleId: payload.exampleId
        };
        this.pebl.storage.getCurrentBook(function (book) {
            self.pebl.storage.getCurrentActivity(function (activity) {
                self.pebl.user.getUser(function (userProfile) {
                    if (userProfile) {
                        self.xapiGen.addId(xapi);
                        self.xapiGen.addVerb(xapi, "http://www.peblproject.com/definitions.html#moduleExampleFeedback", "moduleExampleFeedback");
                        self.xapiGen.addTimestamp(xapi);
                        self.xapiGen.addActorAccount(xapi, userProfile);
                        self.xapiGen.addObject(xapi, PEBL_PREFIX + book, payload.feedback, payload.description, self.xapiGen.addPeblActivity(undefined, payload.activityType, undefined), self.xapiGen.addExtensions(exts));
                        if (activity)
                            self.xapiGen.addParentActivity(xapi, PEBL_PREFIX + activity);
                        let mef = new ModuleExampleFeedback(xapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: mef.id,
                            requestType: "saveModuleEvents",
                            events: [mef]
                        });
                    }
                });
            });
        });
    }
    moduleRemovedEvent(event) {
        let payload = event.detail;
        let voidXapi = {};
        // let eventXapi = {};
        let self = this;
        // let exts = {
        //     type: payload.type
        // }
        this.pebl.user.getUser(function (userProfile) {
            if (userProfile) {
                self.pebl.storage.getCurrentActivity(function (activity) {
                    self.pebl.storage.getCurrentBook(function (book) {
                        self.xapiGen.addId(voidXapi);
                        self.xapiGen.addVerb(voidXapi, "http://adlnet.gov/expapi/verbs/voided", "voided");
                        self.xapiGen.addTimestamp(voidXapi);
                        self.xapiGen.addStatementRef(voidXapi, payload.eventId);
                        self.xapiGen.addActorAccount(voidXapi, userProfile);
                        if (activity)
                            self.xapiGen.addParentActivity(voidXapi, PEBL_PREFIX + activity);
                        let voided = new Voided(voidXapi);
                        self.pebl.storage.saveOutgoingXApi(userProfile, {
                            identity: userProfile.identity,
                            id: voided.id,
                            xId: payload.eventId,
                            requestType: "deleteModuleEvent"
                        });
                        // Send event to everyone to remove that module event from their local storage
                        // self.xapiGen.addId(eventXapi);
                        // self.xapiGen.addVerb(eventXapi, "http://www.peblproject.com/definitions.html#moduleRemovedEvent", "moduleRemovedEvent");
                        // self.xapiGen.addTimestamp(eventXapi);
                        // self.xapiGen.addActorAccount(eventXapi, userProfile);
                        // self.xapiGen.addObject(eventXapi, PEBL_PREFIX + book, payload.idref, payload.eventId, self.xapiGen.addExtensions(exts));
                        // if (activity)
                        //     self.xapiGen.addParentActivity(eventXapi, PEBL_PREFIX + activity);
                        // let mre = new ModuleRemovedEvent(eventXapi);
                        // self.pebl.storage.saveOutgoingXApi(userProfile, mre);
                        // self.pebl.emitEvent(self.pebl.events.incomingModuleEvents, [mre]); //TODO
                    });
                });
            }
        });
    }
    incomingModuleEvents(event) {
        let self = this;
        let events = event.detail;
        for (let event of events) {
            if (event.verb.display['en-US'] === 'moduleRemovedEvent') {
                self.pebl.storage.removeModuleEvent(event.idref, event.eventId);
            }
        }
    }
}

// CONCATENATED MODULE: ./src/pebl.ts
const pebl_USER_PREFIX = "_user-";
const pebl_GROUP_PREFIX = "_group-";

// import { Activity } from "./activity";


// import { Messenger } from "./messenger";



class pebl_PEBL {
    // readonly launcher: LauncherAdapter;
    constructor(config, callback) {
        this.firedEvents = [];
        this.subscribedEventHandlers = {};
        this.subscribedSingularEventHandlers = {};
        this.subscribedThreadHandlers = {};
        this.loaded = false;
        this.extension = {};
        // this.extension.shared = {};
        this.config = config;
        if (config) {
            this.teacher = config.teacher;
            this.enableDirectMessages = config.enableDirectMessages;
            this.useIndexedDB = config.useIndexedDB;
        }
        else {
            this.teacher = false;
            this.enableDirectMessages = true;
            this.useIndexedDB = true;
        }
        this.utils = new utils_Utils(this);
        this.eventHandlers = new eventHandlers_PEBLEventHandlers(this);
        this.events = new EventSet();
        this.user = new User(this);
        this.network = new network_Network(this);
        let self = this;
        // if (this.useIndexedDB) {
        this.storage = new storage_IndexedDBStorageAdapter(this, function () {
            self.loaded = true;
            self.addSystemEventListeners();
            if (callback)
                callback(self);
            self.processQueuedEvents();
        });
        // } else {
        //     this.storage = new IndexedDBStorageAdapter(function() { });
        //     // if (localStorage != null) {
        //     //     this.storage;
        //     // } else if (sessionStorage != null) {
        //     //     this.storage;
        //     // } else {
        //     //     this.storage;
        //     // }
        //     this.loaded = true;
        //     this.addSystemEventListeners();
        //     if (callback)
        //         callback(this);
        //     self.processQueuedEvents();
        // }
    }
    addListener(event, callback) {
        document.removeEventListener(event, callback);
        document.addEventListener(event, callback);
    }
    addSystemEventListeners() {
        let events = Object.keys(this.events);
        for (let event of events) {
            let listener = this.eventHandlers[event];
            if (listener) {
                let call = listener.bind(this.eventHandlers);
                this.addListener(event, call);
            }
        }
    }
    processQueuedEvents() {
        for (let e of this.firedEvents) {
            document.dispatchEvent(e);
        }
        this.firedEvents = [];
    }
    unsubscribeAllEvents() {
        for (let key of Object.keys(this.subscribedEventHandlers)) {
            for (let pack of this.subscribedEventHandlers[key])
                document.removeEventListener(key, pack.modifiedFn);
            delete this.subscribedEventHandlers[key];
        }
        for (let key of Object.keys(this.subscribedSingularEventHandlers)) {
            for (let pack of Object.keys(this.subscribedSingularEventHandlers[key])) {
                document.removeEventListener(key, this.subscribedSingularEventHandlers[key][pack].modifiedFn);
            }
            delete this.subscribedSingularEventHandlers[key];
        }
    }
    unsubscribeAllThreads() {
        for (let key of Object.keys(this.subscribedEventHandlers)) {
            for (let pack of this.subscribedEventHandlers[key])
                document.removeEventListener(key, pack.modifiedFn);
            delete this.subscribedEventHandlers[key];
        }
    }
    unsubscribeEvent(eventName, once, callback) {
        let i = 0;
        if (this.subscribedEventHandlers[eventName]) {
            for (let pack of this.subscribedEventHandlers[eventName]) {
                if ((pack.once == once) && (pack.fn == callback)) {
                    document.removeEventListener(eventName, pack.modifiedFn);
                    this.subscribedEventHandlers[eventName].splice(i, 1);
                    return;
                }
                i++;
            }
        }
    }
    unsubscribeSingularEvent(eventName, id) {
        if (this.subscribedSingularEventHandlers[eventName] && this.subscribedSingularEventHandlers[eventName][id]) {
            document.removeEventListener(eventName, this.subscribedSingularEventHandlers[eventName][id].modifiedFn);
            delete this.subscribedSingularEventHandlers[eventName][id];
        }
    }
    unsubscribeThread(baseThread, once, callback, options) {
        this.user.getUser((userProfile) => {
            if (userProfile) {
                let thread = baseThread;
                if (options && options.groupId) {
                    thread = baseThread + pebl_GROUP_PREFIX + options.groupId;
                }
                else if (options && options.isPrivate) {
                    thread = baseThread + pebl_USER_PREFIX + userProfile.identity;
                }
                let message = {
                    id: this.utils.getUuid(),
                    identity: userProfile.identity,
                    requestType: "unsubscribeThread",
                    thread: baseThread,
                    options: options
                };
                this.storage.saveOutgoingXApi(userProfile, message);
                let i = 0;
                if (this.subscribedThreadHandlers[thread]) {
                    for (let pack of this.subscribedThreadHandlers[thread]) {
                        if ((pack.once == once) && (pack.fn == callback)) {
                            document.removeEventListener(thread, pack.modifiedFn);
                            this.subscribedThreadHandlers[thread].splice(i, 1);
                            return;
                        }
                        i++;
                    }
                }
            }
        });
    }
    subscribeEvent(eventName, once, callback) {
        if (!this.subscribedEventHandlers[eventName])
            this.subscribedEventHandlers[eventName] = [];
        let self = this;
        //fix once for return of annotations
        if (once) {
            var modifiedHandler = function (e) {
                self.unsubscribeEvent(eventName, once, callback);
                callback(e.detail);
            };
            document.addEventListener(eventName, modifiedHandler, { once: once });
            this.subscribedEventHandlers[eventName].push({ once: once, fn: callback, modifiedFn: modifiedHandler });
        }
        else {
            var modifiedHandler = function (e) { callback(e.detail); };
            document.addEventListener(eventName, modifiedHandler);
            this.subscribedEventHandlers[eventName].push({ once: once, fn: callback, modifiedFn: modifiedHandler });
        }
        if (eventName == self.events.incomingAnnotations) {
            self.utils.getAnnotations(function (annotations) {
                callback(annotations);
            });
        }
        else if (eventName == self.events.incomingSharedAnnotations) {
            self.utils.getSharedAnnotations(function (annotations) {
                callback(annotations);
            });
        }
        else if (eventName == self.events.incomingPresence) {
            self.network.retrievePresence();
        }
        else if (eventName == self.events.incomingProgram) {
            self.utils.getPrograms(function (programs) {
                callback(programs);
            });
        }
        else if (eventName == self.events.incomingMembership) {
            self.utils.getGroupMemberships(function (groups) {
                callback(groups);
            });
        }
    }
    subscribeSingularEvent(eventName, id, once, callback) {
        this.unsubscribeSingularEvent(eventName, id);
        if (!this.subscribedSingularEventHandlers[eventName])
            this.subscribedSingularEventHandlers[eventName] = {};
        let self = this;
        if (once) {
            var modifiedHandler = function (e) {
                self.unsubscribeSingularEvent(eventName, id);
                callback(e.detail);
            };
            document.addEventListener(eventName, modifiedHandler, { once: once });
            this.subscribedSingularEventHandlers[eventName][id] = { once: once, fn: callback, modifiedFn: modifiedHandler };
        }
        else {
            var modifiedHandler = function (e) { callback(e.detail); };
            document.addEventListener(eventName, modifiedHandler);
            this.subscribedSingularEventHandlers[eventName][id] = { once: once, fn: callback, modifiedFn: modifiedHandler };
        }
        if (eventName == self.events.incomingAnnotations) {
            self.utils.getAnnotations(function (annotations) {
                callback(annotations);
            });
        }
        else if (eventName == self.events.incomingSharedAnnotations) {
            self.utils.getSharedAnnotations(function (annotations) {
                callback(annotations);
            });
        }
        else if (eventName == self.events.incomingPresence) {
            self.network.retrievePresence();
        }
        else if (eventName == self.events.incomingProgram) {
            self.utils.getPrograms(function (programs) {
                callback(programs);
            });
        }
        else if (eventName == self.events.incomingMembership) {
            self.utils.getGroupMemberships(function (groups) {
                callback(groups);
            });
        }
    }
    //fix once for return of getMessages
    subscribeThread(baseThread, once, callback, options) {
        this.user.getUser((userProfile) => {
            if (userProfile) {
                let thread = baseThread;
                if (options && options.groupId) {
                    thread = thread + pebl_GROUP_PREFIX + options.groupId;
                }
                else if (options && options.isPrivate) {
                    thread = thread + pebl_USER_PREFIX + userProfile.identity;
                }
                let firstRegistration = true;
                let threadCallbacks = this.subscribedThreadHandlers[thread];
                if (!threadCallbacks) {
                    threadCallbacks = [];
                    this.subscribedThreadHandlers[thread] = threadCallbacks;
                }
                else {
                    firstRegistration = false;
                }
                if (once) {
                    var modifiedHandler = ((e) => {
                        this.unsubscribeEvent(thread, once, callback);
                        callback(e.detail);
                    });
                    document.addEventListener(thread, modifiedHandler, { once: once });
                    threadCallbacks.push({ once: once, fn: callback, modifiedFn: modifiedHandler });
                }
                else {
                    var modifiedHandler = ((e) => { callback(e.detail); });
                    document.addEventListener(thread, modifiedHandler);
                    threadCallbacks.push({ once: once, fn: callback, modifiedFn: modifiedHandler });
                }
                if (firstRegistration) {
                    this.storage.saveOutgoingXApi(userProfile, {
                        id: this.utils.getUuid(),
                        identity: userProfile.identity,
                        requestType: "getThreadedMessages",
                        requests: [{
                                thread: baseThread,
                                options: options || {},
                                timestamp: 1
                            }]
                    });
                    this.storage.saveOutgoingXApi(userProfile, {
                        id: this.utils.getUuid(),
                        identity: userProfile.identity,
                        requestType: "subscribeThread",
                        thread: baseThread,
                        options: options || {}
                    });
                }
                this.storage.getMessages(userProfile, thread, callback);
            }
            else {
                callback([]);
            }
        });
    }
    emitEvent(eventName, data) {
        let e = document.createEvent("CustomEvent");
        e.initCustomEvent(eventName, true, true, data);
        if (this.loaded)
            document.dispatchEvent(e);
        else
            this.firedEvents.push(e);
    }
}

// CONCATENATED MODULE: ./src/api.ts

let core = new pebl_PEBL(window.PeBLConfig, window.PeBLLoaded);
const install = function (vue, options) {
    vue.prototype.$PeBL = core;
    vue.prototype.$PeBLEvents = core.events;
    vue.prototype.$PeBLUtils = core.utils;
    vue.prototype.$PeBLUser = core.user;
};
if (typeof window !== 'undefined') {
    window.PeBL = core;
    if (window.Vue) {
        window.Vue.use({ install: install });
    }
}


/***/ })
/******/ ]);