/**
 * Update module; provides functions for update commands.
 * @returns {Object} Public interface
 */
var Update = (function() {

    // Message constants
    var _MSG_ERROR         = "Verbindungsfehler!";
    var _MSG_FOUND         = "neue Begriffe gefunden";
    var _MSG_FAIL          = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_HINT          = "(dsa update [topic] [-f])";

    // Data constants
    var _DATA_CONNECTIONS  = 1;
    var _DATA_RATE         = 0;
    var _DATA_STEPS        = 15;
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

    /**
     * Start update; peforms web crawls to collect and save data.
     * @param {String} topic   Topic to update
     * @param {Object} options Command options
     */
    function start(topic, options) {
        Data.config(function(config) {

            // Initialize variables
            Dns     = require("dns");
            Crawler = require("crawler");
            _config = config.config;
            _force  = options.force || false;
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

        // Initialize crawler options
        var options = {
            maxConnections : _DATA_CONNECTIONS,
            rateLimit      : _DATA_RATE
        };

        // Initialize crawler, queues and data
        var c           = [];
        var queueTerms  = [];
        var queueTopics = [];
        var crawlTerms  = new Crawler(options);
        var crawlTopics = new Crawler(options);

        // Iterate defined topics
        _topic.forEach(function(config, n) {

            // Initialize topic name, create data object
            var topic = config.name;
            var force = typeof data[topic] === "undefined" || _force;
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
                            return typeof term === "undefined";
                        });

                        // Update counter, log message
                        c[n][m] = $terms.length;
                        _logTopic(n, m, c);

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

                                    // Save data, log status
                                    Data.save(data);
                                    _logTerm(i, n, m, c, topic, term);
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
     * @param {Object[]} queues   List of crawler queues
     * @param {Function} callback Callback function
     */
    function _makeCrawls(crawlers, queues) {
        var size = crawlers.length;
        if (size === queues.length) {
            crawlers.forEach(function(crawler, i) {

                // Start first crawler
                if (i === 0) { crawler.queue(queues[i]); }

                // Start next crawler
                crawler.on(_DATA_DRAIN, function() {
                    if (i + 1 < size) {
                        crawlers[i + 1].queue(queues[i + 1]);
                    }
                });
            });
        }
    }

    /**
     * Log message of current downloaded topic.
     * @param {Number} n     Index of topic
     * @param {Number} m     Sub-index of topic
     * @param {Number} count Total number of terms
     */
    function _logTopic(n, m, count) {

        // Caluclate current index and total number of steps and terms
        var total = 0;
        var found = 0;
        var index = 1 + m;
        count.forEach(function(sums, x) {
            total += sums.length;
            index += x < n ? sums.length : 0;
            sums.forEach(function(sum, y) {
                found += sum;
            });
        });

        // Log message
        var message  = found + " " + _MSG_FOUND;
        var progress = Str.progressbar(index, total, _DATA_STEPS);
        Log.empty(index === 1 ? 2 : 0);
        Log.back(index === 1 ? 0 : 3);
        Log.success(message, 0, 0, 0);
        Log.shout(progress, 0, false, false, 0, 1);
    }

    /**
     * Log message of current downloaded term.
     * @param {Number} i     Index of term
     * @param {Number} n     Index of topic
     * @param {Number} m     Sub-index of topic
     * @param {Number} count Total number of terms
     * @param {String} topic Name of topic
     * @param {String} term  Name of term
     */
    function _logTerm(i, n, m, count, topic, term) {

        // Calculate current index and total sum
        var total = 0;
        var index = 1 + i;
        count.forEach(function(sums, x) {
            sums.forEach(function(sum, y) {
                total += sum;
                index += ((x === n && y < m) || (x < n)) ? sum : 0;
            });
        });

        // Log message
        var now      = index + "/" + total + " ";
        var message  = topic + " " + Str.quote(term);
        var progress = Str.progressbar(index, total, _DATA_STEPS);
        Log.empty(index === 1 ? 1 : 0);
        Log.back(index === 1 ? 0 : 3);
        Log.success(now + message, 0, 0, 0);
        Log.shout(progress, 0, false, false, 0, 1);
    }

    /**
     * Check given topic for validity.
     * @param   {String}           topic Topic name to check
     * @returns {String[]|Boolean} List of topics or false
     */
    function _checkTopic(topic) {

        // Check given topic, fill available topics
        var list      = [];
        var matched   = [];
        var available = [];
        _config.forEach(function(config) {
            list.push(config.name);
            available.push(config);
            if (config.name === topic.toLowerCase()) {
                matched.push(config);
            }
        });

        // If no topic was given return all topics
        if (!topic.length) { return available; }

        // Print error on mismatching topic
        if (!matched.length) {
            Log.error(_MSG_FAIL, list.length, 1, 0);
            Log.hint(_MSG_HINT, list.length, 0, 1);
            Log.list(list);
            Log.empty();
            return false;
        }

        // Return match
        return matched;
    }

    /**
     * Check connection to wiki.
     * @param {Function} callback Callback function
     */
    function _checkConnection(callback) {
        Dns.lookup(_DATA_CHECK, function(error) {
            if (error) {
                Log.error(_MSG_ERROR, 0, 1, 0);
                Log.hint(_DATA_CHECK, 0, 0, 1);
                callback(false);
            } else { callback(true); }
        });
    }

    /**
     * Clean name of term.
     * @param   {String} term Name of term
     * @returns {String} Cleaned term name
     */
    function _cleanTermName(term) {
        term = term.replace(G.REGEX.LVL, "");
        term = term.replace(G.REGEX.STAR, "");
        term = term.replace(G.REGEX.DOTS, "");
        return term;
    }

    /**
     * Clean HTML content of term.
     * @param   {Object} $        jQuery
     * @param   {Object} $content Content element
     * @returns {String} Cleaned content string
     */
    function _cleanTermContent($, $content) {

        // Return nothing if invalid
        if (!$content.length) { return ""; }

        // Clean content
        function _filterNode() { return this.nodeType === 3; }
        function _filterEmpty() { return !$(this).text().trim().length; }
        $content.contents().filter(_filterNode).remove();
        $content.children().filter(_filterEmpty).remove();
        $content.html($content.html().split(_HTML_BR).join(_HTML_BREAK));

        // Replace titles
        $content.find(_HTML_SEL_H).each(function() {
            $(this).replaceWith(Str.enclose(
                $(this).text(), G.STR.TITLE, G.STR.TITLE + G.STR.PARA));
        });

        // Replace bold text
        $content.find(_HTML_SEL_B).each(function() {
            $(this).replaceWith(Str.enclose(
                $(this).text(), G.STR.BOLD, G.STR.BOLD));
        });

        // Replace bold text
        $content.find(_HTML_SEL_I).each(function() {
            $(this).replaceWith(Str.enclose(
                $(this).text(), G.STR.ITALIC, G.STR.ITALIC));
        });

        // Replace linebreaks
        $content.find(_HTML_SEL_BR).each(function() {
            $(this).replaceWith(G.STR.PARA);
        });

        // Replace paragraphs
        $content.find(_HTML_SEL_P).each(function() {
            $(this).replaceWith(Str.enclose(
                $(this).text(), G.STR.PARA, G.STR.PARA));
        });

        // Return converted content
        var output = $content.text().trim();
            output = output.replace(G.REGEX.HASH, "");
        return output.substr(0, output.length - G.STR.PARA.length);
    }

    // Public interface
    return { start: start };

})();
