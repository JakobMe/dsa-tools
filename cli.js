#!/usr/bin/env node

/**
 * DSA-Tools CLI: github.com/JakobMe/dsa-tools
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */

// Modules
var Program  = require("commander");
var Colors   = require("colors");
var Terminal = require("terminal-kit").terminal;

// Number constants
var MOD_MIN             = 0;
var SKILL_MIN           = 0;
var ATTR_MIN            = 0;
var ROLLS_MIN           = 1;
var ROLLS_ATTR          = 3;
var ROLLS_TO_CRIT       = 2;
var D_20                = 20;
var ROLL_SLIP           = 20;
var ROLL_CRIT           = 1;
var QUAL_MULTIPLY       = 2;
var QUAL_DIVIDE         = 3;
var QUAL_MAX            = 6;
var QUAL_MIN            = 0;
var QUAL_SUCCESS        = 1;

// Code constants
var C_T                 = "++";
var C_B                 = "==";
var C_P                 = "__";
var C_I                 = "--";

// Regex constants
var REGEX_REPLACE       = "$1";
var REGEX_H             = /\+\+(.*?)\+\+/g;
var REGEX_B             = /==(.*?)==/g;
var REGEX_I             = /--(.*?)--/g;
var REGEX_P             = /__/g;
var REGEX_HASH          = /#(?!#)/g;
var REGEX_LVL           = / I-.*(I|V|X)/;
var REGEX_STAR          = / \(\*\)/;
var REGEX_DOTS          = / \.\.\./;

/**
 * Functions module; encapsulates all helper functions.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 * @returns {Object} Public interface
 */
var F = (function() {

    /**
     * Return a random integer between 'min' and 'max' (inclusive).
     * @param {Number} min Smallest allowed integer
     * @param {Number} max Biggest allowed integer
     * @returns {Number} Random integer
     */
    function _randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Convert string to integer with default fallback.
     * @param {String} string String to convert
     * @param {Number} fallback Default fallback integer
     * @returns {Number} Converted integer
     */
    function toInt(string, fallback) {
        var number = parseInt(string);
        if (isNaN(number)) { number = fallback; }
        return number;
    }

    /**
     * Roll a number of dice with specified number of sides.
     * @param {Number} sides Number of sides of rolled dice
     * @param {Number} [rolls] Number of rolled dice
     */
    function rollDice(sides, rolls) {
        var results = [];
        for (var i = 0; i < toInt(rolls, ROLLS_MIN); i++) {
            results.push(_randInt(1, sides));
        }
        return results;
    }

    /**
     * Split string of attributes and convert to integers.
     * @param {String} attr String of attributes
     * @returns {Number[]} Array of attribute values
     */
    function splitAttr(attr) {
        var values = [];
        attr.split("/").forEach(function(val) {
            values.push(toInt(val, ATTR_MIN));
        });
        return values;
    }

    /**
     * Indent a string according the longest string in the set.
     * @param {String} string String to indent
     * @param {String|Number} longest Longest string to base indentation on
     * @returns {String} Indented string
     */
    function indent(string, longest) {
        var lenStr = string.toString().length;
        var lenLon = longest.toString().length;
        for (var i = 0; i < (lenLon - lenStr); i++) { string = " " + string; }
        return string.toString();
    }

    /**
     * Print a line in console, indent by tab.
     * @param {String} content Content of line
     */
    function printLine(content) {
        Terminal((content || "") + "\n");
    }

    /**
     * Move n lines up in terminal.
     * @param {Number} n Number of lines to move up
     */
    function printUp(n) {
        for (var i = 0; i < (n || 1); i++) {
            Terminal.previousLine(1);
            Terminal.eraseLine();
        }
    }

    /**
     * Print n empty lines.
     * @param {Number} n Number of empty lines
     */
    function printEmpty(n) {
        for (var i = 0; i < (n || 1); i++) {
            printLine("");
        }
    }

    /**
     * Print an element of a list as a line.
     * @param {Number} i Number of list-element
     * @param {Number} size Size of list
     * @param {String} content Content of list-element
     */
    function printList(i, size, content) {
        printLine((indent(i, size) + ". ").grey.dim + content);
    }

    /**
     * Print a message.
     * @param {String} text Text to print
     * @param {Number} size Size of list the message is put in
     * @param {Boolean} error Error-message?
     * @param {Boolean} success Success-message?
     */
    function printMsg(text, size, error, success) {
        var icon = indent("‼", size);
            error = error || false;
            success = success || false;
            icon = error ? icon.red : success ? icon.green : icon.grey.dim;
        printLine(icon + "  " + text);
    }

    /**
     * Creates a colored string of a roll result.
     * @param {String} text Input text
     * @param {Number} roll Result of roll
     * @param {Number} good Definition of a good roll
     * @param {Number} bad Definition of a bad roll
     * @param {Boolean} grey Make default text grey
     * @returns {String} Colored string of roll result
     */
    function strRoll(text, roll, good, bad, grey) {
        text = text.toString();
        return roll === good ? text.green
                             : roll === bad ? text.red
                                            : grey === true ? text.grey
                                                            : text;
    }

    /**
     * Creates a colored string of a set of roll results.
     * @param {Number[]} rolls Array of roll results
     * @param {Number} good Definition of a good roll
     * @param {Number} bad Definition of a bad roll
     * @returns {String} Colored string of roll results
     */
    function strRolls(rolls, good, bad) {
        var output = [];
        rolls.forEach(function(roll) {
            output.push(strRoll(roll.toString(), roll, good, bad, true));
        });
        return output.join("/".grey);
    }

    /**
     * Creates a colored string of dice.
     * @param {Number} rolls Number of rolls
     * @param {Number} sides Number of sides of dice
     * @returns {String} String of dice (e.g. 3w20)
     */
    function strDice(rolls, sides) {
        return rolls.toString().yellow + "w" + sides.toString() + " ";
    }

    /**
     * Creates a colored string of attributes.
     * @param {Number[]} attr Array of attribute values
     * @returns {String} String of attributes (e.g. 10/12/11)
     */
    function strAttr(attr) {
        return "(" + attr.join("/").magenta + ") ";
    }

    /**
     * Creates a colored string of a skill-value.
     * @param {Number} val Skill-value
     * @returns {String} Colored string of skill-value
     */
    function strVal(val) {
        return "[" + val.toString().magenta + "] ";
    }

    /**
     * Creates a colored string of a mod.
     * @param {Number} mod Mod integer
     * @returns {String} Colored string of mod
     */
    function strMod(mod) {
        var output = mod.toString() + " ";
        return mod < MOD_MIN ? output.red
                             : mod > MOD_MIN ? ("+" + output).green
                                             : ("±" + output).grey.dim;
    }

    /**
     * Creates a colored string of skill-check repeats.
     * @param {Number} repeat Number of repeats
     * @returns {String} Colored string of repeats
     */
    function strRepeat(repeat) {
        var output = "×" + repeat.toString();
        return repeat > ROLLS_MIN ? output.yellow : output.grey.dim;
    }

    /**
     * Creates a color string of a sum.
     * @param {Number} sum Integer of sum
     * @param {Boolean} [colon] Add a colon to sum-symbol
     * @param {Number} [items] Number of summed items for indentation
     * @param {Number} [max] Number of max sum for indentation
     * @returns {String} Colored string of sum
     */
    function strSum(sum, colon, items, max) {
        var sym = indent("Σ", items || 0) + ((colon || false) ? ": " : " ");
        return sym.grey.dim + indent(sum, max || 0).cyan;
    }

    /**
     * Creates a colored string of a quality-level.
     * @param {Number} quality Quality-level
     * @returns {String} Colored tring of quality-level
     */
    function strQuality(quality, crit, slip) {
        var icon = crit || slip ? " ‼" : "";
            icon = crit ? icon.green : slip ? icon.red : icon.grey.dim;
        var qual = "\tQS " + indent(quality, QUAL_MAX);
            qual = quality < QUAL_SUCCESS ? qual.grey.dim : qual;
        return qual + icon + "\t";
    }

    /**
     * Creates a colored string of remaining points.
     * @param {Number} points Number of remaining points
     * @returns {String} Colored string of remaining points
     */
    function strPoints(points) {
        var max = (-(D_20 * ROLLS_ATTR)).toString();
        var output = "\t" + indent(points, max);
        return points < SKILL_MIN ? output.red
                                  : output.green;
    }

    /**
     * Creates a colored and quoted string.
     * @param {String} text Text to color
     * @returns {String} Colored quoted string
     */
    function strQuote(text) {
        return "„" + text.toString() + "“";
    }

    /**
     * Creates a color string of a keyword.
     * @param {String} keyword Keyword to color
     * @returns {String} Colored string of keyword
     */
    function strKeyword(keyword) {
        return strQuote(keyword).yellow + " — ".grey.dim;
    }

    /**
     * Count rolls of specific value in set of rolls.
     * @param {Number[]} rolls Array of roll results
     * @param {Number} value Desired result value
     * @returns {Number} Count of desired result values
     */
    function countRolls(rolls, value) {
        var count = 0;
        rolls.forEach(function(roll) { count += roll === value ? 1 : 0; });
        return count;
    }

    /**
     * Caluclate quality level of remaining skill points.
     * @param {Number} points Remaining skill points
     * @param {Boolean} crit Critical success?
     * @param {Boolean} slip Critical slip?
     * @param {Boolean} repeated Repeated check?
     * @returns {Number} Caluclated quality level
     */
    function calcQuality(points, crit, slip, repeated) {
        var calc = Math.ceil(points / QUAL_DIVIDE);
        var min  = crit ? QUAL_SUCCESS : QUAL_MIN;
        var mult = crit && repeated ? QUAL_MULTIPLY : slip ? 0 : 1;
        var qual = points === SKILL_MIN ? QUAL_SUCCESS : calc;
        return Math.max(Math.min(qual * mult, QUAL_MAX), min);
    }

    /**
     * Format and color a text.
     * @param {String} input Input text
     * @returns {String} Output text
     */
    function formatOutput(input) {
        input = input.replace(REGEX_P, "\n");
        input = input.replace(REGEX_H, REGEX_REPLACE.green);
        input = input.replace(REGEX_B, REGEX_REPLACE.blue);
        input = input.replace(REGEX_I, REGEX_REPLACE.yellow);
        return input;
    }

    /**
     * Enclose a string in two other strings.
     * @param {String} str Inner string
     * @param {String} l Left string
     * @param {Boolean} r Right newlines
     * @returns {String} Enclosed string
     */
    function enclose(str, l, r) {
        return l + str + r;
    }

    /**
     * Sort alphabetically.
     * @param {String} a First string
     * @param {String} b Second string
     * @returns {Number} Comparison
     */
    function sortAlpha(a, b) {
        return a.localeCompare(b);
    }

    // Public interface
    return {
        printEmpty   : printEmpty,
        printLine    : printLine,
        printList    : printList,
        printMsg     : printMsg,
        printUp      : printUp,
        formatOutput : formatOutput,
        splitAttr    : splitAttr,
        rollDice     : rollDice,
        countRolls   : countRolls,
        calcQuality  : calcQuality,
        strQuote     : strQuote,
        strKeyword   : strKeyword,
        strQuality   : strQuality,
        strPoints    : strPoints,
        strRepeat    : strRepeat,
        strRolls     : strRolls,
        strDice      : strDice,
        strRoll      : strRoll,
        strAttr      : strAttr,
        strVal       : strVal,
        strSum       : strSum,
        strMod       : strMod,
        toInt        : toInt,
        indent       : indent,
        enclose      : enclose,
        sortAlpha    : sortAlpha
    };

})();

/**
 * Data module; encapsulates all data functions.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 * @returns {Object} Public interface
 */
var Data = (function() {

    // Constants
    var _FILE_DATA          = "/data.json";
    var _FILE_CONFIG        = "/config.json";

    // Modules/variables
    var Jsonfile            = null;
    var Path                = null;
    var _data               = null;
    var _config             = null;

    /**
     * Initialize module.
     */
    function _init() {
        Path     = require("path");
        Jsonfile = require("jsonfile");
        _data    = Path.join(__dirname + _FILE_DATA);
        _config  = Path.join(__dirname + _FILE_CONFIG);
    }

    /**
     * Load data from JSON file.
     * @param {Function} callback Callback function
     */
    function load(callback) {
        _init();
        Jsonfile.readFile(_data, function(error, data) {
            callback(error !== null ? {} : data);
        });
    }

    /**
     * Saves data to a JSON file.
     * @param {Object} data Data to save
     */
    function save(data) {
        _init();
        var temp = {};
        Jsonfile.writeFile(_data, data);
    }

    /**
     * Load config from JSON file.
     * @param {Function} callback Callback function
     */
    function config(callback) {
        _init();
        Jsonfile.readFile(_config, function(error, config) {
            callback(error !== null ? {} : config);
        });
    }

    // Public interface
    return {
        load   : load,
        save   : save,
        config : config
    };

})();

/**
 * Update module; encapsulates all update functions.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 * @returns {Object} Public interface
 */
var Update = (function() {

    // Message constants
    var _MSG_ERROR         = "Verbindungsfehler!";
    var _MSG_START         = "Update: $1 neue Begriffe gefunden";
    var _MSG_FINISH        = "Update abgeschlossen";
    var _MSG_UPTODATE      = "Begriffe sind auf dem aktuellen Stand";
    var _MSG_FAIL          = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_HINT          = "(dsa update [thema] [-f, --force])";

    // Data constants
    var _DATA_CONNECTIONS  = 1;
    var _DATA_RATE         = 0;
    var _DATA_DOTS         = 10;
    var _DATA_CHECK        = "ulisses-regelwiki.de";
    var _DATA_URL_TERM     = "http://www.ulisses-regelwiki.de/";
    var _DATA_URL_TOPIC    = "http://www.ulisses-regelwiki.de/index.php/";
    var _DATA_EXT          = ".html";
    var _DATA_DRAIN        = "drain";

    // HTML constants
    var _HTML_SEL_TERM     = "td > a";
    var _HTML_SEL_TEXT     = "#main .ce_text";
    var _HTML_SEL_H        = "h1";
    var _HTML_SEL_B        = "strong";
    var _HTML_SEL_I        = "em";
    var _HTML_SEL_P        = "p";
    var _HTML_SEL_BR       = "br";
    var _HTML_ATTR_HREF    = "href";
    var _HTML_BR           = "<br>";
    var _HTML_BREAK        = "<br/>";

    // Modules
    var Dns                = null;
    var Crawler            = null;

    // Variables
    var _topic             = false;
    var _force             = false;
    var _config            = null;
    var _wait              = null;

    /**
     * Start update; peforms web crawls to collect data and saves it in a file.
     * @param {String} topic Topic to update
     * @param {Object} options Command options
     */
    function start(topic, options) {
        Data.config(function(config) {

            // Initialize variables
            Dns     = require("dns");
            Crawler = require("crawler");
            _config = config.config;
            _force  = options.force;
            _topic  = _checkTopic(topic || "");

            // Start update
            if (_topic !== false) { _checkConnection(_loadData); }
        });
    }

    /**
     * Initialize crawls.
     * @param {Object} data Loaded data
     */
    function _initCrawls(data) {

        // Print waiting string
        F.printEmpty(2);
        _printWait();

        // Initialize crawler options
        var options = {
            maxConnections : _DATA_CONNECTIONS,
            rateLimit      : _DATA_RATE
        };

        // Initialize crawler, queues and data
        var max         = 0;
        var total       = 0;
        var c           = [];
        var queueTerms  = [];
        var queueTopics = [];
        var crawlTerms  = new Crawler(options);
        var crawlTopics = new Crawler(options);

        // Iterate defined topics
        _topic.forEach(function(config, n) {

            // Initialize topic name, create data object
            var topic = config.name;
            var force = typeof data[topic] === typeof undefined || _force;
            if (force) { data[topic] = {}; }
            Data.save(data);
            c[n] = [];

            // Iterate defined url-list for topic
            config.urls.forEach(function(urlTopic, m) {
                c[n][m] = 0;

                // Push to queue
                queueTopics.push({
                    uri: _DATA_URL_TOPIC + urlTopic + _DATA_EXT,
                    callback: function(err, res, done) {
                        if (err) { return; }

                        // Initialize dom
                        var $      = res.$;
                        var $terms = $(_HTML_SEL_TERM).filter(function() {
                            var term = _cleanTermName($(this).text().trim());
                                term = data[topic][term];
                            return typeof term === typeof undefined;
                        });

                        // Get size, update total amount
                        var size      = $terms.length;
                            max       = size > max ? size : max;
                            c[n][m]   = size;

                        // Iterate all found terms
                        $terms.each(function(i) {
                            var term    = $(this).text().trim();
                                term    = _cleanTermName(term);
                            var urlTerm = $(this).attr(_HTML_ATTR_HREF);
                                urlTerm = encodeURI(urlTerm);

                            // Push to queue
                            queueTerms.push({
                                uri: _DATA_URL_TERM + urlTerm,
                                callback: function(err, res, done) {
                                    if (err) { return; }

                                    // Clean and set data
                                    data[topic][term] = _cleanTermContent(
                                        res.$, res.$(_HTML_SEL_TEXT));

                                    // Save data, print status
                                    Data.save(data);
                                    _printStatus(i, n, m, c, topic, term);
                                    done();
                                }
                            });
                        });
                        done();
                    }
                });
            });
        });

        // Make crawls
        _makeCrawls(
            [crawlTopics, crawlTerms],
            [queueTopics, queueTerms]
        );
    }

    /**
     * Load data.
     * @param {Boolean} connected Connection-status
     */
    function _loadData(connected) {
        if (!connected) { return; }
        Data.load(_initCrawls);
    }

    /**
     * Make crawls; performs consecutive craws one at a time.
     * @param {Object[]} crawlers List of crawler instances
     * @param {Object[]} queues List of crawler queues
     * @param {Function} callback Callback function
     */
    function _makeCrawls(crawlers, queues) {
        var size = crawlers.length;
        if (size === queues.length) {
            crawlers.forEach(function(crawler, i) {

                // Start first crawler
                if (i === 0) { crawler.queue(queues[i]); }

                // When crawler is finished
                crawler.on(_DATA_DRAIN, function() {

                    // Print title
                    if (i === 0) {
                        var total = queues[i + 1].length;
                        if (total === 0) { _printUptodate(); }
                        else { _printStart(total); }
                    }

                    // Start next crawler or print finish on last one
                    if (i + 1 < size) { crawlers[i + 1].queue(queues[i + 1]); }
                    if (i === size - 1) { _printFinish(queues[i].length); }
                });
            });
        }
    }

    /**
     * Print message of download stats.
     * @param {Number} i Index of term
     * @param {Number} n Index of topic
     * @param {Number} m Sub-index of topic
     * @param {Number} count Total numbers of terms
     * @param {String} topic Name of topic
     * @param {String} term Name of term
     */
    function _printStatus(i, n, m, count, topic, term) {

        // Calculate total sum and current index
        var total = 0;
        var index = 1 + i;
        count.forEach(function(sums, x) {
            sums.forEach(function(sum, y) {
                index += ((x === n && y < m) || (x < n)) ? sum : 0;
                total += sum;
            });
        });

        // Print messages
        var message = topic + " " + F.strQuote(term);
        F.printUp();
        F.printList(index, total, message.grey.dim);
    }

    /**
     * Print waiting animation.
     */
    function _printWait() {
        var tic = 0;
        _wait = setInterval(function() {
            tic = tic >= _DATA_DOTS ? 0 : tic + 1;
            F.printUp();
            F.printLine(".".repeat(tic).green);
        }, 500);
    }

    /**
     * Remove waiting animation, print start message.
     * @param {Number} total Number of updates for indentation
     */
    function _printStart(total) {
        clearInterval(_wait);
        var message = _MSG_START.replace(REGEX_REPLACE, total);
        F.printUp();
        F.printMsg(message.green, total, false, true);
        F.printEmpty();
    }

    /**
     * Print finish message.
     * @param {Number} total Total number of terms
     */
    function _printFinish(total) {
        F.printUp();
        F.printMsg(_MSG_FINISH.green, total, false, true);
        F.printEmpty();
    }

    /**
     * Remove waiting animation, print uptodate message.
     */
    function _printUptodate() {
        clearInterval(_wait);
        F.printUp();
        F.printMsg(_MSG_UPTODATE.green, 0, false, true);
        F.printEmpty();
    }

    /**
     * Check given topic for validity.
     * @param {String} topic Topic name to check
     * @returns {String[]|Boolean} List of topics or false
     */
    function _checkTopic(topic) {

        // Check given topic, fill available topics
        var match = [];
        var avail = [];
        _config.forEach(function(config) {
            avail.push(config);
            if (config.name === topic.toLowerCase()) {
                match.push(config);
            }
        });

        // If no topic was given return all topics
        if (topic.length === 0) { return avail; }

        // Print error on mismatching topic
        if (match.length === 0) {
            var count = avail.length;
            F.printEmpty();
            F.printMsg(_MSG_FAIL.red, count, true);
            F.printMsg(_MSG_HINT.grey.dim, count);
            F.printEmpty();
            avail.forEach(function(config, i) {
                F.printList(i + 1, count, config.name);
            });
            F.printEmpty();
            return false;
        }

        // Return match
        return match;
    }

    /**
     * Check connection to wiki.
     * @param {Function} callback Callback function
     */
    function _checkConnection(callback) {
        Dns.lookup(_DATA_CHECK, function(error) {
            if (error) {
                F.printEmpty();
                F.printMsg(_MSG_ERROR.red, 0, true);
                F.printMsg(_DATA_CHECK.grey.dim, 0);
                F.printEmpty();
                callback(false);
            } else { callback(true); }
        });
    }

    /**
     * Clean name of term.
     * @param {String} term Name of term
     * @returns {String} Cleaned term name
     */
    function _cleanTermName(term) {
        term = term.replace(REGEX_LVL, "");
        term = term.replace(REGEX_STAR, "");
        term = term.replace(REGEX_DOTS, "");
        return term;
    }

    /**
     * Clean HTML content of term.
     * @param {Object} $ jQuery
     * @param {Object} $content Content element
     * @returns {String} Cleaned content string
     */
    function _cleanTermContent($, $content) {

        // Return nothing if invalid
        if ($content.length === 0) { return ""; }

        // Clean content
        function _filterNode() { return this.nodeType === 3; }
        function _filterEmpty() { return $(this).text().trim().length === 0; }
        $content.contents().filter(_filterNode).remove();
        $content.children().filter(_filterEmpty).remove();
        $content.html($content.html().split(_HTML_BR).join(_HTML_BREAK));

        // Replace titles
        $content.find(_HTML_SEL_H).each(function() {
            $(this).replaceWith(F.enclose($(this).text(), C_T, C_T + C_P));
        });

        // Replace bold text
        $content.find(_HTML_SEL_B).each(function() {
            $(this).replaceWith(F.enclose($(this).text(), C_B, C_B));
        });

        // Replace bold text
        $content.find(_HTML_SEL_I).each(function() {
            $(this).replaceWith(F.enclose($(this).text(), C_I, C_I));
        });

        // Replace linebreaks
        $content.find(_HTML_SEL_BR).each(function() {
            $(this).replaceWith(C_P);
        });

        // Replace paragraphs
        $content.find(_HTML_SEL_P).each(function() {
            $(this).replaceWith(F.enclose($(this).text(), C_P, C_P));
        });

        // Return converted content
        var output = $content.text().trim();
            output = output.replace(REGEX_HASH, "");
        return output.substr(0, output.length - C_P.length);
    }

    // Public interface
    return { start: start };

})();

/**
 * Commands module; encapsulates all command functions.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 * @returns {Object} Public interface
 */
var Commands = (function() {

    // Message-Constants
    var _MSG_ATTR_HINT     = "(z.B. 11/13/12)";
    var _MSG_ATTR_ERROR    = "Probe im falschen Format!";
    var _MSG_SKILL_SLIP    = "Patzer (automatisch misslungen)";
    var _MSG_SKILL_FAIL    = "Nach misslungenen Proben Malus kumulativ +1";
    var _MSG_SKILL_CRIT    = "Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)";
    var _MSG_SKILL_FLOP    = "Erfolgsprobe misslungen";
    var _MSG_SKILL_SUCC    = "Erfolgsprobe bestanden";
    var _MSG_KEYWORD_FAIL  = "Kein passender Begriff gefunden.";
    var _MSG_KEYWORD_NONE  = "Keine Begriffe verfügbar.";
    var _MSG_KEYWORD_LIST  = "Folgende Begriffe wurden gefunden:";
    var _MSG_KEYWORD_ALL   = "Folgende Begriffe sind verfügbar";
    var _MSG_KEYWORD_HINT  = "(dsa suche $1 [begriff])";
    var _MSG_TOPIC_FAIL    = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_TOPIC_ALL     = "Folgende Themen sind verfügbar:";
    var _MSG_TOPIC_HINT    = "(dsa suche [thema] [begriff])";
    var _MSG_READ_ERROR    = "Es ist ein unbekannter Fehler aufgetreten.";
    var _MSG_DATA_ERROR    = "Keine Daten gefunden!";
    var _MSG_DATA_HINT     = "(dsa update [thema] [-f, --force])";
    var _MSG_DATA_HELP     = "(dsa update $1 [-f, --force])";

    /**
     * Default function for dice commands.
     * @param {Number} n Sides of dice
     * @param {String} rolls Number of rolls as string
     * @param {Object} options Command options
     */
    function roll(n, rolls, options) {

        // Initialize and convert arguments and values
            rolls = F.toInt(rolls, ROLLS_MIN);
        var plus  = F.toInt(options.plus, MOD_MIN);
        var minus = F.toInt(options.minus, MOD_MIN);
        var sum   = plus - minus;
        var max   = n * rolls + sum;

        // Print title
        F.printEmpty();
        F.printLine(F.strDice(rolls, n) + F.strMod(plus - minus));
        F.printEmpty();

        // Roll dice, add to sum, print results
        F.rollDice(n, rolls).forEach(function(roll, i) {
            sum += roll;
            var content = F.strRoll(F.indent(roll, max), roll, ROLL_CRIT, n);
            F.printList(i + 1, rolls, content);
        });
        F.printEmpty();

        // Print sum if necessary
        if (rolls > ROLLS_MIN || plus > MOD_MIN || minus > MOD_MIN) {
            F.printLine(F.strSum(sum, true, rolls, max));
            F.printEmpty();
        }
    }

    /**
     * Command: skill; makes a skill-check.
     * @param {String} attr Skill attributes (e.g. 10/12/11)
     * @param {String} val Skill value
     * @param {Object} options Command options
     */
    function skill(attr, val, options) {

        // Initialize and convert arguments and values
            attr     = F.splitAttr(attr);
            val      = F.toInt(val, SKILL_MIN);
        var plus     = F.toInt(options.plus, MOD_MIN);
        var minus    = F.toInt(options.minus, MOD_MIN);
        var repeat   = F.toInt(options.sammel, ROLLS_MIN);
        var repeated = repeat > ROLLS_MIN;
        var mod      = plus - minus;
        var failed   = false;
        var slipped  = false;
        var critted  = false;
        var malus    = 0;
        var level    = 0;

        // Print error on invalid attributes
        if (attr.length !== ROLLS_ATTR) {
            F.printEmpty();
            F.printMsg(_MSG_ATTR_ERROR.red, 0, true);
            F.printMsg(_MSG_ATTR_HINT.grey.dim, 0);
            F.printEmpty();

        // Else continue with valid attributes
        } else {

            // Print title
            F.printEmpty();
            F.printLine(
                F.strDice(ROLLS_ATTR, D_20) +
                F.strAttr(attr) +
                F.strMod(mod) +
                F.strVal(val) +
                F.strRepeat(repeat)
            );
            F.printEmpty();

            // Make skill-checks
            for (var i = 0; i < repeat; i++) {

                // Make rolls, calculate points
                var rolls = [];
                var points = val + 0;
                for (var j = 0; j < attr.length; j++) {
                    rolls[j] = F.rollDice(D_20, ROLLS_MIN)[0];
                    var goal = Math.max(ATTR_MIN, attr[j] + mod - malus);
                    var diff = Math.max(ATTR_MIN, rolls[j] - goal);
                    points  -= diff;
                }

                // Analyse rolls, set/calculate values
                var slip = F.countRolls(rolls, ROLL_SLIP) >= ROLLS_TO_CRIT;
                var crit = F.countRolls(rolls, ROLL_CRIT) >= ROLLS_TO_CRIT;
                var qual = F.calcQuality(points, crit, slip, repeated);
                var fail = qual < QUAL_SUCCESS;

                // Set global values
                slipped = slipped ? true    : slip;
                critted = critted ? true    : crit;
                failed  = failed  ? true    : fail;
                level   = slip    ? qual    : level + qual;
                malus   = crit    ? MOD_MIN : fail ? malus + 1 : malus;

                // Print results
                F.printList(
                    i + 1, repeat,
                    F.strRolls(rolls, ROLL_CRIT, ROLL_SLIP) +
                    F.strPoints(points) + F.strQuality(qual, crit, slip) +
                    F.strSum(level, false, 0, QUAL_MAX * repeat)
                );

                // Break on critical slip
                if (slip) { break; }
            }

            // Print messages
            F.printEmpty();
            _chooseMsg(repeat, critted, failed, slipped);
        }
    }

    /**
     * Command: find; searches for keyword in local data.
     * @param {String} [topic] Topic to search in
     * @param {String} [keyword] Keyword to search
     */
    function find(topic, keyword) {

        // Initialize values
            keyword = keyword || "";
            topic   = topic   || "";
        var missing = topic.length === 0;

        // Load data
        Data.load(function(data) {
            F.printEmpty();
            if (Object.keys(data).length > 0) {

                // Check if topic is valid
                var avail = [];
                var match = false;
                Object.keys(data).forEach(function(found) {
                    avail.push(found);
                    if (topic.toLowerCase() === found.toLowerCase()) {
                        match = found;
                    }
                });
                avail.sort(F.sortAlpha);
                var count = avail.length;

                // Show error if topic is invalid
                if (!match) {
                    if (missing) { F.printMsg(_MSG_TOPIC_ALL.cyan, count); }
                    else { F.printMsg(_MSG_TOPIC_FAIL.red, count, true); }
                    F.printEmpty();
                    avail.forEach(function(found, i) {
                        F.printList(i + 1, count, found);
                    });
                    F.printEmpty();
                    F.printMsg(_MSG_TOPIC_HINT.grey.dim, count);
                    F.printEmpty();

                // Else continue with search
                } else { _findTerm(data[match], keyword, match); }

            // Print error
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
     */
    function _findTerm(topic, keyword, name) {

        // Initialize values
        var none     = keyword.length === 0;
        var quote    = F.strKeyword(keyword);
        var search   = keyword.toLowerCase();
        var match    = false;
        var count    = 0;
        var similar  = [];

        // Initialize hints
        var hintFind = _MSG_KEYWORD_HINT.grey.dim;
        var hintUpdt = _MSG_DATA_HELP.grey.dim;
            hintFind = hintFind.replace(REGEX_REPLACE, name);
            hintUpdt = hintUpdt.replace(REGEX_REPLACE, name);

        // Search all available terms
        Object.keys(topic).forEach(function(term) {
            var found = term.toLowerCase();
            if (search === found) { match = term; return; }
            else if (found.indexOf(search) !== -1) {
                similar.push(term);
                count++;
            }
        });
        similar.sort(F.sortAlpha);

        // Print term on exact match
        if (match) { _printTerm(topic[match]);

        // Show similar found keywords
        } else if (count > 0) {
            if (none) { F.printMsg(_MSG_KEYWORD_ALL.cyan, count); }
            else { F.printMsg(quote + _MSG_KEYWORD_LIST.cyan, count); }
            F.printEmpty();
            similar.forEach(function(found, i) {
                F.printList(i + 1, count, found);
            });
            F.printEmpty();
            F.printMsg(hintFind, count);
            F.printEmpty();

        // Show error if nothing was found
        } else {
            if (none) {
                F.printMsg(_MSG_KEYWORD_NONE.red, 0, true);
                F.printMsg(hintUpdt, count);
            }
            else {
                F.printMsg(quote + _MSG_KEYWORD_FAIL.red, 0, true);
                F.printMsg(hintFind, count);
            }
            F.printEmpty();
        }
    }

    /**
     * Print the content of a given term.
     * @param {String} term Content of term
     */
    function _printTerm(term) {
        F.printLine(F.formatOutput(term));
        F.printEmpty();
    }

    /**
     * Choose messages for skill-checks to print.
     * @param {Number} repeat Number of repeated skill-checks
     * @param {Boolean} critted At least one critical success on skill-check
     * @param {Boolean} failed At least one failed skill-check
     * @param {Boolean} slipped At least one slipped skill-check
     */
    function _chooseMsg(repeat, critted, failed, slipped) {

        // Initialize status and values
        var extra    = false;
        var message  = false;
        var repeated = repeat > ROLLS_MIN;
        var error    = (!repeated && failed);
        var success  = (!repeated && !failed);

        // Choose messages
        if (!repeated && !failed) { message = _MSG_SKILL_SUCC.green; }
        if (!repeated &&  failed) { message = _MSG_SKILL_FLOP.red; }
        if ( repeated &&  failed) { message = _MSG_SKILL_FAIL.grey.dim; }
        if (critted)              { extra   = _MSG_SKILL_CRIT.green; }
        if (slipped)              { extra   = _MSG_SKILL_SLIP.red; }

        // Print messages
        if (message) { F.printMsg(message, repeat, error, success); }
        if (extra)   { F.printMsg(extra, repeat, slipped, critted); }
        if (extra || message) { F.printEmpty(); }
    }

    // Public interface
    return {
        find   : find,
        roll   : roll,
        skill  : skill
    };

})();

/*
 * Command: w<y> [n]
 * [-m, --minus <x>]
 * [-p, --plus <x>]
 */
[100, 20, 12, 10, 8, 6, 4, 3, 2].forEach(function(y) {
    Program
        .command("w" + y + " [n]")
        .description("nW" + y + " würfeln")
        .option("-m, --minus <x>", "Summe -x")
        .option("-p, --plus <x>", "Summe +x")
        .action(function(rolls, options) {
            Commands.roll(y, rolls, options);
        });
});

/*
 * Command: probe <probe> <fw>
 * [-m, --minus <x>]
 * [-p, --plus <x>]
 * [-s, --sammel <n>]
 */
Program
    .command("probe <probe> <fw>")
    .description("Fertigkeitsprobe würfeln")
    .option("-m, --minus <x>", "Erleichterung +x")
    .option("-p, --plus <x>", "Erschwernis -x")
    .option("-s, --sammel <n>", "Sammelprobe mit n Versuchen")
    .action(function(attr, val, options) {
        Commands.skill(attr, val, options);
    });

/*
 * Command: suche [thema] [begriff]
 */
Program
    .command("suche [thema] [begriff]")
    .description("Regel-Thema nach einem Begriff durchsuchen")
    .action(function(topic, keyword) {
        Commands.find(topic, keyword);
    });

/*
 * Command: update [-f, --force]
 */
Program
    .command("update [thema]")
    .description("Regeln aktualisieren")
    .option("-f, --force", "Aktualisierung erzwingen")
    .action(function(topic, options) {
        Update.start(topic, options);
    });

// Add version and parse
Program.version("0.0.1").parse(process.argv);
