// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// @author: <a href="mailto:mibus@mibus.org">Robert Mibus</a>
// GPLv2+

const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const GnomeDesktop = imports.gi.GnomeDesktop;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const UPDATE_INTERVAL = 5000;

// These timezones must be matched in the "tzs" enum in the settings schema
// I might move to using opaque strings rather than an enum in the future, though.
const Timezones = {
	'UTC': { hr: 0, min: 0, tzname: 'UTC' },
        'America/Los Angeles': { hr: -8, min: 0, tzname: 'PST' },
	'America/Los Angeles (Summer)': { hr: -7, min:0, tzname: 'PDT' },
	'Australia/Adelaide': { hr: 9, min: 30, tzname: 'ACDT' },
	'Australia/Adelaide (Summer)': { hr: 10, min: 30, tzname: 'ACDT' },
	'Australia/Perth': { hr: 8, min: 0, tzname: 'WST' },
        'Australia/Melbourne': { hr: 10, min: 0, tzname: 'EST' },
        'Australia/Melbourne (Summer)': { hr: 11, min: 0, tzname: 'AEDT' },
        'Australia/Sydney': { hr: 10, min: 0, tzname: 'EST' },
        'Australia/Sydney (Summer)': { hr: 11, min: 0, tzname: 'AEDT' },
        'Pacific/Auckland': { hr: 12, min: 0, tzname: 'NZST' },
};

const AltTimeMenuButton = new Lang.Class({
	Name: 'AltTimeMenuButton',
	Extends: PanelMenu.Button,

    _schema: null,
    _clock_settings: null,

    _init: function() {

        let item;

        let menuAlignment = 0.25;
        this.parent(menuAlignment);

        this._clockDisplay = new St.Label({text: 'Initialising', opacity: 150});
        this.actor.add_actor(this._clockDisplay);
	this.actor.set_y_align(Clutter.ActorAlign.CENTER);

	for (let tzid in Timezones) {
		// For some reason, the closure isn't created right unless I copy the variable here.
		// Some sort of scoping issue, despite using "let".
		let tz = tzid;
		this.menu.addAction (
			tz,
			Lang.bind(this, function () {
				this.set_tz (tz);
			}));
	}

        this._clock = new GnomeDesktop.WallClock();

        this._schema = Convenience.getSettings();
	this._clock_settings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });

	let tzid = this._schema.get_string('tz');
	this.set_tz (tzid);
    },

    set_tz: function (tzid) {
	this.hour_offset = Timezones[tzid].hr;
	this.minute_offset = Timezones[tzid].min;
	this.tzname = Timezones[tzid].tzname;
	this.update_time();
	this._schema.set_string('tz', tzid);
    },

    get_alternate_time_string: function() {
        var now = new Date();

	// Start with UTC
	var hour = now.getUTCHours();
	var minute = now.getUTCMinutes();
	var tzname = 'UTC';

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

	now.setHours(hour);
	now.setMinutes(minute);
	if (this._clock_settings.get_enum('clock-format')) { // 12-Hour
		var remote_time = Shell.util_format_date('%l:%M %p ', now) + this.tzname;
	} else { // 24-Hour
		var remote_time = Shell.util_format_date('%R ', now) + this.tzname;
	}

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
	if (this.button.container) { // 3.6+
		global.log ('GNOME-Shell 3.6+ detected...');
		Main.panel.addToStatusArea('multiclock',this.button,1,'center');
		Main.panel.menuManager.addMenu(this.button.menu);
	} else { // 3.4
		global.log ('GNOME-Shell ~3.4 detected...');
		Main.panel._centerBox.add_actor(this.button.actor);
		Main.panel._menus.addMenu(this.button.menu);
	}
    },

    disable: function() {
	if (this.button.container) { // 3.6+
		Main.panel.menuManager.removeMenu(this.button.menu);
		Main.panel._centerBox.remove_actor(this.button.container);
		if (Main.panel.statusArea.hasOwnProperty('multiclock')) {
			delete Main.panel.statusArea['multiclock'];
		}
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

