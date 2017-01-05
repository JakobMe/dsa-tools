(function(){

    // Add version and description
    Program
        .version("0.0.1")
        .description("command line tools for 'The Dark Eye'")
        .on("--help", function() {
            help("d");
            help("skill", true);
            help("update", true);
            help("search", true);
        });

    // Command 'roll dice'
    [3, 4, 6, 8, 10, 12, 20, 100].forEach(function(m) {
        Program
            .command("d" + m + " [n]")
            .description("roll d" + m + " n times")
            .option("-m, --mod <x>", "modify sum by x")
            .action(function(n, options) {
                Dice.roll(m, n, options);
            })
            .on("--help", function() { help("d"); });
    });

    // Command 'make skill check'
    Program
        .command("skill <attributes> <value>")
        .description("make skill check")
        .option("-m, --mod <x>", "modify check by x")
        .option("-r, --repeat <n>", "repeat check n times")
        .option("-p, --probability", "show probability of success")
        .action(function(attributes, value, options) {
            Dice.skill(attributes, value, options);
        })
        .on("--help", function() { help("skill"); });

    // Command 'search for keyword in topic'
    Program
        .command("search [topic] [phrase]")
        .description("search for phrase in topic")
        .option("-f, --fuzzy", "use fuzzy search")
        .option("-g, --guess", "guess correct result")
        .action(function(topic, phrase, options) {
            Search.find(topic, phrase, options);
        })
        .on("--help", function() { help("search"); });

    // Command 'update search database'
    Program
        .command("update [topic]")
        .description("update search database")
        .option("-f, --force", "force update")
        .action(function(topic, options) {
            Update.start(topic, options);
        })
        .on("--help", function() { help("update"); });

    /**
     * Display additional help lines.
     * @param {String}  command   Command name
     * @param {Boolean} hidetitle Hide the title lines
     */
    function help(command, hidetitle) {
        if (!(hidetitle || false)) {
            Log.line("  Examples:");
            Log.empty();
        }
        switch(command) {
            case "d":
                Log.line("    $ dsa d20 3");
                Log.line("    $ dsa d6 2 --mod 6");
                break;
            case "skill":
                Log.line("    $ dsa skill 13/16/14 6 -m -1");
                Log.line("    $ dsa skill 14/13/15 9 -r 7 --mod=1");
                Log.line("    $ dsa skill 12/13/11 4 --probability");
                break;
            case "update":
                Log.line("    $ dsa update --force");
                Log.line("    $ dsa update vorteil");
                break;
            case "search":
                Log.line("    $ dsa search");
                Log.line("    $ dsa search kultur");
                Log.line("    $ dsa search zauber ignifaxius");
                Log.line("    $ dsa search kampf wucht --guess");
                Log.line("    $ dsa search vorteil \"verbessert leben\" -fg");
                Log.line("    $ dsa search nachteil \"schlechte energie\" -f");
                break;
        }
        Log.empty();
    }

    // Parse program, display help on default
    Program.parse(process.argv);
    if (!Program.args.length) { Program.help(); }

})();
