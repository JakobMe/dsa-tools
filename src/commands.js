/**
 * Commands module; encapsulates all command functions.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 * @returns {Object} Public interface
 */
var Commands = (function() {

    // Message-Constants
    var _MSG_ATTR_HINT     = "(z.B. 11/13/12)";
    var _MSG_ATTR_ERROR    = "Probe im falschen Format!";
    var _MSG_SKILL_SLIP    = "Patzer (automatisch misslungen)";
    var _MSG_SKILL_FAIL    = "Nach misslungenen Proben Malus kumulativ +1";
    var _MSG_SKILL_CRIT    = "Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)";
    var _MSG_SKILL_FLOP    = "Erfolgsprobe misslungen";
    var _MSG_SKILL_SUCC    = "Erfolgsprobe bestanden";
    var _MSG_KEYWORD_FAIL  = "Kein passender Begriff gefunden.";
    var _MSG_KEYWORD_NONE  = "Keine Begriffe verfügbar.";
    var _MSG_KEYWORD_LIST  = "Folgende Begriffe wurden gefunden:";
    var _MSG_KEYWORD_ALL   = "Folgende Begriffe sind verfügbar";
    var _MSG_KEYWORD_HINT  = "(dsa suche $1 [begriff])";
    var _MSG_TOPIC_FAIL    = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_TOPIC_ALL     = "Folgende Themen sind verfügbar:";
    var _MSG_TOPIC_HINT    = "(dsa suche [thema] [begriff])";
    var _MSG_READ_ERROR    = "Es ist ein unbekannter Fehler aufgetreten.";
    var _MSG_DATA_ERROR    = "Keine Daten gefunden!";
    var _MSG_DATA_HINT     = "(dsa update [thema] [-f, --force])";
    var _MSG_DATA_HELP     = "(dsa update $1 [-f, --force])";

    /**
     * Default function for dice commands.
     * @param {Number} n Sides of dice
     * @param {String} rolls Number of rolls as string
     * @param {Object} options Command options
     */
    function roll(n, rolls, options) {

        // Initialize and convert arguments and values
            rolls = F.toInt(rolls, ROLLS_MIN);
        var plus  = F.toInt(options.plus, MOD_MIN);
        var minus = F.toInt(options.minus, MOD_MIN);
        var sum   = plus - minus;
        var max   = n * rolls + sum;

        // Print title
        F.printEmpty();
        F.printLine(F.strDice(rolls, n) + F.strMod(plus - minus));
        F.printEmpty();

        // Roll dice, add to sum, print results
        F.rollDice(n, rolls).forEach(function(roll, i) {
            sum += roll;
            var content = F.strRoll(F.indent(roll, max), roll, ROLL_CRIT, n);
            F.printList(i + 1, rolls, content);
        });
        F.printEmpty();

        // Print sum if necessary
        if (rolls > ROLLS_MIN || plus > MOD_MIN || minus > MOD_MIN) {
            F.printLine(F.strSum(sum, true, rolls, max));
            F.printEmpty();
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
            attr     = F.splitAttr(attr);
            val      = F.toInt(val, SKILL_MIN);
        var plus     = F.toInt(options.plus, MOD_MIN);
        var minus    = F.toInt(options.minus, MOD_MIN);
        var repeat   = F.toInt(options.sammel, ROLLS_MIN);
        var repeated = repeat > ROLLS_MIN;
        var mod      = plus - minus;
        var failed   = false;
        var slipped  = false;
        var critted  = false;
        var malus    = 0;
        var level    = 0;

        // Print error on invalid attributes
        if (attr.length !== ROLLS_ATTR) {
            F.printEmpty();
            F.printMsg(_MSG_ATTR_ERROR.red, 0, true);
            F.printMsg(_MSG_ATTR_HINT.grey.dim, 0);
            F.printEmpty();

        // Else continue with valid attributes
        } else {

            // Print title
            F.printEmpty();
            F.printLine(
                F.strDice(ROLLS_ATTR, D_20) +
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
                    rolls[j] = F.rollDice(D_20, ROLLS_MIN)[0];
                    var goal = Math.max(ATTR_MIN, attr[j] + mod - malus);
                    var diff = Math.max(ATTR_MIN, rolls[j] - goal);
                    points  -= diff;
                }

                // Analyse rolls, set/calculate values
                var slip = F.countRolls(rolls, ROLL_SLIP) >= ROLLS_TO_CRIT;
                var crit = F.countRolls(rolls, ROLL_CRIT) >= ROLLS_TO_CRIT;
                var qual = F.calcQuality(points, crit, slip, repeated);
                var fail = qual < QUAL_SUCCESS;

                // Set global values
                slipped = slipped ? true    : slip;
                critted = critted ? true    : crit;
                failed  = failed  ? true    : fail;
                level   = slip    ? qual    : level + qual;
                malus   = crit    ? MOD_MIN : fail ? malus + 1 : malus;

                // Print results
                F.printList(
                    i + 1, repeat,
                    F.strRolls(rolls, ROLL_CRIT, ROLL_SLIP) +
                    F.strPoints(points) + F.strQuality(qual, crit, slip) +
                    F.strSum(level, false, 0, QUAL_MAX * repeat)
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
     * Command: find; searches for keyword in local data.
     * @param {String} [topic] Topic to search in
     * @param {String} [keyword] Keyword to search
     * @param {String} [options] Command options
     */
    function find(topic, keyword, options) {

        // Initialize values
            keyword = keyword       || "";
            topic   = topic         || "";
        var fuzzy   = options.fuzzy || false;
        var missing = topic.length === 0;

        // Load data
        Data.load(function(data) {
            F.printEmpty();
            if (Object.keys(data).length > 0) {

                // Check if topic is valid
                var avail = [];
                var match = false;
                Object.keys(data).forEach(function(found) {
                    avail.push(found);
                    if (topic.toLowerCase() === found.toLowerCase()) {
                        match = found;
                    }
                });
                avail.sort(F.sortAlpha);
                var count = avail.length;

                // Show error if topic is invalid
                if (!match) {
                    if (missing) { F.printMsg(_MSG_TOPIC_ALL.cyan, count); }
                    else { F.printMsg(_MSG_TOPIC_FAIL.red, count, true); }
                    F.printEmpty();
                    avail.forEach(function(found, i) {
                        F.printList(i + 1, count, found);
                    });
                    F.printEmpty();
                    F.printMsg(_MSG_TOPIC_HINT.grey.dim, count);
                    F.printEmpty();

                // Else continue with search
            } else { _findTerm(data[match], keyword, match, fuzzy); }

            // Print error
            } else {
                F.printMsg(_MSG_DATA_ERROR.red, 0, true);
                F.printMsg(_MSG_DATA_HINT.grey.dim, 0);
                F.printEmpty();
            }
        });
    }

    /**
     * Find a term in a topic.
     * @param {Object} topic Topic to search in
     * @param {String} keyword Keyword to search
     * @param {String} name Name of topic
     */
    function _findTerm(topic, keyword, name, fuzzy) {

        // Initialize values
        var none     = keyword.length === 0;
        var quote    = F.strKeyword(keyword);
        var search   = keyword.toLowerCase();
        var match    = false;
        var count    = 0;
        var similar  = [];

        // Initialize hints
        var hintFind = _MSG_KEYWORD_HINT.grey.dim;
        var hintUpdt = _MSG_DATA_HELP.grey.dim;
            hintFind = hintFind.replace(REGEX_REPLACE, name);
            hintUpdt = hintUpdt.replace(REGEX_REPLACE, name);

        // Search all available terms
        Object.keys(topic).forEach(function(term) {
            var found = term.toLowerCase();
            if (search === found) { match = term; return; }
            else if (_compare(search, found, fuzzy)) {
                similar.push(term);
                count++;
            }
        });
        similar.sort(F.sortAlpha);

        // Print term on exact match
        if (match) { _printTerm(topic[match]);

        // Show similar found keywords
        } else if (count > 0) {
            if (none) { F.printMsg(_MSG_KEYWORD_ALL.cyan, count); }
            else { F.printMsg(quote + _MSG_KEYWORD_LIST.cyan, count); }
            F.printEmpty();
            similar.forEach(function(found, i) {
                F.printList(i + 1, count, found);
            });
            F.printEmpty();
            F.printMsg(hintFind, count);
            F.printEmpty();

        // Show error if nothing was found
        } else {
            if (none) {
                F.printMsg(_MSG_KEYWORD_NONE.red, 0, true);
                F.printMsg(hintUpdt, count);
            }
            else {
                F.printMsg(quote + _MSG_KEYWORD_FAIL.red, 0, true);
                F.printMsg(hintFind, count);
            }
            F.printEmpty();
        }
    }

    /**
     * Compare two strings for similarity.
     * @param {String} a First string
     * @param {String} b Second string
     * @param {Boolean} fuzzy Use fuzzysearch
     * @returns {Boolean} Strings are equal or similar
     */
    function _compare(a, b, fuzzy) {

        // Initialize fuzzysearch
        Fuzzy = fuzzy ? require("fuzzysearch")
                      : function() { return false; };

        // Clean inputs, return comparison
        a = a.toLowerCase(); b = b.toLowerCase();
        return (a.indexOf(b) !== -1) || Fuzzy(a, b) ||
               (b.indexOf(a) !== -1) || Fuzzy(b, a);
    }

    /**
     * Print the content of a given term.
     * @param {String} term Content of term
     */
    function _printTerm(term) {
        F.printLine(F.formatOutput(term));
        F.printEmpty();
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
        var repeated = repeat > ROLLS_MIN;
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
        find   : find,
        roll   : roll,
        skill  : skill
    };

})();
