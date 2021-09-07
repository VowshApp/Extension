class EmoteGrabFeature extends Feature {
    init() {
        $('body')
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'})
            .on('click', '.chat-lines .chat-emote', this.onClick.bind(this))
            
        $('#chat-input-frame')
            .tooltip({selector: '#autocomplete .chat-emote', container: '#chat-input-frame'})
            .on('click', '#autocomplete .chat-emote', this.onClick.bind(this))
            .on('keydown', this.onKeydown.bind(this));

        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
    }

    onMessage(message) {
        message.find('.chat-emote').css('cursor', 'pointer');
    }

    onClick(event) {
        var input = $('#chat-input-control');
        
        if($(event.target).is('.autocomplete-emote')) {
            var cursor = this.Vowsh.getCursorPosition(input);
            var space = input.val().slice(0, cursor).lastIndexOf(' ');

            var end = input.val().slice(cursor);
            if(space > -1) {
                var start = input.val().slice(0, space);
                input.val(start + ' ' + $(event.target).text() + ' ' + end);
            }
            else {
                input.val($(event.target).text() + ' ' + end);
            }

            $('#autocomplete').hide();
        }
        else {
            var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
            input.val(input.val() + space + $(event.target).text() + ' ');
        }

        input.focus();
    }

    onKeydown(event) {
        if(event.key == 'Escape')
            $('.tooltip').tooltip('hide');
    }
}