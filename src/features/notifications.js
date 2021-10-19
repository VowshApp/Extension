class NotificationsFeature extends Feature {
    init() {
        Notification.requestPermission().then(function(result) {
            Vowsh.onReady(function() {
                if(result !== 'granted') {
                    $('.chat-lines').append('<div class="msg-chat msg-info"><span class="text" style="color: crimson">Notifications are enabled in Vowsh settings, but you haven\'t granted permission yet.</span></div>');
                }
            });
        });
    }

    onMessage(message) {
        if(message.is('.msg-highlight') && document.visibilityState != 'visible') {
            var mention = new Notification(message.data('username') + ' mentioned you');
            mention.onclick = function() { window.focus(); mention.close(); };

            document.addEventListener('visibilitychange', function() {
                if(document.visibilityState == 'visible') {
                    mention.close();
                }
            });
        }
    }
}