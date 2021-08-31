class Feature {
    constructor(vowsh) {
        this.Vowsh = vowsh;
    }

    init() {}
    onMessage(message) {}
}

class EmoteFeature extends Feature {
    init() {
        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
        $('body')
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'})
            .on('click', '.chat-lines .chat-emote', this.onClick.bind(this));
    }

    onMessage(message) {
        message.find('.chat-emote').css('cursor', 'pointer');
    }

    onClick(event) {
        var input = $('#chat-input-control');
        var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
        input.val(input.val() + space + $(event.target).text() + ' ');
    }
}

class PreviewFeature extends Feature {
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
                this.previews[hrefEncoded] = new PreviewLoader(href);
            
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
class PreviewLoader {
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
        Vowsh.log(Debug, 'Displaying popover: ' + this.popover);
    }
}

class AutocompleteFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.input = $('#chat-input-control');
    }

    init() {
        this.input.on('keyup', this.onKeyup.bind(this));
    }

    onKeyup(event) {
        Vowsh.log(Debug, 'Cursor is at position ' + this.getCursorPosition());
    }

    getCursorPosition() {
        var el = this.input.get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
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
                    '<input class="form-check-input" type="checkbox"> ' +
                    '<label class="form-check-label">' +
                        'Enable enhanced autocomplete' +
                    '</label>' +
                '</div>' +
                '<hr style="border-top: 1px solid #444">'
            )
            .addClass('vowshed');
    }
}

const Debug = 0, Warn = 1, Fail = 2;

class VowshApp {
    constructor() {
        this.logLevel = Debug;
        this.features = [];
    }

    // Initializer
    init() {
        this.features.push(new EmoteFeature(this));
        this.features.push(new PreviewFeature(this));
        this.features.push(new AutocompleteFeature(this));
        this.features.push(new SettingsFeature(this));

        for(const feature of this.features) {
            this.log(Debug, "Initializing " + feature.constructor.name);
            feature.init();
        }

        setInterval(this.parseChat.bind(this), 350);
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

    // Log to console
    log(level, object) {
        if(level < this.logLevel)
            return;
        var logger = level == 0 ? console.log : level == 1 ? console.warn : console.error;
        logger("[Vowsh] " + object);
    }
}

const Vowsh = new VowshApp();
Vowsh.init();

