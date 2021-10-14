class SettingsFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    }

    init(done = null) {
        if($('#chat-settings-form').hasClass('vowshed'))
            return;

        var settings = this;

        $('#chat-settings-form > h4').attr('style', 'color: #999')
        $('#chat-settings-form')
            .prepend(
                '<h4 class="text-white" style="color: orange; margin-bottom: 0px">Vowsh Settings</h4>' +
                '<small class="text-muted my-2" style="display: block; margin: 0px 0px 10px 17px">Some options may require a refresh to take effect.</small>' +
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
                '<div class="form-check">' +
                    '<input id="readable-chat" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="readable-chat" class="form-check-label">' +
                        'Separate chat lines' +
                    '</label>' +
                '</div>' +
                '<hr style="border-top: 1px solid #444">'
            )
            .addClass('vowshed');

        $('#more-emotes').change(function() {
            settings.storage.local.set({
                moreEmotes: $(this).is(':checked')
            }, settings.reload.bind(settings));
        });
        $('#enhanced-autocomplete').change(function() {
            settings.storage.local.set({
                enhancedAutocomplete: $(this).is(':checked')
            }, settings.reload.bind(settings));
        });
        $('#readable-chat').change(function() {
            settings.storage.local.set({
                readableChat: $(this).is(':checked')
            }, settings.reload.bind(settings));
        });

        settings.reload(done);
    }

    reload(done = null) {
        Vowsh.log(Debug, 'Reloading settings');
        this.storage.local.get({
            moreEmotes: true,
            enhancedAutocomplete: true,
            readableChat: true
        }, function(settings) {
            Vowsh.settings = settings;
            Vowsh.log(Debug, Vowsh.settings);
            
            $('#more-emotes').prop('checked', settings.moreEmotes);
            $('#enhanced-autocomplete').prop('checked', settings.enhancedAutocomplete);
            $('#readable-chat').prop('checked', settings.readableChat);

            // Apply other settings after chat has loaded.
            Vowsh.onReady(function() {
                $('.chat-lines').toggleClass('readable', Vowsh.settings.readableChat);
            });
            
            if(done != null)
                done(settings);
        });
    }
}