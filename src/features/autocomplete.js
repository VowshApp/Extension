class AutocompleteFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.input = $('#chat-input-control');
    }

    init() {
        if(!$('#autocomplete').length)
            $('<div id="autocomplete"></div>').hide().prependTo('#chat-input-frame');

        this.input.on('keyup', this.onKeyup.bind(this));
        this.input.on('keydown', function(event) {
            // TODO - make this a double press
            if(event.key == 'Escape')
                $('#autocomplete').hide();
        });

        setInterval(this.position.bind(this), 150);
    }

    position() {
        $('#autocomplete').toggleClass('stacked', $('#chat-auto-complete').is('.active'));
    }

    onKeyup(event) {
        if(this.Vowsh.emotes) {
            if(this.input.val().length) {
                // Autocomplete
                var cursor = this.input.val().slice(0, this.Vowsh.getCursorPosition(this.input));
                if(new RegExp('[A-Za-z:]+').test(cursor.substr(cursor.length - 1, 1))) {
                    cursor = cursor.split(' ');
                    cursor = cursor[cursor.length - 1];
                    if(event.key != 'Escape')
                        $('#autocomplete').show();

                    var emotes = [];
                    for(const i in this.Vowsh.emotes.default) {
                        var emote = this.Vowsh.emotes.default[i];
                        emotes.push({
                            name: emote
                        });
                    }
                    if(this.Vowsh.user && this.Vowsh.user.subscription) {
                        for(const i in this.Vowsh.emotes.subscribers) {
                            var emote = this.Vowsh.emotes.subscribers[i];
                            emotes.push({
                                name: emote
                            });
                        }
                    }
                    for(const i in this.Vowsh.emotes.more) {
                        var emote = this.Vowsh.emotes.more[i];
                        emotes.push({
                            name: emote.name
                        });
                    }

                    var autocomplete = '';
                    var add = function(emote, modifiers = null) {
                        var generify = [];
                        var invalidModifier = false;
                        if(modifiers !== null) {
                            for(var mod of modifiers) {
                                if(Vowsh.emoteModifiers.hasOwnProperty(mod.toLowerCase()))
                                    generify.push(Vowsh.emoteModifiers[mod.toLowerCase()].generify);
                                else
                                    invalidModifier = true;
                            }
                        }

                        var classes = 'autocomplete-emote chat-emote chat-emote-' + emote.name;
                        var styles = '';
                        if(generify.length)
                            autocomplete += '<div class="generify-container ' + generify.join(' ') + '"'
                                          + (invalidModifier ? ' style="opacity: 0.625"' : '') + '>';
                        else if(invalidModifier)
                            styles += ' opacity: 0.625;';

                        autocomplete +=
                            '<span class="' + classes + '" style="' + styles + '" title="' + emote.name + '">'
                                + emote.name
                            + '</span>';

                        if(generify.length)
                            autocomplete += '</div>';
                    }
                    
                    var bestMatches = [];
                    var otherMatches = [];
                    var find = function(emote, exact) {
                        for(const e of emotes) {
                            if(exact && e.name.toLowerCase() == emote.toLowerCase())
                                return e;
                            if(!exact && e.name.toLowerCase().indexOf(emote.toLowerCase()) > -1) {
                                if(e.name.toLowerCase().indexOf(emote.toLowerCase()) === 0)
                                    bestMatches.push(e);
                                else
                                    otherMatches.push(e);
                            }
                        }
                        return null;
                    }

                    find(cursor, false);
                    for(const i in bestMatches)
                        add(bestMatches[i])
                    for(const i in otherMatches)
                        add(otherMatches[i])

                    if(bestMatches.length + otherMatches.length > 0) {
                        $('#autocomplete').html(autocomplete);
                        return;
                    }
                    else if(cursor.indexOf(':') > -1) {
                        var emote = find(cursor.split(':')[0], true);
                        var modifiers = cursor.split(':').splice(1);
                        if(emote) {
                            autocomplete = '';
                            add(emote, modifiers);
                            $('#autocomplete').html(autocomplete);
                            return;
                        }
                    }
                }
            }
        }
        $('#autocomplete').hide();
    }
}