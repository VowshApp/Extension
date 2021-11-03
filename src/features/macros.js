class MacrosFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.input = $('#chat-input-control');
    }

    init() {
        this.input.on('keydown', this.onKeydown.bind(this));
    }

    onKeydown(e) {
        var macros = Vowsh.settings.macros.split('\n');

        if(!macros.length)
            return;
        
        if(e.altKey && /^[1-9]$/.test(e.key)) {
            var index = parseInt(e.key) - 1;
            if(index >= macros.length || !macros[index].length)
                return;
            
            Vowsh.insertEmote(this.input, macros[index], true);
        }
    }
}