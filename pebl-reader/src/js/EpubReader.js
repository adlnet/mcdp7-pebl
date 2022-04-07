define([
    "readium_shared_js/globalsSetup",
    "readium_shared_js/globals",
    './ModuleConfig',
    'underscore',
    'bootstrap',
    'bootstrapA11y',
    'URIjs',
    './Spinner',
    'Settings',
    'i18nStrings',
    './Dialogs',
    './ReaderSettingsDialog',
    'hgn!readium_js_viewer_html_templates/about-dialog.html',
    'hgn!readium_js_viewer_html_templates/reader-navbar.html',
    'hgn!readium_js_viewer_html_templates/reader-body.html',
    'hgn!readium_js_viewer_html_templates/reader-body-page-btns.html',
    'hgn!readium_js_viewer_html_templates/add-bookmark-dialog.html',
    'hgn!readium_js_viewer_html_templates/add-note-dialog.html',
    'hgn!readium_js_viewer_html_templates/fullscreen-image-dialog.html',
    'Analytics',
    'screenfull',
    './Keyboard',
    './EpubReaderMediaOverlays',
    './EpubReaderBackgroundAudioTrack',
    './gestures',
    'readium_js/Readium',
    'readium_shared_js/helpers',
    'readium_shared_js/models/bookmark_data'],

       function(
           globalSetup,
           Globals,
           moduleConfig,
           _,
           bootstrap,
           bootstrapA11y,
           URI,
           spinner,
           Settings,
           Strings,
           Dialogs,
           SettingsDialog,
           AboutDialog,
           ReaderNavbar,
           ReaderBody,
           ReaderBodyPageButtons,
           AddBookmarkDialog,
           AddNoteDialog,
           FullScreenImageDialog,
           Analytics,
           screenfull,
           Keyboard,
           EpubReaderMediaOverlays,
           EpubReaderBackgroundAudioTrack,
           GesturesHandler,
           Readium,
           Helpers,
           BookmarkData) {

           // initialised in initReadium()
           var readium = undefined;

           // initialised in loadReaderUI(), with passed data.embedded
           var embedded = undefined;

           // initialised in loadReaderUI(), with passed data.epub
           var ebookURL = undefined;
           var ebookURL_filepath = undefined;

           // initialised in loadEbook() >> readium.openPackageDocument()
           var currentPackageDocument = undefined;
           var currentSliderToc = undefined;

           // initialised in initReadium()
           // (variable not actually used anywhere here, but top-level to indicate that its lifespan is that of the reader object (not to be garbage-collected))
           var gesturesHandler = undefined;

           var readerUtils = {};

           window.readerUtils = readerUtils;

           readerUtils.setTocHrefCompleted = function (href) {
               $('#readium-toc-body').find('a[href="' + href + '"]').each(function() {
                   $(this).addClass('complete');
               });
           }

           readerUtils.setTocIdrefCompleted = function (idref) {
               var spine = ReadiumSDK.reader.spine().getItemById(idref);
               if (spine && spine.href)
                   readerUtils.setTocHrefCompleted(spine.href);
               else
                   console.error('No spine item found with idref: ' + idref);
           }

           readerUtils.hideNativeTOC = function() {
               $('#tocButt').hide();
           }

           readerUtils.showNativeTOC = function() {
               $('#tocButt').show();
           }

           readerUtils.hideAnnotationButton = function() {
               $('.icon-annotations').hide();
           }

           readerUtils.showAnnotationButton = function() {
               $('.icon-annotations').show();
           }

           readerUtils.hideAnnotationsListButton = function() {
               $('.icon-show-annotations').hide();
           }

           readerUtils.showAnnotationsListButton = function() {
               $('.icon-show-annotations').show();
           }


           // TODO: is this variable actually used anywhere here??
           // (bad naming convention, hard to find usages of "el")
           var el = document.documentElement;

           var tooltipSelector = function() {
               return 'nav *[title], #readium-page-btns *[title]';
           };

           var ensureUrlIsRelativeToApp = function(ebookURL) {

               if (!ebookURL) {
                   return ebookURL;
               }

               if (ebookURL.indexOf("http") != 0) {
                   return ebookURL;
               }

               var isHTTPS = (ebookURL.indexOf("https") == 0);

               var CORS_PROXY_HTTP_TOKEN = "/http://";
               var CORS_PROXY_HTTPS_TOKEN = "/https://";

               // Ensures URLs like http://crossorigin.me/http://domain.com/etc
               // do not end-up loosing the double forward slash in http://domain.com
               // (because of URI.absoluteTo() path normalisation)
               var CORS_PROXY_HTTP_TOKEN_ESCAPED = "/http%3A%2F%2F";
               var CORS_PROXY_HTTPS_TOKEN_ESCAPED = "/https%3A%2F%2F";

               // case-insensitive regexp for percent-escapes
               var regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED = new RegExp("/(http[s]?):%2F%2F", "gi");

               var appUrl =
                   window.location ? (
                       window.location.protocol +
                           "//" +
                           window.location.hostname +
                           (window.location.port ? (':' + window.location.port) : '') +
                           window.location.pathname
                   ) : undefined;

               if (appUrl) {
                   console.log("EPUB URL absolute: " + ebookURL);
                   console.log("App URL: " + appUrl);

                   ebookURL = ebookURL.replace(CORS_PROXY_HTTP_TOKEN, CORS_PROXY_HTTP_TOKEN_ESCAPED);
                   ebookURL = ebookURL.replace(CORS_PROXY_HTTPS_TOKEN, CORS_PROXY_HTTPS_TOKEN_ESCAPED);

                   // console.log("EPUB URL absolute 1: " + ebookURL);

                   ebookURL = new URI(ebookURL).relativeTo(appUrl).toString();
                   if (ebookURL.indexOf("//") == 0) { // URI.relativeTo() sometimes returns "//domain.com/path" without the protocol
                       ebookURL = (isHTTPS ? "https:" : "http:") + ebookURL;
                   }

                   // console.log("EPUB URL absolute 2: " + ebookURL);

                   ebookURL = ebookURL.replace(regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED, "/$1://");

                   console.log("EPUB URL relative to app: " + ebookURL);
               }

               return ebookURL;
           };

           function setBookTitle(title) {

            //    var $titleEl = $('.book-title-header');
            //    if ($titleEl.length) {
            //        $titleEl.text(title);
            //    } else {
            //        $('<h1 class="book-title-header"></h1>').insertAfter('#reading-area').text(title);
            //    }

               $('#webreaderTitle').text(title);
           };

           var _debugBookmarkData_goto = undefined;
           var debugBookmarkData = function(cfi) {

               if (!readium) return;
               readium.reader.debugBookmarkData(cfi);
           };

           var constructEbookTitle = function(ebookURL) {
               var title = ebookURL.replace('epub_content/bookshelf/', '');
               if (!(title.slice(-5) === '.epub'))
                   title = title + '.epub';

               return title;
           };

           var checkCompletion = function() {
               var currentPage = getCurrentPageNumber();

               var totalPages = getPageCountOfCurrentChapter();

               if (currentPage === totalPages) {
                   var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
                   var urlParams = new URLSearchParams(window.location.search);
                   var epub = urlParams.get('epub');
                   var chapterTitle;

                   for (let item of currentSliderToc) {
                       if (item.idref === bookmark.idref) {
                           chapterTitle = item.title;
                           break;
                       }
                   }

                   PeBL.emitEvent(PeBL.events.eventExperienced, {
                       type: 'chapter',
                       activityURI: window.location.origin + '/?epub=' + epub + '&goto=' + encodeURIComponent('{"idref": "' + bookmark.idref + '"}'),
                       activityType: 'chapter',
                       name: chapterTitle,
                       idref: bookmark.idref,
                       cfi: bookmark.contentCFI
                   });
               }
           }

           var getSpineHrefMap = function (spine) {

                var map = {};

                for (var item of spine.items) {
                    var trimmed = item.href.split("/").pop();
                    map[trimmed] = item;
                }
                
                return map;
           };

           var initializeSlider = function() {
               currentPackageDocument.generateTocListDOM(function(dom) {

                   console.log(dom);

                //    var nav;
                //    if (dom.getElementById) {
                //        nav = dom.getElementById('toc');
                //    } else {
                //        // NCX toc returns an ol element
                //        nav = dom;
                //    }

                   var chaptersArray = [];
                   var currentChapterTitle = null;
                   var currentIdref = null;

                   var spine = readium.reader.spine();
                   var spineItemMap = getSpineHrefMap(spine);

                //    console.log("Current Spine:", spine);

                   // $(nav).find('a').each(function() {
                   $("#readium-toc-body").find('a').each(function() {

                        console.log("Chapter Link:", this);

                       var href = this.href.split('/').pop();
                       var hashIndex = href.indexOf('#');
                       var hrefPart;
                       var elementId;
                       var chapterTitle;

                       if (hashIndex >= 0) {
                           hrefPart = href.substr(0, hashIndex);
                           elementId = href.substr(hashIndex + 1);
                       } else {
                           hrefPart = href;
                           elementId = undefined;
                       }

                    //    var spineItem = readium.reader.spine().getItemByHref(hrefPart);
                       var spineItem = spineItemMap[hrefPart];
                       if (spineItem == undefined)
                          return;

                       if (currentIdref == null)
                           currentIdref = spineItem.idref;

                       if (currentIdref === spineItem.idref) {
                           chapterTitle = currentChapterTitle;
                       } else {
                           chapterTitle = this.text;
                           currentIdref = spineItem.idref;
                           currentChapterTitle = this.text
                       }

                       var item = {
                           href: this.href,
                           title: this.text,
                           idref: spineItem.idref,
                           elementId: elementId,
                           chapterTitle: chapterTitle
                       };
                       chaptersArray.push(item);
                   });
                   currentSliderToc = chaptersArray;
                   readium.reader.chaptersMap = chaptersArray;
               });
           }

           var getChapters = function() {
               return readium.reader.spine().items;
           };

           //Add a css rule to the page, needed for pseudo element styling
           var addRule = (function(style) {
               var sheet = document.head.appendChild(style).sheet;
               return function(selector, css) {
                   var propText = typeof css === "string" ? css : Object.keys(css).map(function(p) {
                       return p + ":" + (p === "content" ? "'" + css[p] + "'" : css[p]);
                   }).join(";");
                   sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
               };
           })(document.createElement("style"));


           var createNavigationSlider = function() {
               //Remove the old slider
               $('.sliderContainer').remove();
               $('.sliderInfoContainer').remove();
               $('.sliderPageContainer').remove();
               $('.bookSliderLabel').remove();

               var currentIdref = readium.reader.getFirstVisibleCfi().idref;

               //Get the number of pages in the chapter
               var pageCount = getPageCountOfCurrentChapter();

               //Get the number of the current page relative to the chapter
               var currentPage = getCurrentPageNumber();

               //index of chapter start
               var chapterStart = undefined;

               //index of chapter end
               var chapterEnd = undefined;

               //deep copy the toc array, leave original untouched
               var chapters = JSON.parse(JSON.stringify(currentSliderToc));

               //index of the page we're on
               var currentPageIndex = undefined;


               for (var i = 0; i < chapters.length; i++) {
                   if (chapters[i].idref === currentIdref) {
                       //Mark the chapter start
                       chapterStart = i;
                       while (i < chapters.length && chapters[i].idref === currentIdref) {
                           //Set the page number for each 'subchapter' in this chapter
                           chapters[i].pageNumber = typeof chapters[i].elementId !== 'undefined' ? getPageNumberForElement(readium.reader.getElementById(currentIdref, chapters[i].elementId)) : 1;
                           //Mark the chapter end
                           chapterEnd = i;
                           i++;
                       }
                       break;
                   }
               }

               //deep copy again, this time with the page numbers added
               var newChapters = JSON.parse(JSON.stringify(chapters));

               //Used to draw the start and end points on the slider
               var point1 = chapterStart;
               var point2 = chapterEnd;

               //the index to insert filler pages to
               var insertIndex = chapterStart;

               //Loop through all the possible additional filler pages
               for (var i = 0; i < pageCount; i++) {
                   var inChapterPageObject = {
                       inChapterPageObject: true,
                       pageNumber: i + 1
                   }
                   var chapterMatch = false;
                   //If 'subchapter' already has a page number matching this potential filler page, we don't need to add a filler page
                   for (var j = chapterStart; j <= chapterEnd; j++) {
                       if (chapters[j].pageNumber === inChapterPageObject.pageNumber) {
                           chapterMatch = true;
                           insertIndex++;
                       }
                   }

                   //There was no match for this filler page, add the filler page
                   // if (!chapterMatch) {
                   //     newChapters.splice(insertIndex, 0, inChapterPageObject);
                   //     insertIndex++;
                   //     point2++;
                   // }
               }


               //Find out where to put the slider button for the current page
               var foundPage = false;
               var pageDiff = null;
               var estimatedSliderPosition = null;
               for (var i = chapterStart; i <= point2; i++) {
                   if (!pageDiff || (currentPage - newChapters[i].pageNumber <= pageDiff && currentPage - newChapters[i].pageNumber >= 0)) {
                       pageDiff = Math.abs(currentPage - newChapters[i].pageNumber);
                       estimatedSliderPosition = i;
                   }
                   currentPageIndex = i;
                   if (newChapters[i].pageNumber === currentPage) {
                       foundPage = true;
                       break;
                   }
               }

               if (!foundPage && estimatedSliderPosition) {
                   currentPageIndex = estimatedSliderPosition;
               }

               var chaptersWithoutFiller = newChapters.filter(function (page) {
                   if (!page.inChapterPageObject)
                       return true;
                   else
                       return false;
               });

               //Calculate the percentage of the slider that the pages in this chapter occupy
               // var percent1 = Math.floor((point1 / chaptersWithoutFiller.length) * 100);
               // var percent2 = Math.floor(((point2 + 1) / chaptersWithoutFiller.length) * 100);

               //TODO: Need style strings and rules for all browsers

               //Style the slider bar to show the section containing pages in this chapter
               // var styleString = 'linear-gradient(to right, rgba(236, 83, 83,0) ' + percent1 + '%, rgba(236, 83, 83,1) ' + percent1 + '%, rgba(236, 83, 83,1) ' + percent2 + '%, rgba(236, 83, 83,0) ' + percent2 + '%)';

               if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                   addRule('input[type=range]::-moz-range-track', {
                       // background: styleString,
                       height: '5px'
                   });
               } else if (navigator.userAgent.toLowerCase().indexOf('edge') > -1) {
                   addRule('input[type=range]::-ms-track', {
                       height: '5px'
                   });
               } else {
                   addRule('input[type=range]::-webkit-slider-runnable-track', {
                       // background: styleString,
                       height: '5px'
                   });
               }


               var sliderContainer = document.createElement('div');
               sliderContainer.classList.add('sliderContainer');

               var sliderPageContainer = document.createElement('div');
               sliderPageContainer.classList.add('sliderPageContainer');

               if (!window.PeBLConfig.disabledFeatures || !window.PeBLConfig.disabledFeatures.pageCount) {
                var sliderPageContainerText = document.createElement('span');
                sliderPageContainerText.textContent = currentPage + '/' + pageCount;
                sliderPageContainer.appendChild(sliderPageContainerText);
               }
               

               var sliderInfoContainer = document.createElement('div');
               sliderInfoContainer.classList.add('sliderInfoContainer');

               var sliderPageNumber = document.createElement('span');
               sliderPageNumber.id = 'sliderPageNumber';

               var sliderChapterName = document.createElement('span');
               sliderChapterName.id = 'sliderChapterName';

               var sliderSubChapterName = document.createElement('span');
               sliderSubChapterName.id = 'sliderSubChapterName';


               //sliderInfoContainer.appendChild(sliderPageNumber);
               sliderInfoContainer.appendChild(sliderChapterName);
               sliderInfoContainer.appendChild(sliderSubChapterName);

               var slider = document.createElement('input');
               slider.type = 'range';
               slider.role = 'slider';
               slider.title = 'Book Slider';
               slider.id = 'book-slider';
               slider.min = '0';
               slider.max = chaptersWithoutFiller.length - 1;
               $('#readium-slider').attr('aria-valuemax', slider.max);
               slider.step = '1';
               slider.value = currentPageIndex ? currentPageIndex : 0;
               $('#readium-slider').attr('aria-valuenow', slider.value);


               // Clear selection to prevent blue border bug that prevent slider from working
               slider.ondragstart = function() {
                   if (window.getSelection) {
                       if (window.getSelection().empty) {
                           window.getSelection().empty();
                       } else if (window.getSelection().removeAllRanges) {
                           window.getSelection().removeAllRanges();
                       }
                   } else if (document.selection && document.selection.empty) {
                       document.selection.empty();
                   }
               }

               slider.oninput = function() {
                   var val = Math.round(this.value);
                   //Show either the page or the chapter while dragging the slider
                   if (typeof newChapters[val].pageNumber !== 'undefined') {
                       //$(sliderPageNumber).text('Page ' + newChapters[val].pageNumber);
                       //$(sliderPageNumber).show();
                   } else {
                       //$(sliderPageNumber).hide();
                   }
                   if (typeof newChapters[val].title !== 'undefined') {
                       $(sliderSubChapterName).text(newChapters[val].title);
                       $(sliderSubChapterName).show();
                   } else {
                       $(sliderSubChapterName).hide();
                   }
                   if (newChapters[val].chapterTitle !== newChapters[val].title) {
                       $(sliderChapterName).text(newChapters[val].chapterTitle);
                       $(sliderChapterName).show();
                   } else {
                       $(sliderChapterName).hide();
                   }
                   $(sliderInfoContainer).addClass('visible');
               }

               var sliderSelectFunction = function(value) {
                   var val = Math.round(this.value || value);
                   var tocUrl = currentPackageDocument.getToc();
                   $(sliderInfoContainer).removeClass('visible');
                   if (typeof newChapters[val].pageNumber == 'undefined') {
                       try {
                           spin(true);

                           var href = newChapters[val].href.split('/').pop();
                           //href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href;

                           _tocLinkActivated = true;

                           readium.reader.openContentUrl(href, tocUrl, undefined);
                       } catch (err) {

                           console.error(err);

                       } finally {
                           //e.preventDefault();
                           //e.stopPropagation();
                           return false;
                       }
                   } else {
                       var iframe = $("#epub-reader-frame iframe")[0];
                       var iframeWindow = iframe.contentWindow || iframe.contentDocument;
                       var $body = $(iframeWindow.document.body);
                       var $html = $body.parent();
                       var columnCount = $html.css('column-count') === 'auto' ? 1 : $html.css('column-count');
                       var paginationInfo = readium.reader.getPaginationInfo();
                       var pageIndex;
                       if (columnCount == 2) {
                           pageIndex = (newChapters[val].pageNumber * 2) - 1;
                       } else {
                           pageIndex = newChapters[val].pageNumber - 1;
                       }
                       readium.reader.openPageIndex(pageIndex);

                       PeBL.emitEvent(PeBL.events.eventJumpPage, {});
                   }
               }

               slider.addEventListener('mouseup', sliderSelectFunction);

               //same as above, but for touch screens
               slider.addEventListener('touchend', sliderSelectFunction);

               slider.addEventListener('keypress', function(e) {
                   if (e.key === 'Enter')
                       sliderSelectFunction(e.target.value);
               })


               sliderContainer.appendChild(slider);
               var sliderLabel = document.createElement('label');
               sliderLabel.setAttribute('for', 'book-slider');
               sliderLabel.classList.add('bookSliderLabel');
               sliderLabel.textContent = 'Navigation Slider';

               //Add the chapter title and page number under the slider
               //$('#readium-page-count').text(newChapters[chapterStart].title + ': Page ' + currentPage);
               $('#readium-slider').prepend($(sliderPageContainer));
               $('#readium-slider').prepend($(sliderContainer));
               $('#readium-slider').prepend($(sliderLabel));
               $('#readium-slider').append($(sliderInfoContainer));
           };


           var getPageCountOfCurrentChapter = function() {
               var iframe = $("#epub-reader-frame iframe")[0];
               var iframeWindow = iframe.contentWindow || iframe.contentDocument;
               var $body = $(iframeWindow.document.body);
               var $html = $body.parent();
               var columnCount = $html.css('column-count') === 'auto' ? 1 : $html.css('column-count');
               var paginationInfo = readium.reader.getPaginationInfo();
               if (columnCount == 2) {
                   return Math.ceil(paginationInfo.openPages[0].spineItemPageCount / 2);
               } else {
                   return paginationInfo.openPages[0].spineItemPageCount;
               }
           };

           var getCurrentPageNumber = function() {
               var iframe = $("#epub-reader-frame iframe")[0];
               var iframeWindow = iframe.contentWindow || iframe.contentDocument;
               var $body = $(iframeWindow.document.body);
               var $html = $body.parent();
               var columnCount = $html.css('column-count') === 'auto' ? 1 : $html.css('column-count');
               var paginationInfo = readium.reader.getPaginationInfo();
               if (columnCount == 2) {
                   return Math.ceil((paginationInfo.openPages[0].spineItemPageIndex + 1) / 2);
               } else {
                   return Math.ceil(paginationInfo.openPages[0].spineItemPageIndex + 1);
               }
           };

           var getPageNumberForElement = function(element) {
               var iframe = $("#epub-reader-frame iframe")[0];
               var iframeWindow = iframe.contentWindow || iframe.contentDocument;
               var $body = $(iframeWindow.document.body);
               var $html = $body.parent();
               var contentHeight = parseInt($body.css('height'));
               var pageHeight = parseInt($html.css('height'));
               var pageWidth = $html.width();
               var columnCount = $html.css('column-count') === 'auto' ? 1 : $html.css('column-count');

               var firstElement = element;
               if (typeof firstElement[0].offsetTop === 'undefined')
                   while (typeof firstElement[0].offsetTop === 'undefined')
                       firstElement = firstElement.parent();

               var offsetTop = firstElement[0].offsetTop;
               var offsetLeft = firstElement[0].offsetLeft;

               var temp1;

               //Edge and firefox need to use offsetLeft and pageWidth
               if (navigator.userAgent.toLowerCase().indexOf('edge') > -1 || navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                 temp1 = offsetLeft / pageWidth;
               } else {
                 temp1 = offsetTop / pageHeight;
               }

               //Nudge it over the edge if the pageHeight happens to match the offset exactly
               if (offsetTop % pageHeight === 0)
                   temp1 += 0.0001;

               var temp2;
               if (navigator.userAgent.toLowerCase().indexOf('edge') > -1 || navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                 temp2 = Math.ceil(temp1);
               } else {
                 temp2 = Math.ceil(temp1 / columnCount);
               }
                

               if (temp2 < 1)
                   temp2 = 1;

               return temp2;
           };

           var initializeEpubReaderCssFile = function(packageDocument) {
             var readerCss = document.getElementById('epubReaderCss');
             if (readerCss)
               readerCss.remove();

             var metadata = packageDocument.getMetadata();
             if (metadata.reader_css) {
               readium.getCurrentPublicationFetcher().getFileContentsFromPackage(metadata.reader_css, function(cssContents) {
                 readerCss = document.createElement('style');
                 readerCss.id = 'epubReaderCss';
                 readerCss.textContent = cssContents;

                 document.getElementsByTagName('head')[0].appendChild(readerCss);
               }, function(error) {
                 console.error(error);
               })
             }
           }

           // This function will retrieve a package document and load an EPUB
           var loadEbook = function(readerSettings, openPageRequest) {
               readium.openPackageDocument(

                   ebookURL,

                   function(packageDocument, options) {

                       if (!packageDocument) {

                           console.error("ERROR OPENING EBOOK: " + ebookURL_filepath);

                           spin(false);
                           setBookTitle(ebookURL_filepath);

                           Dialogs.showErrorWithDetails(Strings.err_epub_corrupt, ebookURL_filepath);
                           //Dialogs.showModalMessage(Strings.err_dlg_title, ebookURL_filepath);

                           return;
                       }

                       currentPackageDocument = packageDocument;
                       currentPackageDocument.generateTocListDOM(function(dom) {
                           loadToc(dom)
                       });

                       initializeEpubReaderCssFile(currentPackageDocument);

                       wasFixed = readium.reader.isCurrentViewFixedLayout();
                       var metadata = options.metadata;
                       setBookTitle(metadata.title);

                       initializeSlider();

                       $("#left-page-btn").unbind("click");
                       $("#right-page-btn").unbind("click");
                       var $pageBtnsContainer = $('#readium-page-btns');
                       $pageBtnsContainer.empty();
                       var rtl = currentPackageDocument.getPageProgressionDirection() === "rtl"; //_package.spine.isLeftToRight()
                       $pageBtnsContainer.append(ReaderBodyPageButtons({
                           strings: Strings,
                           dialogs: Dialogs,
                           keyboard: Keyboard,
                           pageProgressionDirectionIsRTL: rtl
                       }));
                       $("#left-page-btn").on("click", prevPage);
                       $("#right-page-btn").on("click", nextPage);
                       $("#left-page-btn").mouseleave(function() {
                           $(tooltipSelector()).tooltip('destroy');
                       });
                       $("#right-page-btn").mouseleave(function() {
                           $(tooltipSelector()).tooltip('destroy');
                       });

                   },
                   openPageRequest
               );
           };

           var spin = function(on) {
               if (on) {
                   //console.error("do SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                   if (spinner.willSpin || spinner.isSpinning) return;

                   spinner.willSpin = true;

                   setTimeout(function() {
                       if (spinner.stopRequested) {
                           //console.log("STOP REQUEST: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                           spinner.willSpin = false;
                           spinner.stopRequested = false;
                           return;
                       }
                       //console.log("SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                       spinner.isSpinning = true;
                       spinner.spin($('#reading-area')[0]);

                       spinner.willSpin = false;

                   }, 100);
               } else {

                   if (spinner.isSpinning) {
                       //console.log("!! SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                       spinner.stop();
                       spinner.isSpinning = false;
                   } else if (spinner.willSpin) {
                       //console.log("!! SPIN REQ: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                       spinner.stopRequested = true;
                   }
               }
           };

           var tocShowHideToggle = function() {

               unhideUI();

               var $appContainer = $('#app-container'),
                   hide = $appContainer.hasClass('toc-visible');
               var bookmark;
               $appContainer.removeClass();
               if (readium.reader.handleViewportResize && !embedded) {
                   bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
               }

               if (hide) {
                   $appContainer.removeClass('toc-visible');

                   // clear tabindex off of any previously focused ToC item
                   var existsFocusable = $('#readium-toc-body a[tabindex="0"]');
                   if (existsFocusable.length > 0) {
                       existsFocusable[0].setAttribute("tabindex", "0");
                   }
                   /* end of clear focusable tab item */
                   setTimeout(function() { $('#tocButt')[0].focus(); }, 100);
                   PeBL.emitEvent(PeBL.events.eventUndisplayed, {
                       activityType: 'reader-toc',
                       type: 'TOC'
                   });
               } else {
                   $appContainer.addClass('toc-visible');

                   setTimeout(function() { $('#readium-toc-body button.close')[0].focus(); }, 1000);
                   PeBL.emitEvent(PeBL.events.eventDisplayed, {
                       activityType: 'reader-toc',
                       type: 'TOC'
                   });
               }

               if (embedded) {
                   hideLoop(null, true);
               } else if (readium.reader.handleViewportResize) {
                   setTimeout(function () {
                       readium.reader.handleViewportResize(bookmark);
                   }, 200);
                   // setTimeout(function()
                   // {
                   //     readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
                   // }, 90);
               }
           };

           var annotationCallback = function(stmts) {
               for (var stmt of stmts) {
                   if (stmt.type === 2) {
                       (function(stmt) {
                           if ($("#annotation-" + stmt.id).length == 0) {
                               var annotationContainer = document.createElement('div');
                               annotationContainer.id = "annotation-" + stmt.id;
                               annotationContainer.setAttribute('tabindex', '0');
                               annotationContainer.setAttribute('aria-label', stmt.title);
                               annotationContainer.classList.add('annotation');
                               var annotation = document.createElement('div');
                               var annotationTitle = document.createElement('span');
                               annotationTitle.textContent = stmt.title;
                               annotation.appendChild(annotationTitle);
                               var note = document.createElement('div');
                               var noteText = document.createElement('span');
                               if (stmt.text)
                                   noteText.textContent = stmt.text;
                               note.appendChild(noteText);

                               annotationContainer.appendChild(annotation);
                               annotationContainer.appendChild(note);

                               annotationContainer.addEventListener('click', function() {
                                   PeBL.emitEvent(PeBL.events.eventAccessed, {
                                       type: 'annotation',
                                       activityType: 'reader-annotation',
                                       activityId: stmt.id,
                                       name: stmt.title,
                                       description: stmt.text,
                                       idref: stmt.idRef,
                                       cfi: stmt.cfi
                                   });
                                   readium.reader.openSpineItemElementCfi(stmt.idRef, stmt.cfi);
                               });

                               annotationContainer.addEventListener('contextmenu', function(evt) {
                                   evt.preventDefault();
                                   showAnnotationContextMenu(evt, stmt, true);
                               });

                               $('#my-annotations div[data-id="' + stmt.idRef + '"]').append($(annotationContainer));
                           }
                       })(stmt);
                   }
               }
           };

           var sharedAnnotationCallback = function(stmts) {
               PeBL.user.getUser(function(userProfile) {
                   for (var stmt of stmts) {
                       if (stmt.groupId === userProfile.currentTeam || stmt.groupId === userProfile.currentClass) {
                           if (stmt.type === 3) {
                               (function(stmt) {
                                   if ($("#sharedAnnotation-" + stmt.id).length == 0) {
                                       var annotationContainer = document.createElement('div');
                                       annotationContainer.id = "sharedAnnotation-" + stmt.id;
                                       annotationContainer.setAttribute('tabindex', '0');
                                       annotationContainer.setAttribute('aria-label', stmt.title);

                                       annotationContainer.classList.add('annotation');

                                       var annotation = document.createElement('div');

                                       var pinnedIcon = document.createElement('i');
                                       pinnedIcon.classList.add('fa', 'fa-star', 'pinnedIcon');
                                       annotation.appendChild(pinnedIcon);

                                       if (stmt.pinned)
                                           annotationContainer.classList.add('pinned');

                                       var annotationTitle = document.createElement('span');
                                       annotationTitle.textContent = stmt.title;
                                       annotation.appendChild(annotationTitle);
                                       var note = document.createElement('div');
                                       var noteText = document.createElement('span');
                                       if (stmt.text)
                                           noteText.textContent = stmt.text;
                                       note.appendChild(noteText);


                                       annotationContainer.appendChild(annotation);
                                       annotationContainer.appendChild(note);

                                       annotationContainer.addEventListener('click', function() {
                                           PeBL.emitEvent(PeBL.events.eventAccessed, {
                                               type: 'annotation',
                                               activityType: 'reader-annotation',
                                               activityId: stmt.id,
                                               name: stmt.title,
                                               description: stmt.text,
                                               idref: stmt.idRef,
                                               cfi: stmt.cfi
                                           });
                                           readium.reader.openSpineItemElementCfi(stmt.idRef, stmt.cfi);
                                       });

                                       annotationContainer.addEventListener('contextmenu', function(evt) {
                                           evt.preventDefault();
                                           showAnnotationContextMenu(evt, stmt, true);
                                       });

                                       if (stmt.owner === userProfile.identity)
                                           $('#my-shared-annotations div[data-id="' + stmt.idRef + '"]').append($(annotationContainer));
                                       else
                                           $('#general-shared-annotations div[data-id="' + stmt.idRef + '"]').append($(annotationContainer));
                                   }
                               })(stmt);
                           }
                       }
                   }
               });
           };

           var addAnnotationChapterSections = function(id) {
               var chaptersAdded = {};
               for (var chapter of readium.reader.chaptersMap) {
                   if (!chaptersAdded[chapter.idref]) {
                       chaptersAdded[chapter.idref] = true;
                       $('#' + id).append('<div data-id="' + chapter.idref + '"><h3 class="hideWhenOnlyChild">' + chapter.title + '</h3></div>');
                   }
               }
           }

           var setDownloadAnnotationsButton = function() {
             $('#downloadAnnotationsButton').off();
             $('#downloadAnnotationsButton').on('click', function() {
               var annotationsByIdref = {};
               var annotationsByChapter = {};
               PeBL.user.getUser(function(userProfile) {
                   PeBL.utils.getAnnotations(function(stmts) {
                     for (var stmt of stmts) {
                         if (stmt.type === 2) {
                             if (!annotationsByIdref[stmt.idRef])
                               annotationsByIdref[stmt.idRef] = [];
                             annotationsByIdref[stmt.idRef].push(stmt);
                         }
                     }

                     for (var idRef of Object.keys(annotationsByIdref)) {
                       for (var chapter of readium.reader.chaptersMap) {
                         if (idRef === chapter.idref) {
                           annotationsByChapter[chapter.chapterTitle] = annotationsByIdref[idRef];
                           break;
                         }
                       }
                     }

                     var text = 'My Annotations\n\r';
                     for (var chapter in annotationsByChapter) {
                       text += chapter + '\n\r\n\r';

                       for (var stmt of annotationsByChapter[chapter]) {
                         text += stmt.title + '\n\r';
                         if (stmt.text !== undefined) {
                           text += ('Note: ' + stmt.text + '\n\r');
                         }
                         text += '\n\r';
                       }
                     }

                     PeBL.utils.getSharedAnnotations(function(stmts) {
                       var sharedAnnotationsByIdref = {};
                       var sharedAnnotationsByChapter = {};
                       for (var stmt of stmts) {
                           if (stmt.type === 3 && stmt.owner === userProfile.identity) {
                               if (!sharedAnnotationsByIdref[stmt.idRef])
                                 sharedAnnotationsByIdref[stmt.idRef] = [];
                               sharedAnnotationsByIdref[stmt.idRef].push(stmt);
                           }
                       }

                       for (var idRef of Object.keys(sharedAnnotationsByIdref)) {
                         for (var chapter of readium.reader.chaptersMap) {
                           if (idRef === chapter.idref) {
                             sharedAnnotationsByChapter[chapter.chapterTitle] = sharedAnnotationsByIdref[idRef];
                             break;
                           }
                         }
                       }

                       text += '----------------------\n\r' + 'My Shared Annotations\n\r';
                       for (var chapter in sharedAnnotationsByChapter) {
                         text += chapter + '\n\r\n\r';

                         for (var stmt of sharedAnnotationsByChapter[chapter]) {
                           text += stmt.title + '\n\r';
                           if (stmt.text !== undefined) {
                             text += ('Note: ' + stmt.text + '\n\r');
                           }
                           text += '\n\r';
                         }
                       }

                       //TODO: Don't hardcode this
                       PeBL.utils.getMessages('ad395c22-f03f-4e4f-bf51-79724743f131_user-' + userProfile.identity, function(stmts) {
                         text += '----------------------\n\r' + 'My Notes\n\r';

                         for (var stmt of stmts) {
                           text += stmt.text + '\n\r\n\r';
                         }

                         var blob = new Blob([text], {type: 'text'});
                         if (window.navigator.msSaveOrOpenBlob) {
                           window.navigator.msSaveBlob(blob, 'MyAnnotations.txt');
                         } else {
                           var elem = window.document.createElement('a');
                           elem.href = window.URL.createObjectURL(blob);
                           elem.download = 'MyAnnotations.txt';        
                           document.body.appendChild(elem);
                           elem.click();        
                           document.body.removeChild(elem);
                         }
                       })
                     });
                 });
               });
             })
           }

           var setHideSharedAnnotationsButton = function() {
               $('#hideSharedAnnotationsButton').off();
               if (readium.reader.disableSharedHighlights) {
                   $('#hideSharedAnnotationsButton').text('Show shared annotations');
                   $('#hideSharedAnnotationsButton').on('click', function() {
                       readium.reader.disableSharedHighlights = false;
                       PeBL.utils.getSharedAnnotations(function(stmts) {
                           PeBL.user.getUser(function(userProfile) {
                               for (var stmt of stmts) {
                                 if (stmt.groupId === userProfile.currentTeam || stmt.groupId === userProfile.currentClass) {
                                   if (stmt.type === 3 && stmt.owner !== userProfile.identity) {
                                       // console.log(stmt);
                                       var highlightType = 'shared-highlight';

                                       try {
                                           readium.reader.plugins.highlights.addHighlight(stmt.idRef, stmt.cfi, stmt.id, highlightType);
                                       } catch (e) {
                                           console.error(e);
                                       }
                                   }
                                 }
                               }
                           });
                       });
                       setHideSharedAnnotationsButton();
                   });
               } else {
                   $('#hideSharedAnnotationsButton').text('Hide shared annotations');
                   $('#hideSharedAnnotationsButton').on('click', function() {
                       readium.reader.disableSharedHighlights = true;
                       readium.reader.plugins.highlights.removeHighlightsByType('shared-highlight');
                       setHideSharedAnnotationsButton();
                   });
               }

           }

           var annotationsShowHideToggle = function(showOnly) {

               unhideUI();

               var $appContainer = $('#app-container'),
                   hide = $appContainer.hasClass('annotations-visible');
               var bookmark;
               $appContainer.removeClass();
               if (readium.reader.handleViewportResize && !embedded) {
                   bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
               }

               if (hide && !showOnly) {
                   $appContainer.removeClass('annotations-visible');

                   PeBL.unsubscribeEvent(PeBL.events.incomingAnnotations,
                                         false,
                                         annotationCallback);
                   PeBL.unsubscribeEvent(PeBL.events.incomingSharedAnnotations,
                                         false,
                                         sharedAnnotationCallback);

                   PeBL.emitEvent(PeBL.events.eventUndisplayed, {
                       activityType: 'reader-annotations',
                       type: 'Annotations'
                   });
               } else {
                   if (!hide) {
                       $('#my-annotations').children().remove();
                       if (!window.PeBLConfig.disabledFeatures.sharedAnnotations) {
                         $('#my-shared-annotations').children().remove();
                         $('#general-shared-annotations').children().remove();
                       }
                       

                       addAnnotationChapterSections('my-annotations');
                       if (!window.PeBLConfig.disabledFeatures.sharedAnnotations) {
                         addAnnotationChapterSections('my-shared-annotations');
                         addAnnotationChapterSections('general-shared-annotations');
                       }
                       

                       $('#my-annotations').prepend('<p class="hideWhenSiblingPresent">When you add Annotations, they will appear here.</p>');

                       if (!window.PeBLConfig.disabledFeatures.sharedAnnotations) {
                         $('#my-shared-annotations').prepend('<p class="hideWhenSiblingPresent">When you add Annotations and share them, they will appear here. You can share annotations by clicking on the highlighted text on the page and selecting the share option from the popup menu.</p>');

                         $('#general-shared-annotations').prepend('<p class="hideWhenSiblingPresent">When other users share their annotations, they will appear here.</p>');

                         setHideSharedAnnotationsButton();

                         PeBL.subscribeEvent(PeBL.events.incomingSharedAnnotations,
                                           false,
                                           sharedAnnotationCallback);
                       }

                       

                       

                       setDownloadAnnotationsButton();

                       PeBL.subscribeEvent(PeBL.events.incomingAnnotations,
                                           false,
                                           annotationCallback);
                       
                   }
                   $appContainer.addClass('annotations-visible');

                   PeBL.emitEvent(PeBL.events.eventDisplayed, {
                       activityType: 'reader-annotations',
                       type: 'Annotations'
                   });
                   setTimeout(function() { $('#annotations-body button.close')[0].focus(); }, 1000);
               }

               if (embedded) {
                   hideLoop(null, true);
               } else if (readium.reader.handleViewportResize) {
                   setTimeout(function () {
                       readium.reader.handleViewportResize(bookmark);
                   }, 200);

                   // setTimeout(function()
                   // {
                   //     readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
                   // }, 90);
               }
           };

           var searchShowHideToggle = function() {
               unhideUI();

               var $appContainer = $('#app-container'),
                   hide = $appContainer.hasClass('search-visible');
               var bookmark;
               $appContainer.removeClass();
               if (readium.reader.handleViewportResize && !embedded) {
                   bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
               }

               if (hide) {
                   $appContainer.removeClass('search-visible');

                   PeBL.emitEvent(PeBL.events.eventUndisplayed, {
                       activityType: 'reader-search',
                       type: 'Search'
                   });
                   readium.reader.plugins.highlights.removeHighlightsByType('search-highlight');
               } else {
                   $appContainer.addClass('search-visible');

                   PeBL.emitEvent(PeBL.events.eventDisplayed, {
                       activityType: 'reader-search',
                       type: 'Search'
                   });
                   setTimeout(function() { $('#search-body button.close')[0].focus(); }, 1000);
               }

               if (embedded) {
                   hideLoop(null, true);
               } else if (readium.reader.handleViewportResize) {
                   setTimeout(function () {
                       readium.reader.handleViewportResize(bookmark);
                   }, 200);
               }
           }

           var saveHighlight = function() {
               var CFI = readium.reader.plugins.highlights.getCurrentSelectionCfi();
               if (CFI) {
                   var annotation = {};
                   var iframe = $("#epub-reader-frame iframe")[0];
                   var iframeWindow = iframe.contentWindow || iframe.contentDocument;
                   annotation.cfi = CFI.cfi;
                   annotation.idRef = CFI.idref;
                   annotation.style = 1;
                   annotation.text = "";
                   annotation.title = iframeWindow.getSelection().toString();
                   annotation.type = 2;

                   annotation.activityType = 'reader-annotation';

                   PeBL.emitEvent(PeBL.events.eventAnnotated, annotation);
                   annotationsShowHideToggle(true);
                   // Clear the selection so you can't hit the button again.
                   if (iframeWindow.getSelection) {
                       if (iframeWindow.getSelection().empty) {  // Chrome
                           iframeWindow.getSelection().empty();
                       } else if (iframeWindow.getSelection().removeAllRanges) {  // Firefox
                           iframeWindow.getSelection().removeAllRanges();
                       }
                   } else if (iframeWindow.selection) {  // IE?
                       iframeWindow.selection.empty();
                   }
               } else {
                   Dialogs.showErrorWithDetails('Alert', 'No text has been selected yet, or selected text is ineligible for highlighting.');
                   throw new Error("Nothing selected");
               }
           };

           var removeHighlight = function(annotation) {
               if (annotation.type === 2) {
                   PeBL.emitEvent(PeBL.events.removedAnnotation, annotation.id);
                   PeBL.emitEvent(PeBL.events.eventUnannotated, {
                       cfi: annotation.cfi,
                       idref: annotation.idRef,
                       name: annotation.title,
                       description: annotation.text,
                       activityType: 'reader-annotation',
                       activityId: annotation.id
                   });
               } else if (annotation.type === 3) {
                   PeBL.emitEvent(PeBL.events.removedSharedAnnotation, annotation);
                   PeBL.emitEvent(PeBL.events.eventUnsharedAnnotation, {
                       cfi: annotation.cfi,
                       idref: annotation.idRef,
                       name: annotation.title,
                       description: annotation.text,
                       activityType: 'reader-annotation',
                       activityId: annotation.id
                   });
               }
               readium.reader.plugins.highlights.removeHighlight(annotation.id);
           };

           var shareHighlight = function(annotation) {
               PeBL.user.getUser(function(userProfile) {
                   var groupId = '';
                   if (userProfile.currentTeam)
                       groupId = userProfile.currentTeam;
                   else if (userProfile.currentClass)
                       groupId = userProfile.currentClass;

                   annotation.groupId = groupId;

                   removeHighlight(annotation);
                   annotation.type = 3;
                   PeBL.emitEvent(PeBL.events.newSharedAnnotation, annotation);
                   annotationsShowHideToggle(true);
               });
           };

           var pinHighlight = function(annotation) {
               annotation.pinned = true;
               PeBL.emitEvent(PeBL.events.pinnedAnnotation, annotation);

               var elem = document.getElementById('sharedAnnotation-' + annotation.id);
               if (elem) {
                   elem.classList.add('pinned');
               }

               annotationsShowHideToggle(true);
           };

           var unpinHighlight = function(annotation) {
               annotation.pinned = false;
               PeBL.emitEvent(PeBL.events.unpinnedAnnotation, annotation);

               var elem = document.getElementById('sharedAnnotation-' + annotation.id);
               if (elem) {
                   elem.classList.remove('pinned');
               }

               annotationsShowHideToggle(true);
           }

           var showAnnotationNoteDialogue = function(annotation) {
               $('#annotationInput').val(annotation.text);
               $('#add-note-submit').data('annotation', annotation);
               $('#add-note-dialog').modal('show');
               setTimeout(function() {
                   $('#annotationInput').focus();
               }, 500);
           }

           var deleteAnnotationPermission = function(userProfile) {
               return true;
               
               // Trey: Allowing all users to delete things
               if (userProfile.role) {
                   if (userProfile.currentTeam && userProfile.role === 'instructor')
                       return true;
                   if (userProfile.currentTeam && userProfile.role === 'admin')
                       return true;
               }
               return false;
           }

           var pinAnnotationPermission = function(userProfile) {
               return true;
               
               // Trey: Allowing all users to pin things
               if (userProfile.role) {
                   if (userProfile.currentTeam && userProfile.role === 'instructor')
                       return true;
                   if (userProfile.currentTeam && userProfile.role === 'admin')
                       return true;
               }
               return false;
           }

           var showAnnotationContextMenu = function(event, annotation, absolutePos) {
               $('#annotationContextMenu').remove();
               $('#clickOutOverlay').remove();
               var appWidth = $('#app-container').width();
               var readerFrameOffset = $('#reading-area').position().left;
               var readerPosition = $('#reflowable-book-frame').position();
               var iframe = $("#epub-reader-frame iframe")[0];
               var iframeWindow = iframe.contentWindow || iframe.contentDocument;
               var columnGap = $(iframeWindow.document).children('html').css('column-gap');

               var menu = document.createElement('div');
               menu.id = 'annotationContextMenu';
               //Try to center it on the mouse, take into account the offset of the reader view relative to the page as a whole

               var left = (event.pageX ? event.pageX : event.originalEvent.pageX) - 50;

               if (!absolutePos)
                   left += readerPosition.left;

               if (left < 0) {
                   left = 0;
               } else {
                   if (!absolutePos)
                       left += readerFrameOffset;
               }

               if ((left + 250) > appWidth) {
                   left = appWidth - 250;
               }

               left += 'px';

               menu.style.left = left;
               menu.style.top = ((event.pageY ? event.pageY : event.originalEvent.pageY) - 10 < 40 ? (event.pageY ? event.pageY : event.originalEvent.pageY) + 60 : (event.pageY ? event.pageY : event.originalEvent.pageY) - 10) + 'px';

               var buttonWrapper = document.createElement('div');
               buttonWrapper.classList.add('annotationContextButtonWrapper');

               PeBL.user.getUser(function(userProfile) {
                   var identity = userProfile.identity;
                   if (identity) {
                       if (annotation.owner === identity || deleteAnnotationPermission(userProfile)) {
                           var deleteButtonContainer = document.createElement('div');
                           var deleteButton = document.createElement('span');
                           deleteButton.classList.add('glyphicon', 'glyphicon-trash');
                           deleteButtonContainer.appendChild(deleteButton);
                           deleteButtonContainer.addEventListener('click', function() {
                               Dialogs.showModalPrompt('Confirm', 'Are you sure you want to delete this annotation?', 'Confirm', 'Cancel', () => {
                                    removeHighlight(annotation);
                                    $('#annotationContextMenu').remove();
                                    $('#clickOutOverlay').remove();
                               }, () => {
                                   //
                               })
                           });
                           buttonWrapper.appendChild(deleteButtonContainer);
                       }

                       if (annotation.owner === identity) {
                           var noteButtonContainer = document.createElement('div');
                           var noteButton = document.createElement('span');
                           noteButton.textContent = 'Note';
                           noteButtonContainer.appendChild(noteButton);
                           noteButtonContainer.addEventListener('click', function() {
                               showAnnotationNoteDialogue(annotation);
                               $('#annotationContextMenu').remove();
                               $('#clickOutOverlay').remove();
                           });


                           buttonWrapper.appendChild(noteButtonContainer);
                       } else {
                           var infoContainer = document.createElement('div');
                           var info = document.createElement('span');
                           info.textContent = 'Shared by ' + annotation.actor.name;
                           infoContainer.appendChild(info);
                           buttonWrapper.appendChild(infoContainer);
                       }


                       if (annotation.type === 2 && !window.PeBLConfig.disabledFeatures.sharedAnnotations) {
                           var shareButtonContainer = document.createElement('div');
                           var shareButton = document.createElement('span');
                           shareButton.textContent = 'Share';
                           shareButtonContainer.appendChild(shareButton);
                           shareButtonContainer.addEventListener('click', function() {
                               shareHighlight(annotation);
                               $('#annotationContextMenu').remove();
                               $('#clickOutOverlay').remove();
                           });
                           buttonWrapper.appendChild(shareButtonContainer);
                       } else if (pinAnnotationPermission(userProfile)) {
                           var pinButtonContainer = document.createElement('div');
                           var pinButton = document.createElement('span');
                           if (!annotation.pinned)
                               pinButton.textContent = 'Pin';
                           else
                               pinButton.textContent = 'Unpin';
                           pinButtonContainer.appendChild(pinButton);
                           pinButtonContainer.addEventListener('click', function() {
                               if (!annotation.pinned)
                                   pinHighlight(annotation);
                               else
                                   unpinHighlight(annotation);
                               $('#annotationContextMenu').remove();
                               $('#clickOutOverlay').remove();
                           });
                           buttonWrapper.appendChild(pinButtonContainer);
                       }

                       menu.appendChild(buttonWrapper);

                       if (annotation.text && annotation.text.length > 0) {
                           var noteContainer = document.createElement('div');
                           noteContainer.classList.add('noteContainer');
                           var noteText = document.createElement('span');
                           noteText.textContent = annotation.text;
                           noteContainer.appendChild(noteText);

                           menu.appendChild(noteContainer);
                       }


                       var clickOutOverlay = document.createElement('div');
                       clickOutOverlay.id = 'clickOutOverlay';
                       clickOutOverlay.addEventListener('click', function() {
                           $('#annotationContextMenu').remove();
                           $('#clickOutOverlay').remove();
                       });

                       document.body.appendChild(clickOutOverlay);
                       document.body.appendChild(menu);
                   }
               });
           };

           var showBookmarkDialogue = function() {
               $('#bookmarkInput').val('');
               $('#add-bookmark-dialog').modal('show');
               setTimeout(function() {
                   $('#bookmarkInput').focus();
               }, 500)
           };

           var saveBookmark = function(title) {
               var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
               var annotation = {};

               annotation.cfi = bookmark.contentCFI;
               annotation.idRef = bookmark.idref;

               annotation.style = 0;
               annotation.text = "";
               annotation.title = title;
               annotation.type = 1;

               var urlParams = new URLSearchParams(window.location.search);
               var epub = urlParams.get('epub');
               var chapterTitle;

               var spineItemCfi = readium.reader.getLoadedSpineItems()[0].cfi;

               for (let item of currentSliderToc) {
                   if (item.idref === bookmark.idref) {
                       chapterTitle = item.title;
                       break;
                   }
               }

               annotation.activityURI = window.location.origin + '/?epub=' + epub + '&goto=epubcfi(' + spineItemCfi + encodeURIComponent(bookmark.contentCFI) + ')';

               PeBL.emitEvent(PeBL.events.eventBookmarked, annotation);
           };

           var bookmarksCallback = function(stmts) {
               for (var stmt of stmts) {
                   if (stmt.type === 1) {
                       if ($("#bookmark-" + stmt.id).length == 0) {
                           (function(stmt) {
                               var bookmarkWrapper = document.createElement('div');
                               bookmarkWrapper.id = "bookmark-" + stmt.id;
                               var bookmarkLink = document.createElement('span');
                               bookmarkLink.setAttribute('tabindex', '0');
                               bookmarkLink.addEventListener('click', function(evt) {
                                   var bookmark = {
                                       contentCFI: evt.currentTarget.getAttribute('data-CFI'),
                                       IDRef: evt.currentTarget.getAttribute('data-IDRef')
                                   }
                                   PeBL.emitEvent(PeBL.events.eventAccessed, {
                                       type: 'bookmark',
                                       activityType: 'reader-bookmark',
                                       activityId: stmt.id,
                                       name: stmt.title,
                                       idref: bookmark.IDRef,
                                       cfi: bookmark.contentCFI
                                   });
                                   readium.reader.openSpineItemElementCfi(bookmark.IDRef, bookmark.contentCFI);
                               });
                               bookmarkLink.classList.add('bookmarkLink');
                               bookmarkLink.textContent = stmt.title;
                               bookmarkLink.setAttribute('data-CFI', stmt.cfi);
                               bookmarkLink.setAttribute('data-IDRef', stmt.idRef);

                               var bookmarkDeleteButton = document.createElement('i');
                               bookmarkDeleteButton.setAttribute('tabindex', '0');
                               bookmarkDeleteButton.setAttribute('aria-label', 'Delete Bookmark');
                               bookmarkDeleteButton.classList.add('glyphicon', 'glyphicon-remove');
                               bookmarkDeleteButton.addEventListener('click', function() {
                                    Dialogs.showModalPrompt('Confirm', 'Are you sure you want to delete this bookmark?', 'Confirm', 'Cancel', () => {
                                        PeBL.emitEvent(PeBL.events.eventUnbookmarked, {
                                            cfi: stmt.cfi,
                                            idref: stmt.idRef,
                                            name: stmt.title,
                                            description: stmt.text,
                                            activityType: 'reader-bookmark',
                                            activityId: stmt.id
                                        });
                                        PeBL.emitEvent(PeBL.events.removedAnnotation, stmt.id);
                                        $(bookmarkWrapper).remove();
                                    }, () => {
                                        //
                                    })
                               });

                               bookmarkWrapper.appendChild(bookmarkLink);
                               bookmarkWrapper.appendChild(bookmarkDeleteButton);
                               $('#bookmarks-body-list').prepend($(bookmarkWrapper));
                           })(stmt);
                       }
                   }
               }
           };

           var bookmarksShowHideToggle = function() {

               unhideUI();

               var $appContainer = $('#app-container'),
                   hide = $appContainer.hasClass('bookmarks-visible');
               var bookmark;
               $appContainer.removeClass();
               if (readium.reader.handleViewportResize && !embedded) {
                   bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
               }

               if (hide) {
                   $appContainer.removeClass('bookmarks-visible');
                   PeBL.unsubscribeEvent(PeBL.events.incomingAnnotations,
                                         false,
                                         bookmarksCallback);
                   PeBL.emitEvent(PeBL.events.eventUndisplayed, {
                       activityType: 'reader-bookmarks',
                       type: 'Bookmarks'
                   });
               } else {
                   $('#bookmarks-body-list').children().remove();
                   $('#bookmarks-body-list').append('<p class="hideWhenSiblingPresent">When you add Bookmarks, they will appear here.</p>');
                   PeBL.subscribeEvent(PeBL.events.incomingAnnotations,
                                       false,
                                       bookmarksCallback);

                   $appContainer.addClass('bookmarks-visible');
                   PeBL.emitEvent(PeBL.events.eventDisplayed, {
                       activityType: 'reader-bookmarks',
                       type: 'Bookmarks'
                   });
                   setTimeout(function() { $('#bookmarks-body button.close')[0].focus(); }, 1000);
               }

               if (embedded) {
                   hideLoop(null, true);
               } else if (readium.reader.handleViewportResize) {

                   setTimeout(function () {
                       readium.reader.handleViewportResize(bookmark);
                   }, 200);

               }
           };

           var showScaleDisplay = function() {
               $('.zoom-wrapper').show();
           }
           var setScaleDisplay = function() {
               var scale = readium.reader.getViewScale();
               $('.zoom-wrapper input').val(Math.round(scale) + "%");
           }

           var hideScaleDisplay = function() {
               $('.zoom-wrapper').hide();
           }

           var loadToc = function(dom) {

               if (dom) {
                   $('script', dom).remove();

                   var tocNav;

                   var $navs = $('nav', dom);
                   Array.prototype.every.call($navs, function(nav) {
                       if (nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type') == 'toc') {
                           tocNav = nav;
                           return false;
                       }
                       return true;
                   });

                   var isRTL = false;
                   var pparent = tocNav;

                   while (pparent && pparent.getAttributeNS) {
                       var dir = pparent.getAttributeNS("http://www.w3.org/1999/xhtml", "dir") || pparent.getAttribute("dir");

                       if (dir && dir === "rtl") {
                           isRTL = true;
                           break;
                       }
                       pparent = pparent.parentNode;
                   }

                   var toc = (tocNav && $(tocNav).html()) || $('body', dom).html() || $(dom).html();
                   var tocUrl = currentPackageDocument.getToc();

                   if (toc && toc.length) {
                       var $toc = $(toc);

                       // "iframe" elements need to be stripped out, because of potential vulnerability when loading malicious EPUBs
                       // e.g. src="javascript:doHorribleThings(window.top)"
                       // Note that "embed" and "object" elements with AllowScriptAccess="always" do not need to be removed,
                       // because unlike "iframe" the @src URI does not trigger the execution of the "javascript:" statement,
                       // and because the "data:" base64 encoding of an image/svg that contains ecmascript
                       // automatically results in origin/domain restrictions (thereby preventing access to window.top / window.parent).
                       // Also note that "script" elements are discarded automatically by jQuery.
                       $('iframe', $toc).remove();

                       $('#readium-toc-body').append($toc);

                       if (isRTL) {
                           $toc[0].setAttributeNS("http://www.w3.org/1999/xhtml", "dir", "rtl");
                           $toc[0].style.direction = "rtl"; // The CSS stylesheet property does not trigger :(
                       }

                       // remove default focus from anchor elements in TOC after added to #readium-toc-body
                       var $items = $('#readium-toc-body li >a');
                       $items.each(function() {
                           $(this).attr("tabindex", "0");
                           $(this).on("focus", function(event) {
                               //console.log("toc item focus: " + event.target);
                               // remove tabindex from previously focused
                               var $prevFocus = $('#readium-toc-body a[tabindex="0"]');
                               if ($prevFocus.length > 0 && $prevFocus[0] !== event.target) {
                                   //console.log("previous focus: " + $prevFocus[0]);
                                   $prevFocus.attr("tabindex", "0");
                               }
                               // add to newly focused
                               event.target.setAttribute("tabindex", "0");
                           });
                           $(this).on("click", function(event) {
                               PeBL.emitEvent(PeBL.events.eventAccessed, {
                                   type: 'TOC',
                                   activityType: 'reader-toc',
                                   activityId: event.currentTarget.href,
                                   name: event.currentTarget.textContent,
                                   target: event.currentTarget.href
                               });
                           });
                       });

                   }

               } else {
                   var tocUrl = currentPackageDocument.getToc();

                   $('#readium-toc-body').append("?? " + tocUrl);
               }

               var _tocLinkActivated = false;

               var lastIframe = undefined,
                   wasFixed;

               readium.reader.on(ReadiumSDK.Events.FXL_VIEW_RESIZED, function() {
                   Globals.logEvent("FXL_VIEW_RESIZED", "ON", "EpubReader.js");
                   setScaleDisplay();
               });


               readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
                   Globals.logEvent("CONTENT_DOCUMENT_LOAD_START", "ON", "EpubReader.js [ " + spineItem.href + " ]");
                   savePlace();
               });


               readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function($iframe, spineItem) {
                   Globals.logEvent("CONTENT_DOCUMENT_LOADED", "ON", "EpubReader.js [ " + spineItem.href + " ]");

                   var isFixed = readium.reader.isCurrentViewFixedLayout();

                   // TODO: fix the pan-zoom feature!
                   if (isFixed) {
                       showScaleDisplay();
                   } else {
                       hideScaleDisplay();
                   }

                   var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
                   var urlParams = new URLSearchParams(window.location.search);
                   var epub = urlParams.get('epub');
                   var chapterTitle;

                   for (let item of currentSliderToc) {
                       if (item.idref === bookmark.idref) {
                           chapterTitle = item.title;
                           try {
                               document.title = item.title + ' | ' + document.getElementById('webreaderTitle').textContent + ' | ' + Strings.i18n_pebl_reader;
                           } catch (e) {
                               //
                           }
                           break;
                       }
                   }

                   PeBL.emitEvent(PeBL.events.eventAccessed, {
                       type: 'chapter',
                       activityURI: window.location.origin + '/?epub=' + epub + '&goto=' + encodeURIComponent('{"idref": "' + bookmark.idref + '"}'),
                       activityType: 'chapter',
                       name: chapterTitle,
                       idref: bookmark.idref,
                       cfi: bookmark.contentCFI
                   });

                   //TODO not picked-up by all screen readers, so for now this short description will suffice
                   $iframe.attr("title", "EPUB");
                   $iframe[0].contentWindow.addEventListener('dragover', function(e) {
                     e.preventDefault();
                   });
                   $iframe[0].contentWindow.addEventListener('drop', function(e) {
                     e.preventDefault();
                   });

                   lastIframe = $iframe[0];
               });

               var sunkHighlighHandler = false;

               readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function(pageChangeData) {
                   Globals.logEvent("PAGINATION_CHANGED", "ON", "EpubReader.js");

                   if (_debugBookmarkData_goto) {

                       debugBookmarkData(_debugBookmarkData_goto);
                       _debugBookmarkData_goto = undefined;
                   }

                   if (!sunkHighlighHandler) {
                       sunkHighlighHandler = true;
                       PeBL.subscribeEvent(PeBL.events.incomingAnnotations,
                                           false,
                                           function(stmts) {
                                               for (var stmt of stmts) {
                                                   if (stmt.type == 2) {
                                                       try {
                                                           readium.reader.plugins.highlights.addHighlight(stmt.idRef, stmt.cfi, stmt.id, "user-highlight");
                                                       } catch (e) {
                                                           console.error(e);
                                                       }
                                                   } else if (stmt.target) {
                                                       readium.reader.plugins.highlights.removeHighlight(stmt.target);
                                                       $("#annotation-" + stmt.target).remove();
                                                       $("#bookmark-" + stmt.target).remove();
                                                       $("#sharedAnnotation-" + stmt.target).remove();
                                                   }
                                               }
                                           });
                       PeBL.subscribeEvent(PeBL.events.incomingSharedAnnotations,
                                           false,
                                           function(stmts) {
                                               PeBL.user.getUser(function(userProfile) {
                                                   for (var stmt of stmts) {
                                                       
                                                           if (stmt.type == 3) {
                                                               if (stmt.groupId === userProfile.currentTeam || stmt.groupId === userProfile.currentClass) {
                                                                   if (stmt.owner !== userProfile.identity && readium.reader.disableSharedHighlights)
                                                                       continue;
                                                                   try {
                                                                       readium.reader.plugins.highlights.addHighlight(stmt.idRef, stmt.cfi, stmt.id, userProfile.identity == stmt.owner ? 'shared-my-highlight' : 'shared-highlight');
                                                                   } catch (e) {
                                                                       console.error(e);
                                                                   }
                                                               }
                                                           } else if (stmt.target) {
                                                               readium.reader.plugins.highlights.removeHighlight(stmt.target);
                                                               $("#annotation-" + stmt.target).remove();
                                                               $("#bookmark-" + stmt.target).remove();
                                                               $("#sharedAnnotation-" + stmt.target).remove();
                                                           }  
                                                    }
                                                });
                                           });
                   }

                   savePlace();
                   saveHistory();
                   updateUI(pageChangeData);

                   spin(false);
                   
                   if (readium.reader.plugins.highlights) {
                        readium.reader.plugins.highlights.redrawAnnotations();
    
                        readium.reader.plugins.highlights.removeHighlightsByType('user-highlight');
                        readium.reader.plugins.highlights.removeHighlightsByType('shared-highlight');
                        readium.reader.plugins.highlights.removeHighlightsByType('shared-my-highlight');
                   }

                   createNavigationSlider();

                   checkCompletion();

                   //TODO: Find a way to not need to remove and readd all the highlights each time
                   PeBL.utils.getAnnotations(function(stmts) {
                       for (var stmt of stmts) {
                           if (stmt.type === 2) {
                               // console.log(stmt);
                               try {
                                   readium.reader.plugins.highlights.addHighlight(stmt.idRef, stmt.cfi, stmt.id, 'user-highlight');
                               } catch (e) {
                                   console.error(e);
                               }
                           }
                       }
                   });

                   PeBL.utils.getSharedAnnotations(function(stmts) {
                       PeBL.user.getUser(function(userProfile) {
                           for (var stmt of stmts) {
                             if (stmt.groupId === userProfile.currentTeam || stmt.groupId === userProfile.currentClass) {
                               if (stmt.type === 3) {
                                   if (stmt.owner !== userProfile.identity && readium.reader.disableSharedHighlights)
                                       continue;
                                   // console.log(stmt);
                                   var highlightType = 'shared-highlight';
                                   if (stmt.owner === userProfile.identity)
                                       highlightType = 'shared-my-highlight';

                                   try {
                                       readium.reader.plugins.highlights.addHighlight(stmt.idRef, stmt.cfi, stmt.id, highlightType);
                                   } catch (e) {
                                       console.error(e);
                                   }
                               }
                             }
                           }
                       });
                   });

                   // If a search result was clicked, draw a new highlight for it.
                   if (window.localStorage.getItem('searchHighlight')) {
                       var searchHighlight = JSON.parse(window.localStorage.getItem('searchHighlight'));
                       readium.reader.plugins.highlights.addHighlight(searchHighlight.idref, searchHighlight.contentCFI, PeBL.utils.getUuid(), 'search-highlight');
                       window.localStorage.removeItem('searchHighlight');
                   }

                   if (!_tocLinkActivated) return;
                   _tocLinkActivated = false;

                   try {
                       var iframe = undefined;
                       var element = undefined;

                       var id = pageChangeData.elementId;
                       if (!id) {
                           var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());

                           //bookmark.idref; //manifest item
                           if (pageChangeData.spineItem) {
                               element = readium.reader.getElementByCfi(pageChangeData.spineItem.idref, bookmark.contentCFI,
                                                                        ["cfi-marker", "mo-cfi-highlight"],
                                                                        [],
                                                                        ["MathJax_Message"]);
                               element = element[0];

                               if (element) {
                                   iframe = $("#epub-reader-frame iframe")[0];
                                   var doc = (iframe.contentWindow || iframe.contentDocument).document;
                                   if (element.ownerDocument !== doc) {
                                       iframe = $("#epub-reader-frame iframe")[1];
                                       if (iframe) {
                                           doc = (iframe.contentWindow || iframe.contentDocument).document;
                                           if (element.ownerDocument !== doc) {
                                               iframe = undefined;
                                           }
                                       }
                                   }
                               }
                           }
                       } else {
                           iframe = $("#epub-reader-frame iframe")[0];
                           var doc = (iframe.contentWindow || iframe.contentDocument).document;
                           element = doc.getElementById(id);
                           if (!element) {
                               iframe = $("#epub-reader-frame iframe")[1];
                               if (iframe) {
                                   doc = (iframe.contentWindow || iframe.contentDocument).document;
                                   element = doc.getElementById(id);
                                   if (!element) {
                                       iframe = undefined;
                                   }
                               }
                           }
                       }

                       if (!iframe) {
                           iframe = lastIframe;
                       }


                       /* Remove because is removing focus from the toc
                          if (iframe)
                          {
                          //var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                          var toFocus = iframe; //doc.body
                          setTimeout(function(){ toFocus.focus(); }, 50);
                          }
                       */
                   } catch (e) {
                       //
                   }
               });

               $('#readium-toc-body').on('click', 'a', function(e) {
                   try {
                       spin(true);

                       var href = $(this).attr('href');
                       //href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href;

                       _tocLinkActivated = true;

                       readium.reader.openContentUrl(href, tocUrl, undefined);

                       if (embedded) {
                           $('.toc-visible').removeClass('toc-visible');
                           unhideUI();
                       }
                   } catch (err) {

                       console.error(err);

                   } finally {
                       //e.preventDefault();
                       //e.stopPropagation();
                       return false;
                   }
               });
               $('#annotations-body').prepend('<div id="annotations-body-list"></div>');
               $('#bookmarks-body').prepend('<div id="bookmarks-body-list"></div>');
               $('#search-body').prepend('<div id="search-body-list" aria-live="polite" role="log"></div>');

               if (!window.PeBLConfig.disabledFeatures || !window.PeBLConfig.disabledFeatures.bookSearchInput) {
                $('#search-body').prepend('<div><input id="searchInput" placeholder="Search this book" aria-label="Search" /></div>');
                var searchBook = function(text) {
                    $('#search-body-list').children().remove();
                    var searchResults = [];
                    if (text.trim().length > 0) {
                        PeBL.emitEvent(PeBL.events.eventSearched, {
                            activityType: 'reader-search',
                            name: text.trim()
                        });
                        var regex = new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "gi"); // Escape the input
                        for (var i = 0; i < window.SpineDocuments.length; i++) {
                            var documentObject = window.SpineDocuments[i];
                            var spineDocument = documentObject.htmlDocument;
                            searchResults.push({title: spineDocument.title, searchResults: []});
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
    
                                    nodeList.push({text: surroundingText, cfi: cfiRange})
                                }
                                currentNode = treeWalker.nextNode();
                            }
                            searchResults[i].searchResults = nodeList;
                        }
                    }
                    console.log(searchResults);
                    if (searchResults.every(function(chapter) { return chapter.searchResults.length === 0 })) {
                        $('#search-body-list').append($('<h3>No results found</h3>'));
                    }
                    for (var chapter of searchResults) {
                        if (chapter.searchResults.length > 0) {
                            var container = document.createElement('div');
    
                            var header = document.createElement('h3');
                            for (var chapterMapping of readium.reader.chaptersMap) {
                                if (chapterMapping.idref === chapter.title) {
                                    header.textContent = chapterMapping.chapterTitle;
                                    container.appendChild(header);
                                    break;
                                }
                            }
    
                            var list = document.createElement('div');
                            container.appendChild(list);
    
                            for (var result of chapter.searchResults) {
                                var textContainer = document.createElement('div');
                                textContainer.classList.add('searchResult');
                                textContainer.setAttribute("role", "status");
                                textContainer.setAttribute('tabindex', '0');
                                (function(textContainer, result) {
                                    textContainer.addEventListener('click', function() {
                                        PeBL.emitEvent(PeBL.events.eventAccessed, {
                                            type: 'searchResult',
                                            activityType: 'reader-search-result',
                                            name: result.text,
                                            idref: result.cfi.idref,
                                            cfi: result.cfi.contentCFI
                                        });
                                        window.localStorage.setItem('searchHighlight', JSON.stringify(result.cfi));
                                        window.READIUM.reader.plugins.highlights.removeHighlightsByType('search-highlight');
                                        window.READIUM.reader.openSpineItemElementCfi(result.cfi.idref, result.cfi.contentCFI);
                                        // window.READIUM.reader.plugins.highlights.addHighlight(result.cfi.idref, result.cfi.contentCFI, PeBL.utils.getUuid(), "search-highlight");
                                    });
                                })(textContainer, result);
    
                                var textContent = document.createElement('p');
                                textContent.innerHTML = result.text;
                                textContainer.appendChild(textContent);
    
                                list.appendChild(textContainer);
                            }
                            $('#search-body-list').append(container);
                            //var searchResultBox = document.getElementById("search-body-list");
                            //searchResultBox.setAttribute("role", "status");
                            //searchResultBox.focus();
                        }
                    }
                   }
                $('#searchInput').on('input', _.debounce(function() {
                    var text = this.value;
                    searchBook(text);
                }, 1000));
               }

               //$('#annotations-body').prepend('<h2 aria-label="' + Strings.annotations + '" title="' + Strings.annotations + '">' + Strings.annotations + '</h2>');
               $('#bookmarks-body').prepend('<h2 title="' + Strings.bookmarks + '"><img src="images/pebl-icons-wip_bookmark-list.svg" aria-hidden="true" height="18px"> ' + Strings.bookmarks + '</h2>');
               $('#search-body').prepend('<h2 title="' + Strings.search + '"><img src="images/pebl-icons-search.svg" aria-hidden="true" height="18px"> ' + Strings.search + '</h2>');

               $('#readium-toc-body').prepend('<button tabindex="0" type="button" class="close" data-dismiss="modal" aria-label="' + Strings.i18n_close + ' ' + Strings.toc + '" title="' + Strings.i18n_close + ' ' + Strings.toc + '"><span aria-hidden="true">&times;</span></button>');
               $('#annotations-body').prepend('<button tabindex="0" type="button" class="close" data-dismiss="modal" aria-label="' + Strings.i18n_close + ' ' + Strings.show_annotations + '" title="' + Strings.i18n_close + ' ' + Strings.show_annotations + '"><span aria-hidden="true">&times;</span></button>');
               $('#bookmarks-body').prepend('<button tabindex="0" type="button" class="close" data-dismiss="modal" aria-label="' + Strings.i18n_close + ' ' + Strings.bookmarks + '" title="' + Strings.i18n_close + ' ' + Strings.bookmarks + '"><span aria-hidden="true">&times;</span></button>');
               $('#search-body').prepend('<button tabindex="0" type="button" class="close" data-dismiss="modal" aria-label="' + Strings.i18n_close + ' ' + Strings.search + '" title="' + Strings.i18n_close + ' ' + Strings.search + '"><span aria-hidden="true">&times;</span></button>');

               $('#readium-toc-body button.close').on('click', function() {
                   tocShowHideToggle();
                   /*
                     var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
                     $('#app-container').removeClass('toc-visible');
                     if (embedded){
                     $(document.body).removeClass('hide-ui');
                     }else if (readium.reader.handleViewportResize){
                     readium.reader.handleViewportResize();
                     readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
                     }
                   */
                   return false;
               });
               $('#annotations-body button.close').on('click', function() {
                   annotationsShowHideToggle();
                   return false;
               });
               $('#bookmarks-body button.close').on('click', function() {
                   bookmarksShowHideToggle();
                   return false;
               });
               $('#search-body button.close').on('click', function() {
                   searchShowHideToggle();
                   return false;
               });

               $('#searchInput').on('input', _.debounce(function() {
                   $('#search-body-list').children().remove();
                   var text = this.value;
                   var searchResults = [];
                   if (text.trim().length > 0) {
                       PeBL.emitEvent(PeBL.events.eventSearched, {
                           activityType: 'reader-search',
                           name: text.trim()
                       });
                       var regex = new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "gi"); // Escape the input
                       for (var i = 0; i < window.SpineDocuments.length; i++) {
                           var documentObject = window.SpineDocuments[i];
                           var spineDocument = documentObject.htmlDocument;
                           searchResults.push({title: spineDocument.title, searchResults: []});
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

                                   nodeList.push({text: surroundingText, cfi: cfiRange})
                               }
                               currentNode = treeWalker.nextNode();
                           }
                           searchResults[i].searchResults = nodeList;
                       }
                   }
                   console.log(searchResults);
                   if (searchResults.every(function(chapter) { return chapter.searchResults.length === 0 })) {
                       $('#search-body-list').append($('<h3>No results found</h3>'));
                   }
                   for (var chapter of searchResults) {
                       if (chapter.searchResults.length > 0) {
                           var container = document.createElement('div');

                           var header = document.createElement('h3');
                           for (var chapterMapping of readium.reader.chaptersMap) {
                               if (chapterMapping.idref === chapter.title) {
                                   header.textContent = chapterMapping.chapterTitle;
                                   break;
                               }
                           }
                           container.appendChild(header);

                           var list = document.createElement('div');
                           container.appendChild(list);

                           for (var result of chapter.searchResults) {
                               var textContainer = document.createElement('div');
                               textContainer.classList.add('searchResult');
                               (function(textContainer, result) {
                                   textContainer.addEventListener('click', function() {
                                       PeBL.emitEvent(PeBL.events.eventAccessed, {
                                           type: 'searchResult',
                                           activityType: 'reader-search-result',
                                           name: result.text,
                                           idref: result.cfi.idref,
                                           cfi: result.cfi.contentCFI
                                       });
                                       window.localStorage.setItem('searchHighlight', JSON.stringify(result.cfi));
                                       window.READIUM.reader.plugins.highlights.removeHighlightsByType('search-highlight');
                                       window.READIUM.reader.openSpineItemElementCfi(result.cfi.idref, result.cfi.contentCFI);
                                       // window.READIUM.reader.plugins.highlights.addHighlight(result.cfi.idref, result.cfi.contentCFI, PeBL.utils.getUuid(), "search-highlight");
                                   });
                               })(textContainer, result);

                               var textContent = document.createElement('p');
                               textContent.innerHTML = result.text;
                               textContainer.appendChild(textContent);

                               list.appendChild(textContainer);
                           }
                           $('#search-body-list').append(container);
                       }
                   }
               }, 1000));
               //        var KEY_ENTER = 0x0D;
               //        var KEY_SPACE = 0x20;
               var KEY_END = 0x23;
               var KEY_HOME = 0x24;
               //        var KEY_LEFT = 0x25;
               var KEY_UP = 0x26;
               //        var KEY_RIGHT = 0x27;
               var KEY_DOWN = 0x28;

               $('#readium-toc-body').keydown(function(event) {
                   var next = null;
                   var blurNode = event.target;
                   switch (event.which) {
                   case KEY_HOME:
                       //find first li >a
                       next = $('#readium-toc-body li >a')[0];
                       break;

                   case KEY_END:
                       // find last a within toc
                       next = $('#readium-toc-body a').last()[0];
                       break;

                   case KEY_DOWN:
                       if (blurNode.tagName == "BUTTON") {
                           var existsFocusable = $('#readium-toc-body a[tabindex="0"]');
                           if (existsFocusable.length > 0) {
                               next = existsFocusable[0];
                           } else {
                               // go to first entry
                               next = $('#readium-toc-body li >a')[0];
                           }
                       } else {
                           // find all the a elements, find previous focus (tabindex=60) then get next
                           var $items = $('#readium-toc-body a');
                           var index = $('a[tabindex="60"]').index('#readium-toc-body a');
                           //var index = $('a[tabindex="60"]').index($items); // not sure why this won't work?
                           if (index > -1 && index < $items.length - 1) {
                               next = $items.get(index + 1);
                           }
                       }
                       break;

                   case KEY_UP:
                       // find all the a elements, find previous focus (tabindex=60) then get previous
                       var $items = $('#readium-toc-body a');
                       var index = $('a[tabindex="0"]').index('#readium-toc-body a');
                       if (index > -1 && index > 0) {
                           next = $items.get(index - 1);
                       }
                       break;

                   default:
                       return;
                   }
                   if (next) {
                       event.preventDefault();
                       setTimeout(next.focus(), 5);
                   }
                   return;
               }); // end of onkeyup
           } // end of loadToc

           var toggleFullScreen = function() {

               if (!screenfull.enabled) return;

               screenfull.toggle();
           }

           var isChromeExtensionPackagedApp = (typeof chrome !== "undefined") && chrome.app &&
               chrome.app.window && chrome.app.window.current; // a bit redundant?

           if (screenfull.enabled) {
               if (isChromeExtensionPackagedApp) {
                   screenfull.onchange = function(e) {
                       if (chrome.app.window.current().isFullscreen()) {
                           chrome.app.window.current().restore();
                       }
                   };
               }

               screenfull.onchange(function(e) {
                   var titleText;

                   if (screenfull.isFullscreen) {
                       titleText = Strings.exit_fullscreen + ' [' + Keyboard.FullScreenToggle + ']';
                       $('#buttFullScreenToggle span').removeClass('glyphicon-resize-full');
                       $('#buttFullScreenToggle span').addClass('glyphicon-resize-small');
                       $('#buttFullScreenToggle').attr('aria-label', titleText);
                       $('#buttFullScreenToggle').attr('title', titleText);
                   } else {
                       titleText = Strings.enter_fullscreen + ' [' + Keyboard.FullScreenToggle + ']';
                       $('#buttFullScreenToggle span').removeClass('glyphicon-resize-small');
                       $('#buttFullScreenToggle span').addClass('glyphicon-resize-full');
                       $('#buttFullScreenToggle').attr('aria-label', titleText);
                       $('#buttFullScreenToggle').attr('title', titleText);
                   }
               });
           }

           var unhideUI = function() {
               hideLoop();
           }

           var hideUI = function() {
               hideTimeoutId = null;
               // don't hide it toolbar while toc open in non-embedded mode
               if (!embedded && $('#app-container').hasClass('toc-visible')) {
                   hideLoop()
                   return;
               }

               var navBar = document.getElementById("app-navbar");
               if (document.activeElement) {
                   var within = jQuery.contains(navBar, document.activeElement);
                   if (within) {
                       hideLoop();
                       return;
                   }
               }

               var $navBar = $(navBar);
               // BROKEN! $navBar.is(':hover')
               var isMouseOver = $navBar.find(':hover').length > 0;
               if (isMouseOver) {
                   hideLoop()
                   return;
               }

               if ($('#audioplayer').hasClass('expanded-audio')) {
                   hideLoop();
                   return;
               }

               $(tooltipSelector()).tooltip('destroy');

               $(document.body).addClass('hide-ui');
           }

           var hideTimeoutId;

           var hideLoop = function(e, immediate) {

               // if (!embedded){
               //     return;
               // }
               if (hideTimeoutId) {
                   window.clearTimeout(hideTimeoutId);
                   hideTimeoutId = null;
               }
               if (!$('#app-container').hasClass('toc-visible') && $(document.body).hasClass('hide-ui')) {
                   $(document.body).removeClass('hide-ui');
               }
               if (immediate) {
                   hideUI();
               } else {
                   hideTimeoutId = window.setTimeout(hideUI, 8000);
               }
           }

           //TODO: also update "previous/next page" commands status (disabled/enabled), not just button visibility.
           // https://github.com/readium/readium-js-viewer/issues/188
           // See onSwipeLeft() onSwipeRight() in gesturesHandler.
           // See nextPage() prevPage() in this class.
           var updateUI = function(pageChangeData) {
               if (pageChangeData.paginationInfo.canGoLeft())
                   $("#left-page-btn").show();
               else
                   $("#left-page-btn").hide();
               if (pageChangeData.paginationInfo.canGoRight())
                   $("#right-page-btn").show();
               else
                   $("#right-page-btn").hide();
           };

           var generateQueryParamCFI = function(bookmark) {
               if (!bookmark.idref) {
                   return;
               }

               var contentCFI = bookmark.contentCFI;
               if (!contentCFI) {
                   contentCFI = "/0"; // "null" CFI step
               }

               var spineItemPackageCFI = readium.reader.spine().getItemById(bookmark.idref).cfi;
               var completeCFI = 'epubcfi(' + spineItemPackageCFI + contentCFI + ')';

               // encodeURI is used instead of encodeURIComponent to not excessively encode all characters
               // characters '/', '!', '@', and ':' are allowed in the query component of a URI as per RFC 3986 section 3.4
               return encodeURI(completeCFI);
           };

           var savePlace = function() {

               var bookmarkString = readium.reader.bookmarkCurrentPage();
               // Note: automatically JSON.stringify's the passed value!
               // ... and bookmarkCurrentPage() is already JSON.toString'ed, so that's twice!
               PeBL.user.getUser(function(userProfile) {
                 if (userProfile) {
                   Settings.put(userProfile.identity + '_' + ebookURL_filepath, bookmarkString, $.noop);
                 } else {
                   Settings.put(ebookURL_filepath, bookmarkString, $.noop);
                 }
               })
               
           };

           var saveHistory = function() {
               var bookmarkString = readium.reader.bookmarkCurrentPage();

               if (!isChromeExtensionPackagedApp // History API is disabled in packaged apps
                   &&
                   window.history && window.history.replaceState) {

                   var urlParams = Helpers.getURLQueryParams();
                   var ebookURL = urlParams['epub'];
                   if (!ebookURL) return;

                   ebookURL = ensureUrlIsRelativeToApp(ebookURL);
                   var bookmark = JSON.parse(bookmarkString) || {};
                   var epubs = urlParams['epubs'];

                   var gotoParam = generateQueryParamCFI(bookmark);

                   var url = Helpers.buildUrlQueryParameters(undefined, {
                       epub: ebookURL,
                       epubs: (epubs ? epubs : " "),
                       embedded: " ",
                       goto: { value: gotoParam ? gotoParam : " ", verbatim: true }
                   });

                   if ((bookmark.contentCFI || bookmark.idref) && (history.state && history.state.url !== url)) {

                       var obj = {
                           epub: ebookURL,
                           epubs: (epubs ? epubs : undefined),
                           url: url
                       };

                       history.pushState(obj, "Readium Viewer", url);
                   }
               }
           }

           var isIos = function() {
               var userAgent = window.navigator.userAgent.toLowerCase();
               return /iphone|ipad|ipod/.test( userAgent );
           }

           var inIos = isIos();
           var clearingKeyboard = false;

           // Focus a hidden input in the content and blur it immediately to clear the iOS keyboard.
           // This function is also in gestures.js
           var clearIosKeyboard = function() {
               if (inIos && !clearingKeyboard) {
                   clearingKeyboard = true;

                   var input = document.getElementById('iosKeyboardClearInput');
                   if (input) {
                       $(input).show();
                       input.focus();
                       input.blur();
                       $(input).hide();
                   }

                   clearingKeyboard = false;
               }
           };

           $(document).on('blur', 'input, textarea', function() {
               console.log('blur');
               clearIosKeyboard();
           });

           var nextPage = function() {
               clearIosKeyboard();

               readium.reader.openPageRight();

               PeBL.emitEvent(PeBL.events.eventNextPage, {
                   firstCfi: readium.reader.getFirstVisibleCfi(),
                   lastCfi: readium.reader.getLastVisibleCfi(),
                   activityType: 'page'
               });

               return false;
           };

           var prevPage = function() {
               clearIosKeyboard();

               readium.reader.openPageLeft();

               PeBL.emitEvent(PeBL.events.eventPrevPage, {
                   firstCfi: readium.reader.getFirstVisibleCfi(),
                   lastCfi: readium.reader.getLastVisibleCfi(),
                   activityType: 'page'
               });

               return false;
           };

           var installReaderEventHandlers = function() {

               if (isChromeExtensionPackagedApp) {
                   $('.icon-shareUrl').css("display", "none");
               } else {
                   $(".icon-shareUrl").on("click", function() {

                       var urlParams = Helpers.getURLQueryParams();
                       var ebookURL = urlParams['epub'];
                       if (!ebookURL) return;

                       var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage()) || {};

                       // TODO: remove dependency on highlighter plugin (selection DOM range convert to BookmarkData)
                       if (readium.reader.plugins.highlights) {
                           var tempId = Math.floor((Math.random() * 1000000));
                           //BookmarkData
                           var bookmarkDataSelection = readium.reader.plugins.highlights.addSelectionHighlight(tempId, "temp-highlight");
                           if (bookmarkDataSelection) {
                               setTimeout(function() {
                                   readium.reader.plugins.highlights.removeHighlight(tempId);
                               }, 500);

                               console.log("Selection shared bookmark:");
                               debugBookmarkData(bookmarkDataSelection);
                               bookmark.contentCFI = bookmarkDataSelection.contentCFI;
                           }
                       }

                       ebookURL = ensureUrlIsRelativeToApp(ebookURL);

                       var url = Helpers.buildUrlQueryParameters(undefined, {
                           epub: ebookURL,
                           epubs: " ",
                           embedded: " ",
                           goto: { value: generateQueryParamCFI(bookmark), verbatim: true }
                       });

                       var injectCoverImageURI = function(uri) {
                           var style = 'margin-top: 1em; margin-bottom: 0.5em; height:400px; width:100%; background-repeat: no-repeat; background-size: contain; background-position: center; background-attachment: scroll; background-clip: content-box; background-origin: content-box; box-sizing: border-box; background-image: url(' + uri + ');';

                           var $div = $("#readium_book_cover_image");
                           if ($div && $div[0]) {
                               $div.attr("style", style);
                           }

                           return style;
                       };

                       var ebookCoverImageURL = undefined;
                       try {
                           var fetcher = readium.getCurrentPublicationFetcher();

                           // debugger;

                           var coverHref = currentPackageDocument.getMetadata().cover_href;
                           if (coverHref) {
                               var coverPath = fetcher.convertPathRelativeToPackageToRelativeToBase(coverHref);
                               var relPath = "/" + coverPath; //  "/META-INF/container.xml"

                               if (fetcher.shouldConstructDomProgrammatically()) {
                                   fetcher.relativeToPackageFetchFileContents(relPath, 'blob', function(res) {
                                       if (res) {
                                           try {
                                               var blobURI = window.URL.createObjectURL(res);
                                               injectCoverImageURI(blobURI);
                                           } catch (err) {
                                               // ignore
                                               console.error(err);
                                           }
                                       }
                                   }, function(err) {
                                       // ignore
                                       console.error(err);
                                   });
                               } else {
                                   ebookCoverImageURL = fetcher.getEbookURL_FilePath() + relPath;
                               }
                           }
                       } catch (err) {
                           // ignore
                           console.error(err);
                       }

                       var styleAttr = "";
                       if (ebookCoverImageURL) {
                           styleAttr = ' style="' + injectCoverImageURI(ebookCoverImageURL) + '" ';
                       }

                       //showModalMessage
                       //showErrorWithDetails
                       Dialogs.showModalMessageEx(Strings.share_url, $('<p id="share-url-dialog-input-label">' + Strings.share_url_label + '</p><input id="share-url-dialog-input-id" aria-labelledby="share-url-dialog-input-label" type="text" value="' + url + '" readonly="readonly" style="width:100%" /><div id="readium_book_cover_image" ' + styleAttr + '> </div>'));

                       setTimeout(function() {
                           $('#share-url-dialog-input-id').focus().select();
                       }, 500);
                   });
               }

               // Set handlers for click events
               $(".icon-annotations").on("click", function() {
                   saveHighlight();
               });

               var isWithinForbiddenNavKeysArea = function() {
                   return document.activeElement &&
                       (
                           document.activeElement === document.getElementById('volume-range-slider') ||
                               document.activeElement === document.getElementById('time-range-slider') ||
                               document.activeElement === document.getElementById('rate-range-slider') ||
                               jQuery.contains(document.getElementById("mo-sync-form"), document.activeElement) ||
                               jQuery.contains(document.getElementById("mo-highlighters"), document.activeElement)

                           // jQuery.contains(document.getElementById("app-navbar"), document.activeElement)
                           // || jQuery.contains(document.getElementById("settings-dialog"), document.activeElement)
                           // || jQuery.contains(document.getElementById("about-dialog"), document.activeElement)
                       );
               };

               var hideTB = function() {
                   if (!embedded && $('#app-container').hasClass('toc-visible')) {
                       return;
                   }
                   hideUI();
                   if (document.activeElement) document.activeElement.blur();
               };
               $("#buttHideToolBar").on("click", hideTB);
               Keyboard.on(Keyboard.ToolbarHide, 'reader', hideTB);

               var showTB = function() {
                   $("#aboutButt1")[0].focus();
                   unhideUI();
                   setTimeout(function() { $("#aboutButt1")[0].focus(); }, 50);
               };
               $("#buttShowToolBar").on("click", showTB);
               Keyboard.on(Keyboard.ToolbarShow, 'reader', showTB);

               Keyboard.on(Keyboard.PagePrevious, 'reader', function() {
                   if (!isWithinForbiddenNavKeysArea()) prevPage();
               });

               Keyboard.on(Keyboard.PagePreviousAlt, 'reader', prevPage);

               Keyboard.on(Keyboard.PageNextAlt, 'reader', nextPage);

               Keyboard.on(Keyboard.PageNext, 'reader', function() {
                   if (!isWithinForbiddenNavKeysArea()) nextPage();
               });

               if (screenfull.enabled) {
                   Keyboard.on(Keyboard.FullScreenToggle, 'reader', toggleFullScreen);
                   $('#buttFullScreenToggle').on('click', toggleFullScreen);
               } else {
                   $('#buttFullScreenToggle').css('display', 'none');
                   // $('#buttFullScreenToggle')[0].style.display = 'none';
               }

               var loadlibrary = function() {
                   $("html").attr("data-theme", "library");
                   $("html").attr("lang", "en");

                   var urlParams = Helpers.getURLQueryParams();
                   //var ebookURL = urlParams['epub'];
                   var libraryURL = urlParams['epubs'];

                   $(window).triggerHandler('loadlibrary', libraryURL);
                   //$(window).trigger('loadlibrary');
               };

               Keyboard.on(Keyboard.SwitchToLibrary, 'reader', loadlibrary /* function(){setTimeout(, 30);} */ );

               $('.icon-library').on('click', function() {
                   loadlibrary();
                   return false;
               });

               $('#aboutButt1').on('click', function() {
                   loadlibrary();
                   return false;
               });

               // $('.icon-help').on('click', function() {
               //     PeBL.emitEvent(PeBL.events.eventHelped, {});
               // });

               $('.zoom-wrapper input').on('click', function() {
                   if (!this.disabled) {
                       this.focus();
                       return false;
                   }
               });

               Keyboard.on(Keyboard.TocShowHideToggle, 'reader', function() {
                   var visible = $('#app-container').hasClass('toc-visible');
                   if (!visible) {
                       tocShowHideToggle();
                   } else {
                       setTimeout(function() { $('#readium-toc-body button.close')[0].focus(); }, 100);
                   }
               });

               $('.icon-toc').on('click', tocShowHideToggle);
               $('.icon-show-annotations').on('click', annotationsShowHideToggle);
               $('#bookmark-show').on('click', bookmarksShowHideToggle);
               $('#bookmark-page').on('click', showBookmarkDialogue);
               $('#searchButt').on('click', searchShowHideToggle);

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
                           window.location.href = window.location.href;
                       }, true);
                   });
               });

               PeBL.user.getUser(function(userProfile) {
                   if (userProfile.currentTeamName) {
                       $('#readerCurrentClassContainer').show();
                       $('#readerCurrentClass').text(userProfile.currentTeamName);
                   } else if (userProfile.currentClassName) {
                       $('#readerCurrentClassContainer').show();
                       $('#readerCurrentClass').text(userProfile.currentClassName);
                   } else {
                       $('#readerCurrentClassContainer').hide();
                   }
               });

               PeBL.extension.hardcodeLogin.hookLoginButton("loginButt",
                                                            function() {
                                                                loadlibrary();
                                                            },
                                                            function() {
                                                                loadlibrary();
                                                            });
               $('#add-bookmark-submit').on('click', function(evt) {
                   var val = $('#bookmarkInput').val();
                   if (val.trim().length > 0) {
                       saveBookmark(val);
                   } else {
                       evt.preventDefault();
                       evt.stopPropagation();
                       Dialogs.showErrorWithDetails('Alert', 'A name for your bookmark is required.');
                   }
               });
               $('#add-note-submit').on('click', function(evt) {
                   PeBL.user.getUser(function(userProfile) {
                       var groupId = '';
                       if (userProfile.currentTeam)
                           groupId = userProfile.currentTeam;
                       else if (userProfile.currentClass)
                           groupId = userProfile.currentClass;

                       var annotation = $(evt.currentTarget).data('annotation');

                       var note = $('#annotationInput').val();
                       removeHighlight(annotation);

                       annotation.text = note;
                       if (annotation.type === 2) {
                           PeBL.emitEvent(PeBL.events.eventAnnotated, annotation);
                       } else if (annotation.type === 3) {
                           annotation.groupId = groupId;
                           PeBL.emitEvent(PeBL.events.newSharedAnnotation, annotation);
                       }
                       annotationsShowHideToggle(true);
                   });
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
                   } else if (data.message === 'goToIdref') {
                       readium.reader.openSpineItemPage(data.idref, 0);
                   }
               }, false);

               if (window.opener) {
                   var message = {
                       "message": "readerLoaded"
                   }
                   window.opener.postMessage(JSON.stringify(message), '*');
               }


               var setTocSize = function() {
                   var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
                   $('#app-container').height(appHeight);
                   // TODO: Where is 44px difference coming from?
                   $('#readium-toc-body').height(appHeight - 44);
                   $('#annotations-body').height(appHeight - 44);
                   $('#bookmarks-body').height(appHeight - 44);
                   $('#search-body').height(appHeight - 44);
               };

               var tocBody = $('#readium-toc-body');
               var annotationsBody = $('#annotations-body');
               var bookmarksBody = $('#bookmarks-body');
               var searchBody = $('#search-body');
               var readingArea = $('#reading-area');

               var setReaderSize = function() {
                   var readingAreaOffset = readingArea.css('right');
                   if (tocBody.is(':visible')) {
                       var tocBodyWidth = tocBody.css('width');
                       if (readingAreaOffset !== tocBodyWidth) {
                           readingArea.css('right', tocBodyWidth);
                           window.dispatchEvent(new Event('resize'));
                       }
                   } else if (annotationsBody.is(':visible')) {
                       var annotationsBodyWidth = annotationsBody.css('width');
                       if (readingAreaOffset !== annotationsBodyWidth) {
                           readingArea.css('right', annotationsBodyWidth);
                           window.dispatchEvent(new Event('resize'));
                       }
                   } else if (bookmarksBody.is(':visible')) {
                       var bookmarksBodyWidth = bookmarksBody.css('width');
                       if (readingAreaOffset !== bookmarksBodyWidth) {
                           readingArea.css('right', bookmarksBodyWidth);
                           window.dispatchEvent(new Event('resize'));
                       }
                   } else if (searchBody.is(':visible')) {
                       var searchBodyWidth = searchBody.css('width');
                       if (readingAreaOffset !== searchBodyWidth) {
                           readingArea.css('right', searchBodyWidth);
                           window.dispatchEvent(new Event('resize'));
                       }
                   } else if (readingAreaOffset !== '0px') {
                       readingArea.css('right', '0px');
                   }
               }

               Keyboard.on(Keyboard.ShowSettingsModal, 'reader', function() { $('#settings-dialog').modal("show") });

               $('#app-navbar').on('mousemove', hideLoop);

               $(window).on('resize', setTocSize);
               setInterval(setReaderSize, 200);
               setTocSize();

               hideLoop();

               // captures all clicks on the document on the capture phase. Not sure if it's possible with jquery
               // so I'm using DOM api directly
               //document.addEventListener('click', hideLoop, true);
           };

           var setFitScreen = function(e) {
               readium.reader.setZoom({ style: 'fit-screen' });
               $('.active-zoom').removeClass('active-zoom');
               $('#zoom-fit-screen').addClass('active-zoom');
               $('.zoom-wrapper input').prop('disabled', true);
               $('.zoom-wrapper>a').dropdown('toggle');
               return false;
           }

           var setFitWidth = function(e) {
               readium.reader.setZoom({ style: 'fit-width' });
               $('.active-zoom').removeClass('active-zoom');
               $('#zoom-fit-width').addClass('active-zoom');
               $('.zoom-wrapper input').prop('disabled', true);
               $('.zoom-wrapper>a').dropdown('toggle');
               return false;
           }

           var enableCustom = function(e) {
               $('.zoom-wrapper input').prop('disabled', false).focus();
               $('.active-zoom').removeClass('active-zoom');
               $('#zoom-custom').addClass('active-zoom');
               $('.zoom-wrapper>a').dropdown('toggle');
               return false;
           }

           var zoomRegex = /^\s*(\d+)%?\s*$/;
           var setCustom = function(e) {
               var percent = $('.zoom-wrapper input').val();
               var matches = zoomRegex.exec(percent);
               if (matches) {
                   var percentVal = Number(matches[1]) / 100;
                   readium.reader.setZoom({ style: 'user', scale: percentVal });
               } else {
                   setScaleDisplay();
               }
           }

           var loadReaderUIPrivate = function() {
               $('.modal-backdrop').remove();
               var $appContainer = $('#app-container');
               $appContainer.empty();
               $appContainer.attr('role','main');
               $appContainer.append(ReaderBody({ strings: Strings, dialogs: Dialogs, keyboard: Keyboard, disabledFeatures: window.PeBLConfig.disabledFeatures }));
               $('nav').empty();
               $('nav').attr("aria-label", Strings.i18n_toolbar);
               $('nav').append(ReaderNavbar({ strings: Strings, dialogs: Dialogs, keyboard: Keyboard }));
               $appContainer.append(AddBookmarkDialog({ strings: Strings }));
               $appContainer.append(AddNoteDialog({ strings: Strings }));
               $appContainer.append(FullScreenImageDialog({ strings: Strings }));
               installReaderEventHandlers();
               document.title = Strings.i18n_pebl_reader;
               $('#zoom-fit-width a').on('click', setFitWidth);
               $('#zoom-fit-screen a').on('click', setFitScreen);
               $('#zoom-custom a').on('click', enableCustom);
               $('.zoom-wrapper input').on('change', setCustom);

               spin(true);
           }

           var loadReaderUI = function(data) {

               Keyboard.scope('reader');

               ebookURL = data.epub;
               ebookURL_filepath = Helpers.getEbookUrlFilePath(ebookURL);

               Analytics.trackView('/reader');
               embedded = data.embedded;

               loadReaderUIPrivate();

               //because we reinitialize the reader we have to unsubscribe to all events for the previews reader instance
               if (readium && readium.reader) {

                   Globals.logEvent("__ALL__", "OFF", "EpubReader.js");
                   readium.reader.off();
               }

               if (window.ReadiumSDK) {
                   Globals.logEvent("PLUGINS_LOADED", "OFF", "EpubReader.js");
                   ReadiumSDK.off(ReadiumSDK.Events.PLUGINS_LOADED);
               }

               setTimeout(function() {
                   initReadium(); //async
               }, 0);
           };

           var initReadium = function() {

               console.log("MODULE CONFIG:");
               console.log(moduleConfig);
             PeBL.user.getUser(function(userProfile) {

               Settings.getMultiple(['reader', ebookURL_filepath, userProfile ? userProfile.identity + '_' + ebookURL_filepath : ''], function(settings) {

                 



                   // Note that unlike Settings.get(), Settings.getMultiple() returns raw string values (from the key/value store), not JSON.parse'd !

                   // Ensures default settings are saved from the start (as the readium-js-viewer defaults can differ from the readium-shared-js).
                   if (!settings.reader) {
                       settings.reader = {};
                   } else {
                       settings.reader = JSON.parse(settings.reader);
                   }
                   for (prop in SettingsDialog.defaultSettings) {
                       if (SettingsDialog.defaultSettings.hasOwnProperty(prop)) {
                           if (!settings.reader.hasOwnProperty(prop) || (typeof settings.reader[prop] == "undefined")) {
                               settings.reader[prop] = SettingsDialog.defaultSettings[prop];
                           }
                       }
                   }
                   // Note: automatically JSON.stringify's the passed value!
                   Settings.put('reader', settings.reader);


                   var readerOptions = {
                       el: "#epub-reader-frame",
                       annotationCSSUrl: moduleConfig.annotationCSSUrl,
                       mathJaxUrl: moduleConfig.mathJaxUrl,
                       fonts: moduleConfig.fonts
                   };

                   var readiumOptions = {
                       jsLibRoot: moduleConfig.jsLibRoot,
                       openBookOptions: {}
                   };

                   if (moduleConfig.useSimpleLoader) {
                       readiumOptions.useSimpleLoader = true;
                   }

                   _debugBookmarkData_goto = undefined;
                   var openPageRequest;
                   if (userProfile && settings[userProfile.identity + '_' + ebookURL_filepath]) {
                       // JSON.parse() *first* because Settings.getMultiple() returns raw string values from the key/value store (unlike Settings.get())
                       var bookmark = JSON.parse(settings[userProfile.identity + '_' + ebookURL_filepath]);
                       // JSON.parse() a *second time* because the stored value is readium.reader.bookmarkCurrentPage(), which is JSON.toString'ed
                       bookmark = JSON.parse(bookmark);
                       if (bookmark && bookmark.idref) {
                           //console.log("Bookmark restore: " + JSON.stringify(bookmark));
                           openPageRequest = { idref: bookmark.idref, elementCfi: bookmark.contentCFI };
                           console.log("Open request (bookmark): " + JSON.stringify(openPageRequest));
                       }
                   } else if (settings[ebookURL_filepath]) {
                       // JSON.parse() *first* because Settings.getMultiple() returns raw string values from the key/value store (unlike Settings.get())
                       var bookmark = JSON.parse(settings[ebookURL_filepath]);
                       // JSON.parse() a *second time* because the stored value is readium.reader.bookmarkCurrentPage(), which is JSON.toString'ed
                       bookmark = JSON.parse(bookmark);
                       if (bookmark && bookmark.idref) {
                           //console.log("Bookmark restore: " + JSON.stringify(bookmark));
                           openPageRequest = { idref: bookmark.idref, elementCfi: bookmark.contentCFI };
                           console.log("Open request (bookmark): " + JSON.stringify(openPageRequest));
                       }
                   }

                   var urlParams = Helpers.getURLQueryParams();
                   var goto = urlParams['goto'];
                   if (goto) {
                       console.log("Goto override? " + goto);

                       try {
                           var gotoObj;
                           var openPageRequest_ = undefined;

                           if (goto.match(/^epubcfi\(.*?\)$/)) {
                               var gotoCfiComponents = goto.slice(8, -1).split('!'); //unwrap and split at indirection step
                               gotoObj = {
                                   spineItemCfi: gotoCfiComponents[0],
                                   elementCfi: gotoCfiComponents[1]
                               };
                           } else {
                               gotoObj = JSON.parse(goto);
                           }

                           // See ReaderView.openBook()
                           // e.g. with accessible_epub_3:
                           // &goto={"contentRefUrl":"ch02.xhtml%23_data_integrity","sourceFileHref":"EPUB"}
                           // or: {"idref":"id-id2635343","elementCfi":"/4/2[building_a_better_epub]@0:10"} (the legacy spatial bookmark is wrong here, but this is fixed in intel-cfi-improvement feature branch)
                           if (gotoObj.idref) {
                               if (gotoObj.spineItemPageIndex) {
                                   openPageRequest_ = { idref: gotoObj.idref, spineItemPageIndex: gotoObj.spineItemPageIndex };
                               } else if (gotoObj.elementCfi) {

                                   _debugBookmarkData_goto = new BookmarkData(gotoObj.idref, gotoObj.elementCfi);

                                   openPageRequest_ = { idref: gotoObj.idref, elementCfi: gotoObj.elementCfi };
                               } else {
                                   openPageRequest_ = { idref: gotoObj.idref };
                               }
                           } else if (gotoObj.contentRefUrl && gotoObj.sourceFileHref) {
                               openPageRequest_ = { contentRefUrl: gotoObj.contentRefUrl, sourceFileHref: gotoObj.sourceFileHref };
                           } else if (gotoObj.spineItemCfi) {
                               openPageRequest_ = { spineItemCfi: gotoObj.spineItemCfi, elementCfi: gotoObj.elementCfi };
                           }

                           if (openPageRequest_) {
                               openPageRequest = openPageRequest_;
                               console.log("Open request (goto): " + JSON.stringify(openPageRequest));
                           }
                       } catch (err) {
                           console.error(err);
                       }
                   }

                   readium = new Readium(readiumOptions, readerOptions);

                   window.READIUM = readium;

                   ReadiumSDK.on(ReadiumSDK.Events.PLUGINS_LOADED, function() {
                       Globals.logEvent("PLUGINS_LOADED", "ON", "EpubReader.js");

                       console.log('PLUGINS INITIALIZED!');

                       if (!readium.reader.plugins.highlights) {
                           $('.icon-annotations').css("display", "none");
                       } else {

                           readium.reader.plugins.highlights.initialize({
                               annotationCSSUrl: readerOptions.annotationCSSUrl
                           });

                           readium.reader.plugins.highlights.on("annotationClicked", function(type, idref, cfi, id, event) {
                               console.log("ANNOTATION CLICK: " + id);
                               //TODO: Maybe have a function to get a specific annotation rather than loop through them all?

                               if (type === 'user-highlight')
                                   PeBL.utils.getAnnotations(function(stmts) {
                                       for (var stmt of stmts) {
                                           if (stmt.id === id) {
                                               console.log(stmt);
                                               showAnnotationContextMenu(event, stmt);
                                               break;
                                           }
                                       }
                                   });
                               else if (type === 'shared-highlight' || type === 'shared-my-highlight')
                                   PeBL.utils.getSharedAnnotations(function(stmts) {
                                       for (var stmt of stmts) {
                                           if (stmt.id === id) {
                                               console.log(stmt);
                                               showAnnotationContextMenu(event, stmt);
                                               break;
                                           }
                                       }
                                   });

                               else if (type === 'search-highlight')
                                   readium.reader.plugins.highlights.removeHighlight(id);
                               // readium.reader.plugins.highlights.removeHighlight(id);
                           });
                       }

                       if (readium.reader.plugins.example) {
                           readium.reader.plugins.example.on("exampleEvent", function(message) {
                               alert(message);
                           });
                       }

                       if (readium.reader.plugins.hypothesis) {
                           // Respond to requests for UI controls to make space for the Hypothesis sidebar
                           readium.reader.plugins.hypothesis.on("offsetPageButton", function(offset) {
                               if (offset == 0) {
                                   $('#right-page-btn').css('right', offset);
                               } else {
                                   $('#right-page-btn').css('right', offset - $('#right-page-btn').width()); // 40px
                               }
                           });
                           readium.reader.plugins.hypothesis.on("offsetNavBar", function(offset) {
                               $('#app-navbar').css('margin-right', offset);
                               $('#reading-area').css('right', offset); // epub-reader-container
                           });
                       }
                   });

                   gesturesHandler = new GesturesHandler(readium.reader, readerOptions.el);
                   gesturesHandler.initialize();

                   $(window).on('keyup', function(e) {
                       if (e.keyCode === 9 || e.which === 9) {
                           unhideUI();
                       }
                   });

                   readium.reader.addIFrameEventListener('click', function(e) {
                       if (!inIos && $(e.target).is('img') && $(e.target).hasClass('zoomable')) {
                           $('#fullscreenImage').attr('src', e.target.src);
                           if (e.target.alt)
                               $('#fullscreen-image-label').text(e.target.alt);

                           $('#fullscreen-image-dialog').modal('show');
                       }
                   });

                   readium.reader.addIFrameEventListener('keydown', function(e) {
                       Keyboard.dispatch(document.documentElement, e.originalEvent);
                   });

                   readium.reader.addIFrameEventListener('keyup', function(e) {
                       Keyboard.dispatch(document.documentElement, e.originalEvent);
                   });

                   readium.reader.addIFrameEventListener('focus', function(e) {
                       $('#reading-area').addClass("contentFocus");
                       //$(window).trigger("focus");
                   });

                   readium.reader.addIFrameEventListener('blur', function(e) {
                       $('#reading-area').removeClass("contentFocus");
                   });

                   readium.reader.addIFrameEventListener('mouseup', function(e) {
                       var text = "";
                       if (e.view) {
                           if (typeof e.view.getSelection != "undefined") {
                               text = e.view.getSelection().toString();
                           } else if (typeof e.view.document.selection != "undefined" && e.view.document.selection.type == "Text") {
                               text = e.view.document.selection.createRange().text;
                           }
                       }

                       if (text.length > 0) {
                           console.log('Text is selected');
                           // Show the highlight button
                       } else {
                           console.log('No text selected');
                           // Hide the highlight button
                       }
                       var iframeWindow = $("#epub-reader-frame iframe")[0].contentWindow;
                       iframeWindow.lastTouchedElement = e.target;
                   });

                   readium.reader.addIFrameEventListener('touchend', function(e) {
                       var text = "";
                       if (e.view) {
                           if (typeof e.view.getSelection != "undefined") {
                               text = e.view.getSelection().toString();
                           } else if (typeof e.view.document.selection != "undefined" && e.view.document.selection.type == "Text") {
                               text = e.view.document.selection.createRange().text;
                           }
                       }

                       if (text.length > 0) {
                           console.log('Text is selected');
                           // Show the highlight button
                       } else {
                           console.log('No text selected');
                           // Hide the highlight button
                       }
                       var iframeWindow = $("#epub-reader-frame iframe")[0].contentWindow;
                       iframeWindow.lastTouchedElement = e.target;
                   });


                   SettingsDialog.initDialog(readium.reader, {
                       readiumJsViewer: {
                           version:window.PeBLConfig ? window.PeBLConfig.version : "N/a"
                       }
                   });

                   $('#settings-dialog').on('hidden.bs.modal', function() {

                       Keyboard.scope('reader');

                       unhideUI()
                       setTimeout(function() { $("#settbutt1").focus(); }, 50);

                       $("#buttSave").removeAttr("accesskey");
                       $("#buttClose").removeAttr("accesskey");
                   });
                   $('#settings-dialog').on('shown.bs.modal', function() {

                       Keyboard.scope('settings');

                       $("#buttSave").attr("accesskey", Keyboard.accesskeys.SettingsModalSave);
                       $("#buttClose").attr("accesskey", Keyboard.accesskeys.SettingsModalClose);
                   });


                   $('#about-dialog').on('hidden.bs.modal', function() {
                       Keyboard.scope('reader');

                       unhideUI();
                       setTimeout(function() { $("#aboutButt1").focus(); }, 50);
                   });
                   $('#about-dialog').on('shown.bs.modal', function() {
                       Keyboard.scope('about');
                   });

                   $('#annotations-dialog').on('hidden.bs.modal', function() {
                       Keyboard.scope('reader');

                       unhideUI();
                       // setTimeout(function(){ $("#annotationsButt1").focus(); }, 50);
                   });
                   $('#annotations-dialog').on('shown.bs.modal', function() {
                       Keyboard.scope('annotations');
                   });

                   $('#bookmarks-dialog').on('hidden.bs.modal', function() {
                       Keyboard.scope('reader');

                       unhideUI();
                       // setTimeout(function(){ $("#bookmarksButt1").focus(); }, 50);
                   });
                   $('#bookmarks-dialog').on('shown.bs.modal', function() {
                       Keyboard.scope('bookmarks');
                   });


                   var readerSettings;
                   if (settings.reader) {
                       readerSettings = settings.reader;
                   }
                   if (!embedded) {
                       readerSettings = readerSettings || SettingsDialog.defaultSettings;
                       SettingsDialog.updateReader(readium.reader, readerSettings);
                   } else {
                       readium.reader.updateSettings({
                           syntheticSpread: "auto",
                           scroll: "auto"
                       });
                   }


                   var toggleNightTheme = function() {

                       if (!embedded) {

                           Settings.get('reader', function(json) {
                               if (!json) {
                                   json = {};
                               }

                               var isNight = json.theme === "night-theme";
                               json.theme = isNight ? "author-theme" : "night-theme";

                               // Note: automatically JSON.stringify's the passed value!
                               Settings.put('reader', json);

                               SettingsDialog.updateReader(readium.reader, json);
                           });
                       }
                   };
                   $("#buttNightTheme").on("click", toggleNightTheme);
                   Keyboard.on(Keyboard.NightTheme, 'reader', toggleNightTheme);

                   readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
                       Globals.logEvent("CONTENT_DOCUMENT_LOAD_START", "ON", "EpubReader.js [ " + spineItem.href + " ]");

                       spin(true);
                   });

                   EpubReaderMediaOverlays.init(readium);

                   EpubReaderBackgroundAudioTrack.init(readium);

                   window.navigator.epubReadingSystem.name = "readium-js-viewer";

                   window.navigator.epubReadingSystem.readium = {};

                   loadEbook(readerSettings, openPageRequest);
                 
               });
              });
           }

           var unloadReaderUI = function() {

               if (readium) {
                   readium.closePackageDocument();
               }

               // needed only if access keys can potentially be used to open a book while a dialog is opened, because keyboard.scope() is not accounted for with HTML access keys :(
               // for example: settings dialogs is open => SHIFT CTRL [B] access key => library view opens with transparent black overlay!
               Dialogs.closeModal();
               Dialogs.reset();
               $('#settings-dialog').modal('hide');
               $('#about-dialog').modal('hide');
               $('.modal-backdrop').remove();
               $('#app-navbar').off('mousemove');


               Keyboard.off('reader');
               Keyboard.off('settings');

               $('#settings-dialog').off('hidden.bs.modal');
               $('#settings-dialog').off('shown.bs.modal');

               $('#about-dialog').off('hidden.bs.modal');
               $('#about-dialog').off('shown.bs.modal');

               // visibility check fails because iframe is unloaded
               //if (readium.reader.isMediaOverlayAvailable())
               if (readium && readium.reader) // window.push/popstate
               {
                   try {
                       readium.reader.pauseMediaOverlay();
                   } catch (err) {
                       //ignore error.
                       //can occur when ReaderView._mediaOverlayPlayer is null, for example when openBook() fails
                   }
               }

               $(window).off('resize');
               $(window).off('mousemove');
               $(window).off('keyup');
               $(window).off('message');
               window.clearTimeout(hideTimeoutId);
               $(document.body).removeClass('embedded');
               $('.book-title-header').remove();

               $(document.body).removeClass('hide-ui');

               spin(false);
           }

           var applyKeyboardSettingsAndLoadUi = function(data) {
               // override current scheme with user options
               Settings.get('reader', function(json) {
                   Keyboard.applySettings(json);

                   loadReaderUI(data);
               });
           };

           return {
               loadUI: applyKeyboardSettingsAndLoadUi,
               unloadUI: unloadReaderUI,
               tooltipSelector: tooltipSelector,
               ensureUrlIsRelativeToApp: ensureUrlIsRelativeToApp
           };

       });
