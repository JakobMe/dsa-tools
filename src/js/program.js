/**
 * DSA-Tools CLI.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */

/*
 * Command: w<y> [n]
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
            Commands.roll(y, rolls, options);
        });
});

/*
 * Command: probe <probe> <fw>
 * [-m, --minus <x>]
 * [-p, --plus <x>]
 * [-s, --sammel <n>]
 */
Program
    .command("probe <probe> <fw>")
    .description("Fertigkeitsprobe würfeln")
    .option("-m, --minus <x>", "Erleichterung +x")
    .option("-p, --plus <x>", "Erschwernis -x")
    .option("-s, --sammel <n>", "Sammelprobe mit n Versuchen")
    .action(function(attr, val, options) {
        Commands.skill(attr, val, options);
    });

// Add version and parse
Program.version("0.0.1").parse(process.argv);
