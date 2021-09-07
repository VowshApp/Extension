class SettingsFeature extends Feature {
    init() {
        if($('#chat-settings-form').hasClass('vowshed'))
            return;

        $('#chat-settings-form > h4').attr('style', 'color: #999')
        $('#chat-settings-form')
            .prepend(
                '<h4 class="text-white" style="color: orange">Vowsh Settings</h4>' +
                '<div class="form-check">' +
                    '<input id="more-emotes" class="form-check-input" type="checkbox" disabled checked> ' +
                    '<label for="more-emotes" class="form-check-label">' +
                        'FrankerFaceZ emotes' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="more-emotes" class="form-check-input" type="checkbox" disabled checked> ' +
                    '<label for="more-emotes" class="form-check-label">' +
                        'Enhanced autocomplete' +
                    '</label>' +
                '</div>' +
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