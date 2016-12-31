#!/usr/bin/env node

/**
 * DSA-Tools CLI.
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */

// Modules
var Fuzzy    = require("fuzzysearch");
var Program  = require("commander");
var Colors   = require("colors");
var Path     = require("path");
var Fs       = require("fs");
