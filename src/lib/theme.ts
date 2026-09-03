/**
 * Light/dark plumbing shared by the server layout and the client toggle.
 *
 * Deliberately NOT a "use client" module: everything a `"use client"` file
 * exports becomes a client reference, so the layout could not read the script
 * string out of the toggle component itself.
 */

export const THEME_KEY = "awraquna-theme";

/** Class placed on <html> for the dark palette (see `@custom-variant dark` in globals.css). */
export const DARK_CLASS = "dark";

/**
 * Inlined in <head> so <html> already carries the right class on the first
 * paint — without it a dark-mode visitor gets a white flash on every load.
 * Falls back to the OS preference until the visitor picks a side.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle(${JSON.stringify(DARK_CLASS)},d);}catch(e){}`;
