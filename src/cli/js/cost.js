/**
 * Cost module; provides functions for calculating experience costs.
 * @returns {Object} Public interface
 */
var Cost = (function() {

    // Message constants
    var _MSG_HINT              = "z.B. 'dsa ap b 12 -s 9'";
    var _MSG_ERROR_COLUMN      = "Steigerungsspalte existiert nicht!";
    var _MSG_ERROR_VALUES      = "Werte sind ungültig!";

    // Costs constant
    var _COSTS = {
        "a" : { "threshold": 12, "basicCost": 1 },
        "b" : { "threshold": 12, "basicCost": 2 },
        "c" : { "threshold": 12, "basicCost": 3 },
        "d" : { "threshold": 12, "basicCost": 4 },
        "e" : { "threshold": 14, "basicCost": 15 },
    };

    /**
     * Calculate experience costs.
     * @param {String} column  Cost column
     * @param {Number} value   End value
     * @param {Object} options Command options
     */
    function calculate(column, value, options) {

        // Initialize command arguments
        var cost    = 0;
        var start   = options.start || value - 1;
            column  = column.toLowerCase();

        // Abort if column does not exist
        if (!_COSTS.hasOwnProperty(column)) {
            Log.error(_MSG_ERROR_COLUMN, 0, 1, 0);
            Log.hint(_MSG_HINT, 0, 0, 1);
            return false;
        }

        // Abort if values are incorrect
        if (isNaN(start) || isNaN(value)) {
            Log.error(_MSG_ERROR_VALUES, 0, 1, 0);
            Log.hint(_MSG_HINT, 0, 0, 1);
            return false;
        }

        // Calculate cost sum
        for (var i = Util.toInt(start) + 1; i <= Util.toInt(value); i++) {
            cost += _getCost(i, column);
        }

        // Log result
        Log.shout(
            Str.brackets(column.toUpperCase()).magenta +
            Str.raise(start, value) +  Str.cost(cost)
        );
    }

    /**
     * Get cost of specific end value in column.
     * @param   {Number} value  End value
     * @param   {String} column Cost column
     * @returns {Number} Caluclated cost
     */
    function _getCost(value, column) {
        if (_COSTS.hasOwnProperty(column)) {
            return (Math.max(value - _COSTS[column].threshold, 0) + 1) *
                   _COSTS[column].basicCost;
        }
        return 0;
    }

    // Public interface
    return {
        calculate : calculate
    };

})();
