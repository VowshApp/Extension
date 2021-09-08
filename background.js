// TODO - get list directly from https://ryan.gq/vowsh/autocomplete for full FFZ/BTTV support
// For now - only shared emotes have built-in autocomplete

/*
const emotes = ["peepoWeird","KEKWait","blobDance","FeelsStrongMan","modCheck","DonoWall","peepoSnow","PepeP","YeeLaugh","YeeMods","YeeDAFUK","FeelsPeekMan","YAM","YEEHAW","PARDNER","BirBreak","vggL","peepoClap","peepoWow","monkaW","FeelsOkayMan","ItalianHands","PogU","POGSLIDE","peepoHey","peepoBye","SUGOI","pepePoint","4WeirdW","4WeirdBuff","peepoWeen","NODDERS","NOPERS","SmokeTime","KKapitalist","WineTime","GuitarTime","COOMER","Vowshgasm","widepeepoWeird","popCat","peepoHappy","AYAYAWeird","frogBLUSH","kot","TrollFace","DANKIES","PIGGIES","TANKIES","pepeJAMJAM","ratJAMJAM","Scoots","hasanSmash","monkaHmm","Okayge","Weirdge","Gladge","Madge","Prayge","peepoKiss","peepoShrek","PogChimp","tonyW","GODVOSA","teddyPepe","NA","EU","peepoBaba","FeelsDankMan","DANKHACKERMANS","VorshG","YEPPERS","forsenCD","peepoCheer","peepoRiot","WAYTOODANK","DaFeels","BLOOMER","OMEGADANCE","HOGGERS","PepeD","ppHop","ppPoof","pepeMeltdown","PepOk","PepoWant","PepoSulk","OMEGALULiguess","punDog","Hhhehhehe"];

browser.webRequest.onBeforeRequest.addListener(
    function(request) {
        let filter = browser.webRequest.filterResponseData(request.requestId);
        let decoder = new TextDecoder('utf-8');
        let encoder = new TextEncoder('utf-8');
        
        let response = '';
        filter.ondata = function(event) {
            response += decoder.decode(event.data, {stream: true});
        };
        filter.onstop = function(event) {
            let json = JSON.parse(response);
            for(const e of emotes)
                json.defaultEmotes.push(e);
            filter.write(encoder.encode(JSON.stringify(json)));
            filter.close();
        }

        return {};
    },
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
        types: [
            'xmlhttprequest'
        ]
    },
    [
        'blocking'
    ]
);*/