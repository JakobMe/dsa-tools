/**
 * Cost module; provides functions for calculating experience costs.
 * @returns {Object} Public interface
 */
var Cost = (function() {

    // Message-constants
    var _MSG_HINT              = "z.B. 'dsa kosten b 12 9'";
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
     * @param {Number} end     End value
     * @param {Number} [start] Start value
     */
    function calculate(column, end, start) {

        // Initialize command arguments
        var cost    = 0;
            column  = column.toLowerCase();
            end     = Util.toInt(end);
            start   = start || end - 1;

        // Abort if column does not exist
        if (!_COSTS.hasOwnProperty(column)) {
            Log.error(_MSG_ERROR_COLUMN, 0, 1, 0);
            Log.hint(_MSG_HINT, 0, 0, 1);
            return false;
        }

        // Abort if values are incorrect
        if (end <= start) {
            Log.error(_MSG_ERROR_VALUES, 0, 1, 0);
            Log.hint(_MSG_HINT, 0, 0, 1);
            return false;
        }

        // Calculate cost sum
        for (var i = Util.toInt(start) + 1; i <= end; i++) {
            cost += _getCost(i, column);
        }

        // Log result
        Log.shout(
            Str.brackets(column.toUpperCase()).magenta +
            Str.raise(start, end) +  Str.cost(cost)
        );
    }

    /**
     * Get cost of specifif end value.
     * @param   {Number} value  End value
     * @param   {String} column Cost column
     * @returns {Number} Caluclated cost
     */
    function _getCost(value, column) {
        if (_COSTS.hasOwnProperty(column)) {

            // Get threshold and basic cost values
            var threshold  = _COSTS[column].threshold;
            var basicCost  = _COSTS[column].basicCost;
            var calculated = basicCost + 0;

            // If new value is above threshold
            if (value > threshold) {
                calculated = (value - threshold + 1) * basicCost;
            }

            // Return calculated cost
            return calculated;
        }

        // Return false on error
        return 0;
    }

    // Public interface
    return {
        calculate : calculate
    };

})();
