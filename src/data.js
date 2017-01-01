/**
 * DSA-Tools CLI.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */

/**
 * Data module; encapsulates all data functions.
 * @returns {Object} Public interface
 */
var Data = (function() {

    // Data constants
    var _DATA_FILE          = "/data.json";

    // Modules/variables
    var Jsonfile            = null;
    var Path                = null;
    var _file               = null;

    /**
     * Initialize module.
     */
    function _init() {
        Path     = require("path");
        Jsonfile = require("jsonfile");
        _file    = Path.join(__dirname + _DATA_FILE);
    }

    /**
     * Load data from JSON file.
     * @param {Function} callback Callback function
     */
    function load(callback) {
        _init();
        Jsonfile.readFile(_file, function(error, data) {
            callback(error !== null ? {} : data);
        });
    }

    /**
     * Saves data to a JSON file.
     * @param {Object} data Data to save
     */
    function save(data) {
        _init();
        Jsonfile.writeFile(_file, data);
    }

    // Public interface
    return {
        load: load,
        save: save
    };

})();
