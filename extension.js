/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details.
 * 
 * @author: <a href="mailto:mibus@mibus.org">Robert Mibus</a>
 *
 * Based heavily on "Fuzzy Clock" - https://bitbucket.org/dallagi/fuzzy-clock/overview
 * (by Marco Dallagiacoma - marco.dallagiacoma@gmail.com)
 */ 

const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Lang = imports.lang;

const UPDATE_INTERVAL = 5000;

function MultiClock() {
    this._init();
}

MultiClock.prototype = {
    _init: function() {
        this.date_menu = Main.panel._dateMenu;
        this.orig_clock = this.date_menu._clock;
        this.multi_clock = new St.Label();
    },

    Run: function() {
        this.run = true;
        this.on_timeout();
        Mainloop.timeout_add(UPDATE_INTERVAL, Lang.bind(this, this.on_timeout));
    },

    MultiHour: function() {
        let now = new Date();

	local_time = now.toDateString() + "   ||   " + now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
	remote_time = ((now.getUTCHours() + 8) % 24) + ":" + (now.getUTCMinutes() < 10 ? "0" : "") + now.getUTCMinutes();

	return local_time + " (" + remote_time + ")";
    },

    on_timeout: function() {
        this.multi_clock.set_text(this.MultiHour());

        return this.run;
    },

    enable: function() {
        this.date_menu.actor.remove_actor(this.orig_clock);
        this.date_menu.actor.add_actor(this.multi_clock);

        this.Run();
    },

    disable: function() {
        this.run = false;

        this.date_menu.actor.remove_actor(this.multi_clock);
        this.date_menu.actor.add_actor(this.orig_clock);
    }
}

function init(meta) {
    global.log("Starting up MultiClock!");

    return new MultiClock();
}

