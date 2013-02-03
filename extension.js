// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// @author: <a href="mailto:mibus@mibus.org">Robert Mibus</a>
// GPLv2+

const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;

const UPDATE_INTERVAL = 5000;

const AltTimeMenuButton = new Lang.Class({
	Name: 'AltTimeMenuButton',
	Extends: PanelMenu.Button,

    _init: function() {
        let item;
        let hbox;
        let vbox;

        let menuAlignment = 0.25;
        this.parent(menuAlignment);

        this._clockDisplay = new St.Label({text: 'Initialising', opacity: 150});
        this.actor.add_actor(this._clockDisplay);

        item = this.menu.addSettingsAction(_("Date and Time Settings"), 'gnome-datetime-panel.desktop');
//        this._clock = new GnomeDesktop.WallClock();
    },


    get_alternate_time_string: function() {
        var now = new Date();

	// TODO: Make these configurable
	var hour_offset = 8;
	var minute_offset = 0;

	// Start with UTC
	var hour = now.getUTCHours();
	var minute = now.getUTCMinutes();
	var tzname = 'WST';

	// Apply offsets in a naive fashion
	hour += hour_offset;
	minute += minute_offset;

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

	var remote_time = hour + ":" + (minute < 10 ? "0" : "") + minute + ' ' + tzname;

	return remote_time;
    },

    enable: function() {
        this.run = true;
        this.on_timeout();
        Mainloop.timeout_add(UPDATE_INTERVAL, Lang.bind(this, this.on_timeout));
    },

    disable: function() {
        this.run = false;
    },

    on_timeout: function() {
        this._clockDisplay.set_text(this.get_alternate_time_string());
        return this.run;
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
	global.log (this.button);
        this.button.enable();
	Main.panel._centerBox.insert_child_at_index(this.button.container, 1);
    },

    disable: function() {
	Main.panel._centerBox.remove_actor(this.button.container);
        this.button.disable();
    }
}

function init(meta) {
    global.log("Starting up MultiClock!");

    return new MultiClock();
}

