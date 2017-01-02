/**
 * Dice module; encapsulates all dice functions.
 * @returns {Object} Public interface
 */
var Dice = (function() {

    // Message-Constants
    var _MSG_ATTR_HINT  = "(z.B. 11/13/12)";
    var _MSG_ATTR_ERROR = "Probe im falschen Format!";
    var _MSG_SKILL_SLIP = "Patzer (automatisch misslungen)";
    var _MSG_SKILL_FAIL = "Nach misslungenen Proben Malus kumulativ +1";
    var _MSG_SKILL_CRIT = "Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)";
    var _MSG_SKILL_FLOP = "Erfolgsprobe misslungen";
    var _MSG_SKILL_SUCC = "Erfolgsprobe bestanden";

    /**
     * Roll a number of n-sided dice.
     * @param {Number} n Sides of dice
     * @param {String} rolls Number of rolls
     * @param {Object} options Command options
     */
    function roll(n, rolls, options) {

        // Initialize and convert arguments and values
            rolls = F.toInt(rolls, G.ROLLS_MIN);
        var plus  = F.toInt(options.plus, G.MOD_MIN);
        var minus = F.toInt(options.minus, G.MOD_MIN);
        var sum   = plus - minus;
        var max   = n * rolls + sum;

        // Print title
        F.printEmpty();
        F.printLine(F.strDice(rolls, n) + F.strMod(plus - minus));
        F.printEmpty();

        // Roll dice, add to sum, print results
        F.rollDice(n, rolls).forEach(function(roll, i) {
            sum += roll;
            var content = F.strRoll(F.indent(roll, max), roll, G.ROLL_CRIT, n);
            F.printList(i + 1, rolls, content);
        });
        F.printEmpty();

        // Print sum if necessary
        if (rolls > G.ROLLS_MIN || plus > G.MOD_MIN || minus > G.MOD_MIN) {
            F.printLine(F.strSum(sum, true, rolls, max));
            F.printEmpty();
        }
    }

    /**
     * Make a skill check by dice rolls.
     * @param {String} attr Skill attributes (e.g. 10/12/11)
     * @param {String} val Skill value
     * @param {Object} options Command options
     */
    function skill(attr, val, options) {

        // Initialize and convert arguments and values
            attr     = F.splitAttr(attr);
            val      = F.toInt(val, G.SKILL_MIN);
        var plus     = F.toInt(options.plus, G.MOD_MIN);
        var minus    = F.toInt(options.minus, G.MOD_MIN);
        var repeat   = F.toInt(options.sammel, G.ROLLS_MIN);
        var repeated = repeat > G.ROLLS_MIN;
        var mod      = plus - minus;
        var failed   = false;
        var slipped  = false;
        var critted  = false;
        var malus    = 0;
        var level    = 0;

        // Print error on invalid attributes
        if (attr.length !== G.ROLLS_ATTR) {
            F.printEmpty();
            F.printMsg(_MSG_ATTR_ERROR.red, 0, true);
            F.printMsg(_MSG_ATTR_HINT.grey.dim, 0);
            F.printEmpty();

        // Else continue with valid attributes
        } else {

            // Print title
            F.printEmpty();
            F.printLine(
                F.strDice(G.ROLLS_ATTR, G.D_20) +
                F.strAttr(attr) +
                F.strMod(mod) +
                F.strVal(val) +
                F.strRepeat(repeat)
            );
            F.printEmpty();

            // Make skill-checks
            for (var i = 0; i < repeat; i++) {

                // Make rolls, calculate points
                var rolls = [];
                var points = val + 0;
                for (var j = 0; j < attr.length; j++) {
                    rolls[j] = F.rollDice(G.D_20, G.ROLLS_MIN)[0];
                    var goal = Math.max(G.ATTR_MIN, attr[j] + mod - malus);
                    var diff = Math.max(G.ATTR_MIN, rolls[j] - goal);
                    points  -= diff;
                }

                // Analyse rolls, set/calculate values
                var slip = F.countRolls(rolls, G.ROLL_SLIP) >= G.ROLLS_TO_CRIT;
                var crit = F.countRolls(rolls, G.ROLL_CRIT) >= G.ROLLS_TO_CRIT;
                var qual = F.calcQuality(points, crit, slip, repeated);
                var fail = qual < G.QUAL_SUCCESS;

                // Set global values
                slipped = slipped ? true      : slip;
                critted = critted ? true      : crit;
                failed  = failed  ? true      : fail;
                level   = slip    ? qual      : level + qual;
                malus   = crit    ? G.MOD_MIN : fail ? malus + 1 : malus;

                // Print results
                F.printList(
                    i + 1, repeat,
                    F.strRolls(rolls, G.ROLL_CRIT, G.ROLL_SLIP) +
                    F.strPoints(points) + F.strQuality(qual, crit, slip) +
                    F.strSum(level, false, 0, G.QUAL_MAX * repeat)
                );

                // Break on critical slip
                if (slip) { break; }
            }

            // Print messages
            F.printEmpty();
            _chooseMsg(repeat, critted, failed, slipped);
        }
    }

    /**
     * Choose messages for skill-checks to print.
     * @param {Number} repeat Number of repeated skill-checks
     * @param {Boolean} critted At least one critical success on skill-check
     * @param {Boolean} failed At least one failed skill-check
     * @param {Boolean} slipped At least one slipped skill-check
     */
    function _chooseMsg(repeat, critted, failed, slipped) {

        // Initialize status and values
        var extra    = false;
        var message  = false;
        var repeated = repeat > G.ROLLS_MIN;
        var error    = (!repeated && failed);
        var success  = (!repeated && !failed);

        // Choose messages
        if (!repeated && !failed) { message = _MSG_SKILL_SUCC.green; }
        if (!repeated &&  failed) { message = _MSG_SKILL_FLOP.red; }
        if ( repeated &&  failed) { message = _MSG_SKILL_FAIL.grey.dim; }
        if (critted)              { extra   = _MSG_SKILL_CRIT.green; }
        if (slipped)              { extra   = _MSG_SKILL_SLIP.red; }

        // Print messages
        if (message) { F.printMsg(message, repeat, error, success); }
        if (extra)   { F.printMsg(extra, repeat, slipped, critted); }
        if (extra || message) { F.printEmpty(); }
    }

    // Public interface
    return {
        roll  : roll,
        skill : skill
    };

})();
