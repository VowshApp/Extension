class LinkPreview {
    constructor(href) {
        console.log('New preview created');
        this.href = href;
        this.content = null;
        this.popover = null;
    }

    load(popover) {
        this.popover = popover;

        if(!this.content) {
            var preview = this;
            $.get('https://ryan.gq/vowsh/preview?link=' + btoa(this.href)).done(function(content, status, xhr) {
                var type = xhr.getResponseHeader('Content-Type');
                if(type.indexOf('html') > -1) {
                    preview.title = 'Preview';
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
        this.linkPreviews = {};
        this.init();
    }

    // Initializer
    init() {
        this.log(Debug, "Initializing");

        $('body')
            // Emote grab
            .on('click', '.chat-lines .chat-emote', function(event) {
                var input = $('#chat-input-control');
                var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
                input.val(input.val() + space + $(event.target).text() + ' ');
            })
            
            // Link preview
            .on('mouseover', 'a', function(event) {
                var target = $(event.target);
                if(target.attr('href')) {
                    var href = target.attr('href');
                    var hrefEncoded = btoa(href);
                    
                    target.popover({
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
                    }).popover('show');
                    
                    if(!Vowsh.linkPreviews.hasOwnProperty(hrefEncoded))
                        Vowsh.linkPreviews[hrefEncoded] = new LinkPreview(href);
                    Vowsh.linkPreviews[hrefEncoded].load(target);
                }
            })

            // Emote tooltips
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'});

        $('#chat-emote-list').tooltip({selector: '.chat-emote'});

        // Force close popovers
        $('#chat-input-control').on('keydown', function(e) {
            if(e.key == 'Escape') {
                for(const [link, preview] of Object.entries(Vowsh.linkPreviews)) {
                    console.log(link);
                    preview.popover.popover('hide');
                }
            }
        })
        
        setInterval(this.parseLines.bind(this), 350);
    }

    // Handles new chat messages
    parseLines() {
        this.log(Debug, "Vowshing");
        var lines = $('.msg-chat:not(.vowshed)');
        for(var i = 0; i < lines.length; i++) {
            var line = lines.eq(i);
            line.addClass('vowshed');
            line.find('.chat-emote').css('cursor', 'pointer');
        }
    }

    // Logs to console
    log(level, object) {
        if(level < this.logLevel)
            return;
        var logger = level == 0 ? console.log : level == 1 ? console.warn : console.error;
        logger("[Vowsh] " + object);
    }
}

const Debug = 0, Warn = 1, Fail = 2;
const Vowsh = new VowshApp();