console.log('Downloading emotes for autocomplete...');

var emotes = null;
$.get('https://ryan.gq/vowsh/autocomplete').done(function(e) {
    emotes = e;
}).fail(function() {
    console.error('Failed to get emotes. Autocomplete will be missing some items.');
});

function injectEmotes(request) {
    let filter = browser.webRequest.filterResponseData(request.requestId);
    let decoder = new TextDecoder('utf-8');
    let encoder = new TextEncoder('utf-8');
    
    let response = '';
    filter.ondata = function(event) {
        response += decoder.decode(event.data, {stream: true});
    };

    filter.onstop = function(event) {
        let host = request.url.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0];
        let json = JSON.parse(response);
        console.log(request, host, emotes);
        if(emotes != null)
            for(const e of emotes[host])
                json.hiddenEmotes.push(e);
        filter.write(encoder.encode(JSON.stringify(json)));
        filter.close();
    }

    return {};
}

browser.webRequest.onBeforeRequest.addListener(
    injectEmotes,
    {
        urls: [
            'https://*.vaush.gg/for/apiAssets/chat/emotes.json*',
            'https://*.destiny.gg/for/apiAssets/chat/emotes.json*',
            'https://*.rosewrist.com/for/apiAssets/chat/emotes.json*',
            'https://*.demonmama.com/for/apiAssets/chat/emotes.json*',
            'https://*.re-vera.life/for/apiAssets/chat/emotes.json*',
            'https://*.xanderhal.com/for/apiAssets/chat/emotes.json*',
            'https://*.surreal.gg/for/apiAssets/chat/emotes.json*',
            'https://*.conure.cc/for/apiAssets/chat/emotes.json*',
        ],
        types: ['xmlhttprequest']
    },
    ['blocking']
);