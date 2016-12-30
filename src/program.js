/*jshint esversion: 6 */

/*
 * Command:
 * w20 [würfel]
 */
program
    .command("w20 [würfel]")
    .description("Anzahl an W20 würfeln")
    .action(Commands.w20);

/*
 * Command:
 * w6 [-p, --plus <bonus>] [-m, --minus <malus>] [würfel]
 */
program
    .command("w6 [würfel]")
    .description("Anzahl an W6 würfeln")
    .option("-p, --plus <bonus>", "Bonus zur Summe der Würfel")
    .option("-m, --minus <malus>", "Malus zur Summe der Würfel")
    .action(Commands.w6);

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
program.version(VERSION).parse(process.argv);
