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

        this.log(Debug, "Initializing");
        for(const feature of this.features) {
            console.log(feature);
            feature.init();
        }

        $.fn.getCursorPosition = function() {
            var el = $(this).get(0);
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

        setInterval(this.parseLines.bind(this), 350);
    }

    // Handle new chat messages
    parseLines() {
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