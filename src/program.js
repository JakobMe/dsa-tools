(function(){
    /*
     * Command:
     * w<y> [n]
     * [-m, --minus <x>]
     * [-p, --plus <x>]
     */
    [100, 20, 12, 10, 8, 6, 4, 3, 2].forEach(function(y) {
        Program
            .command("w" + y + " [n]")
            .description("nW" + y + " würfeln")
            .option("-m, --minus <x>", "Summe -x")
            .option("-p, --plus <x>", "Summe +x")
            .action(function(rolls, options) {
                Dice.roll(y, rolls, options);
            });
    });

    /*
     * Command: probe
     * <probe> <fw>
     * [-m, --minus <x>]
     * [-p, --plus <x>]
     * [-s, --sammel <n>]
     */
    Program
        .command("probe <probe> <fw>")
        .description("Fertigkeitsprobe würfeln")
        .option("-m, --minus <x>", "Erschwernis -x")
        .option("-p, --plus <x>", "Erleichterung +x")
        .option("-s, --sammel <n>", "Sammelprobe mit n Versuchen")
        .action(function(attr, val, options) {
            Dice.skill(attr, val, options);
        });

    /*
     * Command: suche
     * [thema] [begriff]
     * [-f, --fuzzy]
     */
    Program
        .command("suche [thema] [begriff]")
        .description("Thema nach einem Begriff durchsuchen")
        .option("-f, --fuzzy", "Ungefähre Suche benutzen")
        .option("-b, --beste", "Bestes Suchergebnis anzeigen")
        .action(function(topic, keyword, options) {
            Search.find(topic, keyword, options);
        });

    /*
     * Command: update [-f, --force]
     */
    Program
        .command("update [thema]")
        .description("Regeln aktualisieren")
        .option("-f, --force", "Aktualisierung erzwingen")
        .action(function(topic, options) {
            Update.start(topic, options);
        });

    // Add version and parse
    Program.version("0.0.1").parse(process.argv);
})();
