// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// @author: <a href="mailto:mibus@mibus.org">Robert Mibus</a>
// GPLv2+

const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const ModalDialog = imports.ui.modalDialog;
const GObject = imports.gi.GObject;
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

	// Widget set-up
        this._clockDisplay = new St.Label({text: 'Initialising', opacity: 150});
        this.actor.add_actor(this._clockDisplay);
	this.actor.set_y_align(Clutter.ActorAlign.CENTER);

	// Importing clock-related things from outside
        this._clock = new GnomeDesktop.WallClock();
	this._clock_settings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });

	// Loading our own settings
        this._schema = Convenience.getSettings();
	let tzid = this._schema.get_string('timezone');

	// Making the main timezone selection menu
	var seen_tz = false;
	for (var i = 0; i < Timezones.length; i++) {
		let tz = Timezones[i];
		if (tz == tzid)
			seen_tz = true;
		this.menu.addAction (
			tz,
			Lang.bind(this, function () {
				this.set_tz (tz);
			}));
	}

	// Adding "Other..."
	this.menu.addAction ('Other...',
		Lang.bind(this, function() {
		    var d = new CustomDialog(this);
		    d.open();
		}));

	// Internally loading our stored timezone, including adding it as an extra menu option if appropriate
	if (seen_tz)
		this.set_tz (tzid);
        else
		this.set_custom_tz(tzid);
    },

    set_custom_tz: function (tzid) {
	this.set_tz(tzid);
	this.menu.addAction (tzid,
			Lang.bind(this, function () {
				this.set_tz (tzid);
			}));
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

var CustomDialog = GObject.registerClass(class extends ModalDialog.ModalDialog {
    _init(caller) {
        super._init({ styleClass: 'run-dialog',
                destroyOnClose: false });
	this.caller = caller;
	global.log('Started constructor for CustomDialog.');
        let label = new St.Label({ style_class: 'run-dialog-label',
                                   text: _("Enter a timezone identifier") });

        this.contentLayout.add(label, { x_fill: false,
                                        x_align: St.Align.START,
                                        y_align: St.Align.START });

        let entry = new St.Entry({ style_class: 'run-dialog-entry',
                                   can_focus: true });

        entry.label_actor = label;

	global.log('In constructor for CustomDialog.');
        this._entryText = entry.clutter_text;
        this.contentLayout.add(entry, { y_align: St.Align.START });
        this.setInitialKeyFocus(this._entryText);
        this.setButtons([{ action: this.close.bind(this),
                           label: _("Close"),
                           key: Clutter.Escape }]);
        this._entryText.connect('activate', (o) => {
            this.popModal();
            this._run(o.get_text())
	    this.close();
        });
	global.log('Done CustomDialog constructor');
    }
    _run(input) {
	this.caller.set_custom_tz(input);
    }
    open() {
	global.log('open() for CustomDialog');
        this._entryText.set_text('');
        super.open();
    }
});

function init(meta) {
    global.log("Starting up MultiClock!");

    return new MultiClock();
}

