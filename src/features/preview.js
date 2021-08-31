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