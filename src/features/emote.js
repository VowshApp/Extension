class EmoteFeature extends Feature {
    init() {
        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
        $('body')
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'})
            .on('click', '.chat-lines .chat-emote', this.onClick.bind(this));
    }

    onMessage(message) {
        message.find('.chat-emote').css('cursor', 'pointer');
    }

    onClick(event) {
        var input = $('#chat-input-control');
        var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
        input.val(input.val() + space + $(event.target).text() + ' ');
    }
}