/**
 * Main.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */
var Main = (function() {

    // General constants
    var _PATH_FILE             = "../data.json";
    var _TMPL_RESULT           = "#tmpl-result";
    var _TMPL_TAGS             = "#tmpl-tags";
    var _MAX_RESULTS           = 12;
    var _KEY_UP                = 38;
    var _KEY_DOWN              = 40;

    // DOM selectors
    var _SEL_TAGS              = "[data-main='tags']";
    var _SEL_ITEM              = "[data-main='item']";
    var _SEL_INPUT             = "[data-main='input']";
    var _SEL_CONTENT           = "[data-main='content']";
    var _SEL_RESULT            = "[data-main='result']";

    // Event constants
    var _EVT_KEYDOWN           = "keydown";
    var _EVT_INPUT             = "input";
    var _EVT_CLICK             = "click";

    // Class constants
    var _CLASS_SELECTED        = "selected";

    // Variables
    var _selected              = false;
    var _data                  = [];
    var _tags                  = [];
    var _found                 = [];
    var _fuse                  = null;

    // DOM elements
    var _$tags                 = null;
    var _$input                = null;
    var _$content              = null;
    var _$result               = null;
    var _$window               = null;

    // Templates
    var _tmplResult            = "";
    var _tmplTags              = "";

    /**
     * Initialize.
     */
    function init() {

        // Initialize DOM elements
        _$window  = $(window);
        _$tags    = $(_SEL_TAGS);
        _$input   = $(_SEL_INPUT);
        _$content = $(_SEL_CONTENT);
        _$result  = $(_SEL_RESULT);

        // Focus input
        _$input.focus();

        // Initialize templates
        _tmplTags   = $(_TMPL_TAGS).html();
        _tmplResult = $(_TMPL_RESULT).html();

        // Execute function
        _bind();
        _load();
    }

    /**
     * Bind events.
     */
    function _bind() {
        _$input.on(_EVT_INPUT, _search);
        _$window.on(_EVT_KEYDOWN, _navigate);
        _$result.on(_EVT_CLICK, _SEL_ITEM, _select);
    }

    /**
     * Load data.
     */
    function _load() {
        $.getJSON(_PATH_FILE, function(data) {

            // Save data, create list
            $.each(data, function(tag, terms) {
                $.each(terms, function(label, content) {
                    _data.push({
                        tag      : tag,
                        label    : label,
                        content  : content,
                        selected : false
                    });
                });
            });

            // Initialize fuse
            _tags = Object.keys(data).sort();
            _fuse = new Fuse(_data, { keys: ["label"] });
        });
    }

    /**
     * Perform search.
     */
    function _search() {
        var tags    = false;
        var keyword = $(this).val();
        if (!keyword.length) { _found = []; }
        else if (keyword.startsWith("#")) {
            tags = true;
            keyword = keyword.replace(/#/g, "").toLowerCase();
            if ($.inArray(keyword, _tags) >= 0) {
                _found = _data.filter(function(item) {
                    return item.tag === keyword;
                }).sort(function(a, b) {
                    return a.label.localeCompare(b.label);
                });
            } else { _found = []; }
        } else { _found = _fuse.search(keyword).slice(0, _MAX_RESULTS - 1); }
        _selected = _found.length === 0 ? false : 0;
        _renderTags(tags, keyword);
        _renderResult();
    }

    /**
     * Render search results.
     */
    function _renderResult() {
        _$result.html(Mustache.render(_tmplResult, _found).trim())
                .promise().done(function() {
            _renderSelected();
            _renderContent();
        });
    }

    /**
     * Render selected result.
     */
    function _renderSelected() {
        if (_selected !== false) {
            _$result.children().eq(_selected).addClass(_CLASS_SELECTED)
                    .siblings().removeClass(_CLASS_SELECTED);
        }
    }

    /**
     * Render selected content.
     */
    function _renderContent() {
        var content = _selected === false ? "" : _found[_selected].content;
        _$content.html(content.trim() || "");
    }

    /**
     * Render available tags.
     * @param {Boolean} show Shot tags or hide them
     * @param {String} keyword Keyword
     */
    function _renderTags(show, keyword) {
        var data = show ? _tags : [];
        _$tags.html(Mustache.render(_tmplTags, data).trim())
               .promise().done(function() {
            _$tags.focus();
            _$tags.children().removeClass(_CLASS_SELECTED).each(function() {
                var $tag = $(this);
                if ($tag.text() === keyword) {
                    $tag.addClass(_CLASS_SELECTED);
                }
            });
        });
    }

    /**
     * Navigate through result list.
     * @param {Object} event Triggered keydown event
     */
    function _navigate(event) {
        var key = event.which;
        if (key === _KEY_UP || key === _KEY_DOWN) {
            event.preventDefault();
            _selected += key === _KEY_DOWN ? 1 : key === _KEY_UP ? -1 : 0;
            _selected = _selected >= _found.length ? 0 : _selected;
            _selected = _selected < 0 ? _found.length - 1 : _selected;
            _renderSelected();
            _renderContent();
        }
    }

    /**
     * Select result item.
     */
    function _select() {
        _selected = $(this).index();
        _renderSelected();
        _renderContent();
    }

    // Öffentliches Interface
    return { init: init };

})();

// Initialize.
$(document).ready(function() { Main.init(); });
