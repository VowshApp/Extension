const Debug = 0, Warn = 1, Fail = 2;

class Feature {
    constructor(vowsh) {
        this.Vowsh = vowsh;
    }

    init() {}
    onMessage(message) {}
}

class EmoteFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
    }

    init() {
        Vowsh.log(Debug, "Initializing emote features");
        // Emote grab/tooltip
        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
        $('body')
            .on('click', '.chat-lines .chat-emote', function(event) {
                var input = $('#chat-input-control');
                var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
                input.val(input.val() + space + $(event.target).text() + ' ');
            })
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'});
    }

    // Make emotes look clickable
    onMessage(message) {
        Vowsh.log(Debug, "EmoteFeature.onMessage(" + message + ")");
        message.find('.chat-emote').css('cursor', 'pointer');
    }
}

class PreviewFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.previews = {};
    }
    
    init() {
        Vowsh.log(Debug, "Initializing preview features");
        
        const feature = this;
        // Link preview
        $('body').on('mouseover', 'a', function(event) {
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
                
                if(!feature.previews.hasOwnProperty(hrefEncoded))
                    feature.previews[hrefEncoded] = new PreviewLoader(href);
                
                feature.previews[hrefEncoded].load(target);
            }
        });


        // Force close popovers
        $('#chat-input-control').on('keydown', function(e) {
            if(e.key == 'Escape') {
                for(const [link, preview] of Object.entries(feature.previews)) {
                    preview.popover.popover('hide');
                }
            }
        });
    }
}

// Link preview handler.
class PreviewLoader {
    constructor(href) {
        Vowsh.log(Debug, "Getting preview for " + href);
        this.href = href;
        this.content = null;
        this.popover = null;
    }

    load(popover) {
        this.popover = popover;

        if(!this.content) {
            // Downloads preview.
            var preview = this;
            $.get('https://ryan.gq/vowsh/preview?link=' + btoa(this.href)).done(function(content, status, xhr) {
                var type = xhr.getResponseHeader('Content-Type');
                if(type.indexOf('html') > -1) {
                    preview.title = null;
                    preview.content = content;
                }
                else if(type.indexOf('json') > -1) {
                    preview.title = content.title;
                    preview.content = content.content;
                }
                else {
                    Vowsh.log(Fail, 'Unknown preview type returned: ' + type);
                }
                preview.show();
            }).fail(function() {
                Vowsh.log(Fail, "Failed to load preview: " + preview.href);
            });
        }
        else {
            this.show();
        }
    }

    show() {
        this.popover.data('bs.popover').options.title = this.title;
        this.popover.data('bs.popover').options.content = this.content;
        this.popover.popover('show');
    }
}

class VowshApp {
    constructor() {
        this.logLevel = Debug;
        this.features = [];
    }

    // Initializer
    init() {
        this.features.push(new PreviewFeature(this));
        this.features.push(new EmoteFeature(this));
        
        this.log(Debug, "Initializing");
        for(const feature of this.features) {
            console.log(feature);
            feature.init();
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