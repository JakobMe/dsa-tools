/**
 * Cost module; provides functions for calculating experience costs.
 * @returns {Object} Public interface
 */
var Cost = (function() {

    // Message constants
    var _MSG_HINT              = "z.B. 'dsa ap b 12 -s 9'";
    var _MSG_ERROR_COLUMN      = "Steigerungsspalte existiert nicht!";
    var _MSG_ERROR_VALUES      = "Werte sind ungültig!";

    // Cost constant
    var _C = {
        "a" : { "t": 12, "b":  1 },
        "b" : { "t": 12, "b":  2 },
        "c" : { "t": 12, "b":  3 },
        "d" : { "t": 12, "b":  4 },
        "e" : { "t": 14, "b": 15 }
    };

    /**
     * Calculate experience costs.
     * @param {String} col     Cost column
     * @param {Number} val     End value
     * @param {Object} options Command options
     */
    function calculate(col, val, options) {

        // Initialize command arguments and options
        var min = options.start || val - 1;
            col = col.toLowerCase();

        // Abort if column does not exist
        if (!_C.hasOwnProperty(col)) {
            Log.error(_MSG_ERROR_COLUMN, 0, 1, 0);
            Log.hint(_MSG_HINT, 0, 0, 1);
            return false;
        }

        // Abort if values are incorrect
        if (isNaN(min) || isNaN(val)) {
            Log.error(_MSG_ERROR_VALUES, 0, 1, 0);
            Log.hint(_MSG_HINT, 0, 0, 1);
            return false;
        }

        // Calculate and log result
        Log.shout(
            Str.brackets(col.toUpperCase()).magenta + Str.raise(min, val) +
            Str.cost(_sum(parseInt(val), parseInt(min), _C[col].t, _C[col].b))
        );
    }

    /**
     * Calculate cost of value.
     * @param   {Number} x New value
     * @param   {Number} t Threshold value
     * @param   {Number} b Basic cost
     * @returns {Number} Calculated cost
     */
    function _cost(x, t, b) {
        return (Math.max(x - t, 0) + 1) * b;
    }

    /**
     * Calculate sum of costs from minimum to value.
     * @param   {Number} x New value
     * @param   {Number} m Minimum value
     * @param   {Number} t Threshold value
     * @param   {Number} b Basic cost
     * @returns {Number} Calculated cost
     */
    function _sum(x, m, t, b) {
        var s = 0;
        for (var i = m + 1; i <= x; i++) {
            s += _cost(i, t, b);
        }
        return s;
    }

    // Public interface
    return {
        calculate : calculate
    };

})();
