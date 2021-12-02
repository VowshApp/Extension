class Feature {
    constructor(vowsh) {
        this.Vowsh = vowsh;
    }

    init() {}
    onMessage(message) {}
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
            if(event.key == 'Escape')
                $('#autocomplete').hide();
        });

        setInterval(this.position.bind(this), 150);
    }

    position() {
        $('#autocomplete').toggleClass('stacked', $('#chat-auto-complete').is('.active'));
    }

    onKeyup(event) {
        if(this.Vowsh.emotes && !event.altKey) {
            if(this.input.val().length) {
                // Autocomplete
                var cursor = this.input.val().slice(0, this.Vowsh.getCursorPosition(this.input));
                if(new RegExp('[A-Za-z: ]+').test(cursor.substr(cursor.length - 1, 1))) {
                    cursor = cursor.trim().split(' ');
                    cursor = cursor[cursor.length - 1];
                    if(event.key != 'Escape')
                        $('#autocomplete').show();

                    var emotes = [];
                    for(const e of this.Vowsh.emotes.default)
                        emotes.push(e);
                    if(this.Vowsh.user && this.Vowsh.user.subscription)
                        for(const e of this.Vowsh.emotes.subscribers)
                            emotes.push(e);
                    for(const e of this.Vowsh.emotes.more)
                        emotes.push(e.name);

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

                        var classes = 'autocomplete-emote chat-emote chat-emote-' + emote;
                        var styles = '';
                        if(generify.length)
                            autocomplete += '<div class="generify-container ' + generify.join(' ') + '"'
                                          + (invalidModifier ? ' style="opacity: 0.625"' : '') + '>';
                        else if(invalidModifier)
                            styles += ' opacity: 0.625;';

                        var emoteFull = emote + (modifiers !== null ? ':' + modifiers.join(':') : '');
                        autocomplete +=
                            '<span class="' + classes + '" style="' + styles + '" title="' + emoteFull + '">'
                                + emoteFull
                            + '</span>';

                        if(generify.length)
                            autocomplete += '</div>';
                    }
                    
                    var bestMatches = [];
                    var otherMatches = [];
                    var find = function(emote, exact) {
                        for(const e of emotes) {
                            if(exact && e.toLowerCase() == emote.toLowerCase())
                                return e;
                            if(!exact && e.toLowerCase().indexOf(emote.toLowerCase()) > -1) {
                                if(e.toLowerCase().indexOf(emote.toLowerCase()) === 0)
                                    bestMatches.push(e);
                                else
                                    otherMatches.push(e);
                            }
                        }
                        return null;
                    }

                    find(cursor, false);
                    for(const match of bestMatches)
                        add(match);
                    for(const match of otherMatches)
                        add(match);

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

class EmoteGrabFeature extends Feature {
    init() {
        $('body')
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'})
            .on('mousedown', '.chat-lines .chat-emote', this.onMousedown.bind(this))
            
        $('#chat-input-frame')
            .tooltip({selector: '#autocomplete .chat-emote', container: '#chat-input-frame'})
            .on('mousedown', '#autocomplete .chat-emote', this.onMousedown.bind(this))
            .on('keydown', this.onKeydown.bind(this));

        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
    }

    onMessage(message) {
        message.find('.chat-emote').css('cursor', 'pointer');
    }

    onMousedown(event) {
        var input = $('#chat-input-control');
        
        if(event.which == 2) {
            Vowsh.log(Debug, 'Copying emote to clipboard...');
            navigator.clipboard.writeText($(event.target).text() + ' ');
            event.preventDefault();
        }
        else if(event.which == 1) {
            var autocomplete = $(event.target).is('.autocomplete-emote');
            Vowsh.insertEmote(input, $(event.target).text(), autocomplete);
            $('#autocomplete').hide();
        }
        setTimeout(function() { input.focus(); }, 1);
    }

    onKeydown(event) {
        if(event.key == 'Escape')
            $('.tooltip').tooltip('hide');
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

class MacrosFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.input = $('#chat-input-control');
    }

    init() {
        this.input.on('keydown', this.onKeydown.bind(this));
    }

    onKeydown(e) {
        var macros = Vowsh.settings.macros.split('\n');

        if(!macros.length)
            return;
        
        // TODO - make ac modular to preview macros
        if(e.altKey) {
            //$('#autocomplete').show();
            if(/^[1-9]$/.test(e.key)) {
                var index = parseInt(e.key) - 1;
                if(index >= macros.length || !macros[index].length)
                    return;
                
                Vowsh.insertEmote(this.input, macros[index], true);
            }
        }
        else {
            //$('#autocomplete').hide();
        }
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
        $.get('https://ryan.gq/vowsh/emoticons?channel=' + btoa(window.location.host)).done(function(emotes) {
            Vowsh.emotes = emotes;
            
            var css = '';
            for(const emote of Vowsh.emotes.more) {
                css +=
                    '.chat-emote-' + emote.name + ' {'
                        + 'background: url(' + emote.sprite + ') no-repeat;'
                        + 'background-size: contain;'
                        + 'background-position: 0px 0px;'
                        + (emote.name.indexOf('wide') !== 0 ? (
                            'margin-top: -30px;'
                            + 'height: 30px;'
                            + 'width: 30px;'
                        ) : (
                            'margin-top: -20px;'
                            + 'width: 90px;'
                            + 'height: 20px;'
                        ))
                    + '}';
            }
            $('body').prepend('<style>' + css + '</style>');

            var emoteList = $('#chat-emote-list .content');
            var html = '';
            if(!emoteList.is('.vowshed')) {
                html += '<div style="font-weight: 900">Vowsh Emotes</div>';
                html += '<div id="vowsh-emotes" class="emote-group">';
                for(const emote of Vowsh.emotes.more) {
                    html +=
                        '<div class="emote" style="padding: 0.1em">'
                            + '<span class="chat-emote chat-emote-' + emote.name + '" title="' + emote.name + '">'
                                + emote.name
                            + '</span>'
                        + '</div>';
                }
                html += '</div>';
                emoteList.append(html).addClass('vowshed');
            }

            var total = emotes.default.length + emotes.more.length;
            if(Vowsh.user && Vowsh.user.subscription != null)
                total += emotes.subscribers.length;

            Vowsh.log(Debug, emotes.more.length + ' more emotes (' + total + ' total) are now available!');
        }).fail(function(a, b, c) {
            Vowsh.log(Fail, 'Failed to get emote list: ' + 'https://ryan.gq/vowsh/emotes?channel=' + btoa(window.location.host));
        });
    }
}

class NotificationsFeature extends Feature {
    init() {
        Notification.requestPermission().then(function(result) {
            Vowsh.onReady(function() {
                if(result !== 'granted') {
                    $('.chat-lines').append('<div class="msg-chat msg-info"><span class="text" style="color: crimson">Notifications are enabled in Vowsh settings, but you haven\'t granted permission yet.</span></div>');
                }
            });
        });
    }

    onMessage(message) {
        if(message.is('.msg-highlight') && document.visibilityState != 'visible') {
            var mention = new Notification(message.data('username') + ' mentioned you');
            mention.onclick = function() { window.focus(); mention.close(); };

            document.addEventListener('visibilitychange', function() {
                if(document.visibilityState == 'visible') {
                    mention.close();
                }
            });
        }
    }
}

class PronounsFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.pronouns = null;
    }

    init() {
        var self = this;
        Vowsh.log(Debug, 'Downloading pronouns from https://ryan.gq/vowsh/pronouns?channel=' + btoa(window.location.host) + ' ...');
        $.get('https://ryan.gq/vowsh/pronouns?channel=' + btoa(window.location.host)).done(function(pronouns) {
            self.pronouns = pronouns;
            Vowsh.log(Debug, pronouns);
        }).fail(function(a, b, c) {
            Vowsh.log(Warn, a, b, c);
        });
    }

    onMessage(message) {
        if(this.pronouns == null)
            return;
        
        var username = message.data('username');
        for(const user of this.pronouns) {
            if(user.name.toLowerCase() == username.toLowerCase()) {
                message.append('<span class="pronouns">' + user.pronouns + '</span>');
            }
        }
    }
}

class SettingsFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.storage = Vowsh.browser.storage;
    }

    init(done = null) {
        if($('#chat-settings-form').hasClass('vowshed'))
            return;

        $('#chat-settings-form > h4').attr('style', 'color: #999')
        $('#chat-settings-form')
            .prepend(
                '<h4 class="text-white" style="color: orange; margin-bottom: 0px">Vowsh Settings</h4>' +
                '<small class="text-muted my-2" style="display: block; margin: 0px 0px 10px 17px">Some options may require a refresh to take effect.</small>' +
                '<div class="form-check">' +
                    '<input id="more-emotes" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="more-emotes" class="form-check-label">' +
                        'More emotes' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="enhanced-autocomplete" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="enhanced-autocomplete" class="form-check-label">' +
                        'Enhanced autocomplete' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="readable-chat" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="readable-chat" class="form-check-label">' +
                        'Separate chat lines' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="pronouns" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="pronouns" class="form-check-label">' +
                        'Display pronouns' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="notifications" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="notifications" class="form-check-label">' +
                        'Notify when mentioned' +
                    '</label>' +
                '</div>' +
                '<div>' +
                    '<label for="macros" class="form-check-label">' +
                        'Macros (one per line)' +
                    '</label>' +
                    '<textarea id="macros" class="form-control" placeholder="Alt + 1\nAlt + 2\nAlt + 3\n..."></textarea> ' +
                '</div>' +
                '<hr style="border-top: 1px solid #444">'
            )
            .addClass('vowshed');

        var self = this;
            
        $('#more-emotes').change(function() {
            self.storage.local.set({
                moreEmotes: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#enhanced-autocomplete').change(function() {
            self.storage.local.set({
                enhancedAutocomplete: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#readable-chat').change(function() {
            self.storage.local.set({
                readableChat: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#pronouns').change(function() {
            self.storage.local.set({
                pronouns: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#notifications').change(function() {
            self.storage.local.set({
                notifications: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#macros').change(function() {
            self.storage.local.set({
                macros: $(this).val()
            }, self.reload.bind(self));
        });

        self.reload(done);
    }

    reload(done = null) {
        Vowsh.log(Debug, 'Reloading settings');
        this.storage.local.get({
            moreEmotes: true,
            enhancedAutocomplete: true,
            readableChat: true,
            pronouns: true,
            notifications: true,
            macros: ''
        }, function(settings) {
            Vowsh.settings = settings;
            Vowsh.log(Debug, Vowsh.settings);
            
            $('#more-emotes').prop('checked', settings.moreEmotes);
            $('#enhanced-autocomplete').prop('checked', settings.enhancedAutocomplete);
            $('#readable-chat').prop('checked', settings.readableChat);
            $('#pronouns').prop('checked', settings.pronouns);
            $('#notifications').prop('checked', settings.notifications);
            $('#macros').val(settings.macros);

            // Apply other settings after chat has loaded.
            Vowsh.onReady(function() {
                $('.chat-lines')
                    .toggleClass('readable', Vowsh.settings.readableChat)
                    .toggleClass('with-pronouns', Vowsh.settings.pronouns);
            });
            
            if(done != null)
                done(settings);
        });
    }
}

const Debug = 0, Warn = 1, Fail = 2;

class VowshApp {
    constructor() {
        this.ready = false;
        this.queue = [];
        this.logLevel = Debug;
        this.browser = typeof browser !== 'undefined' ? browser : chrome;
        this.features = [];
        this.messageCount = 0;
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
        this.settings = new SettingsFeature(this);
        this.settings.init(function(settings) {
            // Configurable features
            if(settings.moreEmotes)
                Vowsh.features.push(new MoreEmotesFeature(Vowsh));
            if(settings.enhancedAutocomplete)
                Vowsh.features.push(new AutocompleteFeature(Vowsh));
            if(settings.pronouns)
                Vowsh.features.push(new PronounsFeature(Vowsh));
            if(settings.notifications)
                Vowsh.features.push(new NotificationsFeature(Vowsh));

            // Standard features
            Vowsh.features.push(new EmoteGrabFeature(Vowsh));
            Vowsh.features.push(new LinkPreviewFeature(Vowsh));
            Vowsh.features.push(new MacrosFeature(Vowsh));
            
            for(const feature of Vowsh.features) {
                Vowsh.log(Debug, 'Initializing ' + feature.constructor.name);
                feature.init();
            }
        });

        $.get('https://' + window.location.host + '/api/chat/me')
            .done(function(user) {
                Vowsh.user = user;
                setInterval(Vowsh.parseChat.bind(Vowsh), 10);
            })
            .fail(function(a, b, c) {
                setInterval(Vowsh.parseChat.bind(Vowsh), 10);
            });
    }

    // Handle new chat messages
    parseChat() {
        var lines = $('.msg-chat:not(.vowshed)');
        for(var i = 0; i < lines.length; i++) {
            var line = lines.eq(i);
            line.addClass('vowshed').toggleClass('msg-dark', (this.messageCount % 2) == 0);
            this.messageCount++;

            // Initialize CSS after messages have loaded.
            if(!this.ready) {
                Vowsh.log(Debug, 'Chat has finished loading, applying settings...');
                for(const func of this.queue)
                    func();
                this.queue = [];
                this.ready = true;
            }

            for(const feature of this.features) {
                feature.onMessage(line);
            }
        }
    }

    onReady(func) {
        if(this.ready)
            func();
        else
            this.queue.push(func);
    }

    // Get the text being typed for autocomplete
    getCursorPosition(input) {
        input = input.get(0);
        var index = 0;
        if('selectionStart' in input) {
            index = input.selectionStart;
        }
        else if('selection' in document) {
            input.focus();
            var selection = document.selection.createRange();
            var length = document.selection.createRange().text.length;
            selection.moveStart('character', -input.value.length);
            index = selection.text.length - length;
        }
        return index;
    }

    insertEmote(input, emote, atCursor=false) {
        if(atCursor) {
            var cursor = this.getCursorPosition(input);
            var space = input.val().slice(0, cursor).lastIndexOf(' ');
            var end = input.val().slice(cursor);
            
            if(space > -1) {
                var start = input.val().slice(0, space);
                input.val(start + ' ' + emote + ' ' + end);
            }
            else {
                input.val(emote + ' ' + end);
            }
        }
        else {
            var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
            input.val(input.val() + space + emote + ' ');
        }

        setTimeout(function() {
            input.focus();
        }, 1);
    }

    // Log to console
    log(level, ...obj) {
        if(level >= this.logLevel) {
            if(obj.length == 1 && typeof obj[0] === 'string')
                obj[0] = '[Vowsh] ' + obj[0];
            else
                console.log('[Vowsh] ' + obj.length + ' object(s) logged:');

            if(level == 0)
                console.log(...obj);
            else if(level == 1)
                console.warn(...obj);
            else if(level == 2)
                console.error(...obj);
        }
    }
}

const Vowsh = new VowshApp();
$(document).ready(function() {
    Vowsh.init();
});

