class AutocompleteFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.input = $('#chat-input-control');
    }

    init() {
        if(!$('#autocomplete').length)
            $('#chat-input-frame').prepend('<div id="autocomplete"></div>');

        this.input.on('keyup', this.onKeyup.bind(this));
        this.input.on('keydown', function(event) {
            // TODO - make this a double press
            if(event.key == 'Escape')
                $('#autocomplete').hide();
        });
    }

    onKeyup(event) {
        if(this.Vowsh.emotes) {
            if(this.input.val().length) {
                // Override autocomplete
                var cursor = this.input.val().slice(0, this.Vowsh.getCursorPosition(this.input));
                if(new RegExp('[A-Za-z]+').test(cursor.substr(cursor.length - 1, 1))) {
                    cursor = cursor.split(' ');
                    cursor = cursor[cursor.length - 1];
                    if(event.key != 'Escape')
                        $('#autocomplete').show();

                    var emotes = [];
                    for(const i in this.Vowsh.emotes.default) {
                        var emote = this.Vowsh.emotes.default[i];
                        emotes.push({
                            name: emote,
                            class: 'chat-emote-' + emote
                        });
                    }
                    if(this.Vowsh.user.subscription) {
                        for(const i in this.Vowsh.emotes.subscribers) {
                            var emote = this.Vowsh.emotes.subscribers[i];
                            emotes.push({
                                name: emote,
                                class: 'chat-emote-' + emote
                            });
                        }
                    }
                    for(const i in this.Vowsh.emotes.more) {
                        var emote = this.Vowsh.emotes.more[i];
                        emotes.push({
                            name: emote.name,
                            sprite: emote.sprite
                        });
                    }

                    var autocomplete = '';
                    var push = function(emote) {
                        var type = 'more-emote' + (emote.name.indexOf('wide') === 0 ? ' more-emote-wide' : '');
                        autocomplete +=
                            '<span class="autocomplete-emote chat-emote' + (emote.class ? ' ' + emote.class : ' ' + type) + '"'
                            + (emote.sprite ? ' style="cursor: pointer; background-image: url(' + emote.sprite + ')"' : '')
                            + ' title="' + emote.name + '">'
                            + emote.name
                            + '</span>';
                    }
                    
                    var bestMatches = [];
                    var otherMatches = [];
                    for(const i in emotes) {
                        var emote = emotes[i];
                        if(emote.name.toLowerCase().indexOf(cursor.toLowerCase()) > -1) {
                            if(emote.name.toLowerCase().indexOf(cursor.toLowerCase()) === 0)
                                bestMatches.push(emote);
                            else
                                otherMatches.push(emote);
                        }
                    }

                    for(const i in bestMatches)
                        push(bestMatches[i])
                    for(const i in otherMatches)
                        push(otherMatches[i])

                    if(autocomplete.length) {
                        $('#autocomplete').html(autocomplete);
                        return;
                    }
                }
            }
        }
        $('#autocomplete').hide();
    }
}