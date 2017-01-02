/**
 * Data module; encapsulates all data functions.
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
