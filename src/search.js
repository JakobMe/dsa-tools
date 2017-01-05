/**
 * Search module; provides function for search commands.
 * @returns {Object} Public interface
 */
var Search = (function() {

    // Constants
    var _MSG_PHRASE_FAIL  = "Kein passender Begriff gefunden.";
    var _MSG_PHRASE_NONE  = "Keine Begriffe verfügbar.";
    var _MSG_PHRASE_LIST  = "Folgende Begriffe wurden gefunden:";
    var _MSG_PHRASE_ALL   = "Folgende Begriffe sind verfügbar";
    var _MSG_PHRASE_HINT  = "(dsa suche $1 [begriff] [-u] [-r])";
    var _MSG_TOPIC_FAIL   = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_TOPIC_ALL    = "Folgende Themen sind verfügbar:";
    var _MSG_TOPIC_HINT   = "(dsa suche [thema] [begriff] [-u] [-r])";
    var _MSG_DATA_ERROR   = "Keine Daten gefunden!";
    var _MSG_DATA_HINT    = "(dsa aktualisiere [thema] [-e])";
    var _MSG_DATA_HELP    = "(dsa aktualisiere $1 [-e])";
    var _NUM_CHARS_LINE   = 80;

    // Variables
    var DidYouMean        = null;

    /**
     * Find phrase in topic; searches local data for topic and phrase.
     * @param {String} [topic]   Topic to search in
     * @param {String} [phrase]  Phrase to search
     * @param {String} [options] Command options
     */
    function find(topic, phrase, options) {

        // Initialize modules
        DidYouMean = require("didyoumean");
        DidYouMean.nullResultValue = false;

        // Initialize command arguments and options
            phrase = (phrase         || "").toLowerCase();
            topic  = (topic          || "").toLowerCase();
        var guess  = options.raten   || false;
        var fuzzy  = options.ungenau || false;

        // Load data
        Data.load(function(data) {

            // Initialize variables for search
            var available = Object.keys(data).sort(Util.sortAlpha);
            var matched   = _topic(topic, available);
            var blank     = topic.length === 0;
            var count     = available.length;
            var error     = blank ? _MSG_TOPIC_ALL.green : _MSG_TOPIC_FAIL.red;

            // Continue search on matched topic
            if (count && matched) {
                _search(data[matched], phrase, matched, fuzzy, guess);

            // Show available topics on wrong or no topic
            } else if (count) {
                Log.shout(error, count, !blank, blank);
                Log.list(available);
                Log.hint(_MSG_TOPIC_HINT, count);

            // Show error on missing data
            } else {
                Log.error(_MSG_DATA_ERROR, count, 1, 0);
                Log.hint(_MSG_DATA_HINT, count, 0, 1);
            }
        });
    }

    /**
     * Search a phrase in data of topic.
     * @param {Object}  data   Data to search in
     * @param {String}  phrase Phrase to search
     * @param {String}  topic  Name of topic
     * @param {Boolean} fuzzy  Use fuzzy search
     * @param {Boolean} guess  Guess correct result
     */
    function _search(data, phrase, topic, fuzzy, guess) {

        // Initialize values
        var blank   = phrase.length === 0;
        var terms   = Object.keys(data);
        var found   = false;
        var similar = [];
        var title   = blank ? _MSG_PHRASE_ALL : _MSG_PHRASE_LIST;
        var hint    = _MSG_PHRASE_HINT.replace(G.STR.PH, topic);
        var help    = _MSG_DATA_HELP.replace(G.STR.PH, topic);

        // Find match and similar terms
        terms.forEach(function(term) {
            if (phrase === term.toLowerCase()) { found = term; }
            else if (_compare(phrase, term, fuzzy)) { similar.push(term); }
        });

        // Sort and count similar terms, guess match
        similar.sort(Util.sortAlpha);
        var matched = !found ? _guess(phrase, similar, guess) : found;
        var count   = similar.length;

        // Log matched term
        if (matched) {
            Log.spaced(_format(data[matched]));

        // Log similar matches
        } else if (count) {
            Log.success(title, count);
            Log.list(similar);
            Log.hint(hint, count);

        // Log error if no terms are available
        } else if (blank && !count) {
            Log.error(_MSG_PHRASE_NONE, count, 1, 0);
            Log.hint(help, count, 0, 1);

        // Log error if no match was found
        } else {
            Log.error(_MSG_PHRASE_FAIL, count, 1, 0);
            Log.hint(hint, count, 0, 1);
        }
    }

    /**
     * Compare two strings for similarity.
     * @param   {String}  a     First string
     * @param   {String}  b     Second string
     * @param   {Boolean} fuzzy Use fuzzysearch
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
     * Search topic in list of available topics.
     * @param   {String}         topic     Searched topic
     * @param   {String[]}       available Available topics
     * @returns {String|Boolean} Found topic or false
     */
    function _topic(topic, available) {
        return available.indexOf(topic) >= 0 ? topic :
               DidYouMean(topic, available);
    }

    /**
     * Guess best search result from list.
     * @param   {String}   search Search phrase
     * @param   {String[]} list   List of possible matches
     * @param   {Boolean}  guess  Do guess
     * @returns {String|Boolean}  Found result or false
     */
    function _guess(search, list, guess) {
        DidYouMean.threshold = null;
        DidYouMean.thresholdAbsolute = 100;
        return guess ? DidYouMean(search, list) : false;
    }

    /**
     * Format output of term content.
     * @param   {String} term Content of term
     * @returns {String} Formatted content
     */
    function _format(term) {
        term = _linebreaks(term);
        term = term.replace(G.REGEX.HEAD, G.STR.PH.green);
        term = term.replace(G.REGEX.BOLD, G.STR.PH.magenta);
        term = term.replace(G.REGEX.ITAL, G.STR.PH.cyan);
        return term;
    }

    /**
     * Insert linebreaks into a string to prevent breaking words.
     * @param   {String} str String to format
     * @returns {String} Formatted string
     */
    function _linebreaks(str) {
        var paragraphs = [];
        str.split("\n").forEach(function(paragraph) {
            var lines = [""], i = 0;
            paragraph.split(" ").forEach(function(word) {
                if (!_squeeze(word, lines[i])) { lines[++i] = ""; }
                lines[i] += word + " ";
            });
            lines.forEach(function(line, i) { lines[i] = line.trim(); });
            paragraphs.push(lines.join("\n"));
        });
        return paragraphs.join("\n");
    }

    /**
     * Check if a string can be queezed in a line, ignoring some chars.
     * @param   {String}  str  String to squeeze in line
     * @param   {String}  line Line to squeeze string into
     * @returns {Boolean} String fits in line
     */
    function _squeeze(str, line) {
        var put  = str.replace(G.REGEX.IGNORE, "");
        var host = line.replace(G.REGEX.IGNORE, "");
        return (put.length + host.length) <= _NUM_CHARS_LINE;
    }

    // Public interface
    return { find: find };

})();
