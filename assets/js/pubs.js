"use strict";

// Perform setup before the full page is loaded.  Since almost none of
// the DOM exists as this point, this mostly sets up event handlers to
// do later DOM manipulation.
function pubs_init() {
    var first_nav = true;

    $(document).on('click', '.pub .pub-meta', function(ev) {
        if (first_nav) {
            // On the first user-initiated navigation, disable
            // scrolling to the targeted publication by hiding the
            // target elements.  This way, the browser will still
            // scroll to the right element when the user follows a
            // link to a publication, but once they're on the page, we
            // can still use fragments, but also prevent scrolling.
            // Since the document may still be loading, use style
            // injection.  (Unfortunately, we can't do this in
            // onhashchange because that happens after scrolling.)
            $('<style>.pub-id {display:none;}</style>').appendTo('head');
            first_nav = false;
        }

        var target = $('.pub-expand', this).attr('href');
        if (window.location.hash !== target) {
            // Expand the publication.  Use 'replace' to avoid piling
            // up useless browser history.  (Note that this all works
            // even if the user clicked the expand button.)
            window.location.replace(target);
        } else {
            // Collapse publication
            window.location.replace('#/');
        }
    });

    $(document).on('click', '.pub-links', function(ev) {
        // *Don't* trigger the above event handler if the user clicked
        // on a genuine link.  Otherwise when the come back to this
        // page, things will have shifted.
        ev.stopPropagation();
    });

    $(document).on('click', '.pub-collapse', function(ev) {
        // Tweak collapse button behavior to be consistent with
        // expanding done above.
        window.location.replace('#/');
        // Don't let the browser follow the href itself, and don't
        // trigger the publication click.
        ev.preventDefault();
        ev.stopPropagation();
    });

    // Indicate publications are clickable
    $('<style>.pub .pub-meta {cursor: pointer;}</style>').
        appendTo('head');

    // Add popover for link groups
    $(document).on('click', '.pub-links-combined', function(ev) {
        // The DOM didn't exist when we registered the event handler,
        // so we create the popovers on the fly.  Once we've done
        // this, the popover takes care of itself.
        if (this.__pubs_popup === undefined) {
            this.__pubs_popup = true;
            var jthis = $(this);
            var title = jthis.attr('title');
            var popover = $('<div>'), any = false;
            // Find the links we're collapsing into the popover
            jthis.nextAll('a.pub-links-multi').each(function() {
                var parts = $(this).attr('title').match(/([^(]+) \(([^)]+)\)/);
                if (parts && parts[1] === title) {
                    if (any)
                        popover.append(document.createTextNode('\u00a0\u00a0'));
                    any = true;
                    popover.append($('<a>').attr('href', $(this).attr('href')).
                                   text(parts[2]));
                }
            });
            // Create popover.  We temporarily clear the element's
            // title, lest the popover steal it for its title.
            jthis.attr('title', '').
                popover({html: true, placement: 'left',
                         content: popover.html()}).popover('toggle').
                attr('title', title);
        }
        return false;
    });

    // Now that we've enabled popovers, hide expanded link groups and
    // show combined popover links
    $('<style>.pub-links-combined {display: inline;} .pub-links-multi {display:none;}</style>').
        appendTo('head');
}

pubs_init();

$(document).ready(function() {
    // Document is loaded.  Map each pub to its heading.
    var pubsHeadings = $('.pub, h2');
    var headings = [];
    var lastHeading = null;

    pubsHeadings.each(function() {
        if ($(this).hasClass('pub'))
            headings.push(lastHeading);
        else
            lastHeading = this;
    });

    // Get search from query string, if any
    // XXX Use replaceState to update this when the user searches
    var initialSearch = undefined;
    var qsArgs = location.search.slice(1).split('&');
    for (var i = 0; !initialSearch && i < qsArgs.length; i++) {
        var parts = qsArgs[i].split('=');
        if (decodeURIComponent(parts[0]) === 'search')
            initialSearch = decodeURIComponent(parts[1]);
    }

    // Create publications filter
    function getText(item) {
        return {'': $(item).text(), 'key': item.getAttribute('data-key')};
    }

    function onFilterChange(pubs, matched) {
        // Hide all headings
        for (var i = 0; i < headings.length; i++)
            headings[i].style.display = 'none';

        // Show/hide matched pubs and show headings
        var any = false;
        for (var i = 0; i < pubs.length; i++) {
            pubs[i].style.display = matched[i] ? '' : 'none';
            if (matched[i]) {
                any = true;
                headings[i].style.display = '';
            }
        }

        if (any)
            $('#no-matches').hide();
        else
            $('#no-matches').show();
    }

    new Quickfilter(
        $('.pub'), $('#filter'),
        [new Quickfilter.FreeText('search metadata', getText,
                                  {initial: initialSearch,
                                   autofocus: true}),
         new Quickfilter.Categorical('Topic', 'data-topic'),
         new Quickfilter.Categorical('Type', 'data-type')],
        onFilterChange);
});
