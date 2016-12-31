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

    // Data-Constants
    var _DATA_PATH         = "/data/";
    var _DATA_TYPE         = ".txt";
    var _DATA_LINE         = "line";
    var _DATA_CLOSE        = "close";
    var _DATA_ERROR        = "error";
    var _DATA_DELIMITER    = "/";
    var _DATA_IGNORE       = ".";

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
            _.printMsg(_MSG_ATTR_ERROR.red, 0, true);
            _.printMsg(_MSG_ATTR_HINT.grey.dim, 0);
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
     * @param {String} [directory] Directory to search in
     * @param {String} [keyword] Keyword to search
     */
    function find(directory, keyword) {

        // Initialize values
            keyword   = keyword   || "";
            directory = directory || "";
        var missing   = directory.length === 0;

        // Read directory
        Fs.readdir(Path.join(__dirname + _DATA_PATH), function(error, dirs) {
            _.printLine();
            if (!error) {

                // Check if directory is valid
                var avail = [];
                var topic = false;
                dirs.forEach(function(dir) {
                    if (!dir.startsWith(_DATA_IGNORE)) { avail.push(dir); }
                    if (directory.toLowerCase() === dir.toLowerCase()) {
                        topic = dir;
                    }
                });
                var count = avail.length;

                // Show error if directory is invalid
                if (!topic) {
                    if (missing) { _.printMsg(_MSG_TOPIC_ALL.cyan, count); }
                    else { _.printMsg(_MSG_TOPIC_FAIL.red, count, true); }
                    _.printMsg(_MSG_TOPIC_HINT.grey.dim, count);
                    _.printLine();
                    avail.forEach(function(dir, i) {
                        _.printList(i + 1, count, dir);
                    });
                    _.printLine();

                // Else continue with search
                } else { _findFile(topic, keyword); }

            // Print error
            } else { _.printMsg(_MSG_READ_ERROR.red, 0, true); }
        });
    }

    /**
     * Find a file in a directory.
     * @param {String} directory Directory to search in
     * @param {String} keyword Keyword to search
     */
    function _findFile(directory, keyword) {
        var none = keyword.length === 0;
        var path = Path.join(__dirname + _DATA_PATH + directory);
        Fs.readdir(path, function(error, files) {

            // Initialize values
            var quote   = _.strKeyword(keyword);
            var search  = keyword.toLowerCase();
            var match   = false;
            var count   = 0;
            var similar = [];
            var hint    = _MSG_KEYWORD_HINT.grey.dim;
                hint    = hint.replace(DATA_PLACEHOLDER, directory);

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

            // Print file on exact match
            if (match) { _printFile(path, match);

            // Show similar found keywords
            } else if (count > 0) {
                if (none) { _.printMsg(_MSG_KEYWORD_ALL.cyan, count); }
                else { _.printMsg(quote + _MSG_KEYWORD_LIST.cyan, count); }
                _.printMsg(hint, count);
                _.printLine();
                similar.forEach(function(found, i) {
                    _.printList(i + 1, count, found);
                });
                _.printLine();

            // Show error if nothing was found
            } else {
                if (none) { _.printMsg(_MSG_KEYWORD_NONE.red, 0, true); }
                else { _.printMsg(quote + _MSG_KEYWORD_FAIL.red, 0, true); }
                _.printMsg(hint, count);
                _.printLine();
            }
        });
    }

    /**
     * Print the content of a given file.
     * @param {String} path Path to file
     * @param {String} name Name of file
     */
    function _printFile(path, name) {

        // Read file
        var file = path + _DATA_DELIMITER + name + _DATA_TYPE;
        var read = Fs.createReadStream(Path.join(file))
            .on(_DATA_ERROR, function() {
            _.printMsg(_MSG_READ_ERROR.red, 0, true);
            _.printLine();
        });

        // Print file line by line
        Readline.createInterface({ input: read })
            .on(_DATA_LINE, function(line) {
            _.printLine(_.formatLine(line));

        // Print empty line
        }).on(_DATA_CLOSE, function() { _.printLine(); });
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
