/**
 * Globals module, provides global constants.
 * @returns {Object} Public interface
 */
var G = (function() {
    return {
        STR: {
            TITLE           : "++",
            BOLD            : "==",
            PARA            : "__",
            ITALIC          : "--",
            BULLET          : ". ",
            DELIMITER       : "/"
        },
        REGEX: {
            PH              : "$1",
            TITLE           : /\+\+(.*?)\+\+/g,
            BOLD            : /==(.*?)==/g,
            ITALIC          : /--(.*?)--/g,
            PARA            : /__/g,
            IGNORE          : /\+\+|==|--|__/g,
            HASH            : /#(?!#)/g,
            LVL             : / I-.*(I|V|X)/,
            STAR            : / \(\*\)/,
            DOTS            : / \.\.\./
        }
    };
})();
