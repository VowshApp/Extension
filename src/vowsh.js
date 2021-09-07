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