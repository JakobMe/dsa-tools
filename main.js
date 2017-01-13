// Electron squirrel
if (require("electron-squirrel-startup")) { return; }

/**
 * Main module.
 * @param   {Object} require NPM require module
 * @param   {Object} process Global process object
 * @returns {Object} Public interface
 */
var Main = (function(require, process) {

    // Event constants
    var _EVT_CLOSED            = "closed";
    var _EVT_CLOSED_ALL        = "window-all-closed";
    var _EVT_ACTIVATE          = "activate";
    var _EVT_READY             = "ready";

    // Path constants
    var _PATH_FILE             = "file://";
    var _PATH_INDEX            = "/web/index.html";

    // Window constants
    var _WINDOW_WIDTH          = 840;
    var _WINDOW_HEIGHT         = 560;
    var _WINDOW_MINWIDTH       = 640;
    var _WINDOW_MINHEIGHT      = 480;
    var _WINDOW_CENTER         = true;
    var _WINDOW_TITLE          = "hidden";

    // Misc constants
    var _PLATFORM_DARWIN       = "darwin";

    // Electron components

    var _Electron              = require("electron");
    var _App                   = _Electron.app;
    var _Ipc                   = _Electron.ipcMain;
    var _Window                = _Electron.BrowserWindow;
    var _Menu                  = _Electron.Menu;

    // Windows
    var _windowMain            = null;

    /**
     * Start app.
     */
    function start() {
        _bindEvents();
    }

    /**
     * Bind events.
     */
    function _bindEvents() {
        _App.on(_EVT_ACTIVATE, _createWindowMain);
        _App.on(_EVT_READY, _createWindowMain);
        _App.on(_EVT_CLOSED_ALL, _quitApp);
    }

    /**
     * Create main window.
     */
    function _createWindowMain() {
        if (_windowMain === null) {

            // Create menu
            _createMenu();

            // Create window
            _windowMain = new _Window({
                width         : _WINDOW_WIDTH,
                height        : _WINDOW_HEIGHT,
                center        : _WINDOW_CENTER,
                minWidth      : _WINDOW_MINWIDTH,
                minHeight     : _WINDOW_MINHEIGHT,
                titleBarStyle : _WINDOW_TITLE
            });

            // Load HTML
            _windowMain.loadURL(_PATH_FILE + __dirname + _PATH_INDEX);
            _windowMain.on(_EVT_CLOSED, function() { _windowMain = null; });
        }
    }

    /**
     * Close main window.
     */
    function _closeWindow() {
        _windowMain.close();
    }

    /**
     * Reload main window.
     */
    function _reloadWindow() {
        _windowMain.reload();
    }

    /**
     * Quit app.
     */
    function _quitApp() {
        if (process.platform !== _PLATFORM_DARWIN) { _App.quit(); }
    }

    /**
     * Create app menu.
     */
    function _createMenu() {

        // Menu template
        var template = [
            {
                label: "Aventurische Enzyklopädie",
                submenu: [
                    {
                        label: "Beenden",
                        accelerator: "Command+Q",
                        click: function() { _App.quit(); }
                    }
                ]
            },
            {
                label: "Ablage",
                submenu: [
                    {
                        label: "Fenster schließen",
                        accelerator: "Command+W",
                        click: _closeWindow
                    },
                    {
                        label: "Fenster neu laden",
                        accelerator: "Command+R",
                        click: _reloadWindow
                    }
                ]
            },
            {
                label: "Bearbeiten",
                submenu: [
                    {
                        label: "Widerrufen",
                        accelerator: "Cmd+Z",
                        selector: "undo:"
                    },
                    {
                        label: "Widerholen",
                        accelerator: "Shift+Cmd+Z",
                        selector: "redo:"
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "Ausschneiden",
                        accelerator: "Cmd+X",
                        selector: "cut:"
                    },
                    {
                        label: "Kopieren",
                        accelerator: "Cmd+C",
                        selector: "copy:"
                    },
                    {
                        label: "Einfügen",
                        accelerator: "Cmd+V",
                        selector: "paste:"
                    },
                    {
                        label: "Alles auswählen",
                        accelerator: "Cmd+A",
                        selector: "selectAll:"
                    }
                ]
            }
        ];

        // Set menu
        _Menu.setApplicationMenu(_Menu.buildFromTemplate(template));
    }

    // Public interface
    return { start: start };

})(require, process);

// Start app
Main.start();
