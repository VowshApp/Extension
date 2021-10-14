class MoreEmotesFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
    }

    init() {
        this.reload();
    }

    reload() {
        var moreEmotes = this;
        
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
            if(moreEmotes.subscription != null)
                total += emotes.subscribers.length;

            Vowsh.log(Debug, emotes.more.length + ' more emotes (' + total + ' total) are now available!');
        }).fail(function(a, b, c) {
            Vowsh.log(Fail, 'Failed to get emote list: ' + 'https://ryan.gq/vowsh/emotes?channel=' + btoa(window.location.host));
        });
    }

    onMessage(message) {
        // Note: we replaced regex/replace with XHR injection/CSS instead.
        // new RegExp('\\b(' + emote.name + ')(?::([a-z:]{2,}))?(?!\\S)\\b', 'gm')
    }
}