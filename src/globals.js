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
            NL              : "\n",
            TAB             : "\t",
            SPACE           : " ",
            BULLET          : ". ",
            ALERT           : "‼",
            QUOTE_LEFT      : "„",
            QUOTE_RIGHT     : "“",
            BRACK_LEFT      : "[",
            BRACK_RIGHT     : "]",
            PAREN_LEFT      : "(",
            PAREN_RIGHT     : ")",
            HYPHEN          : " — ",
            QUAL            : "QS",
            SUM             : "Σ",
            COLON           : ":",
            TIMES           : "×",
            PLUS            : "+",
            MINUS           : "-",
            PLUSMINUS       : "±",
            DELIMITER       : "/",
            DICE            : "d",
            TIC             : "."
        },
        REGEX: {
            PH              : "$1",
            TITLE           : /\+\+(.*?)\+\+/g,
            BOLD            : /==(.*?)==/g,
            ITALIC          : /--(.*?)--/g,
            PARA            : /__/g,
            HASH            : /#(?!#)/g,
            LVL             : / I-.*(I|V|X)/,
            STAR            : / \(\*\)/,
            DOTS            : / \.\.\./
        }
    };
})();
