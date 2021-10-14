const Debug = 0, Warn = 1, Fail = 2;

class VowshApp {
    constructor() {
        this.ready = false;
        this.queue = [];
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
        this.settings = new SettingsFeature(this);
        this.settings.init(function(settings) {
            // Configurable features
            if(settings.moreEmotes)
                Vowsh.features.push(new MoreEmotesFeature(Vowsh));
            if(settings.enhancedAutocomplete)
                Vowsh.features.push(new AutocompleteFeature(Vowsh));

            // Standard features
            Vowsh.features.push(new EmoteGrabFeature(this));
            Vowsh.features.push(new LinkPreviewFeature(this));
            
            for(const feature of Vowsh.features) {
                Vowsh.log(Debug, 'Initializing ' + feature.constructor.name);
                feature.init();
            }
        });

        $.get('https://' + window.location.host + '/api/chat/me')
            .done(function(user) {
                Vowsh.user = user;
                setInterval(Vowsh.parseChat.bind(Vowsh), 250);
            })
            .fail(function(a, b, c) {
                setInterval(Vowsh.parseChat.bind(Vowsh), 250);
            });
    }

    // Handle new chat messages
    parseChat() {
        var lines = $('.msg-chat:not(.vowshed)');
        for(var i = 0; i < lines.length; i++) {
            var line = lines.eq(i);
            line.addClass('vowshed');
            
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
    log(level, ...obj) {
        if(level >= this.logLevel) {
            if(obj.length == 1 && typeof obj[0] === 'string')
                obj[0] = '[Vowsh] ' + obj[0];
            else
                console.log('[Vowsh] Unknown object:');

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