/*jshint esversion: 6 */

/*
 * Command:
 * w20 [rolls]
 */
program
    .command("w20 [rolls]")
    .description("roll w20 dice")
    .action(Commands.w20);

/*
 * Command:
 * w6 [-p, --plus <bonus>] [-m, --minus <malus>] [rolls]
 */
program
    .command("w6 [rolls]")
    .description("roll w6 dice")
    .option("-p, --plus <bonus>", "bonus to sum of rolls")
    .option("-m, --minus <malus>", "malus to sum of rolls")
    .action(Commands.w6);

/*
 * Command:
 * skill [-m, --minus <malus>] [-p, --plus <bonus>]
 * [-r, --repeat <times>] <attr> <value>
 */
program
    .command("skill <attr> <value>")
    .description("make a skill-check")
    .option("-r, --repeat <times>", "repeat skill-check")
    .option("-m, --minus <malus>", "make skill-check harder by malus")
    .option("-p, --plus <bonus>", "make skill-check easier by bonus")
    .action(Commands.skill);

// Add version and parse
program.version(VERSION).parse(process.argv);
