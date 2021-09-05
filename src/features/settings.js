class SettingsFeature extends Feature {
    init() {
        if($('#chat-settings-form').hasClass('vowshed'))
            return;

        $('#chat-settings-form > h4').attr('style', 'color: #999')
        $('#chat-settings-form')
            .prepend(
                '<h4 class="text-white" style="color: orange">Vowsh Settings</h4>' +
                '<div class="form-check">' +
                    '<input id="sync" class="form-check-input" type="checkbox"> ' +
                    '<label for="sync" class="form-check-label">' +
                        'More emotes' +
                    '</label>' +
                '</div>' +
                '<button id="reset" class="btn btn-sm btn-warning">Reset</button>' +
                '<hr style="border-top: 1px solid #444">'
            )
            .addClass('vowshed');
        
        var settings = this;
        settings.reload();
        $('#sync').changed(function() {
            // set({sync: $(this).is(':checked')}, settings.reload);
        });
    }

    reload() {
        //get({sync: true}, $('#sync').prop('checked', results.sync))
    }
}