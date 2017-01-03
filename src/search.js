/**
 * Search module; encapsulates all search functions.
 * @returns {Object} Public interface
 */
var Search = (function() {

    // Constants
    var _MSG_KEYWORD_FAIL = "Kein passender Begriff gefunden.";
    var _MSG_KEYWORD_NONE = "Keine Begriffe verfügbar.";
    var _MSG_KEYWORD_LIST = "Folgende Begriffe wurden gefunden:";
    var _MSG_KEYWORD_ALL  = "Folgende Begriffe sind verfügbar";
    var _MSG_KEYWORD_HINT = "(dsa seach $1 [keyword] [-f] [-l])";
    var _MSG_TOPIC_FAIL   = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_TOPIC_ALL    = "Folgende Themen sind verfügbar:";
    var _MSG_TOPIC_HINT   = "(dsa search [topic] [keyword] [-f] [-l])";
    var _MSG_READ_ERROR   = "Es ist ein unbekannter Fehler aufgetreten.";
    var _MSG_DATA_ERROR   = "Keine Daten gefunden!";
    var _MSG_DATA_HINT    = "(dsa update [topic] [-f])";
    var _MSG_DATA_HELP    = "(dsa update $1 [-f])";

    // Modules
    var DidYouMean        = null;

    /**
     * Find keyword in topic; searches local data for topic and keyword.
     * @param {String} [topic] Topic to search in
     * @param {String} [keyword] Term to search
     * @param {String} [options] Command options
     */
    function find(topic, keyword, options) {

        // Initialize didyoumean
        DidYouMean = require("didyoumean");
        DidYouMean.nullResultValue = false;

        // Initialize values
            keyword = keyword       || "";
            topic   = topic         || "";
        var lucky   = options.lucky || false;
        var fuzzy   = options.fuzzy || false;
        var empty   = topic.length === 0;

        // Load data, print empty line
        Data.load(function(data) {
            F.printEmpty();

            // Check if data is available
            if (Object.keys(data).length > 0) {

                // Search for topic, collect available topics
                var avail = [];
                var match = false;
                Object.keys(data).forEach(function(found) {
                    avail.push(found);
                    var search  = topic.toLowerCase();
                    var compare = found.toLowerCase();
                    if (search === compare) { match = found; }
                });

                // Sort available topics, get size, fix match
                avail.sort(F.sortAlpha);
                var size = avail.length;
                match = !match ? DidYouMean(topic, avail) : match;

                // Show message and available terms if no match was found
                if (!match) {

                    // Print title
                    if (empty) { F.printMsg(_MSG_TOPIC_ALL.cyan, size); }
                    else { F.printMsg(_MSG_TOPIC_FAIL.red, size, true); }
                    F.printEmpty();

                    // Print available terms
                    avail.forEach(function(found, i) {
                        F.printList(i + 1, size, found);
                    });

                    // Print hint
                    F.printEmpty();
                    F.printMsg(_MSG_TOPIC_HINT.grey.dim, size);
                    F.printEmpty();

                // Else continue with search
                } else {
                    _findTerm(data[match], keyword, match, fuzzy, lucky);
                }

            // Print error if no data found
            } else {
                F.printMsg(_MSG_DATA_ERROR.red, 0, true);
                F.printMsg(_MSG_DATA_HINT.grey.dim, 0);
                F.printEmpty();
            }
        });
    }

    /**
     * Find a term in a topic.
     * @param {Object} topic Topic to search in
     * @param {String} keyword Keyword to search
     * @param {String} name Name of topic
     * @param {Boolean} fuzzy Use fuzzysearch
     * @param {Boolean} lucky Pick lucky result
     */
    function _findTerm(topic, keyword, name, fuzzy, lucky) {

        // Initialize values
        var empty    = keyword.length === 0;
        var quote    = F.strKeyword(keyword);
        var search   = keyword.toLowerCase();
        var match    = false;
        var size     = 0;
        var similar  = [];

        // Initialize hints
        var hintFind = _MSG_KEYWORD_HINT.grey.dim;
        var hintUpdt = _MSG_DATA_HELP.grey.dim;
            hintFind = hintFind.replace(G.REGEX_REPLACE, name);
            hintUpdt = hintUpdt.replace(G.REGEX_REPLACE, name);

        // Search all available terms, save similar and exact match
        Object.keys(topic).forEach(function(term) {
            var found = term.toLowerCase();
            if (search === found) { match = term; return; }
            else if (_compare(search, found, fuzzy)) {
                similar.push(term); size++;
            }
        });

        // Choose match, sort similar list
        match = !match ? _pickBest(search, similar, lucky) : match;
        similar.sort(F.sortAlpha);

        // Print term on exact match
        if (match) { _printTerm(topic[match]);

        // Show similar found keywords if available
        } else if (size > 0) {

            // Print title
            if (empty) { F.printMsg(_MSG_KEYWORD_ALL.cyan, size); }
            else { F.printMsg(quote + _MSG_KEYWORD_LIST.cyan, size); }
            F.printEmpty();

            // Print similar found terms
            similar.forEach(function(found, i) {
                F.printList(i + 1, size, found);
            });

            // Print hint
            F.printEmpty();
            F.printMsg(hintFind, size);
            F.printEmpty();

        // Show error if no terms are available
        } else if (empty) {
            F.printMsg(_MSG_KEYWORD_NONE.red, 0, true);
            F.printMsg(hintUpdt, size);
            F.printEmpty();

        // Show error if no match was found
        } else {
            F.printMsg(quote + _MSG_KEYWORD_FAIL.red, 0, true);
            F.printMsg(hintFind, size);
            F.printEmpty();
        }
    }

    /**
     * Compare two strings for similarity.
     * @param {String} a First string
     * @param {String} b Second string
     * @param {Boolean} fuzzy Use fuzzysearch
     * @returns {Boolean} Strings are equal or similar
     */
    function _compare(a, b, fuzzy) {

        // Initialize fuzzysearch
        var FuzzySearch = fuzzy ? require("fuzzysearch")
                                : function() { return false; };

        // Clean inputs, return comparison
        a = a.toLowerCase(); b = b.toLowerCase();
        return (a.indexOf(b) !== -1) || FuzzySearch(a, b) ||
               (b.indexOf(a) !== -1) || FuzzySearch(b, a);
    }

    /**
     * Choose best search result from list.
     * @param {String} search Search keyword
     * @param {String[]} list List of possible matches
     * @param {Boolean} lucky Use lucky result
     * @returns {String|Boolean} Found match or false
     */
    function _pickBest(search, list, lucky) {
        DidYouMean.threshold = null;
        DidYouMean.thresholdAbsolute = 100;
        return lucky ? DidYouMean(search, list) : false;
    }

    /**
     * Print the content of a given term.
     * @param {String} term Content of term
     */
    function _printTerm(term) {
        F.printLine(F.formatOutput(term));
        F.printEmpty();
    }

    // Public interface
    return { find: find };

})();
