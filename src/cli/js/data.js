/**
 * Data module; provides functions for reading and saving local data.
 * @returns {Object} Public interface
 */
var Data = (function() {

    // Constants
    var _PATH_DATA   = "/../web/data.json";
    var _PATH_CONFIG = "/config.json";

    // Modules/variables
    var JsonFile     = null;
    var Path         = null;
    var _pathData    = null;
    var _pathConfig  = null;

    /**
     * Initialize module.
     */
    function _init() {
        Path        = require("path");
        JsonFile    = require("jsonfile");
        _pathData   = Path.join(__dirname + _PATH_DATA);
        _pathConfig = Path.join(__dirname + _PATH_CONFIG);
    }

    /**
     * Load data from JSON file.
     * @param {Function} callback Callback function
     */
    function load(callback) {
        _init();
        JsonFile.readFile(_pathData, function(error, data) {
            callback(error !== null ? {} : data);
        });
    }

    /**
     * Saves data to a JSON file.
     * @param {Object} data Data to save
     */
    function save(data) {
        _init();
        JsonFile.writeFile(_pathData, data);
    }

    /**
     * Load config from JSON file.
     * @param {Function} callback Callback function
     */
    function config(callback) {
        _init();
        JsonFile.readFile(_pathConfig, function(error, config) {
            callback(error !== null ? {} : config);
        });
    }

    // Public interface
    return {
        config : config,
        load   : load,
        save   : save
    };

})();
