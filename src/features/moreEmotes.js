class MoreEmotesFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
    }

    init() {
        this.reload();
    }

    reload() {
        $.get('https://ryan.gq/vowsh/emotes?channel=' + btoa(window.location.host)).done(function(emotes) {
            Vowsh.emotes = emotes;

            var emoteList = $('#chat-emote-list .content');
            var emotes = '';
            if(!emoteList.is('.vowshed')) {
                emotes += '<div style="font-weight: 900">Vowsh Emotes</div>';
                emotes += '<div id="vowsh-emotes" class="emote-group">';
                for(const emote of Vowsh.emotes.more) {
                    var type = emote.name.indexOf('wide') === 0 ? ' more-emote-wide' : '';
                    var style = ' style="background-image: url(' + emote.sprite + ');' + '"';
                    emotes +=
                        '<div class="emote" style="padding: 0.1em">'
                            + '<span class="chat-emote more-emote' + type + '" title="' + emote.name + '"' + style + '>'
                                + emote.name
                            + '</span>'
                        + '</div>';
                }
                emotes += '</div>';
                emoteList.append(emotes).addClass('vowshed');
            }

            var total = emotes.default.length + emotes.more.length;
            if(moreEmotes.subscription != null)
                total += emotes.subscribers.length;

            Vowsh.log(Debug, emotes.more.length + ' more emotes (' + total + ' total) are now available!');
        }).fail(function() {
            Vowsh.log(Fail, 'Failed to get emote list; using defaults.');
        });
    }

    onMessage(message) {
        var text = message.find('.text').html();
        for(const i in this.Vowsh.emotes.more) {
            var emote = this.Vowsh.emotes.more[i];
            var regex = new RegExp('\\b(' + emote.name + ')(?::([a-z:]{2,}))?(?!\\S)\\b', 'gm');
            var matches = text.match(regex);
            if(matches) {
                for(const match of matches) {
                    var modifiers = match.split(':').splice(1);
                    var generify = [];
                    for(const mod of modifiers)
                        if(Vowsh.emoteModifiers.hasOwnProperty(mod.toLowerCase()))
                            generify.push(Vowsh.emoteModifiers[mod.toLowerCase()].generify);
                    
                    var type = 'more-emote' + (emote.name.indexOf('wide') === 0 ? ' more-emote-wide' : '');
                    text = text.replace(
                        match,
                        (generify.length ? '<div class="generify-container ' + generify.join(' ') + '">' : '') +
                        '<span class="chat-emote ' + type + '" title="' + match + '" style="background-image: url(' + emote.sprite + ')">'
                            + match
                        + '</span>'
                        + (generify.length ? '</div>' : '')
                    );
                }
            }
        }
        message.find('.text').html(text);
    }
}