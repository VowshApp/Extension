class PronounsFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.pronouns = null;
    }

    init() {
        var self = this;
        Vowsh.log(Debug, 'Downloading pronouns from https://ryan.gq/vowsh/pronouns?channel=' + btoa(window.location.host) + ' ...');
        $.get('https://ryan.gq/vowsh/pronouns?channel=' + btoa(window.location.host)).done(function(pronouns) {
            self.pronouns = pronouns;
            Vowsh.log(Debug, pronouns);
        }).fail(function(a, b, c) {
            Vowsh.log(Warn, a, b, c);
        });
    }

    onMessage(message) {
        if(this.pronouns == null)
            return;
        
        var username = message.data('username');
        for(const user of this.pronouns) {
            if(user.name.toLowerCase() == username.toLowerCase()) {
                message.append('<span class="pronouns">' + user.pronouns + '</span>');
            }
        }
    }
}