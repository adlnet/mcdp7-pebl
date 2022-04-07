define([
    './ModuleConfig',
    'StorageManager',
    'Settings',
    './EpubLibraryManager',
    'i18nStrings',
    'hgn!readium_js_viewer_html_templates/library-navbar.html',
    'hgn!readium_js_viewer_html_templates/library-body.html',
    'hgn!readium_js_viewer_html_templates/empty-library.html',
    'hgn!readium_js_viewer_html_templates/library-item.html',
    'hgn!readium_js_viewer_html_templates/add-epub-dialog.html',
    'hgn!readium_js_viewer_html_templates/download-books-dialog.html',
    'hgn!readium_js_viewer_html_templates/install-reader-dialog.html',
    'hgn!readium_js_viewer_html_templates/install-ios-reader-dialog.html',
    'hgn!readium_js_viewer_html_templates/spinner-dialog.html',
    'hgn!readium_js_viewer_html_templates/analytics-spinner-dialog.html',
    'hgn!readium_js_viewer_html_templates/upload-epub-spinner-dialog.html',
    './Spinner',
    './ReaderSettingsDialog',
    './Dialogs',
    './workers/Messages',
    'Analytics',
    './Keyboard',
    'readium_shared_js/helpers',
    './PackageParser'],

       function(
           moduleConfig,
           StorageManager,
           Settings,
           libraryManager,
           Strings,
           LibraryNavbar,
           LibraryBody,
           EmptyLibrary,
           LibraryItem,
           AddEpubDialog,
           DownloadBooksDialog,
           InstallReaderDialog,
           InstallIosReaderDialog,
           SpinnerDialog,
           AnalyticsSpinnerDialog,
           UploadEpubSpinnerDialog,
           spinner,
           SettingsDialog,
           Dialogs,
           Messages,
           Analytics,
           Keyboard,
           Helpers,
           PackageParser){

           var heightRule,
           noCoverRule;
           //maxHeightRule

           var spinLibrary = function(on, target) {
               if (on) {
                   //console.error("do SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                   if (spinner.willSpin || spinner.isSpinning) return;

                   spinner.willSpin = true;

                   setTimeout(function() {
                       if (spinner.stopRequested) {
                           //console.debug("STOP REQUEST: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                           spinner.willSpin = false;
                           spinner.stopRequested = false;
                           return;
                       }
                       //console.debug("SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                       spinner.isSpinning = true;
                       spinner.spin(target);

                       spinner.willSpin = false;

                   }, 100);
               } else {

                   if (spinner.isSpinning) {
                       //console.debug("!! SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                       spinner.stop();
                       spinner.isSpinning = false;
                   } else if (spinner.willSpin) {
                       //console.debug("!! SPIN REQ: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                       spinner.stopRequested = true;
                   }
               }
           };

           var findHeightRule = function(){

               var styleSheet=document.styleSheets[0];
               var ii=0;
               var cssRule;
               do {
                   if (styleSheet.cssRules) {
                       cssRule = styleSheet.cssRules[ii];
                   } else {
                       cssRule = styleSheet.rules[ii];
                   }
                   if (cssRule && cssRule.selectorText)  {
                       if (cssRule.selectorText.toLowerCase()=='.library-item') {
                           heightRule = cssRule;
                       }
                       // else if (cssRule.selectorText.toLowerCase()=='.library-item img') {
                       //     maxHeightRule = cssRule;
                       // }
                       else if (cssRule.selectorText.toLowerCase() == 'body:not(.list-view) .library-item .no-cover'){
                           noCoverRule = cssRule;
                       }

                   }
                   ii++;
               } while (cssRule);
           }


           var setItemHeight = function(){
               if (!heightRule || !noCoverRule) return;

               var medWidth = 2,
               smWidth = 3,
               xsWidth = 4,
               rowHeight = 0,
               imgWidth = 0,
               scale = 1;

               var winWidth = window.innerWidth;

               if (winWidth >= 992){
                   imgWidth = winWidth * (medWidth/12) - 60;
                   rowHeight = 1.33 * imgWidth + 60;
               }
               else if (winWidth >= 768){
                   imgWidth = winWidth * (smWidth/12) - 60;
                   rowHeight = 1.33 * imgWidth + 60;
               }
               else{
                   imgWidth = winWidth * (xsWidth/12) - 60;
                   rowHeight = 1.33 * imgWidth + 20;
               }
               heightRule.style.height  = rowHeight + 'px';
               scale = imgWidth/300;

               noCoverRule.style.width = imgWidth + 'px';
               noCoverRule.style.height = 1.33 * imgWidth + 'px';
               noCoverRule.style.fontSize = 40 * scale + 'px';
               //maxHeightRule.style.height = 1.33 * imgWidth + 'px';
               //maxHeightRule.style.width = imgWidth + 'px';
           };

           var showError = function(errorCode, data){
               Dialogs.showError(errorCode, data);
           }

           var loadLibraryItems = function(epubs){
               window.libraryItems = [];
               var currentScrollPos = $('#app-container').scrollTop();
               $('#app-container .library-row-title').remove();
               $('#app-container .library-items.cloud-library').remove();
               //$('#app-container .library-items.local-library').remove();
               $('#app-container').append(LibraryBody({strings: Strings}));

               if (!epubs.length){
                   $('#app-container .library-items.cloud-library').append(EmptyLibrary({imagePathPrefix: moduleConfig.imagePathPrefix, strings: Strings}));
                   return;
               }

               var processEpub = function(epubs, count) {
                   var epub = epubs[count];
                   if (!epub) { // count >= epubs.length
                       // $('.details').on('click', loadDetails);
                       $('#app-container').scrollTop(currentScrollPos);
                       return;
                   }

                   var noCoverBackground = moduleConfig.imagePathPrefix + 'images/covers/cover' + ((count % 8) + 1) + '.jpg';
                   if (epub.isSubLibraryLink) {
                       noCoverBackground = moduleConfig.imagePathPrefix + 'images/covers/cover2.jpg';
                   }

                   var createLibraryItem = function() {

                       // See --COMMENT-- below!
                       // if (!epub.isSubLibraryLink && !epub.packagePath) {
                       //     console.error("no epub.packagePath (OPF within zipped EPUB archive?): " + epub.rootUrl);
                       //     //console.log(epub);
                       // }

                       var background = epub.coverHref;

                       if (background) {
                           StorageManager.getFile(background, function(data) {
                               // debugger
                               if (data)
                                   var elem = LibraryItem({count:{n: count+1, tabindex:0}, epub: epub, coverHref: URL.createObjectURL(data), strings: Strings, noCoverBackground: noCoverBackground});
                               else
                                   var elem = LibraryItem({count:{n: count+1, tabindex:0}, epub: epub, coverHref: background, strings: Strings, noCoverBackground: noCoverBackground});
                               if ((epub.rootUrl.substr(0, 5) == "db://") || epub.isLocal) {
                                 $('.library-items.cloud-library').append(elem);
                                 window.libraryItems.push(epub);
                               } else {
                                 var cachedBook = document.getElementById(epub.id);
                                 if (!cachedBook) {
                                   $('.library-items.cloud-library').append(elem);
                                   window.libraryItems.push(epub);
                                 }
                               }
                               
                               processEpub(epubs, ++count);
                           }, function() {
                               var elem = LibraryItem({count:{n: count+1, tabindex:0}, epub: epub, strings: Strings, noCoverBackground: noCoverBackground});
                               if ((epub.rootUrl.substr(0, 5) == "db://") || epub.isLocal) {
                                 $('.library-items.cloud-library').append(elem);
                                 window.libraryItems.push(epub);
                               } else {
                                 var cachedBook = document.getElementById(epub.id);
                                 if (!cachedBook) {
                                   $('.library-items.cloud-library').append(elem);
                                   window.libraryItems.push(epub);
                                 }
                               }

                               processEpub(epubs, ++count);
                           });
                       } else {
                           var elem = LibraryItem({count:{n: count+1, tabindex:0}, epub: epub, coverHref: background, strings: Strings, noCoverBackground: noCoverBackground});
                           if ((epub.rootUrl.substr(0, 5) == "db://") || epub.isLocal) {
                             $('.library-items.cloud-library').append(elem);
                             window.libraryItems.push(epub);
                           } else {
                             var cachedBook = document.getElementById(epub.id);
                             if (!cachedBook) {
                               $('.library-items.cloud-library').append(elem);
                               window.libraryItems.push(epub);
                             }
                           }
                           
                           processEpub(epubs, ++count);
                       }





                   };

                   if (!epub.isSubLibraryLink && !epub.packagePath) {
                       createLibraryItem();
                   }
                   else {
                       createLibraryItem();
                   }
               };
               processEpub(epubs, 0);

               var initializeLibrarySearch = function() {
                   window.AllSpineDocuments = [];

                   libraryManager.retrieveAvailableEpubs(function(epubs) {
                       console.log(epubs);

                       var getStuff = function(index, arr) {
                           var epub = arr[index];
                           window.READIUM.getPackageDocument(epub.rootUrl, function(packageDocument) {
                               var packageData = packageDocument.getSharedJsPackageData();
                               var spine = packageData.spine;
                               window.AllSpineDocuments[index] = {
                                   title: epub.title,
                                   rootUrl: epub.rootUrl,
                                   spineDocuments: []
                               }

                               for (var j = 0; j < spine.items.length; j++) {
                                   var spineItem = spine.items[j];
                                   (function(epub, index, spineItem, j, packageData) {
                                       var fetcher = window.READIUM.getCurrentPublicationFetcher();
                                       fetcher.fetchContentDocumentWithoutResolvingDom({spineItem: spineItem}, packageData.rootUrl + '/' + spineItem.href, function(resolvedContentDocumentDom) {
                                           var searchDocumentObject = {
                                               spineItem: spineItem,
                                               htmlDocument: resolvedContentDocumentDom
                                           }
                                           window.AllSpineDocuments[index].spineDocuments[j] = searchDocumentObject;
                                       }, function(err) {
                                           console.log(err);
                                       });
                                   })(epub, index, spineItem, j, packageData);
                               }
                               console.log(packageData);

                               if (index < arr.length - 1) {
                                   index++;
                                   getStuff(index, arr);
                               }
                           });
                       }

                       getStuff(0, epubs);
                   });
               }

               var searchShowHideToggle = function() {
                   var searchBody = $('#search-library-body');
                   var hide = searchBody.hasClass('search-library-visible');
                   if (hide) {
                       searchBody.removeClass('search-library-visible');

                       $('#searchNotInitialized').remove();

                       PeBL.emitEvent(PeBL.events.eventUndisplayed, {
                           activityType: 'library-search',
                           type: 'Search'
                       });
                   } else {
                       if (!window.READIUM)
                           return Dialogs.showErrorWithDetails('Alert', 'Bookshelf search has not been initialized. Please open any book from the bookshelf to initialize the search.');
                       searchBody.addClass('search-library-visible');

                       initializeLibrarySearch();
                       
                       PeBL.emitEvent(PeBL.events.eventDisplayed, {
                           activityType: 'library-search',
                           type: 'Search'
                       });
                       $('#searchInput').get.focus();
                   }
               }

               $('#search-library-body').prepend('<div id="search-body-list"></div>');

               $('#search-library-body').prepend('<div><input id="searchInput" placeholder="Search this book" /></div>');

               $('#search-library-body').prepend('<h2 aria-label="' + Strings.search + '" title="' + Strings.search + '"><img src="images/pebl-icons-search.svg" aria-hidden="true" height="18px"> ' + Strings.search + '</h2>');
               $('#search-library-body').prepend('<button tabindex="50" type="button" class="close" data-dismiss="modal" aria-label="' + Strings.i18n_close + ' ' + Strings.search + '" title="' + Strings.i18n_close + ' ' + Strings.search + '"><span aria-hidden="true">&times;</span></button>');

               $('#search-library-body button.close').on('click', function() {
                   searchShowHideToggle();
                   return false;
               });



               $('#searchButt').on('click', searchShowHideToggle);

               $('#searchInput').on('input', _.debounce(function() {
                   $('#search-body-list').children().remove();
                   var text = this.value;
                   var searchResults = [];
                   if (text.trim().length > 0) {
                       var regex = new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "gi"); // Escape the input
                       for (var i = 0; i < window.AllSpineDocuments.length; i++) {
                           searchResults[i] = {
                               title: window.AllSpineDocuments[i].title,
                               rootUrl: window.AllSpineDocuments[i].rootUrl,
                               spineDocuments: []
                           };
                           for (var j = 0; j < window.AllSpineDocuments[i].spineDocuments.length; j++) {
                               var documentObject = window.AllSpineDocuments[i].spineDocuments[j];
                               var spineDocument = documentObject.htmlDocument;
                               searchResults[i].spineDocuments[j] = {title: spineDocument.title, searchResults: []};
                               var treeWalker = spineDocument.createTreeWalker(spineDocument.body, NodeFilter.SHOW_TEXT, function(node) {
                                   if (node.nodeValue && node.nodeValue.trim().length > 0) { return NodeFilter.FILTER_ACCEPT } else  { return NodeFilter.FILTER_REJECT }
                               });
                               var nodeList = [];
                               var currentNode = treeWalker.currentNode;
                               currentNode = treeWalker.nextNode();
                               while (currentNode) {
                                   while ((match = regex.exec(currentNode.nodeValue)) != null) {
                                       var start = match.index;
                                       var end = match.index + match.length - 1;
                                       var range = spineDocument.createRange();
                                       range.setStart(currentNode, start);
                                       range.setEnd(currentNode, end);
                                       var cfiRange = window.READIUM.reader.getRangeCfiFromDomRange(range);
                                       cfiRange.idref = documentObject.spineItem.idref;
                                       cfiRange.spineItemCfi = documentObject.spineItem.cfi;

                                       var surroundingTextStart = 0;
                                       var surroundingTextEnd = currentNode.nodeValue.length;
                                       if (start > 50) {
                                           surroundingTextStart = start - 50;
                                       }
                                       if (surroundingTextEnd - end > 50) {
                                           surroundingTextEnd = end + 50;
                                       }

                                       var surroundingText = currentNode.nodeValue.substr(surroundingTextStart, surroundingTextEnd);
                                       surroundingText = surroundingText.replace(match, '<mark>' + match + '</mark>');

                                       nodeList.push({text: surroundingText, cfi: cfiRange, rootUrl: window.AllSpineDocuments[i].rootUrl})
                                   }
                                   currentNode = treeWalker.nextNode();
                               }
                               searchResults[i].spineDocuments[j].searchResults = nodeList;
                           }
                       }
                   }
                   console.log(searchResults);
                   for (var book of searchResults) {
                       var bookContainer = document.createElement('div');

                       var bookHeader = document.createElement('h2');
                       bookHeader.textContent = book.title;
                       bookContainer.appendChild(bookHeader);

                       var chapterList = document.createElement('div');
                       bookContainer.appendChild(chapterList);

                       for (var chapter of book.spineDocuments) {
                           if (chapter.searchResults.length > 0) {
                               var container = document.createElement('div');

                               var header = document.createElement('h3');
                               header.textContent = chapter.title;
                               container.appendChild(header);

                               var list = document.createElement('div');
                               container.appendChild(list);

                               for (var result of chapter.searchResults) {
                                   var textContainer = document.createElement('div');
                                   textContainer.classList.add('searchResult');
                                   (function(textContainer, result) {
                                       textContainer.addEventListener('click', function() {
                                           console.log(result);
                                           window.localStorage.setItem('searchHighlight', JSON.stringify(result.cfi));
                                           window.location.href = window.location.origin + '/?epub=' + encodeURI(result.rootUrl) + '&goto=epubcfi(' + result.cfi.spineItemCfi + result.cfi.contentCFI + ')';
                                           // window.READIUM.reader.plugins.highlights.addHighlight(result.cfi.idref, result.cfi.contentCFI, PeBL.utils.getUuid(), "search-highlight");
                                       });
                                   })(textContainer, result);

                                   var textContent = document.createElement('p');
                                   textContent.innerHTML = result.text;
                                   textContainer.appendChild(textContent);

                                   list.appendChild(textContainer);
                               }
                               chapterList.append(container);
                           }
                       }
                       if ($(bookContainer).find('.searchResult').length !== 0)
                           $('#search-body-list').append(bookContainer);
                   }
               }, 1000));
           }

           var readClick = function(e){
               var urlParams = Helpers.getURLQueryParams();
               //var ebookURL = urlParams['epub'];
               var libraryURL = urlParams['epubs'];
               var embedded = urlParams['embedded'];

               var ebookURL = $(this).attr('data-book');
               var ebookTitle = $(this).attr('data-title');
               var ebookId = $(this).attr('data-id');

               if (ebookURL && ebookURL.substr(0, 5) == "db://") {
                   if (ebookURL.endsWith(".epub")) {
                       StorageManager.getFile(ebookURL, function (data) {
                           var eventPayload = {embedded: embedded, localPath : ebookURL, epub: data, epubs: libraryURL, ebookTitle: ebookTitle, ebookId: ebookId};
                           $(window).triggerHandler('readepub', eventPayload);
                       });
                   } else {
                       var eventPayload = {embedded: embedded, epub: ebookURL, epubs: libraryURL, ebookTitle: ebookTitle, ebookId: ebookId};
                       $(window).triggerHandler('readepub', eventPayload);
                   }
               } else if (ebookURL) {
                   var eventPayload = {embedded: embedded, epub: ebookURL, epubs: libraryURL, ebookTitle: ebookTitle, ebookId: ebookId};
                   $(window).triggerHandler('readepub', eventPayload);
               }
               else {
                   var libURL = $(this).attr('data-library');
                   if (libURL) {

                       // TODO: this doesn't work, so we refresh the whole page, bypassing pushState (replaceState is used instead after reload)
                       // libraryManager.resetLibraryData();
                       // var eventPayload = libURL;
                       // $(window).triggerHandler('loadlibrary', eventPayload);

                       var URLPATH =
                           window.location ? (
                               window.location.protocol
                                   + "//"
                                   + window.location.hostname
                                   + (window.location.port ? (':' + window.location.port) : '')
                                   + window.location.pathname
                           ) : 'index.html'
                       ;

                       var url = URLPATH + '?epubs=' + encodeURIComponent(libURL);

                       window.location = url;
                   } else {
                       var linkURL = $(this).attr('data-link');
                       if (linkURL) {
                           window.open(linkURL, '_blank');
                       }
                   }
               }
               return false;
           }

           var unloadLibraryUI = function(){

               // needed only if access keys can potentially be used to open a book while a dialog is opened, because keyboard.scope() is not accounted for with HTML access keys :(
               Dialogs.closeModal();
               Dialogs.reset();
               $('.modal-backdrop').remove();

               Keyboard.off('library');
               Keyboard.off('settings');

               $('#settings-dialog').off('hidden.bs.modal');
               $('#settings-dialog').off('shown.bs.modal');

               $('#about-dialog').off('hidden.bs.modal');
               $('#about-dialog').off('shown.bs.modal');

               $('#add-epub-dialog').off('hidden.bs.modal');
               $('#add-epub-dialog').off('shown.bs.modal');

               $('.details-dialog').off('hidden.bs.modal');
               $('.details-dialog').off('shown.bs.modal');

               $(window).off('resize');
               $(document.body).off('click');
               $(window).off('storageReady');
               $('#app-container').attr('style', '');
           }

           var promptForReplace = function(originalData, replaceCallback, keepBothCallback){
               Settings.get('replaceByDefault', function(val){
                   if (val === 'true'){
                       replaceCallback()
                   }
                   else{
                       keepBothCallback();
                   }
               })
           }

           var handleLibraryChange = function(){
               Dialogs.closeModal();
               libraryManager.retrieveAvailableEpubs(loadLibraryItems);
           }

           var importZippedEpub = function(file) {

               if (!window.Blob || !window.File) return;

               if (!(file instanceof Blob) || !(file instanceof File)) return;


               var title = Strings.import_dlg_title + " [ " + file.name + " ]";
               Dialogs.showModalProgress(title, Strings.import_dlg_message);

               libraryManager.handleZippedEpub({
                   file: file,
                   overwrite: promptForReplace,
                   success: handleLibraryChange,
                   progress: Dialogs.updateProgress,
                   error: showError
               });
           };

           var importZippedEpubs_CANCELLED = false;
           var importZippedEpubs = function(files, i, callback) {

               if (!window.Blob || !window.File) return;

               if (i == 0) { // first call
                   importZippedEpubs_CANCELLED = false;
               } else {
                   if (importZippedEpubs_CANCELLED) {

                       handleLibraryChange();

                       setTimeout(function(){
                           Dialogs.showModalMessage(Strings.i18n_add_book, Strings.i18n_cancel + " - " + Strings.import_dlg_title);
                       }, 800);

                       return; // break the iteration
                   }
               }

               if (i >= files.length) { // last call
                   handleLibraryChange();
                   return;
               }

               var nextImportEPUB = function(callback) {
                   setTimeout(function(){
                       //Dialogs.closeModal();
                       //Dialogs.reset(); // ? (costly DOM mutations)
                       importZippedEpubs(files, ++i, callback); // next
                   }, 100); // time for the Web Worker to die (background unzipping)
               };

               var file = files[i];

               if (!(file instanceof Blob) || !(file instanceof File)) {

                   nextImportEPUB();

                   return;
               }

               var fileInfo = " [ " + file.name + " ] "+(i+1)+"/"+(files.length)+"";
               var title = Strings.import_dlg_title + fileInfo;
               if (i == 0) { // first call
                   Dialogs.showModalProgress(title, Strings.import_dlg_message, function() {
                       importZippedEpubs_CANCELLED = true;
                       Dialogs.updateModalProgressTitle("(" + Strings.i18n_cancel + ") " + title);
                   });
               } else {
                   Dialogs.updateModalProgressTitle(title);
               }

               Dialogs.updateProgress(0, Messages.PROGRESS_EXTRACTING, file.name);

               libraryManager.handleZippedEpub({
                   file: file,
                   overwrite: promptForReplace,
                   success: function() {
                       if (callback) {
                           callback(i);
                           nextImportEPUB(callback);
                       } else
                           nextImportEPUB();
                   },
                   progress: Dialogs.updateProgress,
                   error: function(errorCode, data) {

                       // TODO: collapse multiple errors into a single user prompt
                       //showError(errorCode, data);

                       var msg = Strings.err_unknown;
                       switch(errorCode){
                           case Messages.ERROR_PACKAGE_PARSE:
                               Dialogs.updateModalProgressTitle(Strings.err_epub_corrupt + fileInfo);
                               //Dialogs.showErrorWithDetails(Strings.err_epub_corrupt, data);
                               return;
                           case Messages.ERROR_STORAGE:
                               msg = Strings.err_storage;
                               break;
                           case Messages.ERROR_EPUB:
                               msg = Strings.err_epub_corrupt;
                               break;
                           case Messages.ERROR_AJAX:
                               msg = Strings.err_ajax;
                               break;
                           default:
                               msg = Strings.err_unknown;
                               console.log(msg);
                               break;
                       }
                       Dialogs.updateModalProgressTitle(Strings.err_dlg_title + " (" + msg + ")" + fileInfo);
                       //Dialogs.showModalMessage(Strings.err_dlg_title, msg);

                       setTimeout(function(){
                           nextImportEPUB();
                       }, 500); // short error report, then let's move to the next item.
                   }
               });
           };

           var uploadEpub = function(evt) {
                $('#upload-epub-spinner-dialog').modal('show');
                spinLibrary(true, $('#upload-epub-spinner-body')[0]);
                const fd = new FormData();
                fd.append('epub', evt.target.files[0]);
                fetch(window.PeBLConfig.PeBLServicesURL + '/upload-epub', {
                    credentials: 'include',
                    method: 'POST',
                    body: fd
                }).then( async (response) => {
                    if (!response.ok)
                        throw Error(await response.text());
                    console.log('done upload');
                    window.location.reload();
                }).catch((e) => {
                    console.error(e);
                    alert(e);
                }).finally(() => {
                    spinLibrary(false);
                    $('#upload-epub-spinner-dialog').modal('hide');
                    $('#add-epub-dialog').modal('hide');
                })
           }

           var handleFileSelect = function(evt){
               $('#add-epub-dialog').modal('hide');

               if (evt.target.files.length > 1) {
                   importZippedEpubs(evt.target.files, 0);
                   return;
               }

               var file = evt.target.files[0];
               importZippedEpub(file);
           }

           var handleDirSelect = function(evt){
               var files = evt.target.files;
               $('#add-epub-dialog').modal('hide');
               Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
               libraryManager.handleDirectoryImport({
                   files: files,
                   overwrite: promptForReplace,
                   success: handleLibraryChange,
                   progress: Dialogs.updateProgress,
                   error: showError
               });
           }

           var handleUrlSelect = function(){
               var url = $('#url-upload').val();
               $('#add-epub-dialog').modal('hide');
               Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
               libraryManager.handleUrlImport({
                   url: url,
                   overwrite: promptForReplace,
                   success: handleLibraryChange,
                   progress: Dialogs.updateProgress,
                   error: showError
               });
           }

           var importEpub = function(ebook) {
               // TODO: also allow import of URL and directory select
               // See libraryManager.canHandleUrl() + handleUrlSelect()
               // See libraryManager.canHandleDirectory() + handleDirSelect()

               if (Array.isArray(ebook)) {
                   importZippedEpubs(ebook, 0);
                   return;
               }

               importZippedEpub(ebook);
           };

           var doMigration = function(){
               Dialogs.showModalProgress(Strings.migrate_dlg_title, Strings.migrate_dlg_message);
               libraryManager.handleMigration({
                   success: function(){

                       // Note: automatically JSON.stringify's the passed value!
                       Settings.put('needsMigration', false, $.noop);

                       handleLibraryChange();
                   },
                   progress: Dialogs.updateProgress,
                   error: showError
               });
           }

           var storeBookOffline = function(rootUrl, callback) {
               StorageManager.getFile('db://epub_library.json', function(index) {
                   if (index)
                       window.existingBookshelf = index;
                   else
                       window.existingBookshelf = null;

                   window.tempBookshelf = [];

                   libraryManager.retrieveAvailableEpubs(function(epubs) {
                       if (epubs.length < 1)
                           callback();
                       else {
                           for (var epub of epubs) {
                               if (epub.rootUrl === rootUrl) {
                                   if (rootUrl.endsWith(".epub")) {
                                       var request = new XMLHttpRequest();
                                       request.responseType = 'blob';
                                       request.onload = function(data) {
                                           var blob = this.response;
                                           var file = new File([blob], rootUrl.split('/').pop());
                                           importZippedEpubs([file], 0, function(num) {
                                               callback();
                                           });
                                       }
                                       request.open('GET', rootUrl);
                                       request.send();
                                   } else {
                                       var request = new XMLHttpRequest();
                                       let root = location.origin + "/" + rootUrl + (rootUrl.endsWith("/")?"":"/")
                                       let adjRoot = root + "OEBPS/";
                                       request.onload = function() {
                                           let xml = new DOMParser().parseFromString(this.response, "text/xml");
                                           let package = PackageParser.parsePackageDom(xml);
                                           let items = xml.getElementsByTagName("package")[0].getElementsByTagName("manifest")[0].getElementsByTagName("item");
                                           let hrefs = [];
                                           var title = Strings.import_dlg_title + " [ " + package.title + " ]";
                                           Dialogs.showModalProgress(title, Strings.storing_file);
                                           for (let item of items) {
                                               hrefs.push(adjRoot + item.getAttribute("href"));
                                           }
                                           StorageManager.saveTemporaryBookshelf({
                                               id: package.id,
                                               packagePath: "OEBPS/content.opf",
                                               title: package.title,
                                               author: package.author,
                                               isLocal: true,
                                               rootDir: root,
                                               rootUrl: root,
                                               coverPath: package.coverHref,
                                               coverHref: adjRoot + package.coverHref
                                           });
                                           let pFn = (data)=>{
                                               let percent = 100*((data.total - data.remaining) / data.total);
                                               Dialogs.updateProgress(percent, Messages.PROGRESS_WRITING, package.title);
                                           }
                                           let fn = () => {
                                               unregisterSWListener("addedToCache", fn);
                                               unregisterSWListener("addToCacheProgress", pFn);
                                               callback();
                                               handleLibraryChange();
                                           }
                                           registerSWListener("addToCacheProgress", pFn);
                                           registerSWListener("addedToCache", fn);
                                           sendSWMsg("addToCache", {
                                               root: adjRoot,
                                               items: hrefs
                                           });
                                       }
                                       request.open('GET', adjRoot+"content.opf");
                                       request.send();
                                   }
                               }
                           }
                       }
                   });
               });
           }

           var loadLibraryUI = function(){
               var inIos = false;
               var inIosStandalone = false;
               // Detects if device is on iOS
               var isIos = function() {
                   var userAgent = window.navigator.userAgent.toLowerCase();
                   return /iphone|ipad|ipod/.test( userAgent );
               }
               // Detects if device is in standalone mode
               var isInStandaloneMode = function () {
                   return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
               }

               var readerCss = document.getElementById('epubReaderCss');
               if (readerCss)
                 readerCss.remove();

               // Checks if should display install popup notification:
               if (isIos()) {
                   inIos = true;
               }
               if (isInStandaloneMode()) {
                   inIosStandalone = true;
               }

               Dialogs.reset();

               Keyboard.scope('library');

               Analytics.trackView('/library');
               var $appContainer = $('#app-container');
               $appContainer.empty();
               $appContainer.attr('role','main');
               $appContainer.append(AddEpubDialog({
                   canHandleUrl : libraryManager.canHandleUrl(),
                   canHandleDirectory : libraryManager.canHandleDirectory(),
                   strings: Strings
               }));

               SettingsDialog.initDialog(undefined, {
                   readiumJsViewer: {
                       version:window.PeBLConfig ? window.PeBLConfig.version : "N/a"
                   }
               });

               $appContainer.append(DownloadBooksDialog({
                   strings: Strings
               }));

               $appContainer.append(InstallReaderDialog({
                   strings: Strings,
                   hideInstallInstructions: window.PeBLConfig.hideInstallInstructions,
                   param: window.PeBLConfig.installGuideParam
               }));

               $appContainer.append(InstallIosReaderDialog({
                   strings: Strings,
                   imagePathPrefix: moduleConfig.imagePathPrefix
               }));

               $appContainer.append(SpinnerDialog({
                   strings: Strings
               }));

               $appContainer.append(AnalyticsSpinnerDialog({
                   strings: Strings
               }));

               $appContainer.append(UploadEpubSpinnerDialog({
                   strings: Strings
               }));

               $('#about-dialog').on('hidden.bs.modal', function () {
                   Keyboard.scope('library');

                   setTimeout(function(){ $("#aboutButt1").focus(); }, 50);
               });
               $('#about-dialog').on('shown.bs.modal', function(){
                   Keyboard.scope('about');
               });

               $('#add-epub-dialog').on('hidden.bs.modal', function () {
                   Keyboard.scope('library');

                   setTimeout(function(){ $("#addbutt").focus(); }, 50);
               });
               $('#add-epub-dialog').on('shown.bs.modal', function(){
                   Keyboard.scope('add');

                   $('#add-epub-dialog input').val('');

                   setTimeout(function(){ $('#closeAddEpubCross')[0].focus(); }, 1000);
               });
               $('#url-upload').on('keyup', function(){
                   var val = $(this).val();
                   if (val && val.length){
                       $('#add-epub-dialog .add-book').prop('disabled', false);
                   }
                   else{
                       $('#add-epub-dialog .add-book').prop('disabled', true);
                   }
               });
               $('.add-book').on('click', handleUrlSelect);
               $('nav').empty();
               $('nav').attr("aria-label", Strings.i18n_toolbar);
               $('nav').append(LibraryNavbar({strings: Strings, dialogs: Dialogs, keyboard: Keyboard, inIos: inIos}));
               $('.icon-list-view').on('click', function(){
                   $(document.body).addClass('list-view');
                   setTimeout(function(){ $('.icon-thumbnails')[0].focus(); }, 50);
               });
               $('.icon-thumbnails').on('click', function(){
                   $(document.body).removeClass('list-view');
                   setTimeout(function(){ $('.icon-list-view')[0].focus(); }, 50);
               });

               try {
                   PeBL.extension.hardcodeLogin.hookLoginButton("loginButt");
               } catch (e) {
                   console.log('Unable to hook login button', e);
               }

               findHeightRule();
               setItemHeight();
               StorageManager.initStorage(function(){
                   libraryManager.retrieveAvailableEpubs(loadLibraryItems);
               }, showError);

               Keyboard.on(Keyboard.ShowSettingsModal, 'library', function(){$('#settings-dialog').modal("show");});

               $(window).trigger('libraryUIReady');
               $(window).on('resize', setItemHeight);

               var setAppSize = function(){
                   var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
                   $('#app-container').height(appHeight);
               }
               $(window).on('resize', setAppSize);
               $('#app-container').css('overflowY', 'auto');

               setAppSize();
               $(document.body).on('click', '.read', readClick);
               $('#epub-upload').on('change', uploadEpub);
               $('#dir-upload').on('change', handleDirSelect);

               $(document.body).on('click', '.delete-book-button', function(evt) {
                   let target = evt.currentTarget;
                   if (window.confirm('Are you sure you want to delete this EPUB?')) {
                        fetch(window.PeBLConfig.PeBLServicesURL + '/delete-epub?id=' + target.getAttribute('data-id'), {
                            credentials: 'include',
                            method: 'DELETE'
                        }).then((response) => {
                            if (!response.ok)
                                throw Error(response.statusText);

                            var url = $(target).attr('data-root');
                            if (url.substr(0, 5) === 'db://') {
                                StorageManager.deleteFile(url, function() {
                                    StorageManager.getFile('db://epub_library.json', function(index) {
                                        if (index) {
                                            for (var i = 0; i < index.length; i++) {
                                                if (index[i].rootUrl === url) {
                                                    index.splice(i, 1);
                                                    StorageManager.saveBookshelf('db://epub_library.json', index, function() {
                                                        console.log('deleted epub_library.json entry');
                                                        libraryManager.retrieveAvailableEpubs(loadLibraryItems);
                                                    }, function() {
                                                        console.log('failed to delete epub_library.json entry');
                                                    });
                                                }
                                            }
                                        } else {
                                            console.log('No associated epub_library.json found');
                                        }
                                    });
                                }, function() {
                                    console.log('delete failed');
                                });
                            } else if (url.substr(0,8) === 'https://') {
                                let fn = () =>{
                                    unregisterSWListener("removedCache", fn);
                                    StorageManager.getFile('db://epub_library.json', function(index) {
                                        if (index) {
                                            for (var i = 0; i < index.length; i++) {
                                                if (index[i].rootUrl === url) {
                                                    index.splice(i, 1);
                                                    StorageManager.saveBookshelf('db://epub_library.json', index, function() {
                                                        console.log('deleted epub_library.json entry');
                                                        libraryManager.retrieveAvailableEpubs(loadLibraryItems);
                                                    }, function() {
                                                        console.log('failed to delete epub_library.json entry');
                                                    });
                                                }
                                            }
                                        } else {
                                            console.log('No associated epub_library.json found');
                                        }
                                    });
                                };
                                registerSWListener("removedCache", fn);
                                sendSWMsg("removeCache", {root: (url.endsWith("/")?url:url+"/")+"OEBPS/"});
                            } else {
                                libraryManager.retrieveAvailableEpubs(loadLibraryItems);
                            }
                        }).catch((e) => {
                            console.error(e);
                            alert('There was an error deleting this EPUB.');
                        })
                   }
               });

               $(document.body).on('click', '.download-book-button', function(evt) {
                   var url = $(evt.currentTarget).attr('data-root');
                   var bookTitle = $(evt.currentTarget).attr('data-title');
                   $('#install-spinner-dialog').modal('show');
                   spinLibrary(true, $('#install-spinner-body')[0]);
                   storeBookOffline(url, function() {
                       if (window.existingBookshelf) {
                           for (var i = 0; i < window.existingBookshelf.length; i++) {
                               if (window.existingBookshelf[i].title === window.tempBookshelf[0].title) {
                                   window.existingBookshelf.splice(i, 1);
                                   break;
                               }
                           }
                       }
                       if (window.existingBookshelf) {
                           window.tempBookshelf = window.tempBookshelf.concat(window.existingBookshelf);
                       }
                       StorageManager.saveBookshelf('db://epub_library.json', window.tempBookshelf, function() {
                           spinLibrary(false);
                           $('#install-spinner-dialog').modal('hide');
                           if (!isInStandaloneMode()) {
                             $('#downloaded-book-title').text(bookTitle);
                             $('#install-reader-dialog').modal('show');
                           }
                       }, function() {
                           console.log('error thing');
                       });
                   });
               });

               document.title = Strings.i18n_pebl_library;

               $('#settings-dialog').on('hidden.bs.modal', function () {

                   Keyboard.scope('library');

                   setTimeout(function(){ $("#settbutt1").focus(); }, 50);

                   $("#buttSave").removeAttr("accesskey");
                   $("#buttClose").removeAttr("accesskey");
               });
               $('#settings-dialog').on('shown.bs.modal', function () {

                   Keyboard.scope('settings');

                   $("#buttSave").attr("accesskey", Keyboard.accesskeys.SettingsModalSave);
                   $("#buttClose").attr("accesskey", Keyboard.accesskeys.SettingsModalClose);
               });

               var isChromeExtensionPackagedApp_ButNotChromeOS = (typeof chrome !== "undefined") && chrome.app
                   && chrome.app.window && chrome.app.window.current // a bit redundant?
                   && !/\bCrOS\b/.test(navigator.userAgent);

               // test whether we are in the Chrome app.  If so, put up the dialog and whine at the users...
               if (isChromeExtensionPackagedApp_ButNotChromeOS) {
                   setTimeout(function() {
                       Dialogs.showModalHTML(Strings.i18n_ChromeApp_deprecated_dialog_title, Strings.i18n_ChromeApp_deprecated_dialog_HTML);
                   }, 800);
               }

               //async in Chrome
               Settings.get("needsMigration", function(needsMigration){
                   if (needsMigration){
                       doMigration();
                   }
               });

               $('#readerCurrentClassContainer').on('click', function() {
                   PeBL.user.getUser(function(userProfile) {
                       window.Lightbox.createGroupSelectForm(userProfile.groups, function(classObj, teamObj) {
                           if (classObj) {
                                userProfile.currentClass = classObj;
                                userProfile.currentClassName = classObj.split('/').pop();
                            }
                            
                            if (teamObj) {
                                userProfile.currentTeam = teamObj;
                                userProfile.currentTeamName = teamObj.replace(/([^\/]*\/){2}/, '');
                            }
                           window.PeBL.emitEvent(window.PeBL.events.eventLoggedIn, userProfile);
                           window.Lightbox.close();
                       });
                   });
               });

               var getAnalytics = function(id) {
                 PeBL.user.getUser(function(userProfile) {
                     if (userProfile) {
                         $('#analytics-spinner-dialog').modal('show');
                         spinLibrary(true, $('#analytics-spinner-body')[0]);
                         window.peblAnalyticsLoading = 4;
                         PeBL.storage.saveOutgoingXApi(userProfile, {
                             identity: userProfile.identity,
                             requestType: 'getChapterCompletionPercentages',
                             id: PeBL.utils.getUuid(),
                             params: {
                                 bookId: id,
                                 teamId: userProfile.currentTeam,
                                 classId: userProfile.currentClass,
                                 timestamp: 1
                             }
                         })

                         PeBL.storage.saveOutgoingXApi(userProfile, {
                             identity: userProfile.identity,
                             requestType: 'getMostAnsweredQuestions',
                             id: PeBL.utils.getUuid(),
                             params: {
                                 bookId: id,
                                 teamId: userProfile.currentTeam,
                                 classId: userProfile.currentClass
                             }
                         })

                         PeBL.storage.saveOutgoingXApi(userProfile, {
                             identity: userProfile.identity,
                             requestType: 'getQuizAttempts',
                             id: PeBL.utils.getUuid(),
                             params: {
                                 bookId: id,
                                 teamId: userProfile.currentTeam,
                                 classId: userProfile.currentClass
                             }
                         })

                         PeBL.storage.saveOutgoingXApi(userProfile, {
                             identity: userProfile.identity,
                             requestType: 'getReportedThreadedMessages',
                             id: PeBL.utils.getUuid(),
                             params: {
                               bookId: id,
                               teamId: userProfile.currentTeam,
                               classId: userProfile.currentClass
                             }
                         })
                     }
                 })
               }

               $(document.body).on('click', '#adminSidebarToggleButton', function() {
                   $('#adminSidebar').toggleClass('is-collapsed');
               });

               $(document.body).on('click', '#adminSidebarLibraryButton', function() {
                   $('#library-body').show();
                   $('#analytics-body').hide();
                   $('#adminSidebarLibraryButton').addClass('is-active');
                   $('#adminSidebarAnalyticsButton').removeClass('is-active');
               });

               $(document.body).on('click', '#adminSidebarAnalyticsButton', function() {
                   if (window.libraryItems.length > 1) {
                     $('#analytics-book-title').show();
                   } else {
                     $('#analytics-book-title').hide();
                   }
                   $('#analytics-book-title').children().remove();
                   for (var book of window.libraryItems) {
                     var item = document.createElement('option');
                     item.textContent = book.title;
                     item.value = book.id;
                     $('#analytics-book-title').append(item);
                   }
                   $('#library-body').hide();
                   $('#analytics-body').show();
                   $('#adminSidebarAnalyticsButton').addClass('is-active');
                   $('#adminSidebarLibraryButton').removeClass('is-active');
                   getAnalytics(window.libraryItems[0].id);
               });

               $(document.body).on('change', '#analytics-book-title', function(evt) {
                 getAnalytics(evt.target.value);
               });

               var showAnalytics = function() {
                   window.peblAnalyticsLoading--;
                   if (window.peblAnalyticsLoading === 0) {
                       spinLibrary(false);
                       $('#analytics-spinner-dialog').modal('hide');
                       $('#retrieveAnalyticsButton').hide();
                       $('#analytics-content').show();
                   }
               }

               $(document).off('getChapterCompletionPercentages').on('getChapterCompletionPercentages', function(e) {
                   showAnalytics();
                   var keys = Object.keys(e.detail).sort();
                   var container = document.getElementById('percentageCompletionContainer');
                   $(container).children().remove();
                   for (var i = 0; i < keys.length; i++) {
                       var canvas = document.createElement('canvas');
                       var canvasContainer = document.createElement('div');
                       var title = document.createElement('h4');
                       title.textContent = keys[i];

                       e.detail[keys[i]] = parseInt(e.detail[keys[i]]);

                       canvasContainer.appendChild(title);
                       canvasContainer.appendChild(canvas);
                       container.appendChild(canvasContainer);
                       var ctx = canvas.getContext('2d');
                       var chart = new Chart(ctx, {
                            // The type of chart we want to create
                            type: 'doughnut',

                            // The data for our dataset
                            data: {
                                labels: ['Complete', 'Incomplete'],
                                datasets: [{
                                    backgroundColor: ['#ffb74d', '#e0e0e0'],
                                    borderColor: ['#ffb74d', '#e0e0e0'],
                                    data: [e.detail[keys[i]], (100 - e.detail[keys[i]])]
                                }]
                            },

                            plugins: [{
                                beforeDraw: function (chart) {
                                    if (chart.config.options.elements.center) {
                                        var width = chart.chart.width,
                                        height = chart.chart.height,
                                        ctx = chart.chart.ctx;
                                        ctx.restore();
                                        var fontSize = (height / 114).toFixed(2);
                                        ctx.font = fontSize + "em sans-serif";
                                        ctx.textBaseline = "middle";
                                        var text = chart.config.options.elements.center.text,
                                            textX = Math.round((width - ctx.measureText(text).width) / 2),
                                            textY = height / 2;
                                        ctx.fillText(text, textX, textY);
                                        ctx.save();
                                    }
                                }
                            }],

                            // Configuration options go here
                            options: {
                                elements: {
                                    center: {
                                        text: e.detail[keys[i]] + '%'
                                    }
                                },
                                legend: {
                                    display: false
                                },
                                cutoutPercentage: 75
                            }
                        });
                   }
               });

               $(document).off('getMostAnsweredQuestions').on('getMostAnsweredQuestions', function(e) {
                   showAnalytics();
                   console.log(e.detail);
                   var container = document.getElementById('mostAnsweredQuestionCountsContainer');
                   $(container).children().remove();
                   for (var i = 0; i < e.detail.length; i++) {
                       var elem = document.createElement('div');
                       var count = document.createElement('span');
                       var prompt = document.createElement('a');

                       count.textContent = e.detail[i].count;
                       elem.appendChild(count);

                       prompt.textContent = e.detail[i].prompt.trim();
                       prompt.href = e.detail[i].url;
                       elem.appendChild(prompt);

                       container.appendChild(elem);
                   }
               })

               $(document).off('getLeastAnsweredQuestions').on('getLeastAnsweredQuestions', function(e) {
                   showAnalytics();
                   console.log(e.detail);
                   var container = document.getElementById('leastAnsweredQuestionCountsContainer');
                   $(container).children().remove();
                   for (var i = 0; i < e.detail.length; i++) {
                       var elem = document.createElement('div');
                       var count = document.createElement('span');
                       var prompt = document.createElement('a');

                       count.textContent = e.detail[i].count;
                       elem.appendChild(count);

                       prompt.textContent = e.detail[i].prompt.trim();
                       prompt.href = e.detail[i].url;
                       elem.appendChild(prompt);

                       container.appendChild(elem);
                   }
               })

               $(document).off('getQuizAttempts').on('getQuizAttempts', function(e) {
                   showAnalytics();
                   console.log(e.detail);
                   var container = document.getElementById('quizChartContainer');
                   $(container).children().remove();

                   var quizes = Object.keys(e.detail).map(function(x) {
                     return e.detail[x];
                   }).sort(function(a, b) {
                     return b.totalCount - a.totalCount;
                   });

                   for (var i = 0; i < quizes.length; i++) {
                       var responses = Object.keys(quizes[i].responses).sort();
                       var backgroundColors = [];
                       var responseCounts = [];
                       for (var j = 0; j < responses.length; j++) {
                           if (quizes[i].responses[responses[j]].success)
                               backgroundColors.push('#ffb74d');
                           else
                               backgroundColors.push('#e0e0e0');

                           responseCounts.push(quizes[i].responses[responses[j]].count);
                       }
                       
                       var quizContainer = document.createElement('div');

                       var quizPrompt = document.createElement('a');
                       quizPrompt.href = quizes[i].url;
                       quizPrompt.textContent = quizes[i].prompt;

                       var canvas = document.createElement('canvas');

                       var ctx = canvas.getContext('2d');
                       var chart = new Chart(ctx, {
                            // The type of chart we want to create
                            type: 'horizontalBar',

                            // The data for our dataset
                            data: {
                                labels: responses,
                                datasets: [{
                                    backgroundColor: backgroundColors,
                                    borderColor: backgroundColors,
                                    data: responseCounts,
                                    barThickness: 'flex'
                                }]
                            },

                            plugins: [{
                                beforeInit: function(chart) {
                                  chart.data.labels.forEach(function(e, i, a) {
                                     if (/\n/.test(e)) {
                                        a[i] = e.split(/\n/);
                                     }
                                     if (e.length > 23)
                                         a[i] = e.substr(0,20) + '...';
                                  });
                               }
                            }],

                            // Configuration options go here
                            options: {
                                legend: {
                                    display: false
                                },
                                scales: {
                                    xAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            precision: 0
                                        }
                                    }]
                                }
                            }
                        });

                       quizContainer.appendChild(quizPrompt);
                       quizContainer.appendChild(canvas);

                       container.appendChild(quizContainer);
                   }
               })

               $(document).off('getReportedThreadedMessages').on('getReportedThreadedMessages', function(e) {
                   showAnalytics();
                   console.log(e.detail);
                   
                   PeBL.user.getUser(function(userProfile) {
                     var messages = e.detail.sort(function(a, b) {
                       return b.count - a.count;
                     })

                     var container = document.getElementById('reportedMessagesCountsContainer');
                     $(container).children().remove();
                     for (var i = 0; i < messages.length; i++) {
                         var message = messages[i];
                         var parsedMessage = JSON.parse(message.message);
                         var elem = document.createElement('div');
                         elem.id = message.messageid;

                         var count = document.createElement('span');
                         count.textContent = messages[i].count;
                         elem.appendChild(count);

                         var prompt = document.createElement('a');
                         prompt.textContent = messages[i].prompt.trim();
                         prompt.href = messages[i].url;

                         var username = document.createElement('span');
                         username.classList.add('username');
                         username.textContent = message.identity;

                         var messageText = document.createElement('span');
                         messageText.textContent = parsedMessage.result.response;

                         var controlsWrapper = document.createElement('div');
                         var deleteButton = document.createElement('button');
                         deleteButton.classList.add('btn', 'btn-primary')
                         deleteButton.textContent = 'Delete Message';
                         (function(parsedMessage) {
                           deleteButton.addEventListener('click', function() {
                                Dialogs.showModalPrompt('Confirm', 'Delete this message?', 'Confirm', 'Cancel', () => {
                                    $('#' + parsedMessage.id).remove();
                                    PeBL.emitEvent(PeBL.events.removedMessage, {
                                        message: parsedMessage,
                                        activityType: 'discussion',
                                        activityId: parsedMessage.thread
                                    });
                                }, () => {
                                    //
                                })
                           });
                         })(parsedMessage);
                         
                         controlsWrapper.appendChild(deleteButton);

                         var wrapper = document.createElement('div');
                         wrapper.appendChild(prompt);
                         wrapper.appendChild(username);
                         wrapper.appendChild(messageText);
                         wrapper.appendChild(controlsWrapper);
                         elem.appendChild(wrapper);

                         container.appendChild(elem);
                     }
                   })
               })

               $(document).on('eventLoggedIn', function(e) {
                   var userProfile = e.detail;
                   if (userProfile.currentTeamName) {
                       $('#readerCurrentClassContainer').show();
                       $('#readerCurrentClass').text(userProfile.currentTeamName);
                   } else if (userProfile.currentClassName) {
                       $('#readerCurrentClassContainer').show();
                       $('#readerCurrentClass').text(userProfile.currentClassName);
                   } else {
                       $('#readerCurrentClassContainer').hide();
                   }

                   var analyticsPermission = false;
                   var uploadPermission = false;

                //    if (userProfile.currentTeam && userProfile.role === 'instructor')
                //        analyticsPermission = true;
                //    if (userProfile.currentTeam && userProfile.role === 'admin') {
                //        analyticsPermission = true;
                //        uploadPermission = true;
                //    }
                   
                   // Trey: Allow everyone analytics
                   analyticsPermission = true;
                   uploadPermission = true;

                   if (analyticsPermission) {
                       $('#app-container').addClass('show-adminSidebar');
                   } else {
                       $('#app-container').removeClass('show-adminSidebar');
                   }

                   if (uploadPermission) {
                       $('#app-navbar').addClass('show-upload');
                       $('#app-container').addClass('show-delete');
                   } else {
                       $('#app-navbar').removeClass('show-upload');
                       $('#app-container').removeClass('show-delete');
                   }
               });

               window.addEventListener('message', function(event) {
                   console.log(event);
                   var data = JSON.parse(event.data);
                   if (data.message === 'extensionDashboardSync') {
                       var handleSync = function() {
                           window.extensionDashboard = {};
                           window.extensionDashboard.programID = data.programID;
                           window.extensionDashboard.userProfile = data.userProfile;
                           window.extensionDashboard.programTitle = data.programTitle;
                           window.extensionDashboard.isAdmin = data.isAdmin;
                           if (data.userProfile) {
                               PeBL.emitEvent(PeBL.events.eventLoggedIn, data.userProfile);
                               window.Lightbox.close();
                           }

                           if (data.redirectUrl) {
                               window.location.href = data.redirectUrl;
                           }

                           console.log('SUCCESS');
                       }

                       window.PeBL.user.isLoggedIn(function(isLoggedIn) {
                           if (isLoggedIn) {
                               window.PeBL.user.getUser(function(userProfile) {
                                   if (userProfile.identity !== data.userProfile.identity || (window.extensionDashboard && window.extensionDashboard.programID && (window.extensionDashboard.programID !== data.programID))) {
                                       setTimeout(function() {
                                           window.location.href = window.location.href;
                                       }, 10);
                                       handleSync();
                                   } else {
                                       handleSync();
                                   }
                               });
                           } else {
                               handleSync();
                           }
                       });
                   }
               }, false);

               if (window.opener) {
                   var urlParams = new URLSearchParams(window.location.search);
                   var redirectUrl = urlParams.get('redirectUrl');
                   var message = {
                       "message": "bookshelfLoaded"
                   }

                   if (redirectUrl) {
                       message.redirectUrl = unescape(redirectUrl);
                   }

                   window.opener.postMessage(JSON.stringify(message), '*');
               }

           }

           var applyKeyboardSettingsAndLoadUi = function(data)
           {
               PeBL.emitEvent(PeBL.events.newBook, {
                   book: window.location.origin
               });
               if (data && data.epubs && (typeof data.epubs == "string")) {

                   // this is normally init'ed at page launch using the "epubs" URL GET query parameter,
                   // but needs manually setting when using pushState() to refresh the page contents with a different library source
                   moduleConfig.epubLibraryPath = data.epubs;
               }

               // override current scheme with user options
               Settings.get('reader', function(json)
                            {
                   Keyboard.applySettings(json);

                   loadLibraryUI();

                   if (data && data.importEPUB) { // File/Blob, possibly Array
                       importEpub(data.importEPUB);
                   }
               });
           };
           window.setReplaceByDefault = function(replace){
               // Note: automatically JSON.stringify's the passed value!
               Settings.put('replaceByDefault', String(replace));
           }
           return {
               loadUI : applyKeyboardSettingsAndLoadUi,
               unloadUI : unloadLibraryUI,
               importEpub : importEpub
           };
       });