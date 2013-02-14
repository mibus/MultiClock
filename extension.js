// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// @author: <a href="mailto:mibus@mibus.org">Robert Mibus</a>
// GPLv2+

const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const GnomeDesktop = imports.gi.GnomeDesktop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const UPDATE_INTERVAL = 5000;

const Timezones = {
	'UTC': { hr: 0, min: 0, tzname: 'UTC' },
	'Australia/Adelaide': { hr: 10, min: 30, tzname: 'ACDT' },
	'Australia/Perth': { hr: 8, min: 0, tzname: 'WST' },
};

const AltTimeMenuButton = new Lang.Class({
	Name: 'AltTimeMenuButton',
	Extends: PanelMenu.Button,

    _schema: null,

    _init: function() {
        let item;

        let menuAlignment = 0.25;
        this.parent(menuAlignment);

        this._clockDisplay = new St.Label({text: 'Initialising', opacity: 150});
        this.actor.add_actor(this._clockDisplay);

	this.hour_offset = 8;
	this.minute_offset = 0;
	this.tzname = 'WST';

        item = this.menu.addAction('UTC', Lang.bind(this, function() { this.set_tz (0, 0, 'UTC', 'UTC'); }));
        item = this.menu.addAction('Adelaide', Lang.bind(this, function() { this.set_tz (10, 30, 'CDT', 'Australia/Adelaide'); }));
        item = this.menu.addAction('Perth', Lang.bind(this, function() { this.set_tz (8, 0, 'WST', 'Australia/Perth'); }));

        this._clock = new GnomeDesktop.WallClock();

        this._schema = Convenience.getSettings();
	global.log (this._schema.get_string('tz'));

	let tzid = this._schema.get_string('tz');
	let tz = Timezones[tzid];
	this.set_tz (tz.hr, tz.min, tz.tzname, tzid);
    },

    set_tz: function (hour_offset, minute_offset, tzname, fulltzname) {
	this.hour_offset = hour_offset;
	this.minute_offset = minute_offset;
	this.tzname = tzname;
	this.update_time();
	this._schema.set_string('tz', fulltzname);
    },

    get_alternate_time_string: function() {
        var now = new Date();

	// Start with UTC
	var hour = now.getUTCHours();
	var minute = now.getUTCMinutes();
	var tzname = 'WST';

	// Apply offsets in a naive fashion
	hour += this.hour_offset;
	minute += this.minute_offset;

	// Basic fix-up of minute wrap-around
	if (minute < 0) {
		hour--;
		minute += 60;
	} else if (minute >= 60) {
		hour++;
		minute -= 60;
	}

	// Basic fix-up of hour wrap-around
	if (hour < 0) {
		hour += 24;
	} else if (hour >= 24) {
		hour -= 24;
	}

	var remote_time = hour + ":" + (minute < 10 ? "0" : "") + minute + ' ' + this.tzname;

	return remote_time;
    },

    enable: function() {
        this.clock_signal_id = this._clock.connect('notify::clock', Lang.bind(this, this.update_time));
        this.update_time();
    },

    disable: function() {
	this._clock.disconnect(this.clock_signal_id);
    },

    update_time: function() {
        this._clockDisplay.set_text(this.get_alternate_time_string());
    },

});

function MultiClock() {
    this._init();
}

MultiClock.prototype = {
    button: null,

    _init: function() {
	this.button = new AltTimeMenuButton();
    },

    enable: function() {
        this.button.enable();
	Main.ATMButton = this.button;
	global.log (this.button);
	if (this.button.container) { // 3.6
		global.log ('GNOME-Shell ~3.6 detected...');
		Main.panel._centerBox.add_actor(this.button.container);
		Main.panel.menuManager.addMenu(this.button.menu);
	} else { // 3.4
		global.log ('GNOME-Shell ~3.4 detected...');
		Main.panel._centerBox.add_actor(this.button.actor);
		Main.panel._menus.addMenu(this.button.menu);
	}
    },

    disable: function() {
	if (this.button.container) { // 3.6
		Main.panel.menuManager.removeMenu(this.button.menu);
		Main.panel._centerBox.remove_actor(this.button.container);
	} else { // 3.4
		Main.panel._centerBox.remove_actor(this.button.actor);
		Main.panel._menus.removeMenu(this.button.menu);
	}
        this.button.disable();
    }
}

function init(meta) {
    global.log("Starting up MultiClock!");

    return new MultiClock();
}

