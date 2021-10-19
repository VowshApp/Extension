class EmoteGrabFeature extends Feature {
    init() {
        $('body')
            .tooltip({selector: '.chat-lines .chat-emote', container: '.chat-lines'})
            .on('mousedown', '.chat-lines .chat-emote', this.onMousedown.bind(this))
            
        $('#chat-input-frame')
            .tooltip({selector: '#autocomplete .chat-emote', container: '#chat-input-frame'})
            .on('mousedown', '#autocomplete .chat-emote', this.onMousedown.bind(this))
            .on('keydown', this.onKeydown.bind(this));

        $('#chat-emote-list').tooltip({selector: '.chat-emote'});
    }

    onMessage(message) {
        message.find('.chat-emote').css('cursor', 'pointer');
    }

    onMousedown(event) {
        var input = $('#chat-input-control');
        
        if(event.which == 2) {
            Vowsh.log(Debug, 'Copying emote to clipboard...');
            navigator.clipboard.writeText($(event.target).text() + ' ');
            event.preventDefault();
        }
        else if(event.which == 1) {
            if($(event.target).is('.autocomplete-emote')) {
                var cursor = Vowsh.getCursorPosition(input);
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
        }

        setTimeout(function() {
            input.focus();
        }, 1);
    }

    onKeydown(event) {
        if(event.key == 'Escape')
            $('.tooltip').tooltip('hide');
    }
}