(function(){

    // Command 'roll dice'
    [2, 3, 4, 6, 8, 10, 12, 20, 100].forEach(function(m) {
        Program
            .command("w" + m + " [n]")
            .description("N w" + m + " würfeln")
            .option("-m, --mod <x>", "Summenmodifikator")
            .action(function(n, options) {
                Dice.roll(m, n, options);
            })
            .on("--help", function() { help("dice"); });
    });

    // Command 'make skill check'
    Program
        .command("probe <probe> <fw>")
        .description("Fertigkeitsprobe würfeln")
        .option("-m, --mod <x>", "Modifikator der Probe")
        .option("-s, --sammel <n>", "Sammelprobe mit N Versuchen")
        .option("-w, --wahrscheinlich", "Nur die Wahrscheinlichkeit anzeigen")
        .action(function(attributes, value, options) {
            Dice.skill(attributes, value, options);
        })
        .on("--help", function() { help("skill"); });

    // Command 'calculate cost'
    Program
        .command("kosten <spalte> <endwert> [startwert]")
        .description("Steigerungskosten berechnen")
        .action(function(column, end, start) {
            Cost.calculate(column, end, start);
        })
        .on("--help", function() { help("cost"); });

    // Command 'search for keyword in topic'
    Program
        .command("suche [thema] [begriff]")
        .description("In einem Thema nach Begriff suchen")
        .option("-u, --ungenau", "Ungenaue Suche durchführen")
        .option("-r, --raten", "Suchergebnis raten")
        .action(function(topic, phrase, options) {
            Search.find(topic, phrase, options);
        })
        .on("--help", function() { help("search"); });

    // Command 'update search database'
    Program
        .command("aktualisiere [thema]")
        .description("Daten aktualisieren")
        .option("-e, --erzwingen", "Aktualisierung erzwingen")
        .option("-s, --schnell", "Mehr Verbindungen erlauben")
        .action(function(topic, options) {
            Update.start(topic, options);
        })
        .on("--help", function() { help("update"); });

    // General program properties
    Program
        .version("0.0.1")
        .description("Kommandozeilen-Tools für 'Das Schwarze Auge'")
        .on("--help", function() {
            help("dice");
            help("skill", true);
            help("update", true);
            help("search", true);
        })
        .parse(process.argv);

    // Display help on default
    if (!Program.args.length) { Program.help(); }

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
            case "dice":
                Log.line("    $ dsa w20 3 -m -2");
                Log.line("    $ dsa w6 2 --mod 6");
                break;
            case "skill":
                Log.line("    $ dsa probe 13/16/14 6 -m -1");
                Log.line("    $ dsa probe 14/13/15 9 -s 7 --mod 1");
                Log.line("    $ dsa probe 12/13/11 4 --wahrscheinlich");
                break;
            case "cost":
                Log.line("    $ dsa kosten e 15");
                Log.line("    $ dsa kosten b 14 12");
                break;
            case "update":
                Log.line("    $ dsa aktualisiere vorteil");
                Log.line("    $ dsa aktualisiere kampf -s");
                Log.line("    $ dsa aktualisiere --erzwingen");
                break;
            case "search":
                Log.line("    $ dsa suche");
                Log.line("    $ dsa suche kultur");
                Log.line("    $ dsa suche zauber ignifaxius");
                Log.line("    $ dsa suche kampf wucht --raten");
                Log.line("    $ dsa suche vorteil \"verbessert leben\" -ru");
                Log.line("    $ dsa suche nachteil \"schlechte energie\" -u");
                break;
        }
        Log.empty();
    }

})();
