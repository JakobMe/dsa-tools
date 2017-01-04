/**
 * Dice module; provdes functions for dice and skill commands.
 * @returns {Object} Public interface
 */
var Dice = (function() {

    // Message-constants
    var _MSG_ATTR_HINT  = "(z.B. 11/13/12)";
    var _MSG_ATTR_ERROR = "Probe im falschen Format!";
    var _MSG_SKILL_SLIP = "Patzer (automatisch misslungen)";
    var _MSG_SKILL_FAIL = "Nach misslungenen Proben Malus kumulativ +1";
    var _MSG_SKILL_CRIT = "Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)";
    var _MSG_SKILL_FLOP = "Erfolgsprobe misslungen";
    var _MSG_SKILL_SUCC = "Erfolgsprobe bestanden";

    // Number-constants
    var _ROLLS_ATTR     = 3;
    var _ROLLS_SPECIAL  = 2;
    var _ROLLS_MIN      = 1;
    var _DICE_CRIT      = 1;
    var _DICE_CHECK     = 20;
    var _QUAL_FACTOR    = 2;
    var _QUAL_DIVIDE    = 3;
    var _QUAL_MAX       = 6;
    var _QUAL_MIN       = 0;
    var _QUAL_HIT       = 1;

    /**
     * Roll a number of dice.
     * @param {Number} m       Number of sides
     * @param {String} n       Number of rolls
     * @param {Object} options Command options
     */
    function roll(m, n, options) {

        // Initialize command arguments and options
            n       = Math.max(Util.toInt(n), _ROLLS_MIN);
            mod     = Util.toInt(options.mod);
        var add     = n > _ROLLS_MIN || mod;
        var results = [];
        var sum     = 0;

        // Make dice rolls
        _dice(n, m).forEach(function(res, i) {
            sum    += res;
            var str = Str.indent(res, m);
            results.push(Str.roll(str, res, _DICE_CRIT, m));
        });

        // Log results
        Log.spaced(Str.dice(n, m) + Str.mod(mod));
        Log.list(results);
        Log.spaced(add ? Str.sum(sum + mod, true, n) : "", add ? 1 : 0);
    }

    /**
     * Make a skill check by dice rolls.
     * @param {String} attributes Skill attributes
     * @param {String} value      Skill value
     * @param {Object} options    Command options
     */
    function skill(attributes, value, options) {

        // Initialize command arguments and options
            attributes = _attributes(attributes);
            value      = Util.toInt(value);
        var mod        = Util.toInt(options.mod);
        var repeat     = Math.max(Util.toInt(options.repeat), _ROLLS_MIN);
        var repeated   = repeat > _ROLLS_MIN;
        var failed     = false;
        var slipped    = false;
        var critted    = false;
        var checks     = [];
        var malus      = 0;
        var sum        = 0;

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
                var slip    = _count(results, _DICE_CHECK) >= _ROLLS_SPECIAL;
                var crit    = _count(results, _DICE_CRIT)  >= _ROLLS_SPECIAL;
                var qual    = _quality(points, crit, slip, repeated);
                var fail    = qual < _QUAL_HIT;
                    slipped = slipped ? true : slip;
                    critted = critted ? true : crit;
                    failed  = failed  ? true : fail;
                    sum     = slip    ? qual : sum + qual;
                    malus   = crit    ? 0    : fail ? malus + 1 : malus;

                // Add result
                checks.push(
                    Str.rolls(results, _DICE_CRIT, _DICE_CHECK) +
                    Str.points(points, _ROLLS_ATTR * _DICE_CHECK) +
                    Str.quality(qual, crit, slip, _QUAL_HIT, _QUAL_MAX) +
                    Str.sum(sum, false, 0, _QUAL_MAX * repeat)
                );

                // Break on critical slip
                if (slip) { break; }
            }

            // Log results
            Log.spaced(
                Str.dice(Str.indent(_ROLLS_ATTR, checks.length), _DICE_CHECK) +
                Str.attr(attributes) + Str.mod(mod) +
                Str.brackets(value) + Str.times(repeat)
            );
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
        var repeated = repeat > _ROLLS_MIN;
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
        attributes.split(G.STR.DELIMITER).forEach(function(value) {
            values.push(Util.toInt(value));
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
        var points  = value + 0;
        var results = _dice(attr.length, _DICE_CHECK);
        results.forEach(function(result, i) {
            var goal = Math.max(0, attr[i] + mod - malus);
            points  -= Math.max(0, result - goal);
        });
        return { results: results, points: points };
    }

    /**
     * Count results of specific value in array of results.
     * @param   {Number[]} res Array of roll results
     * @param   {Number}   val   Desired result value
     * @returns {Number}   Count of desired result values
     */
    function _count(res, val) {
        var count = 0;
        res.forEach(function(int) { count += int === val ? 1 : 0; });
        return count;
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
        var min  = crit ? _QUAL_HIT : _QUAL_MIN;
        var mult = crit && repeated ? _QUAL_FACTOR : slip ? 0 : 1;
        var qual = points === 0 ? _QUAL_HIT : calc;
        return Math.max(Math.min(qual * mult, _QUAL_MAX), min);
    }

    // Public interface
    return {
        roll  : roll,
        skill : skill
    };

})();
