class AutocompleteFeature extends Feature {
    constructor(vowsh) {
        super(vowsh);
        this.input = $('#chat-input-control');
    }

    init() {
        this.input.on('keyup', this.onKeyup.bind(this));
    }

    onKeyup(event) {
        Vowsh.log(Debug, 'Cursor is at position ' + this.getCursorPosition());
    }

    getCursorPosition() {
        var el = this.input.get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }
}