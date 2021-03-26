# GNOME-Shell "MultiClock".

It was made because I need to reference Perth time (UTC+8) all the time.

# CONFIGURATION

Click on the displayed "alternate" time; selection from the dropdown is saved for future logins.

# INSTALLATION

```
mkdir -p ~/.local/share/gnome-shell/extensions
cd ~/.local/share/gnome-shell/extensions/
git clone https://github.com/mibus/MultiClock.git MultiClock@mibus.org
```

# DEVELOPING

Just edit the files in ~/.local/share/gnome-shell/extensions/MultiClock@mibus.org/

Under X11, using Alt-F2 to run `r` will cause a gnome-shell reload (and thus pick up the edited extension).

Under Wayland, there's no ability to reload just gnome-shell, so you're better off doing development in a nested environment that you can readily restart:

```
dbus-run-session -- gnome-shell --nested --wayland
```

# LICENSE

This extension is distributed under the terms of the GNU General Public License, version 2 or later. See the LICENSE file for details.
