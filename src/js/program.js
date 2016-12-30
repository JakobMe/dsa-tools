/*jshint esversion: 6 */

/*
 * Commands:
 * w<n> [-m, --minus <malus>] [-p, --plus <bonus>] [würfel]
 */
[100, 20, 12, 10, 8, 6, 4, 3, 2].forEach(function(n) {
    program
        .command("w" + n + " [würfel]")
        .description("Anzahl an W" + n + " würfeln")
        .option("-p, --plus <bonus>", "Bonus zur Summe der Würfel")
        .option("-m, --minus <malus>", "Malus zur Summe der Würfel")
        .action(function(rolls, options) {
            Commands.roll(n, rolls, options);
        });
});

/*
 * Command:
 * probe [-m, --minus <malus>] [-p, --plus <bonus>]
 * [-s, --sammel <versuche>] <eigenschaften> <fw>
 */
program
    .command("probe <eigenschaften> <fw>")
    .description("Eine Fertigkeitsprobe würfeln")
    .option("-s, --sammel <versuche>", "Sammelprobe mit Anzahl an Versuchen")
    .option("-m, --minus <malus>", "Erschwernis auf Probe")
    .option("-p, --plus <bonus>", "Erleichterung auf Probe")
    .action(Commands.skill);

// Add version and parse
program.version("0.0.1").parse(process.argv);
