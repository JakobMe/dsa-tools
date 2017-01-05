/**
 * Update module; provides functions for update commands.
 * @returns {Object} Public interface
 */
var Update = (function() {

    // Message constants
    var _MSG_CONFIG        = "Konfigurationsfehler!";
    var _MSG_ERROR         = "Verbindungsfehler!";
    var _MSG_FOUND         = "neue Begriffe gefunden";
    var _MSG_FAIL          = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_HINT          = "(dsa update [topic] [-f])";

    // HTML constants
    var _HTML_SEL_TERM     = "td > a";
    var _HTML_SEL_TEXT     = "#main .ce_text";
    var _HTML_SEL_H        = "h1";
    var _HTML_SEL_B        = "strong";
    var _HTML_SEL_I        = "em";
    var _HTML_SEL_P        = "p";
    var _HTML_SEL_BR       = "br";
    var _HTML_ATTR_HREF    = "href";

    // Modules
    var Connect            = null;
    var Crawler            = null;

    // Variables
    var _topic             = false;
    var _force             = false;
    var _config            = false;

    /**
     * Start update; peforms web crawls to collect and save data.
     * @param {String} topic   Topic to update
     * @param {Object} options Command options
     */
    function start(topic, options) {
        Data.config(function(config) {
            _checkConfig(config, function() {
                Connect = require("dns");
                Crawler = require("crawler");
                _config = config;
                _force  = options.force || false;
                _topic  = _checkTopic(topic || "");

                // Continue on valid topic value
                if (_topic) { _checkConnection(_loadData); }
            });
        });
    }

    /**
     * Check validity of config data.
     * @param {Object}   config   Configuration object
     * @param {Function} callback Callback function
     */
    function _checkConfig(config, callback) {
        if (config.hasOwnProperty("topics") &&
            config.hasOwnProperty("domain") &&
            config.hasOwnProperty("protocol")) {
            callback();
        } else { Log.error(_MSG_CONFIG); }
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
        _config.topics.forEach(function(config) {
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
     * Check connection to configured website.
     * @param {Function} callback Callback function
     */
    function _checkConnection(callback) {
        var domain = _config.domain.replace("/", "");
        Connect.lookup(domain, function(error) {
            if (error) {
                Log.error(_MSG_ERROR, 0, 1, 0);
                Log.hint(domain, 0, 0, 1);
                callback(false);
            } else { callback(true); }
        });
    }

    /**
     * Load data.
     * @param {Boolean} connected Working connection
     */
    function _loadData(connected) {
        if (!connected) { return; }
        Data.load(_initCrawls);
    }

    /**
     * Initialize crawls.
     * @param {Object} data Loaded data
     */
    function _initCrawls(data) {

        // Initialize crawler options
        var options = {
            maxConnections : 1,
            rateLimit      : 0
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
            config.urls.forEach(function(address, m) {
                c[n][m] = 0;

                // Push to queue
                queueTopics.push({
                    uri: _config.protocol + _config.domain + address,
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
                            var term = $(this).text().trim();
                                term = _cleanTermName(term);
                            var url  = $(this).attr(_HTML_ATTR_HREF);
                                url  = encodeURI(url);

                            // Push to queue
                            queueTerms.push({
                                uri: _config.protocol + _config.domain + url,
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
                crawler.on("drain", function() {
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
        var progress = Str.progressbar(index, total);
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
        var progress = Str.progressbar(index, total);
        Log.empty(index === 1 ? 1 : 0);
        Log.back(index === 1 ? 0 : 3);
        Log.success(now + message, 0, 0, 0);
        Log.shout(progress, 0, false, false, 0, 1);
    }

    /**
     * Clean name of term.
     * @param   {String} term Name of term
     * @returns {String} Cleaned term name
     */
    function _cleanTermName(term) {
        return term.replace(G.REGEX.REMOVE, "").trim();
    }

    /**
     * Clean HTML content of term.
     * @param   {Object} $        jQuery
     * @param   {Object} $content Content element
     * @returns {String} Cleaned content string
     */
    function _cleanTermContent($, $content) {
        if (!$content.length) { return ""; }
        _cleanup($, $content);
        _replace($, $content, _HTML_SEL_BR, "\n");
        _enclose($, $content, _HTML_SEL_B, G.STR.BOLD_L, G.STR.BOLD_R);
        _enclose($, $content, _HTML_SEL_I, G.STR.ITAL_L, G.STR.ITAL_R);
        _enclose($, $content, _HTML_SEL_H, G.STR.HEAD_L, G.STR.HEAD_R, "\n");
        _enclose($, $content, _HTML_SEL_P, "\n", "\n");
        return $content.text().trim();
    }

    /**
     * Replace HTML entities with a string.
     * @param {Object}  $        jQuery object
     * @param {Object}  $parent  Parent element
     * @param {String}  selector Search selector
     * @param {String}  string   Replace string
     */
    function _replace($, $parent, selector, string) {
        $parent.find(selector).replaceWith(string);
    }

    /**
     * Replace and enclose HTML entities in strings.
     * @param {Object}  $        jQuery object
     * @param {Object}  $parent  Parent element
     * @param {String}  selector Search selector
     * @param {String}  l        Left enclose string
     * @param {Boolean} r        Right enclose string
     * @param {String}  [append] Appended string to right
     */
    function _enclose($, $parent, selector, l, r, append) {
        $parent.find(selector).each(function() {
            var $el = $(this);
            $el.replaceWith(Str.enclose($el.text(), l, r + (append || "")));
        });
    }

    /**
     * Remove unwanted HTML entities.
     * @param {Object}  $       jQuery object
     * @param {Object}  $parent Parent element
     */
    function _cleanup($, $parent) {
        $parent.contents().filter(function() {
            var wrong = this.nodeType === 3;
            var empty = $(this).text().trim().length === 0;
            return empty || wrong;
        }).remove();
    }

    // Public interface
    return { start: start };

})();
