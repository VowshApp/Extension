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