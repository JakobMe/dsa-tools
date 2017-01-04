(function(){

    // Add version and description
    Program
        .version("0.0.1")
        .description("CLI tools for The Dark Eye");

    // Command 'roll dice'
    [3, 4, 6, 8, 10, 12, 20, 100].forEach(function(m) {
        Program
            .command("d" + m + " [n]")
            .description("roll d" + m + " n times")
            .option("-m, --mod <x>", "modify sum by x")
            .action(function(n, options) {
                Dice.roll(m, n, options);
            });
    });

    // Command 'make skill check'
    Program
        .command("skill <attributes> <value>")
        .description("make skill check")
        .option("-m, --mod <x>", "modify check by x")
        .option("-r, --repeat <n>", "repeat check n times")
        .action(function(attributes, value, options) {
            Dice.skill(attributes, value, options);
        });

    // Command 'search for keyword in topic'
    Program
        .command("search [topic] [phrase]")
        .description("search for phrase in topic")
        .option("-f, --fuzzy", "use fuzzy search")
        .option("-g, --guess", "guess correct result")
        .action(function(topic, phrase, options) {
            Search.find(topic, phrase, options);
        });

    // Command 'update search database'
    Program
        .command("update [topic]")
        .description("update search database")
        .option("-f, --force", "force update")
        .action(function(topic, options) {
            Update.start(topic, options);
        });

    // Parse program, display help on default
    Program.parse(process.argv);
    if (!Program.args.length) { Program.help(); }

})();
