/**
 * DSA-Tools CLI.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */

/**
 * Commands module; encapsulates all command functions.
 * @returns {Object} Public interface
 */
var Commands = (function() {

    // Constants
    const _MSG_HINT    = "(z.B. 11/13/12)";
    const _MSG_ERROR   = "Probe im falschen Format!";
    const _MSG_SLIPPED = "Patzer (automatisch misslungen)";
    const _MSG_FAILED  = "Misslungen (bei Sammelprobe Malus +1)";
    const _MSG_CRITTED = "Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)";

    /**
     * Default function for dice commands.
     * @param {Number} n Sides of dice
     * @param {String} rolls Number of rolls as string
     * @param {Object} options Command options
     */
    function roll(n, rolls, options) {

        // Initialize and convert arguments and values
            rolls = _.toInt(rolls, ROLLS_MIN);
        var plus  = _.toInt(options.plus, MOD_MIN);
        var minus = _.toInt(options.minus, MOD_MIN);
        var sum   = plus - minus;
        var max   = n * rolls + sum;

        // Print title
        _.printLine();
        _.printLine(_.strDice(rolls, n) + _.strMod(plus - minus));
        _.printLine();

        // Roll dice, add to sum, print results
        _.rollDice(n, rolls).forEach(function(roll, i) {
            sum += roll;
            var content = _.strRoll(_.indent(roll, max), roll, ROLL_CRIT, n);
            _.printList(i + 1, rolls, content);
        });
        _.printLine();

        // Print sum if necessary
        if (rolls > ROLLS_MIN || plus > MOD_MIN || minus > MOD_MIN) {
            _.printLine(_.strSum(sum, true, rolls, max));
            _.printLine();
        }
    }

    /**
     * Command: skill; makes a skill-check.
     * @param {String} attr Skill attributes (e.g. 10/12/11)
     * @param {String} val Skill value
     * @param {Object} options Command options
     */
    function skill(attr, val, options) {

        // Initialize and convert arguments and values
            attr     = _.splitAttr(attr);
            val      = _.toInt(val, SKILL_MIN);
        var plus     = _.toInt(options.plus, MOD_MIN);
        var minus    = _.toInt(options.minus, MOD_MIN);
        var repeat   = _.toInt(options.sammel, ROLLS_MIN);
        var repeated = repeat > ROLLS_MIN;
        var mod      = plus - minus;
        var failed   = false;
        var slipped  = false;
        var critted  = false;
        var malus    = 0;
        var level    = 0;

        // Print error on invalid attributes
        if (attr.length !== ROLLS_ATTR) {
            _.printLine();
            _.printLine(_MSG_ERROR.red);
            _.printLine(_MSG_HINT.grey);
            _.printLine();

        // Else continue with valid attributes
        } else {

            // Print title
            _.printLine();
            _.printLine(
                _.strDice(ROLLS_ATTR, D_20) +
                _.strAttr(attr) +
                _.strMod(mod) +
                _.strVal(val) +
                _.strRepeat(repeat)
            );
            _.printLine();

            // Make skill-checks
            for (let i = 0; i < repeat; i++) {

                // Make rolls, calculate points
                var rolls = [];
                var points = val + 0;
                for (let j = 0; j < attr.length; j++) {
                    rolls[j] = _.rollDice(D_20, ROLLS_MIN)[0];
                    var goal = Math.max(ATTR_MIN, attr[j] + mod - malus);
                    var diff = Math.max(ATTR_MIN, rolls[j] - goal);
                    points  -= diff;
                }

                // Analyse rolls, set/calculate values
                var slip = _.countRolls(rolls, ROLL_SLIP) >= ROLLS_TO_CRIT;
                var crit = _.countRolls(rolls, ROLL_CRIT) >= ROLLS_TO_CRIT;
                var qual = _.calcQuality(points, crit, slip, repeated);
                var mult = Math.min(QUAL_MAX, qual * QUAL_MULTIPLY);
                var fail = qual < QUAL_SUCCESS;

                // Set global values
                slipped = slipped ?  true : slip;
                critted = critted ?  true : crit;
                failed  = failed  ?  true : fail;
                malus   = crit ?  MOD_MIN : fail ? malus + 1    : malus;
                level   = slip ? QUAL_MIN : crit ? level + mult : level + qual;

                // Print results
                _.printList(
                    i + 1, repeat,
                    _.strRolls(rolls, ROLL_CRIT, ROLL_SLIP) +
                    _.strPoints(points) + _.strQuality(qual, crit, slip) +
                    _.strSum(level, false, 0, QUAL_MAX * repeat)
                );

                // Break on critical slip
                if (slip) { break; }
            }

            // Print messages
            _.printLine();
            if (failed && !slipped) { _.printMsg(_MSG_FAILED, repeat); }
            if (critted) { _.printMsg(_MSG_CRITTED, repeat, false, true); }
            if (slipped) { _.printMsg(_MSG_SLIPPED, repeat, true, false); }
            if (failed || slipped || critted) { _.printLine(); }
        }
    }

    // Public interface
    return {
        roll  : roll,
        skill : skill
    };

})();
