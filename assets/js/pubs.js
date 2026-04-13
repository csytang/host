"use strict";

// Perform setup before the full page is loaded. Since almost none of
// the DOM exists at this point, this mostly sets up event handlers to
// do later DOM manipulation.
function pubs_init() {
    var first_nav = true;

    $(document).on('click', '.pub .pub-meta', function(ev) {
        if (first_nav) {
            $('<style>.pub-id {display:none;}</style>').appendTo('head');
            first_nav = false;
        }

        var target = $('.pub-expand', this).attr('href');
        if (window.location.hash !== target) {
            window.location.replace(target);
        } else {
            window.location.replace('#/');
        }
    });

    $(document).on('click', '.pub-links', function(ev) {
        ev.stopPropagation();
    });

    $(document).on('click', '.pub-collapse', function(ev) {
        window.location.replace('#/');
        ev.preventDefault();
        ev.stopPropagation();
    });

    $('<style>.pub .pub-meta {cursor: pointer;}</style>').appendTo('head');

    $(document).on('click', '.pub-links-combined', function(ev) {
        if (this.__pubs_popup === undefined) {
            this.__pubs_popup = true;
            var jthis = $(this);
            var title = jthis.attr('title');
            var popover = $('<div>');
            var any = false;

            jthis.nextAll('a.pub-links-multi').each(function() {
                var parts = $(this).attr('title').match(/([^(]+) \(([^)]+)\)/);
                if (parts && parts[1] === title) {
                    if (any) {
                        popover.append(document.createTextNode('\u00a0\u00a0'));
                    }
                    any = true;
                    popover.append(
                        $('<a>')
                            .attr('href', $(this).attr('href'))
                            .text(parts[2])
                    );
                }
            });

            jthis.attr('title', '')
                .popover({
                    html: true,
                    placement: 'left',
                    content: popover.html()
                })
                .popover('toggle')
                .attr('title', title);
        }
        return false;
    });

    $('<style>.pub-links-combined {display: inline;} .pub-links-multi {display:none;}</style>')
        .appendTo('head');
}

pubs_init();

$(document).ready(function() {
    var FILTER_SECTIONS = [
        { title: 'Year', attr: 'data-year', multi: false },
        { title: 'Topic', attr: 'data-topic', multi: true },
        { title: 'Type', attr: 'data-type', multi: false },
        { title: 'CCF-Rankings', attr: 'data-ccf', multi: false },
        { title: 'CORE-Rankings', attr: 'data-core', multi: false }
    ];

    function parseQueryStringSearch() {
        var initialSearch = '';
        var qsArgs = location.search.slice(1).split('&');
        for (var i = 0; i < qsArgs.length; i++) {
            var parts = qsArgs[i].split('=');
            if (decodeURIComponent(parts[0] || '') === 'search') {
                initialSearch = decodeURIComponent(parts[1] || '');
                break;
            }
        }
        return initialSearch;
    }

    function normalizeValue(v) {
        var s = (v || '').trim();
        return s ? s : 'null';
    }

    function splitMultiValue(v) {
        var s = (v || '').trim();
        if (!s) {
            return ['null'];
        }
        return s
            .split(/[|;,]/)
            .map(function(x) { return x.trim(); })
            .filter(function(x) { return x.length > 0; });
    }

    function getValuesForPub(pub, section) {
        var raw = pub.getAttribute(section.attr);
        if (section.multi) {
            var arr = splitMultiValue(raw);
            return arr.length ? arr : ['null'];
        }
        return [normalizeValue(raw)];
    }

    function uniqueSortedValuesForSection(pubs, section) {
        var seen = {};
        var vals = [];

        pubs.each(function() {
            var values = getValuesForPub(this, section);
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                if (!seen[v]) {
                    seen[v] = true;
                    vals.push(v);
                }
            }
        });

        vals.sort(function(a, b) {
            if (section.title === 'Year') {
                var na = parseInt(a, 10);
                var nb = parseInt(b, 10);

                if (!isNaN(na) && !isNaN(nb)) {
                    return nb - na;
                }
                if (!isNaN(na)) {
                    return -1;
                }
                if (!isNaN(nb)) {
                    return 1;
                }
                return String(a).localeCompare(String(b));
            }

            if (a === 'null' && b !== 'null') {
                return 1;
            }
            if (a !== 'null' && b === 'null') {
                return -1;
            }
            return String(a).localeCompare(String(b));
        });

        return vals;
    }

    function inferYears() {
        var currentYear = null;
        $('#content').find('h3, .pub').each(function() {
            var tag = (this.tagName || '').toLowerCase();
            if (tag === 'h3') {
                var txt = $(this).text().trim();
                var match = txt.match(/\d{4}/);
                currentYear = match ? match[0] : null;
            } else if ($(this).hasClass('pub')) {
                this.setAttribute('data-year', currentYear || 'Pre-prints');
            }
        });
    }

    function mapPubToHeading() {
        var pubsHeadings = $('#content').find('.pub, h3');
        var headings = [];
        var lastHeading = null;

        pubsHeadings.each(function() {
            if ($(this).hasClass('pub')) {
                headings.push(lastHeading);
            } else {
                lastHeading = this;
            }
        });

        return headings;
    }

    function renderFilterUI($filter, pubs, state) {
        $filter.empty();

        var searchWrap = $('<div class="pub-filter-search"></div>');
        var searchInput = $('<input type="text" class="form-control" placeholder="search metadata">')
            .val(state.searchText)
            .attr('id', 'pub-filter-search-input');
        searchWrap.append(searchInput);
        $filter.append(searchWrap);

        for (var i = 0; i < FILTER_SECTIONS.length; i++) {
            var section = FILTER_SECTIONS[i];
            var values = state.allValues[section.title];
            var sectionDiv = $('<div class="pub-filter-section"></div>');
            sectionDiv.attr('data-section', section.title);

            var titleDiv = $('<div class="pub-filter-title"></div>').text(section.title);
            sectionDiv.append(titleDiv);

            for (var j = 0; j < values.length; j++) {
                var value = values[j];
                var id = 'filter_' + section.title.replace(/\W+/g, '_') + '_' + j;
                var label = $('<label class="pub-filter-option"></label>').attr('for', id);
                var input = $('<input type="checkbox" checked>');
                input.attr('id', id);
                input.attr('data-section', section.title);
                input.attr('data-value', value);

                var textSpan = $('<span class="pub-filter-label"></span>')
                    .attr('data-section', section.title)
                    .attr('data-value', value)
                    .text(value);

                label.append(input);
                label.append(document.createTextNode(' '));
                label.append(textSpan);
                sectionDiv.append(label);
            }

            var controls = $('<div class="pub-filter-controls"></div>');

            var selectBtn = $('<button type="button" class="pub-filter-select">Select all</button>')
                .attr('data-section', section.title);

            var sep = $('<span class="pub-filter-sep"> | </span>');

            var clearBtn = $('<button type="button" class="pub-filter-clear">Clear all</button>')
                .attr('data-section', section.title);

            controls.append(selectBtn);
            controls.append(sep);
            controls.append(clearBtn);

            sectionDiv.append(controls);

            $filter.append(sectionDiv);
        }

       if (!document.getElementById('pub-filter-inline-style')) {
            $('<style id="pub-filter-inline-style">' +
              '.pub-filter-search{margin-bottom:18px;}' +
              '.pub-filter-section{margin-top:22px;}' +
              '.pub-filter-title{font-size:16px;font-weight:700;margin-bottom:8px;}' +
              '.pub-filter-option{display:block;font-weight:400;margin:4px 0;cursor:pointer;}' +
              '.pub-filter-option input{margin-right:6px;}' +
              '.pub-filter-controls{margin-top:6px;}' +
              '.pub-filter-clear, .pub-filter-select{' +
                'background:none;' +
                'border:none;' +
                'padding:0;' +
                'color:#666;' +
                'font-size:13px;' +
                'cursor:pointer;' +
                '}' +

                '.pub-filter-clear:hover, .pub-filter-select:hover{' +
                'text-decoration:underline;' +
                '}' +

                '.pub-filter-clear:focus, .pub-filter-select:focus{' +
                'outline:none;' +
                '}' +
              '.pub-filter-clear:hover{text-decoration:underline;}' +
              '</style>').appendTo('head');
        }
    }

    function buildInitialState(pubs) {
        var state = {
            searchText: parseQueryStringSearch(),
            allValues: {},
            selected: {}
        };

        for (var i = 0; i < FILTER_SECTIONS.length; i++) {
            var section = FILTER_SECTIONS[i];
            var values = uniqueSortedValuesForSection(pubs, section);
            state.allValues[section.title] = values;
            state.selected[section.title] = {};
            for (var j = 0; j < values.length; j++) {
                state.selected[section.title][values[j]] = true;
            }
        }

        return state;
    }

    function getSearchBlob(pub) {
        var text = $(pub).text() || '';
        var key = pub.getAttribute('data-key') || '';
        return (text + ' ' + key).toLowerCase();
    }

    function pubMatchesSection(pub, section, state) {
        var values = getValuesForPub(pub, section);
        var selectedMap = state.selected[section.title];
        var anySelected = false;
        var i;

        for (i = 0; i < values.length; i++) {
            if (selectedMap[values[i]]) {
                anySelected = true;
                break;
            }
        }

        return anySelected;
    }

    function pubMatchesAll(pub, state) {
        var search = (state.searchText || '').trim().toLowerCase();
        if (search) {
            var blob = getSearchBlob(pub);
            if (blob.indexOf(search) === -1) {
                return false;
            }
        }

        for (var i = 0; i < FILTER_SECTIONS.length; i++) {
            if (!pubMatchesSection(pub, FILTER_SECTIONS[i], state)) {
                return false;
            }
        }

        return true;
    }

    function computeVisibleCounts(visiblePubs) {
        var counts = {};

        for (var i = 0; i < FILTER_SECTIONS.length; i++) {
            counts[FILTER_SECTIONS[i].title] = {};
        }

        visiblePubs.each(function() {
            for (var i = 0; i < FILTER_SECTIONS.length; i++) {
                var section = FILTER_SECTIONS[i];
                var values = getValuesForPub(this, section);
                for (var j = 0; j < values.length; j++) {
                    var v = values[j];
                    counts[section.title][v] = (counts[section.title][v] || 0) + 1;
                }
            }
        });

        return counts;
    }

    function updateSidebarCounts(counts, state) {
        $('#filter .pub-filter-label').each(function() {
            var section = $(this).attr('data-section');
            var value = $(this).attr('data-value');
            var n = (counts[section] && counts[section][value]) ? counts[section][value] : 0;
            $(this).text(value + ' (' + n + ')');
        });
    }

    function syncStateFromUI(state) {
        state.searchText = $('#pub-filter-search-input').val() || '';

        $('#filter input[type="checkbox"][data-section]').each(function() {
            var section = $(this).attr('data-section');
            var value = $(this).attr('data-value');
            state.selected[section][value] = $(this).is(':checked');
        });
    }

    function applyFilters(pubs, headings, state) {
        var any = false;
        var visiblePubs = $();

        for (var i = 0; i < headings.length; i++) {
            if (headings[i]) {
                headings[i].style.display = 'none';
            }
        }

        pubs.each(function(index) {
            var matched = pubMatchesAll(this, state);
            this.style.display = matched ? '' : 'none';

            if (matched) {
                any = true;
                visiblePubs = visiblePubs.add(this);
                if (headings[index]) {
                    headings[index].style.display = '';
                }
            }
        });

        if (any) {
            $('#no-matches').hide();
        } else {
            $('#no-matches').show();
        }

        updateSidebarCounts(computeVisibleCounts(visiblePubs), state);
    }

    inferYears();

    var pubs = $('.pub');
    var headings = mapPubToHeading();
    var state = buildInitialState(pubs);

    renderFilterUI($('#filter'), pubs, state);

    $('#pub-filter-search-input').on('input', function() {
        syncStateFromUI(state);
        applyFilters(pubs, headings, state);
    });

    $(document).on('change', '#filter input[type="checkbox"][data-section]', function() {
        syncStateFromUI(state);
        applyFilters(pubs, headings, state);
    });

    $(document).on('click', '.pub-filter-clear', function() {
        var section = $(this).attr('data-section');

        $('#filter input[type="checkbox"][data-section="' + section + '"]').prop('checked', false);

        syncStateFromUI(state);
        applyFilters(pubs, headings, state);
    });

    $(document).on('click', '.pub-filter-select', function() {
        var section = $(this).attr('data-section');

        $('#filter input[type="checkbox"][data-section="' + section + '"]').prop('checked', true);

        syncStateFromUI(state);
        applyFilters(pubs, headings, state);
    });

    applyFilters(pubs, headings, state);
});