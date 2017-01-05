/**
 * Globals module, provides global constants.
 * @returns {Object} Public interface
 */
var G = (function() {
    return {
        STR: {
            PH              : "$1",
            HEAD_L          : "{{",
            HEAD_R          : "}}",
            BOLD_L          : "[[",
            BOLD_R          : "]]",
            ITAL_L          : "((",
            ITAL_R          : "))",
            BULLET          : ". ",
            DELIMITER       : "/"
        },
        REGEX: {
            HEAD            : /\{\{([\s\S]*?)\}\}/g,
            BOLD            : /\[\[([\s\S]*?)\]\]/g,
            ITAL            : /\(\(([\s\S]*?)\)\)/g,
            IGNORE          : /\[\[|\]\]|\{\{|\}\}|\(\(|\)\)/g,
            REMOVE          : /I-.*(I|V|X)|\(\*\)|\.\.\.|\*/g
        }
    };
})();
