/**
 * Dice module; provdes functions for dice and skill commands.
 * @returns {Object} Public interface
 */
var Dice = (function() {

    // Message-constants
    var _MSG_ATTR_HINT   = "z.B. 11/13/12";
    var _MSG_ATTR_ERROR  = "Probe im falschen Format!";
    var _MSG_SKILL_SLIP  = "Patzer (automatisch misslungen)";
    var _MSG_SKILL_FAIL  = "Nach misslungenen Proben Malus kumulativ +1";
    var _MSG_SKILL_CRIT  = "Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)";
    var _MSG_SKILL_FLOP  = "Erfolgsprobe misslungen";
    var _MSG_SKILL_SUCC  = "Erfolgsprobe bestanden";

    // Number-constants
    var _ROLLS_ATTR      = 3;
    var _ROLLS_SPECIAL   = 2;
    var _DICE_ATTR       = 20;
    var _VAL_SLIP        = 20;
    var _VAL_CRIT        = 1;
    var _QUAL_FACTOR     = 2;
    var _QUAL_DIVIDE     = 3;
    var _QUAL_MAX        = 6;
    var _QUAL_MIN        = 0;
    var _QUAL_SUCCESS    = 1;

    /**
     * Roll a number of dice.
     * @param {Number} m       Number of sides
     * @param {String} n       Number of rolls
     * @param {Object} options Command options
     */
    function roll(m, n, options) {

        // Initialize command arguments and options
            n       = Math.max(Util.toInt(n), 1);
        var mod     = Util.toInt(options.mod);
        var add     = n > 1 || mod;
        var results = [];
        var sum     = 0;

        // Make dice rolls
        _dice(n, m).forEach(function(res, i) {
            sum    += res;
            var str = Str.indent(res, m);
            results.push(Str.roll(str, res, _VAL_CRIT, m));
        });

        // Log results
        Log.spaced(Str.dice(n, m) + Str.mod(mod));
        Log.list(results);
        Log.spaced(add ? Str.sum(sum + mod, true) : "",
                   add ? 1 : 0, add ? 1 : 0);
    }

    /**
     * Make a skill check by dice rolls.
     * @param {String} attributes Skill attributes
     * @param {String} value      Skill value
     * @param {Object} options    Command options
     */
    function skill(attr, val, options) {

        // Initialize command arguments and options
        var attributes  = _attributes(attr);
        var value       = Math.max(Util.toInt(val), 0);
        var mod         = Util.toInt(options.mod);
        var prob        = options.wahrscheinlich || false;
        var repeat      = prob ? 0 : Math.max(Util.toInt(options.sammel), 1);
        var probability = Str.percent(_probability(attributes, value, mod));
        var repeated    = repeat > 1;
        var failed      = false;
        var slipped     = false;
        var critted     = false;
        var checks      = [];
        var malus       = 0;
        var sum         = 0;

        // Log error on invalid attributes
        if (attributes.length !== _ROLLS_ATTR) {
            Log.error(_MSG_ATTR_ERROR, 0, 1, 0);
            Log.hint(_MSG_ATTR_HINT, 0, 0, 1);

        // Continue with skill check
        } else {

            // Repeat skill checks
            for (var i = 0; i < repeat; i++) {

                // Calculate and set values
                var check   = _check(attributes, value, mod, malus);
                var results = check.results;
                var points  = check.points;
                var slip    = _special(results, _VAL_SLIP);
                var crit    = _special(results, _VAL_CRIT);
                var qual    = _quality(points, crit, slip, repeated);
                var fail    = qual < _QUAL_SUCCESS;
                    slipped = slipped ? true : slip;
                    critted = critted ? true : crit;
                    failed  = failed  ? true : fail;
                    sum     = slip    ? qual : sum + qual;
                    malus   = crit    ? 0    : fail ? malus + 1 : malus;

                // Add result
                checks.push(
                    Str.rolls(results, _VAL_CRIT, _DICE_ATTR) +
                    Str.points(points, _ROLLS_ATTR * _DICE_ATTR) +
                    Str.quality(qual, crit, slip, _QUAL_SUCCESS, _QUAL_MAX) +
                    Str.sum(sum, false, 0, _QUAL_MAX * repeat)
                );

                // Break on critical slip
                if (slip) { break; }
            }

            // Log title
            Log.spaced(
                Str.dice(Str.indent(_ROLLS_ATTR, checks.length), _DICE_ATTR) +
                Str.attr(attributes).magenta + Str.mod(mod) +
                Str.brackets(value).magenta + Str.times(repeat) + " " +
                (prob ? probability.cyan : probability.grey.dim)
            );

            // Abort if probability option is set
            if (prob) { return; }

            // Log results
            Log.list(checks);
            _alerts(checks.length, critted, failed, slipped);
        }
    }

    /**
     * Choose alerts for skill checks to log.
     * @param {Number}  repeat  Number of repeated checks
     * @param {Boolean} critted At least one critical success
     * @param {Boolean} failed  At least one failed check
     * @param {Boolean} slipped At least one slipped check
     */
    function _alerts(repeat, critted, failed, slipped) {

        // Initialize status and values
        var extra    = false;
        var message  = false;
        var repeated = repeat > 1;
        var error    = (!repeated &&  failed);
        var success  = (!repeated && !failed);

        // Choose messages
        if (!repeated && !failed) { message = _MSG_SKILL_SUCC.green; }
        if (!repeated &&  failed) { message = _MSG_SKILL_FLOP.red; }
        if ( repeated &&  failed) { message = _MSG_SKILL_FAIL.grey.dim; }
        if (critted)              { extra   = _MSG_SKILL_CRIT.green; }
        if (slipped)              { extra   = _MSG_SKILL_SLIP.red; }

        // Log messages
        if (!message && extra) { Log.empty(); }
        if (message)  { Log.shout(message, repeat, error, success, 1, 0); }
        if (extra)    { Log.shout(extra, repeat, slipped, critted, 0, 1); }
        if (!extra)   { Log.empty(); }
    }

    /**
     * Splitt attributes string to array of integers.
     * @param   {String}   attributes String of attributes
     * @returns {Number[]} Array of integers of attribute values
     */
    function _attributes(attributes) {
        var values = [];
        attributes.split("/").forEach(function(value) {
            values.push(Math.max(Util.toInt(value), 0));
        });
        return values;
    }

    /**
     * Make dice rolls.
     * @param   {Number}   n Integer of number of dice rolls
     * @param   {Number}   m Integer of number of dice sides
     * @returns {Number[]} Array of result integers
     */
    function _dice(n, m) {
        var results = [];
        for (var i = 0; i < n; i++) { results.push(Util.randomInt(1, m)); }
        return results;
    }

    /**
     * Make a skill check.
     * @param   {Number[]} attr  Integers of attribute values
     * @param   {Number}   value Integer of skill value
     * @param   {Number}   mod   Integer of mod
     * @param   {Number}   malus Integer of additional malus
     * @returns {Object}   Results of rolls and remaining skill points
     */
    function _check(attr, value, mod, malus) {
        var results = _dice(attr.length, _DICE_ATTR);
        var points  = _points(results, attr, value, mod, malus);
        return { results: results, points: points };
    }

    /**
     * Caluclate quality level of remaining skill points.
     * @param   {Number}  points  Remaining skill points
     * @param   {Boolean} crit    Critical success?
     * @param   {Boolean} slip    Critical slip?
     * @param   {Boolean} repeated Repeated check?
     * @returns {Number}  Caluclated quality level
     */
    function _quality(points, crit, slip, repeated) {
        var calc = Math.ceil(points / _QUAL_DIVIDE);
        var min  = crit ? _QUAL_SUCCESS : _QUAL_MIN;
        var mult = crit && repeated ? _QUAL_FACTOR : slip ? 0 : 1;
        var qual = points === 0 ? _QUAL_SUCCESS : calc;
        return Math.max(Math.min(qual * mult, _QUAL_MAX), min);
    }

    /**
     * Calculate probability of success of skill check.
     * @param   {Number[]} attr Attribute values
     * @param   {Number}   val  Skill value
     * @param   {Number}   mod  Mod value
     * @returns {Number}   Float number of probability
     */
    function _probability(attr, val, mod) {
        var s = 0;
        for (var x = 1; x <= _DICE_ATTR; x++) {
            for (var y = 1; y <= _DICE_ATTR; y++) {
                for (var z = 1; z <= _DICE_ATTR; z++) {
                    if (_special([x, y, z], _VAL_CRIT)) { s++; }
                    else if (!_special([x, y, z], _VAL_CRIT)) {
                        var p = _points([x, y, z], attr, val, mod, 0);
                        s += p >= 0 ? 1 : 0;
                    }
                }
            }
        }
        return Math.round(
            (1.0 /parseFloat(Math.pow(_DICE_ATTR, _ROLLS_ATTR)) * s) *
                100 * 100) / 100;
    }

    /**
     * Check for special result.
     * @param   {Number[]} res Result values
     * @param   {Number}   n   Special value
     * @returns {Boolean}  Is special result
     */
    function _special(res, n) {
        var count = 0;
        res.forEach(function(int) { count += int === n ? 1 : 0; });
        return count >= _ROLLS_SPECIAL;
    }

    /**
     * Calculate remaining points from skill check.
     * @param   {Number[]} res   Result values
     * @param   {Number[]} attr  Attribute values
     * @param   {Number}   val   Skill value
     * @param   {Number}   mod   Mod value
     * @param   {Number}   malus Addtional malus
     * @returns {Number}   Remaining points
     */
    function _points(res, attr, val, mod, malus) {
        var points = val + 0;
        res.forEach(function(x, i) {
            points -= Math.max(0, x - (attr[i] + mod - malus));
        });
        return points;
    }

    // Public interface
    return {
        roll  : roll,
        skill : skill
    };

})();
