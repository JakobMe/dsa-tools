/**
 * Globals module, encapsulates all global constants.
 * @returns {Object} Public interface
 */
var G = (function() {
    return {

        // Number constants
        MOD_MIN             : 0,
        SKILL_MIN           : 0,
        ATTR_MIN            : 0,
        ROLLS_MIN           : 1,
        ROLLS_ATTR          : 3,
        ROLLS_TO_CRIT       : 2,
        D_20                : 20,
        ROLL_SLIP           : 20,
        ROLL_CRIT           : 1,
        QUAL_MULTIPLY       : 2,
        QUAL_DIVIDE         : 3,
        QUAL_MAX            : 6,
        QUAL_MIN            : 0,
        QUAL_SUCCESS        : 1,

        // Code constants
        CODE_T              : "++",
        CODE_B              : "==",
        CODE_P              : "__",
        CODE_I              : "--",

        // Regex constants
        REGEX_REPLACE       : "$1",
        REGEX_H             : /\+\+(.*?)\+\+/g,
        REGEX_B             : /==(.*?)==/g,
        REGEX_I             : /--(.*?)--/g,
        REGEX_P             : /__/g,
        REGEX_HASH          : /#(?!#)/g,
        REGEX_LVL           : / I-.*(I|V|X)/,
        REGEX_STAR          : / \(\*\)/,
        REGEX_DOTS          : / \.\.\./
    };
})();
