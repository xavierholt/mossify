# Mossify

This is a  [WebExtension][webx]  that enhances the  web UI  of the  [Moss][moss]
plagiarism detector.  It's developed on Firefox, but should also work in Chrome,
Safari, Opera, and Edge.

It adds the following features to the main results page:

- Match percentages are separated out and colorized for better readability.
- The results table is now sortable by clicking the column headers.
- The results table can now be filtered by filename.
- Results can be downloaded as JSON or CSV files.

![Screenshot of the Mossify submission table.](table.png)

It also adds a graph view to help identify clusters of submissions:

![Screenshot of the Mossify submission graph.](graph.png)


## Installing

Mossify is currently a beta version.  I'll have official packages soon.


## Installing for Development

The instructions below assume that you have this repository cloned locally. Code
changes you make after following them will _not_ be picked up automatically; you
will need to use the "Reload" button on your browser's extension page,  and then
refresh the Moss page you are viewing.

### Firefox

This installs Mossify as a  temporary/development add-on, as in the instructions
for the  [your first extension][ffex] tutorial.  These temporary extensions will
be uninstalled when you restart your browser.

- Enter `about:debugging` in the URL bar.
- Click "This Firefox" in the sidebar.
- Click the "Load Temporary Add-on..." button.
- When prompted, select the `src/manifest.json` file.

### Chrome

This loads Mossify as an "unpacked" extension, as in the [getting started][crex]
tutorial.  These unpacked extensions seem to persist across browser restarts.

- Enter `chrome://extensions` in the URL bar.
- Enable "Developer mode" in the top right corner.
- Click the "Load unpacked" button.
- When prompted, select the `src` folder.


[crex]: <https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked>
[ffex]: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#trying_it_out>
[webx]: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions>
[moss]: <http://moss.stanford.edu>
