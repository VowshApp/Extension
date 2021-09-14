class SettingsFeature extends Feature {
    init(done = null) {
        if($('#chat-settings-form').hasClass('vowshed'))
            return;

        $('#chat-settings-form > h4').attr('style', 'color: #999')
        $('#chat-settings-form')
            .prepend(
                '<h4 class="text-white" style="color: orange">Vowsh Settings</h4>' +
                '<div class="form-check">' +
                    '<input id="more-emotes" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="more-emotes" class="form-check-label">' +
                        'More emotes' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="enhanced-autocomplete" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="enhanced-autocomplete" class="form-check-label">' +
                        'Enhanced autocomplete' +
                    '</label>' +
                '</div>' +
                '<hr style="border-top: 1px solid #444">'
            )
            .addClass('vowshed');


        var settings = this;
        
        $('#more-emotes').change(function() {
            browser.storage.local.set({
                moreEmotes: $(this).is(':checked')
            }, settings.reload);
        });
        $('#enhanced-autocomplete').change(function() {
            browser.storage.local.set({
                enhancedAutocomplete: $(this).is(':checked')
            }, settings.reload);
        });

        settings.reload(done);
    }

    reload(done = null) {
        Vowsh.log(Debug, 'Reloading settings');
        browser.storage.local.get({
            moreEmotes: true,
            enhancedAutocomplete: true
        }, function(settings) {
            Vowsh.settings = settings;
            Vowsh.log(Debug, Vowsh.settings);
            $('#more-emotes').prop('checked', settings.moreEmotes);
            $('#enhanced-autocomplete').prop('checked', settings.enhancedAutocomplete);
            if(done != null)
                done(settings);
        });
    }
}