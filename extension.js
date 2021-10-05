// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// @author: <a href="mailto:mibus@mibus.org">Robert Mibus</a>
// GPLv2

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
    'Africa/Abidjan',
    'Africa/Algiers',
    'Africa/Bissau',
    'Africa/Cairo',
    'Africa/Casablanca',
    'Africa/Ceuta',
    'Africa/El_Aaiun',
    'Africa/Johannesburg',
    'Africa/Juba',
    'Africa/Khartoum',
    'Africa/Lagos',
    'Africa/Maputo',
    'Africa/Monrovia',
    'Africa/Nairobi',
    'Africa/Ndjamena',
    'Africa/Sao_Tome',
    'Africa/Tripoli',
    'Africa/Tunis',
    'Africa/Windhoek',
    'America/Adak',
    'America/Anchorage',
    'America/Araguaina',
    'America/Argentina/Buenos_Aires',
    'America/Argentina/Catamarca',
    'America/Argentina/Cordoba',
    'America/Argentina/Jujuy',
    'America/Argentina/La_Rioja',
    'America/Argentina/Mendoza',
    'America/Argentina/Rio_Gallegos',
    'America/Argentina/Salta',
    'America/Argentina/San_Juan',
    'America/Argentina/San_Luis',
    'America/Argentina/Tucuman',
    'America/Argentina/Ushuaia',
    'America/Asuncion',
    'America/Bahia',
    'America/Bahia_Banderas',
    'America/Barbados',
    'America/Belem',
    'America/Belize',
    'America/Boa_Vista',
    'America/Bogota',
    'America/Boise',
    'America/Cambridge_Bay',
    'America/Campo_Grande',
    'America/Cancun',
    'America/Caracas',
    'America/Cayenne',
    'America/Chicago',
    'America/Chihuahua',
    'America/Costa_Rica',
    'America/Cuiaba',
    'America/Danmarkshavn',
    'America/Dawson',
    'America/Dawson_Creek',
    'America/Denver',
    'America/Detroit',
    'America/Edmonton',
    'America/Eirunepe',
    'America/El_Salvador',
    'America/Fort_Nelson',
    'America/Fortaleza',
    'America/Glace_Bay',
    'America/Goose_Bay',
    'America/Grand_Turk',
    'America/Guatemala',
    'America/Guayaquil',
    'America/Guyana',
    'America/Halifax',
    'America/Havana',
    'America/Hermosillo',
    'America/Indiana/Indianapolis',
    'America/Indiana/Knox',
    'America/Indiana/Marengo',
    'America/Indiana/Petersburg',
    'America/Indiana/Tell_City',
    'America/Indiana/Vevay',
    'America/Indiana/Vincennes',
    'America/Indiana/Winamac',
    'America/Inuvik',
    'America/Iqaluit',
    'America/Jamaica',
    'America/Juneau',
    'America/Kentucky/Louisville',
    'America/Kentucky/Monticello',
    'America/La_Paz',
    'America/Lima',
    'America/Los_Angeles',
    'America/Maceio',
    'America/Managua',
    'America/Manaus',
    'America/Martinique',
    'America/Matamoros',
    'America/Mazatlan',
    'America/Menominee',
    'America/Merida',
    'America/Metlakatla',
    'America/Mexico_City',
    'America/Miquelon',
    'America/Moncton',
    'America/Monterrey',
    'America/Montevideo',
    'America/New_York',
    'America/Nipigon',
    'America/Nome',
    'America/Noronha',
    'America/North_Dakota/Beulah',
    'America/North_Dakota/Center',
    'America/North_Dakota/New_Salem',
    'America/Nuuk',
    'America/Ojinaga',
    'America/Panama',
    'America/Pangnirtung',
    'America/Paramaribo',
    'America/Phoenix',
    'America/Port-au-Prince',
    'America/Porto_Velho',
    'America/Puerto_Rico',
    'America/Punta_Arenas',
    'America/Rainy_River',
    'America/Rankin_Inlet',
    'America/Recife',
    'America/Regina',
    'America/Resolute',
    'America/Rio_Branco',
    'America/Santarem',
    'America/Santiago',
    'America/Santo_Domingo',
    'America/Sao_Paulo',
    'America/Scoresbysund',
    'America/Sitka',
    'America/St_Johns',
    'America/Swift_Current',
    'America/Tegucigalpa',
    'America/Thule',
    'America/Thunder_Bay',
    'America/Tijuana',
    'America/Toronto',
    'America/Vancouver',
    'America/Whitehorse',
    'America/Winnipeg',
    'America/Yakutat',
    'America/Yellowknife',
    'Antarctica/Casey',
    'Antarctica/Davis',
    'Antarctica/Macquarie',
    'Antarctica/Mawson',
    'Antarctica/Palmer',
    'Antarctica/Rothera',
    'Antarctica/Troll',
    'Antarctica/Vostok',
    'Asia/Almaty',
    'Asia/Amman',
    'Asia/Anadyr',
    'Asia/Aqtau',
    'Asia/Aqtobe',
    'Asia/Ashgabat',
    'Asia/Atyrau',
    'Asia/Baghdad',
    'Asia/Baku',
    'Asia/Bangkok',
    'Asia/Barnaul',
    'Asia/Beirut',
    'Asia/Bishkek',
    'Asia/Brunei',
    'Asia/Chita',
    'Asia/Choibalsan',
    'Asia/Colombo',
    'Asia/Damascus',
    'Asia/Dhaka',
    'Asia/Dili',
    'Asia/Dubai',
    'Asia/Dushanbe',
    'Asia/Famagusta',
    'Asia/Gaza',
    'Asia/Hebron',
    'Asia/Ho_Chi_Minh',
    'Asia/Hong_Kong',
    'Asia/Hovd',
    'Asia/Irkutsk',
    'Asia/Jakarta',
    'Asia/Jayapura',
    'Asia/Jerusalem',
    'Asia/Kabul',
    'Asia/Kamchatka',
    'Asia/Karachi',
    'Asia/Kathmandu',
    'Asia/Khandyga',
    'Asia/Kolkata',
    'Asia/Krasnoyarsk',
    'Asia/Kuala_Lumpur',
    'Asia/Kuching',
    'Asia/Macau',
    'Asia/Magadan',
    'Asia/Makassar',
    'Asia/Manila',
    'Asia/Nicosia',
    'Asia/Novokuznetsk',
    'Asia/Novosibirsk',
    'Asia/Omsk',
    'Asia/Oral',
    'Asia/Pontianak',
    'Asia/Pyongyang',
    'Asia/Qatar',
    'Asia/Qostanay',
    'Asia/Qyzylorda',
    'Asia/Riyadh',
    'Asia/Sakhalin',
    'Asia/Samarkand',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Srednekolymsk',
    'Asia/Taipei',
    'Asia/Tashkent',
    'Asia/Tbilisi',
    'Asia/Tehran',
    'Asia/Thimphu',
    'Asia/Tokyo',
    'Asia/Tomsk',
    'Asia/Ulaanbaatar',
    'Asia/Urumqi',
    'Asia/Ust-Nera',
    'Asia/Vladivostok',
    'Asia/Yakutsk',
    'Asia/Yangon',
    'Asia/Yekaterinburg',
    'Asia/Yerevan',
    'Atlantic/Azores',
    'Atlantic/Bermuda',
    'Atlantic/Canary',
    'Atlantic/Cape_Verde',
    'Atlantic/Faroe',
    'Atlantic/Madeira',
    'Atlantic/Reykjavik',
    'Atlantic/South_Georgia',
    'Atlantic/Stanley',
    'Australia/Adelaide',
    'Australia/Brisbane',
    'Australia/Broken_Hill',
    'Australia/Darwin',
    'Australia/Eucla',
    'Australia/Hobart',
    'Australia/Lindeman',
    'Australia/Lord_Howe',
    'Australia/Melbourne',
    'Australia/Perth',
    'Australia/Sydney',
    'Europe/Amsterdam',
    'Europe/Andorra',
    'Europe/Astrakhan',
    'Europe/Athens',
    'Europe/Belgrade',
    'Europe/Berlin',
    'Europe/Brussels',
    'Europe/Bucharest',
    'Europe/Budapest',
    'Europe/Chisinau',
    'Europe/Copenhagen',
    'Europe/Dublin',
    'Europe/Gibraltar',
    'Europe/Helsinki',
    'Europe/Istanbul',
    'Europe/Kaliningrad',
    'Europe/Kiev',
    'Europe/Kirov',
    'Europe/Lisbon',
    'Europe/London',
    'Europe/Luxembourg',
    'Europe/Madrid',
    'Europe/Malta',
    'Europe/Minsk',
    'Europe/Monaco',
    'Europe/Moscow',
    'Europe/Oslo',
    'Europe/Paris',
    'Europe/Prague',
    'Europe/Riga',
    'Europe/Rome',
    'Europe/Samara',
    'Europe/Saratov',
    'Europe/Simferopol',
    'Europe/Sofia',
    'Europe/Stockholm',
    'Europe/Tallinn',
    'Europe/Tirane',
    'Europe/Ulyanovsk',
    'Europe/Uzhgorod',
    'Europe/Vienna',
    'Europe/Vilnius',
    'Europe/Volgograd',
    'Europe/Warsaw',
    'Europe/Zaporozhye',
    'Europe/Zurich',
    'Indian/Chagos',
    'Indian/Christmas',
    'Indian/Cocos',
    'Indian/Kerguelen',
    'Indian/Mahe',
    'Indian/Maldives',
    'Indian/Mauritius',
    'Indian/Reunion',
    'Pacific/Apia',
    'Pacific/Auckland',
    'Pacific/Bougainville',
    'Pacific/Chatham',
    'Pacific/Chuuk',
    'Pacific/Easter',
    'Pacific/Efate',
    'Pacific/Fakaofo',
    'Pacific/Fiji',
    'Pacific/Funafuti',
    'Pacific/Galapagos',
    'Pacific/Gambier',
    'Pacific/Guadalcanal',
    'Pacific/Guam',
    'Pacific/Honolulu',
    'Pacific/Kanton',
    'Pacific/Kiritimati',
    'Pacific/Kosrae',
    'Pacific/Kwajalein',
    'Pacific/Majuro',
    'Pacific/Marquesas',
    'Pacific/Nauru',
    'Pacific/Niue',
    'Pacific/Norfolk',
    'Pacific/Noumea',
    'Pacific/Pago_Pago',
    'Pacific/Palau',
    'Pacific/Pitcairn',
    'Pacific/Pohnpei',
    'Pacific/Port_Moresby',
    'Pacific/Rarotonga',
    'Pacific/Tahiti',
    'Pacific/Tarawa',
    'Pacific/Tongatapu',
    'Pacific/Wake',
    'Pacific/Wallis',
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
