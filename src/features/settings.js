class SettingsFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.storage = Vowsh.browser.storage;
    }

    init(done = null) {
        if($('#chat-settings-form').hasClass('vowshed'))
            return;

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
                '<div class="form-check">' +
                    '<input id="pronouns" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="pronouns" class="form-check-label">' +
                        'Display pronouns' +
                    '</label>' +
                '</div>' +
                '<div class="form-check">' +
                    '<input id="notifications" class="form-check-input" type="checkbox" checked> ' +
                    '<label for="notifications" class="form-check-label">' +
                        'Notify when mentioned' +
                    '</label>' +
                '</div>' +
                '<hr style="border-top: 1px solid #444">'
            )
            .addClass('vowshed');

        var self = this;
            
        $('#more-emotes').change(function() {
            self.storage.local.set({
                moreEmotes: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#enhanced-autocomplete').change(function() {
            self.storage.local.set({
                enhancedAutocomplete: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#readable-chat').change(function() {
            self.storage.local.set({
                readableChat: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#pronouns').change(function() {
            self.storage.local.set({
                pronouns: $(this).is(':checked')
            }, self.reload.bind(self));
        });
        $('#notifications').change(function() {
            self.storage.local.set({
                notifications: $(this).is(':checked')
            }, self.reload.bind(self));
        })

        self.reload(done);
    }

    reload(done = null) {
        Vowsh.log(Debug, 'Reloading settings');
        this.storage.local.get({
            moreEmotes: true,
            enhancedAutocomplete: true,
            readableChat: true,
            pronouns: true,
            notifications: true
        }, function(settings) {
            Vowsh.settings = settings;
            Vowsh.log(Debug, Vowsh.settings);
            
            $('#more-emotes').prop('checked', settings.moreEmotes);
            $('#enhanced-autocomplete').prop('checked', settings.enhancedAutocomplete);
            $('#readable-chat').prop('checked', settings.readableChat);
            $('#pronouns').prop('checked', settings.pronouns);
            $('#notifications').prop('checked', settings.notifications);

            // Apply other settings after chat has loaded.
            Vowsh.onReady(function() {
                $('.chat-lines')
                    .toggleClass('readable', Vowsh.settings.readableChat)
                    .toggleClass('with-pronouns', Vowsh.settings.pronouns);
            });
            
            if(done != null)
                done(settings);
        });
    }
}