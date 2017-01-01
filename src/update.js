/**
 * DSA-Tools CLI.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */

/**
 * Update module; encapsulates all update functions.
 * @returns {Object} Public interface
 */
var Update = (function() {

    // Message constants
    var _MSG_ERROR         = "Verbindungsfehler!";
    var _MSG_DOWNLOAD      = "Lade Thema ";
    var _MSG_START         = "Starte Update";
    var _MSG_FOUND         = "Neue Begriffe: ";
    var _MSG_FINISH        = "Update abgeschlossen";
    var _MSG_UPTODATE      = "Begriffe sind auf dem aktuellen Stand";
    var _MSG_FAIL          = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_HINT          = "(dsa update [thema] [-f, --force])";

    // Data constants
    var _DATA_CONNECTIONS  = 1;
    var _DATA_RATE         = 0;
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

    // Private topic list
    var _config = [
        /*
        {
            name: "zauber",
            urls: ["za_zaubersprueche"]
        },
        */
        {
            name: "vorteil",
            urls: ["vorteile"]
        }/*,
        {
            name: "nachteil",
            urls: ["nachteile"]
        }
        */
    ];

    /**
     * Start update; peforms web crawls to collect data and saves it in a file.
     * @param {String} topic Topic to update
     * @param {Object} options Command options
     */
    function start(topic, options) {

        // Initialize variables
        Dns     = require("dns");
        Crawler = require("crawler");
        _force  = options.force;
        _topic  = _checkTopic(topic || "");

        // Start update
        if (_topic !== false) { _checkConnection(_loadData); }
    }

    /**
     * Initialize crawls.
     * @param {Object} data Loaded data
     */
    function _initCrawls(data) {

        // Initialize crawler options
        var options = {
            maxConnections : _DATA_CONNECTIONS,
            rateLimit      : _DATA_RATE
        };

        // Initialize crawler, queues and data
        var max         = 0;
        var total       = 0;
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

            // Iterate defined url-list for topic
            config.urls.forEach(function(urlTopic) {

                // Push to queue
                queueTopics.push({
                    uri: _DATA_URL_TOPIC + urlTopic + _DATA_EXT,
                    callback: function(err, res, done) {
                        if (err) { return; }

                        // Initialize dom
                        var $      = res.$;
                        var $terms = $(_HTML_SEL_TERM).filter(function() {
                            var term = data[topic][$(this).text().trim()];
                            return typeof term === typeof undefined;
                        });

                        // Get size, update total amount
                        var size   = $terms.length;
                            total += size;
                            max    = size > max ? size : max;

                        // Iterate all found terms
                        $terms.each(function(i) {
                            var term    = $(this).text().trim();
                            var urlTerm = $(this).attr(_HTML_ATTR_HREF);
                                urlTerm = encodeURI(urlTerm);

                            // Push to queue
                            queueTerms.push({
                                uri: _DATA_URL_TERM + urlTerm,
                                callback: function(err, res, done) {
                                    if (err) { return; }

                                    // Clean and set data
                                    data[topic][term] =
                                        _convert(res.$, res.$(_HTML_SEL_TEXT));

                                    // Print download message
                                    _printDownload(i, n, total, topic, term);
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
            [queueTopics, queueTerms],
            function() { Data.save(data); }
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
    function _makeCrawls(crawlers, queues, callback) {
        var size = crawlers.length;
        if (size === queues.length) {
            crawlers.forEach(function(crawler, i) {

                // Start first crawler
                if (i === 0) { crawler.queue(queues[i]); }

                // When crawler is finished
                crawler.on(_DATA_DRAIN, function() {
                    var total;

                    // Print title
                    if (i === 0) {
                        total = queues[i + 1].length;
                        _.printLine();
                        _.printMsg(_MSG_START.green, total, false, true);
                        if (total === 0) {
                            _.printMsg(_MSG_UPTODATE.green, 0, false, true);
                            _.printLine();
                        }
                    }

                    // Start next crawler or callback on last one
                    if (i + 1 < size) { crawlers[i + 1].queue(queues[i + 1]); }
                    if (i === size - 1) {
                        total = queues[i].length;
                        _.printLine();
                        _.printMsg(_MSG_FINISH.green, total, false, true);
                        _.printLine();
                        callback();
                    }
                });
            });
        }
    }

    /**
     * Print message of downloaded topic/term.
     * @param {Number} i Index of term
     * @param {Number} max Maximum size of term lists
     * @param {Number} n Index of topic
     * @param {Number} total Total number of terms
     * @param {String} topic Name of topic
     * @param {String} term Name of term
     */
    function _printDownload(i, n, total, topic, term) {
        if (i === 0) {
            if (n === 0) {
                var num = total.toString().grey;
                _.printMsg(_MSG_FOUND.grey.dim + num, total);
                _.printLine();
            }
            _.printMsg(_MSG_DOWNLOAD.cyan + _.strQuote(topic), total);
            _.printLine();
        }
        _.printList(i + 1, total, _.strSuccess(term.grey.dim));
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
            _.printLine();
            _.printMsg(_MSG_FAIL.red, count, true);
            _.printMsg(_MSG_HINT.grey.dim, count);
            _.printLine();
            avail.forEach(function(config, i) {
                _.printList(i + 1, count, config.name);
            });
            _.printLine();
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
                _.printLine();
                _.printMsg(_MSG_ERROR.red, 0, true);
                _.printMsg(_DATA_CHECK.grey.dim, 0);
                _.printLine();
                callback(false);
            } else { callback(true); }
        });
    }

    /**
     * Convert HTML content to writeable output.
     * @param {Object} $ jQuery
     * @param {Object} $content Content element
     * @returns {String} Converted content string
     */
    function _convert($, $content) {

        // Clean content
        function _filterNode() { return this.nodeType === 3; }
        function _filterEmpty() { return $(this).text().trim().length === 0; }
        $content.contents().filter(_filterNode).remove();
        $content.children().filter(_filterEmpty).remove();
        $content.html($content.html().split(_HTML_BR).join(_HTML_BREAK));

        // Replace titles
        $content.find(_HTML_SEL_H).each(function() {
            $(this).replaceWith(_.enclose($(this).text(), C_T, C_T + C_P));
        });

        // Replace bold text
        $content.find(_HTML_SEL_B).each(function() {
            $(this).replaceWith(_.enclose($(this).text(), C_B, C_B));
        });

        // Replace linebreaks
        $content.find(_HTML_SEL_BR).each(function() {
            $(this).replaceWith(C_P);
        });

        // Replace paragraphs
        $content.find(_HTML_SEL_P).each(function() {
            $(this).replaceWith(_.enclose($(this).text(), C_P, C_P));
        });

        // Return converted content
        var output = $content.text().trim();
        return output.substr(0, output.length - C_P.length);
    }

    // Public interface
    return { start: start };

})();
