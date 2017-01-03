(function(){

    // Add version and description
    Program
        .version("0.0.1")
        .description("CLI tools for The Dark Eye");

    /*
     * Command: d<x> [n] [-m, --minus <x>] [-p, --plus <x>]
     */
    [2, 3, 4, 6, 8, 10, 12, 20, 100].forEach(function(sides) {
        Program
            .command("d" + sides + " [rolls]")
            .description("roll d" + sides)
            .option("-m, --minus <x>", "subtract x from sum")
            .option("-p, --plus <x>", "add x to sum")
            .action(function(rolls, options) {
                Dice.roll(sides, rolls, options);
            });
    });

    /*
     * Command: skill <attributes> <value>
     * [-m, --minus <x>] [-p, --plus <x>] [-r, --repeat <n>]
     */
    Program
        .command("skill <attributes> <value>")
        .description("roll skill check")
        .option("-m, --minus <x>", "modify check by -x")
        .option("-p, --plus <x>", "modify check by +x")
        .option("-r, --repeat <n>", "repeat check n times")
        .action(function(attributes, value, options) {
            Dice.skill(attributes, value, options);
        });

    /*
     * Command: search [topic] [keyword] [-f, --fuzzy] [-l, --lucky]
     */
    Program
        .command("search [topic] [keyword]")
        .description("search for keyword in topic")
        .option("-f, --fuzzy", "make fuzzy search")
        .option("-l, --lucky", "show best result immediately")
        .action(function(topic, keyword, options) {
            Search.find(topic, keyword, options);
        });

    /*
     * Command: update [topic] [-f, --force]
     */
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
