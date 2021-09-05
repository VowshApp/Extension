const Debug = 0, Warn = 1, Fail = 2;

class VowshApp {
    constructor() {
        this.logLevel = Debug;
        this.features = [];
    }

    // Initializer
    init() {
        this.features.push(new EmoteGrabFeature(this));
        this.features.push(new MoreEmotesFeature(this));
        this.features.push(new LinkPreviewFeature(this));
        this.features.push(new AutocompleteFeature(this));
        this.features.push(new SettingsFeature(this));

        $.get('//' + window.location.host + '/api/chat/me')
            .done(function(user) {
                Vowsh.user = user;
                Vowsh.log(Debug, 'Signed in as ' + user.username);
            })
            .fail(function(a, b, c) {
                Vowsh.log(Fail, 'Failed to get profile:');
                console.log(a, b, c);
            })
            .always(function() {
                setInterval(Vowsh.parseChat.bind(Vowsh), 300);
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