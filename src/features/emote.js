class EmoteFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
    }

    init() {
        Vowsh.log(Debug, "Initializing emote feature");
        // Emote grab/tooltip
        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
        $('body')
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'})
            .on('click', '.chat-lines .chat-emote', function(event) {
                var input = $('#chat-input-control');
                var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
                input.val(input.val() + space + $(event.target).text() + ' ');
            })
            .on('keyup', this.onKeyup.bind(this));
    }

    // Make emotes look clickable
    onMessage(message) {
        message.find('.chat-emote').css('cursor', 'pointer');
    }

    onKeyup(event) {
        Vowsh.log(Debug, 'Textarea cursor is at position ' + $('#chat-input-control').getCursorPosition());
    }
}