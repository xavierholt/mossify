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

### Firefox

This installs Mossify as a  temporary/development add-on  as in the instructions
for the [your first extension][ffex] tutorial.  If you're doing development work
on Mossify,  use the "Reload" button after following these steps  to get Firefox
to load your latest changes.

- Clone this repository.
- In Firefox, enter `about:debugging` in the URL bar.
- Click "This Firefox" in the sidebar.
- Click the "Load Temporary Add-on..." button.
- When prompted, select the `manifest.json` file.


[ffex]: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#trying_it_out>
[webx]: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions>
[moss]: <http://moss.stanford.edu>
