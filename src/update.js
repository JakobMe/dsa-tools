/**
 * Update module; provides functions for update commands.
 * @returns {Object} Public interface
 */
var Update = (function() {

    // Message constants
    var _MSG_CONFIG     = "Konfigurationsfehler!";
    var _MSG_CONNECT    = "Verbindungsfehler!";
    var _MSG_FOUND      = "neue Begriffe gefunden";
    var _MSG_FAIL       = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_HINT       = "(dsa aktualisiere [thema] [-e] [-s])";

    // HTML constants
    var _HTML_FORBID    = "*:not(h1):not(strong):not(em):not(br):not(p)";
    var _HTML_HREF      = "href";

    // Modules
    var Connect         = null;
    var Crawler         = null;
    var Entities        = null;

    // Variables
    var _topic          = false;
    var _force          = false;
    var _config         = false;
    var _data           = false;

    // Counters
    var _countTopics    = 0;
    var _totalTopics    = 0;
    var _countTerms     = 0;
    var _totalTerms     = 0;

    /**
     * Start update; peforms web crawls to collect and save data.
     * @param {String} topic   Topic to update
     * @param {Object} options Command options
     */
    function start(topic, options) {
        Data.config(function(config) {
            _checkConfig(config, function() {
                Connect  = require("dns");
                Crawler  = require("crawler");
                Entities = require("entities");
                _quick   = options.schnell   || false;
                _force   = options.erzwingen || false;
                _topic   = _checkTopic(topic || "");

                // Continue on valid topic value
                if (_topic) {
                    _checkConnection(function(connected) {
                        if (connected) { Data.load(_initCrawls); }
                    });
                }
            });
        });
    }

    /**
     * Check validity of config data.
     * @param {Object}   config   Configuration object
     * @param {Function} callback Callback function
     */
    function _checkConfig(config, callback) {
        if (config.hasOwnProperty("btn") &&
            config.hasOwnProperty("text") &&
            config.hasOwnProperty("topics") &&
            config.hasOwnProperty("domain") &&
            config.hasOwnProperty("protocol")) {

            // Continue on valid config
            _config = config;
            callback();

        // Else log error message
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

        // Else return match
        return matched;
    }

    /**
     * Check connection to configured website.
     * @param {Function} callback Callback function
     */
    function _checkConnection(callback) {
        var domain = _config.domain.replace("/", "");
        Connect.lookup(domain, function(error) {

            // Log error message on failed connection
            if (error) {
                Log.error(_MSG_CONNECT, 0, 1, 0);
                Log.hint(domain, 0, 0, 1);
                callback(false);

            // Else continue
            } else { callback(true); }
        });
    }

    /**
     * Initialize crawls.
     * @param {Object} data Loaded data
     */
    function _initCrawls(data) {

        // Initialize crawler options
        var options = {
            rateLimit      : 0,
            maxConnections : _quick ? 10 : 1
        };

        // Initialize crawlers and queues
        var queueTerms  = [];
        var queueTopics = [];
        var crawlTerms  = new Crawler(options);
        var crawlTopics = new Crawler(options);
        var urlBase     = _config.protocol + _config.domain;

        // Iterate defined topics
        _topic.forEach(function(config) {

            // Get topic name, reset data on force
            var topic = config.name;
            if (!data.hasOwnProperty(topic) || _force) { data[topic] = {}; }

            // Iterate defined url list for topic
            config.urls.forEach(function(urlTopic) {

                // Increment topic total, push to queue
                _totalTopics++;
                queueTopics.push({
                    uri: urlBase + urlTopic,
                    callback: function(err, res, done) {
                        _countTopics++;
                        if (err) { done(); return false; }

                        // Get terms
                        var $terms = res.$(_config.btn).filter(function() {
                            return !data[topic].hasOwnProperty(
                                _cleanName(res.$(this).text().trim())
                            );
                        });

                        // Log message
                        _totalTerms += $terms.length;
                        _logTopic();

                        // Iterate all found terms
                        $terms.each(function() {
                            var $t      = res.$(this);
                            var term    = _cleanName($t.text().trim());
                            var urlTerm = encodeURI($t.attr(_HTML_HREF));

                            // Push to queue
                            queueTerms.push({
                                uri: urlBase + urlTerm,
                                callback: function(err, res, done) {
                                    _countTerms++;
                                    if (err) { done(); return false; }

                                    // Clean and set data
                                    data[topic][term] =
                                        _cleanContent(
                                            res.$, res.$(_config.text));

                                    // Save data, log status
                                    _logTerm(topic, term);
                                    Data.save(data);
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
                if (i === 0) { crawler.queue(queues[i]); }
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
     */
    function _logTopic() {
        var message  = _totalTerms + " " + _MSG_FOUND;
        var progress = Str.progressbar(_countTopics, _totalTopics);
        Log.empty(_countTopics === 1 ? 2 : 0);
        Log.back(_countTopics === 1 ? 0 : 3);
        Log.success(message, 0, 0, 0);
        Log.shout(progress, 0, false, false, 0, 1);
    }

    /**
     * Log message of current downloaded term.
     * @param {String} topic Name of topic
     * @param {String} term  Name of term
     */
    function _logTerm(topic, term) {
        var now      = _countTerms + "/" + _totalTerms + " ";
        var message  = topic + " " + Str.quote(term);
        var progress = Str.progressbar(_countTerms, _totalTerms);
        Log.empty(_countTerms === 1 ? 1 : 0);
        Log.back(_countTerms === 1 ? 0 : 3);
        Log.success(now + message, 0, 0, 0);
        Log.shout(progress, 0, false, false, 0, 1);
    }

    /**
     * Clean name of term.
     * @param   {String} term Name of term
     * @returns {String} Cleaned term name
     */
    function _cleanName(term) {
        return term.replace(/I-.*(I|V|X)|\(\*\)|\.\.\.|\*/g, "").trim();
    }

    /**
     * Clean HTML content of term.
     * @param   {Object} $        jQuery
     * @param   {Object} $content Content element
     * @returns {String} Cleaned content string
     */
    function _cleanContent($, $content) {
        if (!$content.length) { return ""; }
        $content.contents().filter(function() {
            var wrong = this.nodeType === 3;
            var empty = $(this).text().trim().length === 0;
            return empty || wrong;
        }).remove().find(_HTML_FORBID).each(function() {
            var $el = $(this); $el.replaceWith($el.html().trim());
        });
        return Entities.decodeXML($content.html().trim());
    }

    // Public interface
    return { start: start };

})();
