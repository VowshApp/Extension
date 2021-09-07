class MoreEmotesFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
    }

    init() {
        this.reload();
    }

    reload() {
        var moreEmotes = this;
        $.get('https://ryan.gq/vowsh/emotes?channel=' + btoa(window.location.host)).done(function(emotes) {
            moreEmotes.Vowsh.emotes = emotes;
            var total = emotes.default.length + emotes.more.length;
            if(moreEmotes.subscription != null) {
                total += emotes.subscribers.length;
            }
            Vowsh.log(Debug, emotes.more.length + ' more emotes (' + total + ' total) are now available!');
        }).fail(function() {
            Vowsh.log(Fail, 'Failed to get emote list; using defaults.');
        });
    }

    onMessage(message) {
        var text = message.find('.text').html();
        for(const i in this.Vowsh.emotes.more) {
            var emote = this.Vowsh.emotes.more[i];
            var regex = new RegExp('\\b(' + emote.name + ')(?::([a-z]{2,}))?(?!\\S)\\b', 'gm');
            var matches = text.match(regex);
            if(matches) {
                var type = 'more-emote' + (emote.name.indexOf('wide') === 0 ? ' more-emote-wide' : '');
                text = text.replace(
                    regex,
                    '<span class="chat-emote ' + type + '" title="' + emote.name + '"'
                        + ' style="background-image: url(' + emote.sprite + ')">'
                        + emote.name
                        + '</span>'
                );
            }
        }
        message.find('.text').html(text);
    }
}