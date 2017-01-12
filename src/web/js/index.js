/**
 * App module.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */
var App = (function() {

    // General constants
    var _PATH_FILE              = "../data.json";
    var _TMPL_RESULT            = "#tmpl-result";
    var _TMPL_TAGS              = "#tmpl-tags";
    var _TEXT_CITE              = "Publikation:";
    var _CHAR_SPECIFY           = ":";
    var _CHAR_TAG               = "#";
    var _MAX_RESULTS            = 10;
    var _KEY_UP                 = 38;
    var _KEY_DOWN               = 40;
    var _KEY_ESCAPE             = 27;
    var _TIME_ANIMATION         = 200;

    // DOM selectors
    var _SEL_SEARCH_TAGS        = "[data-app='search-tags']";
    var _SEL_SEARCH_TAG         = "[data-app='search-tag']";
    var _SEL_SEARCH             = "[data-app='search']";
    var _SEL_SEARCH_INPUT       = "[data-app='search-input']";
    var _SEL_ARTICLE            = "[data-app='article']";
    var _SEL_RESULT             = "[data-app='result']";
    var _SEL_RESULT_ITEM        = "[data-app='result-item']";
    var _SEL_RESULT_COUNT       = "[data-app='result-count']";

    // Event constants
    var _EVT_KEYDOWN            = "keydown";
    var _EVT_INPUT              = "input";
    var _EVT_CLICK              = "click";

    // Class constants
    var _CLASS_SEARCH_TAG       = "search--tag";
    var _CLASS_RESULT_SELECTED  = "result__item--selected";
    var _CLASS_TAG_SELECTED     = "search__tag--selected";
    var _CLASS_CITE             = "cite";

    // Variables
    var _selected               = false;
    var _data                   = [];
    var _tags                   = [];
    var _found                  = [];
    var _fuse                   = null;

    // DOM elements
    var _$tags                  = null;
    var _$input                 = null;
    var _$search                = null;
    var _$article               = null;
    var _$result                = null;
    var _$count                 = null;
    var _$window                = null;

    // Templates
    var _tmplResult             = "";
    var _tmplTags               = "";

    /**
     * Initialize; initializes DOM element and
     * templates, binds events and loads data.
     */
    function init() {

        // Initialize DOM elements
        _$window  = $(window);
        _$tags    = $(_SEL_SEARCH_TAGS);
        _$search  = $(_SEL_SEARCH);
        _$input   = $(_SEL_SEARCH_INPUT);
        _$article = $(_SEL_ARTICLE);
        _$result  = $(_SEL_RESULT);
        _$count   = $(_SEL_RESULT_COUNT);

        // Focus input
        _$input.focus();

        // Initialize templates
        _tmplTags   = $(_TMPL_TAGS).html();
        _tmplResult = $(_TMPL_RESULT).html();

        // Execute functions
        _bind();
        _load();
    }

    /**
     * Bind events; binds functions to DOM events.
     */
    function _bind() {

        // Bindings
        _$input.on(_EVT_INPUT, _search);
        _$window.on(_EVT_KEYDOWN, _navigate);
        _$result.on(_EVT_CLICK, _SEL_RESULT_ITEM, _select);
        _$tags.on(_EVT_CLICK, _SEL_SEARCH_TAG, _tag);
    }

    /**
     * Load data; loads app data from JSON file,
     * initializes and renders tag list and fuse module.
     */
    function _load() {
        $.getJSON(_PATH_FILE, function(data) {

            // Save data, create list
            $.each(data, function(tag, terms) {
                $.each(terms, function(label, content) {
                    _data.push({
                        tag      : tag,
                        label    : label,
                        content  : content
                    });
                });
            });

            // Initialize fuse, insert tags
            _tags = Object.keys(data).sort();
            _fuse = new Fuse(_data, { keys: ["label", "content"] });
            _$tags.html(Mustache.render(_tmplTags, _tags).trim());
        });
    }

    /**
     * Perform search; analyzes search query and filters
     * data by keyword and tag, renders results.
     */
    function _search() {

        // Initialize variables
        var tag     = false;
        var query   = $(this).val();
        var keyword = query.substr(0);

        // Tag searching
        if (query.startsWith(_CHAR_TAG)) {
            var specify = query.indexOf(_CHAR_SPECIFY);
                keyword = query.substr(specify >= 0 ? specify + 1 : 0);
                keyword = keyword.startsWith(_CHAR_TAG) ? "" : keyword;
                tag     = query.substring(0, specify >= 0 ?
                          specify : undefined).replace(_CHAR_TAG, "")
                                              .toLowerCase();
        }

        // Initialize found items
        if (!query.length) { _found = []; }
        else if (tag && !keyword.length) { _found = _data.slice(0); }
        else { _found = _fuse.search(keyword); }

        // Filter, sort and slice found items
        _found = _found.filter(function(item) {
            return tag === false ? true : item.tag === tag;
        }).sort(function(a, b) {
            return tag !== false && !keyword.length ?
                   a.label.localeCompare(b.label) : 0;
        }).slice(0, keyword.length ? _MAX_RESULTS : undefined);

        // Reset selected item and render
        _selected = _found.length === 0 ? false : 0;
        _renderTags(tag);
        _renderResult();
    }

    /**
     * Render search results; inserts results into
     * result list, renders content and selection.
     */
    function _renderResult() {

        // Insert results
        _$result.html(Mustache.render(_tmplResult, _found).trim())
                .promise().done(function() {

            // Set counter, render selected item and content
            _$count.text(_found.length);
            _renderSelected();
            _renderContent();
        });
    }

    /**
     * Render selected result; marks selected result
     * and scroll result list to it's position.
     */
    function _renderSelected() {
        if (_selected !== false) {
            var $selected = _$result.find(_SEL_RESULT_ITEM).eq(_selected);

            // Select list item
            $selected.addClass(_CLASS_RESULT_SELECTED)
                     .siblings().removeClass(_CLASS_RESULT_SELECTED);

            // Calculate scroll
            var scr = _$result.scrollTop();
            var max = _$result.outerHeight();
            var pos = $selected.position().top;
            var end = pos + $selected.outerHeight();
            var pad = Math.round((max - _$result.height()) / 2);
            var mov = end > max ? scr + (end - max) + pad
                                : pos < pad ? scr + pos - pad
                                            : scr;

            // Animate scroll
            _$result.animate({ scrollTop: mov }, _TIME_ANIMATION / 4);
        }
    }

    /**
     * Render selected content; inserts selected content
     * into content container, performs highlighting operations.
     */
    function _renderContent() {

        // Define content
        var content = _selected === false ? "" : _found[_selected].content;

        // Insert content
        _$article.html(content.trim() || "").promise().done(function() {

            // Perform highlighting
            _$article.children().each(function() {
                var $el = $(this);
                if ($el.text().indexOf(_TEXT_CITE) >= 0) {
                    $el.addClass(_CLASS_CITE);
                }
            });
        });
    }

    /**
     * Render tags; find selected tag and mark it,
     * scroll tags container to selected tag.
     * @param {String|Boolean} tag Selected tag
     */
    function _renderTags(tag) {

        // Render tags
        var $selected = null;
        _$search.toggleClass(_CLASS_SEARCH_TAG, tag !== false);
        _$tags.find(_SEL_SEARCH_TAG).each(function() {
            var $tag = $(this);
            if ($tag.text() === tag) { $selected = $tag; }
            $tag.toggleClass(_CLASS_TAG_SELECTED, $tag.text() === tag);
        });

        // Calculate scroll
        if ($selected !== null) {
            var scr = _$tags.scrollLeft();
            var max = _$tags.outerWidth();
            var pos = $selected.position().left;
            var end = pos + $selected.outerWidth();
            var pad = Math.round((max - _$tags.width()) / 2);
            var mov = end > max ? scr + (end - max) + pad
                                : pos < pad ? scr + pos - pad
                                            : scr;

            // Animate scroll
            _$tags.animate({ scrollLeft: mov }, _TIME_ANIMATION);
        }
    }

    /**
     * Perform navigation actions by key events;
     * navigate through results list by arrow keys,
     * clear search input by escape key.
     * @param {Object} event Triggered keydown event
     */
    function _navigate(event) {

        // If recognized key is pressed
        var key = event.which;
        if (key === _KEY_UP || key === _KEY_DOWN || key == _KEY_ESCAPE) {
            event.preventDefault();

            // Get navigation direction
            _selected += key === _KEY_DOWN ? 1 : key === _KEY_UP ? -1 : 0;
            _selected = _selected >= _found.length ? 0 : _selected;
            _selected = _selected < 0 ? _found.length - 1 : _selected;

            // Clear input on escape
            if (key === _KEY_ESCAPE) {
                _selected = false;
                _$input.val("").trigger(_EVT_INPUT).focus();

            // Else render
            } else {
                _renderSelected();
                _renderContent();
            }
        }
    }

    /**
     * Select result item; set selected result item
     * by click event on it.
     */
    function _select() {

        // Get selected index, render item and content
        _selected = $(this).index();
        _renderSelected();
        _renderContent();
    }

    /**
     * Set tag; get tag by click event and insert it
     * into search input, performing respective search.
     */
    function _tag() {
        _$input.val(_CHAR_TAG + $(this).text() + _CHAR_SPECIFY)
               .trigger(_EVT_INPUT).focus();
    }

    // Public interface
    return { init: init };

})();

// Initialize
$(document).ready(function() { App.init(); });
