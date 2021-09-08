class Feature {
    constructor(vowsh) {
        this.Vowsh = vowsh;
    }

    init() {}
    onMessage(message) {}
}

class EmoteGrabFeature extends Feature {
    init() {
        $('body')
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'})
            .on('click', '.chat-lines .chat-emote', this.onClick.bind(this))
            
        $('#chat-input-frame')
            .tooltip({selector: '#autocomplete .chat-emote', container: '#chat-input-frame'})
            .on('click', '#autocomplete .chat-emote', this.onClick.bind(this))
            .on('keydown', this.onKeydown.bind(this));

        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
    }

    onMessage(message) {
        message.find('.chat-emote').css('cursor', 'pointer');
    }

    onClick(event) {
        var input = $('#chat-input-control');
        
        if($(event.target).is('.autocomplete-emote')) {
            var cursor = this.Vowsh.getCursorPosition(input);
            var space = input.val().slice(0, cursor).lastIndexOf(' ');

            var end = input.val().slice(cursor);
            if(space > -1) {
                var start = input.val().slice(0, space);
                input.val(start + ' ' + $(event.target).text() + ' ' + end);
            }
            else {
                input.val($(event.target).text() + ' ' + end);
            }

            $('#autocomplete').hide();
        }
        else {
            var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
            input.val(input.val() + space + $(event.target).text() + ' ');
        }

        input.focus();
    }

    onKeydown(event) {
        if(event.key == 'Escape')
            $('.tooltip').tooltip('hide');
    }
}

class MoreEmotesFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
    }

    init() {
        this.reload();
    }

    reload() {
        $.get('https://ryan.gq/vowsh/emotes?channel=' + btoa(window.location.host)).done(function(emotes) {
            Vowsh.emotes = emotes;
            /*var css = '';
            for(const emote of Vowsh.emotes.more) {
                css += '.chat-emote-' + emote.name + '{background:url(' + emote.sprite + ')}';
            }
            $('body').prepend('<style>' + css + '</style>');*/

            var emoteList = $('#chat-emote-list .content');
            var emotes = '';
            if(!emoteList.is('.vowshed')) {
                emotes += '<div style="font-weight: 900">Vowsh Emotes</div>';
                emotes += '<div id="vowsh-emotes" class="emote-group">';
                for(const emote of Vowsh.emotes.more) {
                    var type = emote.name.indexOf('wide') === 0 ? ' more-emote-wide' : '';
                    var style = ' style="background-image: url(' + emote.sprite + ');' + '"';
                    emotes +=
                        '<div class="emote" style="padding: 0.1em">'
                            + '<span class="chat-emote more-emote' + type + '" title="' + emote.name + '"' + style + '>'
                                + emote.name
                            + '</span>'
                        + '</div>';
                }
                emotes += '</div>';
                emoteList.append(emotes).addClass('vowshed');
            }

            var total = emotes.default.length + emotes.more.length;
            if(moreEmotes.subscription != null)
                total += emotes.subscribers.length;

            Vowsh.log(Debug, emotes.more.length + ' more emotes (' + total + ' total) are now available!');
        }).fail(function() {
            Vowsh.log(Fail, 'Failed to get emote list; using defaults.');
        });
    }

    onMessage(message) {
        var text = message.find('.text').html();
        for(const i in this.Vowsh.emotes.more) {
            var emote = this.Vowsh.emotes.more[i];
            var regex = new RegExp('\\b(' + emote.name + ')(?::([a-z:]{2,}))?(?!\\S)\\b', 'gm');
            var matches = text.match(regex);
            if(matches) {
                for(const match of matches) {
                    var modifiers = match.split(':').splice(1);
                    var generify = [];
                    for(const mod of modifiers)
                        if(Vowsh.emoteModifiers.hasOwnProperty(mod.toLowerCase()))
                            generify.push(Vowsh.emoteModifiers[mod.toLowerCase()].generify);
                    
                    var type = 'more-emote' + (emote.name.indexOf('wide') === 0 ? ' more-emote-wide' : '');
                    text = text.replace(
                        match,
                        (generify.length ? '<div class="generify-container ' + generify.join(' ') + '">' : '') +
                        '<span class="chat-emote ' + type + '" title="' + match + '" style="background-image: url(' + emote.sprite + ')">'
                            + match
                        + '</span>'
                        + (generify.length ? '</div>' : '')
                    );
                }
            }
        }
        message.find('.text').html(text);
    }
}

class LinkPreviewFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.previews = {};
    }
    
    init() {
        $('body').on('mouseover', 'a', this.onMouseover.bind(this));
        $('#chat-input-control').on('keydown', this.onKeydown.bind(this));
    }

    onMouseover(event) {
        var target = $(event.target);
        if(target.attr('href')) {
            var href = target.attr('href');
            var hrefEncoded = btoa(href);
            
            target
                .popover({
                    container: '.chat-lines',
                    placement: 'auto top',
                    trigger: 'hover',
                    title: 'Preview',
                    content: 'Loading...',
                    html: 
                        '<div class="popover" role="tooltip" data-href="' + href + '">'
                        + '<div class="arrow"></div>'
                        + '<h3 class="popover-title"></h3>'
                        + '<div class="popover-content"></div>'
                        + '</div>'
                })
                .popover('show');
            
            if(!this.previews.hasOwnProperty(hrefEncoded))
                this.previews[hrefEncoded] = new LinkPreviewLoader(href);
            
            this.previews[hrefEncoded].load(target);
        }
    }

    onKeydown(e) {
        if(e.key == 'Escape') {
            for(const [link, preview] of Object.entries(this.previews)) {
                preview.popover.popover('hide');
            }
        }
    }
}

// Link preview handler.
class LinkPreviewLoader {
    constructor(href) {
        this.href = href;
        this.content = null;
        this.popover = null;
    }

    load(popover) {
        this.popover = popover;

        if(!this.content) {
            // Downloads preview.
            Vowsh.log(Debug, 'Downloading preview for ' + this.href);
            $.get('https://ryan.gq/vowsh/preview?link=' + btoa(this.href))
                .done(this.done.bind(this))
                .fail(function() {
                    Vowsh.log(Fail, "Failed to load preview: " + preview.href);
                });
        }
        else {
            this.show();
        }
    }

    done(content, status, xhr) {
        var type = xhr.getResponseHeader('Content-Type');
        if(type.indexOf('html') > -1) {
            this.title = '';
            this.content = content;
        }
        else if(type.indexOf('json') > -1) {
            this.title = content.title;
            this.content = content.content;
        }
        else {
            Vowsh.log(Fail, 'Unknown preview type returned: ' + type);
        }
        this.show();
    }

    show() {
        this.popover.data('bs.popover').options.title = this.title;
        this.popover.data('bs.popover').options.content = this.content;
        this.popover.popover('show');
    }
}

class AutocompleteFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.input = $('#chat-input-control');
    }

    init() {
        if(!$('#autocomplete').length)
            $('<div id="autocomplete"></div>').hide().prependTo('#chat-input-frame');

        this.input.on('keyup', this.onKeyup.bind(this));
        this.input.on('keydown', function(event) {
            // TODO - make this a double press
            if(event.key == 'Escape')
                $('#autocomplete').hide();
        });

        setInterval(this.position.bind(this), 150);
    }

    position() {
        $('#autocomplete').toggleClass('stacked', $('#chat-auto-complete').is('.active'));
    }

    onKeyup(event) {
        if(this.Vowsh.emotes) {
            if(this.input.val().length) {
                // Autocomplete
                var cursor = this.input.val().slice(0, this.Vowsh.getCursorPosition(this.input));
                if(new RegExp('[A-Za-z:]+').test(cursor.substr(cursor.length - 1, 1))) {
                    cursor = cursor.split(' ');
                    cursor = cursor[cursor.length - 1];
                    if(event.key != 'Escape')
                        $('#autocomplete').show();

                    var emotes = [];
                    for(const i in this.Vowsh.emotes.default) {
                        var emote = this.Vowsh.emotes.default[i];
                        emotes.push({
                            name: emote,
                            class: 'chat-emote-' + emote
                        });
                    }
                    if(this.Vowsh.user && this.Vowsh.user.subscription) {
                        for(const i in this.Vowsh.emotes.subscribers) {
                            var emote = this.Vowsh.emotes.subscribers[i];
                            emotes.push({
                                name: emote,
                                class: 'chat-emote-' + emote
                            });
                        }
                    }
                    for(const i in this.Vowsh.emotes.more) {
                        var emote = this.Vowsh.emotes.more[i];
                        emotes.push({
                            name: emote.name,
                            sprite: emote.sprite
                        });
                    }

                    var autocomplete = '';
                    var add = function(emote, modifiers = null) {
                        var generify = [];
                        var invalidModifier = false;
                        if(modifiers !== null) {
                            for(var mod of modifiers) {
                                if(Vowsh.emoteModifiers.hasOwnProperty(mod.toLowerCase()))
                                    generify.push(Vowsh.emoteModifiers[mod.toLowerCase()].generify);
                                else
                                    invalidModifier = true;
                            }
                        }

                        var classes = 'autocomplete-emote chat-emote';
                        if(emote.class)
                            classes += ' ' + emote.class;
                        else
                            classes += ' more-emote' + (emote.name.indexOf('wide') === 0 ? ' more-emote-wide' : '');

                        var styles = '';
                        if(emote.sprite)
                            styles += ' background-image: url(' + emote.sprite + ');';
                        if(!generify.length && invalidModifier)
                            styles += ' opacity: 0.625;';

                        if(generify.length)
                            autocomplete += '<div class="generify-container ' + generify.join(' ') + '"'
                                          + (invalidModifier ? ' style="opacity: 0.625"' : '') + '>';
                        autocomplete +=
                            '<span class="' + classes + '" style="' + styles + '" title="' + emote.name + '">'
                                + emote.name
                            + '</span>';
                        if(generify.length)
                            autocomplete += '</div>';
                    }
                    
                    var bestMatches = [];
                    var otherMatches = [];
                    var find = function(emote, exact) {
                        for(const i in emotes) {
                            var e = emotes[i];
                            if(exact && e.name.toLowerCase() == emote.toLowerCase())
                                return e;
                            if(!exact && e.name.toLowerCase().indexOf(emote.toLowerCase()) > -1) {
                                if(e.name.toLowerCase().indexOf(emote.toLowerCase()) === 0)
                                    bestMatches.push(e);
                                else
                                    otherMatches.push(e);
                            }
                        }
                        return null;
                    }

                    find(cursor, false);
                    for(const i in bestMatches)
                        add(bestMatches[i])
                    for(const i in otherMatches)
                        add(otherMatches[i])

                    if(bestMatches.length + otherMatches.length > 0) {
                        $('#autocomplete').html(autocomplete);
                        return;
                    }
                    else if(cursor.indexOf(':') > -1) {
                        var emote = find(cursor.split(':')[0], true);
                        var modifiers = cursor.split(':').splice(1);
                        if(emote) {
                            autocomplete = '';
                            add(emote, modifiers);
                            $('#autocomplete').html(autocomplete);
                            return;
                        }
                    }
                }
            }
        }
        $('#autocomplete').hide();
    }
}

class SettingsFeature extends Feature {
    init() {
        if($('#chat-settings-form').hasClass('vowshed'))
            return;

        $('#chat-settings-form > h4').attr('style', 'color: #999')
        $('#chat-settings-form')
            .prepend(
                '<h4 class="text-white" style="color: orange">Vowsh Settings</h4>' +
                '<div class="form-check">' +
                    '<input id="more-emotes" class="form-check-input" type="checkbox" disabled checked> ' +
                    '<label for="more-emotes" class="form-check-label">' +
                        'More emotes' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="more-emotes" class="form-check-input" type="checkbox" disabled checked> ' +
                    '<label for="more-emotes" class="form-check-label">' +
                        'Enhanced autocomplete' +
                    '</label>' +
                '</div>' +
                '<hr style="border-top: 1px solid #444">'
            )
            .addClass('vowshed');
        
        var settings = this;
        settings.reload();
        $('#sync').changed(function() {
            // set({sync: $(this).is(':checked')}, settings.reload);
        });
    }

    reload() {
        //get({sync: true}, $('#sync').prop('checked', results.sync))
    }
}

const Debug = 0, Warn = 1, Fail = 2;

class VowshApp {
    constructor() {
        this.logLevel = Debug;
        this.features = [];
        this.emoteModifiers = {
            asex: { generify: 'asex flag' },
            bi: { generify: 'bi flag' },
            cancelled: { generify: 'cancelled' },
            dank: { generify: 'generify-dank' },
            enby: { generify: 'enby flag' },
            flip: { generify: 'flip' },
            genderfluid: { generify: 'genderfluid flag' },
            lag: { generify: 'lag' },
            lesbian: { generify: 'lesbian flag' },
            love: { generify: 'generify-love' },
            mirror: { generify: 'mirror' },
            pan: { generify: 'pan flag' },
            pride: { generify: 'pride flag' },
            rain: { generify: 'weather rain anim-fix' },
            rustle: { generify: 'generify-rustle' },
            snow: { generify: 'weather snow anim-fix' },
            spin: { generify: 'generify-spin' },
            trans: { generify: 'trans flag' },
            wide: { generify: 'wide' },
            worth: { generify: 'generify-worth' }
        }
    }

    // Initializer
    init() {
        this.features.push(new EmoteGrabFeature(this));
        this.features.push(new MoreEmotesFeature(this));
        this.features.push(new LinkPreviewFeature(this));
        this.features.push(new AutocompleteFeature(this));
        this.features.push(new SettingsFeature(this));

        $.get('https://' + window.location.host + '/api/chat/me')
            .done(function(user) {
                Vowsh.user = user;
                setInterval(Vowsh.parseChat.bind(Vowsh), 250);
            })
            .fail(function(a, b, c) {
                console.log(a, b, c);
                setInterval(Vowsh.parseChat.bind(Vowsh), 250);
            });

        for(const feature of this.features) {
            Vowsh.log(Debug, 'Initializing ' + feature.constructor.name);
            feature.init();
        }
    }

    // Handle new chat messages
    parseChat() {
        var lines = $('.msg-chat:not(.vowshed)');
        for(var i = 0; i < lines.length; i++) {
            var line = lines.eq(i);
            line.addClass('vowshed');

            for(const feature of this.features) {
                feature.onMessage(line);
            }
        }
    }

    // Get the text being typed for autocomplete
    getCursorPosition(input) {
        var el = input.get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        }
        else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }

    // Log to console
    log(level, object) {
        if(level < this.logLevel)
            return;
        var logger = level == 0 ? console.log : level == 1 ? console.warn : console.error;
        logger('[Vowsh] ' + object);
    }
}

const Vowsh = new VowshApp();
Vowsh.init();

