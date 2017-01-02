/**
 * Update module; encapsulates all update functions.
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
    var _DATA_DOTS         = 3;
    var _DATA_TIC_TIME     = 300;
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
                        var size    = $terms.length;
                            max     = size > max ? size : max;
                            c[n][m] = size;

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
        }, _DATA_TIC_TIME);
    }

    /**
     * Remove waiting animation, print start message.
     * @param {Number} total Number of updates for indentation
     */
    function _printStart(total) {
        clearInterval(_wait);
        var message = _MSG_START.replace(G.REGEX_REPLACE, total);
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
        term = term.replace(G.REGEX_LVL, "");
        term = term.replace(G.REGEX_STAR, "");
        term = term.replace(G.REGEX_DOTS, "");
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
            $(this).replaceWith(F.enclose(
                $(this).text(), G.CODE_T, G.CODE_T + G.CODE_P));
        });

        // Replace bold text
        $content.find(_HTML_SEL_B).each(function() {
            $(this).replaceWith(F.enclose(
                $(this).text(), G.CODE_B, G.CODE_B));
        });

        // Replace bold text
        $content.find(_HTML_SEL_I).each(function() {
            $(this).replaceWith(F.enclose(
                $(this).text(), G.CODE_I, G.CODE_I));
        });

        // Replace linebreaks
        $content.find(_HTML_SEL_BR).each(function() {
            $(this).replaceWith(G.CODE_P);
        });

        // Replace paragraphs
        $content.find(_HTML_SEL_P).each(function() {
            $(this).replaceWith(F.enclose(
                $(this).text(), G.CODE_P, G.CODE_P));
        });

        // Return converted content
        var output = $content.text().trim();
            output = output.replace(G.REGEX_HASH, "");
        return output.substr(0, output.length - G.CODE_P.length);
    }

    // Public interface
    return { start: start };

})();
