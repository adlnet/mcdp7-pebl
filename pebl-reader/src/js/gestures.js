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
Modified in commit 994a17c6cf0b38051b98f4b9a126a18f28fd0e7e
*/

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define(['readium_shared_js/globals'], function(Globals) {

    var gesturesHandler = function(reader, viewport){

        this.initialize= function(){};
        return; // TODO disabled gestures for now

        // var onSwipeLeft = function(){
        //     reader.openPageRight();
        // };

        // var onSwipeRight = function(){
        //     reader.openPageLeft();
        // };

        // var isGestureHandled = function() {
        //     var viewType = reader.getCurrentViewType();

        //     return viewType === ReadiumSDK.Views.ReaderView.VIEW_TYPE_FIXED || viewType == ReadiumSDK.Views.ReaderView.VIEW_TYPE_COLUMNIZED;
        // };

        this.initialize= function(){

            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function(iframe, spineItem) {
                Globals.logEvent("CONTENT_DOCUMENT_LOADED", "ON", "gestures.js [ " + spineItem.href + " ]");

                // delete Hammer.defaults.cssProps.userSelect;

                // var hammer = new Hammer(iframe[0].contentDocument);

                var isIos = function() {
                  var userAgent = window.navigator.userAgent.toLowerCase();
                  return /iphone|ipad|ipod/.test( userAgent );
                }

                var inIos = isIos();

                // Focus a hidden input in the content and blur it immediately to clear the iOS keyboard.
                // This function is also in EpubReader.js
                var clearIosKeyboard = function() {
                    if (inIos) {
                        var input = document.getElementById('iosKeyboardClearInput');
                        if (input) {
                            $(input).show();
                            input.focus();
                            input.blur();
                            $(input).hide();
                        }
                    }
                }
                //set up the hammer gesture events
                //swiping handlers
                // var swipingOptions = {prevent_mouseevents: true};
                // hammer.on("swipeleft", function (event) {
                //     if (event.pointerType === 'touch') {
                //         clearIosKeyboard();
                //         reader.openPageRight();
                //     }
                // });
                // hammer.on("swiperight", function (event) {
                //     if (event.pointerType === 'touch') {
                //         clearIosKeyboard();
                //         reader.openPageLeft();
                //     }
                // });
            });
        };

    };
    return gesturesHandler;
});
