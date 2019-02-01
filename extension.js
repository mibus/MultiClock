// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// @author: <a href="mailto:mibus@mibus.org">Robert Mibus</a>
// GPLv2+

const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const GLib = imports.gi.GLib;
const GnomeDesktop = imports.gi.GnomeDesktop;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const UPDATE_INTERVAL = 5000;

const Timezones = [
    'UTC',
    'America/Los_Angeles',
    'Australia/Adelaide',
    'Australia/Perth',
    'Australia/Melbourne',
    'Australia/Sydney',
    'Pacific/Auckland',
];

const AltTimeMenuButton = new Lang.Class({
	Name: 'AltTimeMenuButton',
	Extends: PanelMenu.Button,

    _schema: null,
    _clock_settings: null,
    selected_tz: null,

    _init: function() {

        let item;

        let menuAlignment = 0.25;
        this.parent(menuAlignment);

        this._clockDisplay = new St.Label({text: 'Initialising', opacity: 150});
        this.actor.add_actor(this._clockDisplay);
	this.actor.set_y_align(Clutter.ActorAlign.CENTER);

	for (var i = 0; i < Timezones.length; i++) {
		let tz = Timezones[i];
		this.menu.addAction (
			tz,
			Lang.bind(this, function () {
				this.set_tz (tz);
			}));
	}

        this._clock = new GnomeDesktop.WallClock();

        this._schema = Convenience.getSettings();
	this._clock_settings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });

	let tzid = this._schema.get_string('timezone');
	this.set_tz (tzid);
    },

    set_tz: function (tzid) {
	this.selected_tz = GLib.TimeZone.new(tzid);
	this.update_time();
	this._schema.set_string('timezone', tzid);
    },

    get_alternate_time_string: function() {
	if (!this.selected_tz)
	    return "Initialising";

        var now = GLib.DateTime.new_now(this.selected_tz);
	if (this._clock_settings.get_enum('clock-format')) { // 12-Hour
		var remote_time = now.format('%l:%M %p %Z');
	} else { // 24-Hour
		var remote_time = now.format('%R %Z');
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
	global.log ('GNOME-Shell 3.6+ detected...');
	Main.panel.addToStatusArea('multiclock',this.button,1,'center');
	Main.panel.menuManager.addMenu(this.button.menu);
    },

    disable: function() {
	Main.panel.menuManager.removeMenu(this.button.menu);
	Main.panel._centerBox.remove_actor(this.button.container);
	if (Main.panel.statusArea.hasOwnProperty('multiclock')) {
		delete Main.panel.statusArea['multiclock'];
	}
        this.button.disable();
    }
}

function init(meta) {
    global.log("Starting up MultiClock!");

    return new MultiClock();
}

