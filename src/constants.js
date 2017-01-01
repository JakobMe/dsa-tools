/**
 * DSA-Tools CLI.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */

// Number constants
var MOD_MIN             = 0;
var SKILL_MIN           = 0;
var ATTR_MIN            = 0;
var ROLLS_MIN           = 1;
var ROLLS_ATTR          = 3;
var ROLLS_TO_CRIT       = 2;
var D_20                = 20;
var ROLL_SLIP           = 20;
var ROLL_CRIT           = 1;
var QUAL_MULTIPLY       = 2;
var QUAL_DIVIDE         = 3;
var QUAL_MAX            = 6;
var QUAL_MIN            = 0;
var QUAL_SUCCESS        = 1;

// Code constants
var C_T                 = "##";
var C_B                 = "==";
var C_P                 = "__";

// Regex constants
var REGEX_REPLACE       = "$1";
var REGEX_H             = /##(.*?)##/g;
var REGEX_B             = /==(.*?)==/g;
var REGEX_P             = /__/g;
