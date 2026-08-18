# FHS user environment for deno desktop CEF (laufey) on NixOS.
# Prebuilt Chromium expects a traditional /lib layout; mkShell LD_LIBRARY_PATH
# mixes Nix Mesa with bundled libEGL and causes GL symbol failures.
#
# Build: nix-build desktop/fhs.nix -o desktop/.fhs-run
# Run:   desktop/.fhs-run/bin/smoovdeck bash desktop/run-nix.sh
{ pkgs ? import <nixpkgs> {} }:
pkgs.buildFHSEnv {
  name = "smoovdeck";
  targetPkgs = pkgs:
    with pkgs; [
      bash
      coreutils
      gcc
      binutils
      gtk3
      glib
      pango
      cairo
      gdk-pixbuf
      atk
      at-spi2-core
      cups
      libdrm
      libxkbcommon
      nss
      nspr
      sqlite
      alsa-lib
      libx11
      libxcomposite
      libxdamage
      libxext
      libxfixes
      libxrandr
      libxi
      libxcb
      libxshmfence
      libxscrnsaver
      libgbm
      mesa
      libGL
      vulkan-loader
      wayland
      wayland-protocols
      expat
      dbus
      systemd
      fontconfig
      freetype
      libpulseaudio
      krb5
      gsettings-desktop-schemas
      stdenv.cc.cc.lib
      libuuid
      util-linux
    ];
  runScript = "bash";
}
