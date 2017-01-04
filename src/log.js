/**
 * Log module; provides utility function for console log output.
 * @returns {Object} Public interface
 */
var Log = (function() {

    // Modules
    var Terminal = require("terminal-kit").terminal;

    /**
     * Log a single line in console.
     * @param {String} content Content of line
     */
    function line(content) {
        Terminal((content || "") + "\n");
    }

    /**
     * Move n lines back in console.
     * @param {Number} n Number of lines to move back
     */
    function back(n) {
        for (var i = 0; i < (n || 1); i++) {
            Terminal.previousLine(1);
            Terminal.eraseLine();
        }
    }

    /**
     * Log n empty lines in console.
     * @param {Number} n Number of empty lines
     */
    function empty(n) {
        n = typeof n !== "number" ? 1 : n;
        for (var i = 0; i < n; i++) { line(""); }
    }

    /**
     * Log a line with empty lines at top and bottom.
     * @param {String} content Content of line
     * @param {Number} [above] Number of empty lines above
     * @param {Number} [below] Number of empty lines below
     */
    function spaced(content, above, below) {
        empty(above);
        line(content);
        empty(below);
    }

    /**
     * Log a numbered list.
     * @param {String[]} list Array of list items
     */
    function list(list) {
        list.forEach(function(item, i) {
            line((Str.indent(i + 1, list.length) +
                 G.STR.BULLET).grey.dim + item);
        });
    }

    /**
     * Log a shout message.
     * @param {String}  content   Content of message
     * @param {Number}  [size]    Size of list the message belongs to
     * @param {Boolean} [error]   Style as error
     * @param {Boolean} [success] Style as success
     * @param {Number}  [above]   Number of empty lines above
     * @param {Number}  [below]   Number of empty lines below
     */
    function shout(content, size, error, success, above, below) {
        var spaces  = " ".repeat(G.STR.BULLET.length);
        var icon    = Str.indent("‼", size || 0);
            error   = error   || false;
            success = success || false;
            icon    = error ? icon.red : success ? icon.green : icon.grey.dim;
        spaced(icon + spaces + content, above, below);
    }

    /**
     * Log error message.
     * @param {String}  content Content of message
     * @param {Number}  [size]  Size of list the message belongs to
     * @param {Number}  [above] Number of empty lines above
     * @param {Number}  [below] Number of empty lines below
     */
    function error(content, size, above, below) {
        shout(content.red, size, true, false, above, below);
    }

    /**
     * Log hint message.
     * @param {String}  content Content of message
     * @param {Number}  [size]  Size of list the message belongs to
     * @param {Number}  [above] Number of empty lines above
     * @param {Number}  [below] Number of empty lines below
     */
    function hint(content, size, above, below) {
        shout(content.toString().grey.dim, size, false, false, above, below);
    }

    /**
     * Log success message.
     * @param {String}  content Content of message
     * @param {Number}  [size]  Size of list the message belongs to
     * @param {Number}  [above] Number of empty lines above
     * @param {Number}  [below] Number of empty lines below
     */
    function success(content, size, above, below) {
        shout(content.green, size, false, true, above, below);
    }

    // Public interface
    return {
        spaced  : spaced,
        success : success,
        empty   : empty,
        shout   : shout,
        error   : error,
        hint    : hint,
        line    : line,
        list    : list,
        back    : back
    };

})();
