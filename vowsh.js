const LINK_LOADING = 2;
var links = {};
setInterval(handleChat, 500);
$('body').tooltip({
    selector: '.chat-emote',
    container: '.chat-lines'
}).on('click', '.chat-lines .chat-emote', function(event) {
    var input = $('#chat-input-control');
    var space = input.val().length && input.val().substr(input.val().length - 1) != ' ' ? ' ' : '';
    input.val(input.val() + space + $(event.target).text() + ' ');
}).on('mouseover', 'a', function(event) {
    //if($(event.target).attr('href')) {
        var href = $(event.target).attr('href') || 'https://www.google.com';
        if(!links.href) {
            console.log('Loading ' + href);
            $(event.target).popover({
                container: '.chat-lines',
                placement: 'auto top',
                trigger: 'hover',
                content: 'Loading preview',
                html: '<div class="popover" role="tooltip" data-href="' + href + '"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
            }).popover('show');
            links.href = {title: 'Google', description: 'Google test.', image: ''};
        }
        if(links.href !== LINK_LOADING) {

        }
        console.log(links.href);
    //}
});
function handleChat() {
    var lines = $('.msg-chat:not(.vowshed)');
    for(var i = 0; i < lines.length; i++) {
        var line = lines.eq(i);
        line.addClass('vowshed');
    }
}