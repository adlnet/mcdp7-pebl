/*
  Copyright 2020 Eduworks Corporation
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

define([], function(){
    
    var iDB = indexedDB // || mozIndexedDB || webkitIndexedDB || msIndexedDB;
    var IDBT = IDBTransaction // || webkitIDBTransaction || msIDBTransaction || {READ_WRITE: "readwrite"};
    var IDBKR = IDBKeyRange // || webkitIDBKeyRange || msIDBKeyRange;

    var db;

    var getBook = function(id, success, error, isIOS) {
        var request = db.transaction(["books"], "readonly").objectStore("books").get(id);
        request.onerror = function (e) {
            //console.log(e);
            if (error != null)
                error();
        };
        request.onsuccess = function (e) {
            if ((success != null) && e.target.result) {
                var data = e.target.result.content;
                var filename = e.target.result.id.split('/').pop();
                if (isIOS && data instanceof ArrayBuffer) {
                    convertToFile(data, filename, function(file) {
                        success(file);
                    })
                } else {
                    success(e.target.result.content);
                }
            } else
                success();
        };  
    };

    var convertToArrayBuffer = function(blob, callback) {
        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
            arrayBuffer = event.target.result;
            callback(arrayBuffer);
        };
        fileReader.readAsArrayBuffer(blob);
    };

    function convertToFile(arraybuffer, filename, callback) {
        var blob = new Blob([new Uint8Array(arraybuffer)]);
        var file = new File([blob], filename);
        callback(file);
    };

    var deleteFile = function(id, success, error) {
        var request = db.transaction(["books"], "readwrite").objectStore("books").delete(id);
        request.onerror = function (e) {
            if (error != null)
                error();
        };
        request.onsuccess = function (e) {
            if (success != null)
                success();
        };
    }

    var saveBookshelf = function(id, bookshelf, success, error) {
        var data = {
            id : id,
            content : bookshelf
        }
        var request = db.transaction(["books"], "readwrite").objectStore("books").put(cleanRecord(data));
        request.onerror = function (e) {
            if (error != null)
                error(e);
        };
        request.onsuccess = function (e) {
            if (success != null)
                success(e.target.result);
        };
    };

    var saveTemporaryBookshelf = function(epubObj) {
        if (window.tempBookshelf)
            window.tempBookshelf.push(epubObj);
    };
    
    var saveBook = function(id, book, success, error) {
        var data = {
            id : id,
            content : book
        }
        var request = db.transaction(["books"], "readwrite").objectStore("books").put(cleanRecord(data));
        request.onerror = function (e) {
            if (error != null)
                error(e);
        };
        request.onsuccess = function (e) {
            if (success != null)
                success(e.target.result);
        };
    };


    function getAll(index, query, callback) {
        var request;
        var result;

        if (index.getAll)
            request = index.getAll(query);
        else {
            result = [];
            request = index.openCursor(query);
        }
        
        request.onerror = function (e) {
            //console.log(e);
        };
        request.onsuccess = function (e) {
            var r = e.target.result;
            if (result) {
                if (r) {
                    result.push(r.value);
                    r.continue();
                } else if (callback != null)
                    callback(result);
            } else {
                if (callback != null) {
                    if (r != null)
                        callback(r);
                    else
                        callback([]);
                }
            }
        };
    }

    function cleanRecord(r) {
        var recordType = typeof(r);
        if (recordType == "object") {
            for (var p in r)
                if (r.hasOwnProperty(p)) {
                    var v = r[p];
                    var t = typeof(v);
                    if (t == "function")
                        delete r[p];
                    else if (t == "array")
                        for (var i = 0; i < v.length; i++)
                            cleanRecord(v[i]);
                    else if (t == "object")
                        cleanRecord(v);
                }
        } else if (recordType == "array")
            for (var i = 0; i < r.length; i++)
                cleanRecord(r[i]);
        return r;
    }

    
    function iOS() {

        var iDevices = [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ];

        if (!!navigator.platform) {
            while (iDevices.length) {
                if (navigator.platform === iDevices.pop()){ return true; }
            }
        }

        return false;
    }

    var isIOS = iOS();
    
    var StaticStorageManager = {

        saveFile : function(path, blob, success, error){
            if (isIOS) {
                convertToArrayBuffer(blob, function(arraybuffer) {
                    saveBook(path, arraybuffer, success, error);
                });
            } else {
                saveBook(path, blob, success, error);
            }    
        },

        saveBookshelf : function(path, blob, success, error){
            saveBookshelf(path, blob, success, error);              
        },

        saveTemporaryBookshelf : function(epubObj) {
            saveTemporaryBookshelf(epubObj);
        },

        getFile : function(path, success, error) {
            getBook(path, success, error, isIOS);
        },
        
        deleteFile : function(path, success, error){
            deleteFile(path, success, error);
        },

        getPathUrl : function(path){     
            return "db://" + path;
        },
        
        initStorage: function(success, error){          
            var request = iDB.open("bookshelf", 2);

            request.onupgradeneeded = function (event) {
                db = event.target.result;

                var objectStores = db.objectStoreNames;
                for (var i = 0; i < objectStores.length; i++)
                    db.deleteObjectStore(objectStores[i]);

                var bookStore = db.createObjectStore("books", { keyPath:"id" });
            };

            
            request.onsuccess = function (event) {
                db = event.target.result;
                
                success();
            };
            
            request.onerror = function (event) {
                // readyCallback(false, event.target.errorCode);
            };

            
        }
    }
    
    return StaticStorageManager;
});
