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

    // Message-Constants
    var _MSG_ATTR_HINT  = "(z.B. 11/13/12)";
    var _MSG_ATTR_ERROR = "Probe im falschen Format!";
    var _MSG_SLIPPED    = "Patzer (automatisch misslungen)";
    var _MSG_FAILED     = "Nach misslungenen Proben Malus kumulativ +1";
    var _MSG_CRITTED    = "Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)";
    var _MSG_UNSUCCESS  = "Erfolgsprobe misslungen";
    var _MSG_SUCCESS    = "Erfolgsprobe bestanden";
    var _MSG_NOT_FOUND  = "Kein passender Begriff gefunden.";
    var _MSG_WAS_FOUND  = "Folgende Begriffe wurden gefunden:";
    var _MSG_HAS_MATCH  = "Suchbegriff gefunden:";
    var _MSG_TOPIC_NO   = "Thema existiert nicht, folgende sind verfügbar:";
    var _MSG_TOPIC_HINT = "[dsa suche <thema> <begriff>]";

    // Data-Constants
    var _DATA_PATH     = "/data/";
    var _DATA_TYPE     = ".txt";
    var _DATA_IGNORE   = ".";

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
        var success  = false;
        var malus    = 0;
        var level    = 0;

        // Print error on invalid attributes
        if (attr.length !== ROLLS_ATTR) {
            _.printLine();
            _.printLine(_MSG_ATTR_ERROR.red);
            _.printLine(_MSG_ATTR_HINT.grey);
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
            for (var i = 0; i < repeat; i++) {

                // Make rolls, calculate points
                var rolls = [];
                var points = val + 0;
                for (var j = 0; j < attr.length; j++) {
                    rolls[j] = _.rollDice(D_20, ROLLS_MIN)[0];
                    var goal = Math.max(ATTR_MIN, attr[j] + mod - malus);
                    var diff = Math.max(ATTR_MIN, rolls[j] - goal);
                    points  -= diff;
                }

                // Analyse rolls, set/calculate values
                var slip = _.countRolls(rolls, ROLL_SLIP) >= ROLLS_TO_CRIT;
                var crit = _.countRolls(rolls, ROLL_CRIT) >= ROLLS_TO_CRIT;
                var qual = _.calcQuality(points, crit, slip, repeated);
                var fail = qual < QUAL_SUCCESS;

                // Set global values
                slipped = slipped ? true    : slip;
                critted = critted ? true    : crit;
                failed  = failed  ? true    : fail;
                level   = slip    ? qual    : level + qual;
                malus   = crit    ? MOD_MIN : fail ? malus + 1 : malus;

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
            _chooseMsg(repeat, critted, failed, slipped);
        }
    }

    /**
     * Command: find; searches for keyword in local data filenames.
     * @param {String} directory Directory to search in
     * @param {String} keyword Keyword to search
     */
    function find(directory, keyword) {
        var path = Path.join(__dirname + _DATA_PATH);
        Fs.readdir(path, function(error, dirs) {
            _.printLine();
            if (!error) {

                // Check if directory is valid
                var avail = [];
                var topic = false;
                dirs.forEach(function(dir) {
                    if (!dir.startsWith(_DATA_IGNORE)) { avail.push(dir); }
                    if (directory.toLowerCase() === dir) { topic = dir; }
                });

                // Show error if directory is invalid
                if (!topic) {
                    _.printMsg(_MSG_TOPIC_NO.red, avail.length, true);
                    _.printMsg(_MSG_TOPIC_HINT.grey.dim, avail.length);
                    _.printLine();
                    avail.forEach(function(dir, i) {
                        _.printList(i + 1, avail.length, dir);
                    });
                    _.printLine();

                // Else continue with search
                } else { _findFile(topic, keyword); }

            // Print error
            } else { console.log(error); }
        });
    }

    /**
     * Find a file in a directory.
     * @param {String} directory Directory to search in
     * @param {String} keyword Keyword to search
     */
    function _findFile(directory, keyword) {
        var path = Path.join(__dirname + _DATA_PATH + directory);
        Fs.readdir(path, function(error, files) {

            // Fix search keyword, initialize values
            var quote   = _.strKeyword(keyword);
            var search  = keyword.toLowerCase();
            var match   = false;
            var count   = 0;
            var similar = [];

            // Search all available files
            files.forEach(function(file) {
                var name  = Path.basename(file, _DATA_TYPE);
                var found = name.toLowerCase();
                if (search === found) { match = name; return; }
                else if (Fuzzy(search, found) || Fuzzy(found, search)) {
                    similar.push(name);
                    count++;
                }
            });

            // If exact match was found
            if (match) {
                var topic = _.strKeyword(match);
                _.printMsg(topic + _MSG_HAS_MATCH.green, 0, false, true);

            // Show similar found keywords
            } else if (count > 0) {
                similar.forEach(function(found, i) {
                    _.printMsg(quote + _MSG_WAS_FOUND.cyan, count);
                    _.printLine();
                    _.printList(i + 1, similar.length, found);
                    if (i >= SEARCH_MAX - 1) { return; }
                });

            // Show error if nothing was found
            } else { _.printMsg(quote + _MSG_NOT_FOUND.red, 0, true); }
            _.printLine();
        });
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
        if (!repeated && !failed) { message = _MSG_SUCCESS.green; }
        if (!repeated &&  failed) { message = _MSG_UNSUCCESS.red; }
        if ( repeated &&  failed) { message = _MSG_FAILED.grey.dim; }
        if (critted)              { extra   = _MSG_CRITTED.green; }
        if (slipped)              { extra   = _MSG_SLIPPED.red; }

        // Print messages
        if (message) { _.printMsg(message, repeat, error, success); }
        if (extra)   { _.printMsg(extra, repeat, slipped, critted); }
        if (extra || message) { _.printLine(); }
    }

    // Public interface
    return {
        find  : find,
        roll  : roll,
        skill : skill
    };

})();
