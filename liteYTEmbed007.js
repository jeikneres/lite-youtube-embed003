class LiteYTEmbed extends HTMLElement {
    connectedCallback() {
        this.videoId = this.getAttribute('videoid');
        let playBtnEl = this.querySelector('.lty-playbtn');
        this.playLabel = (playBtnEl && playBtnEl.textContent.trim()) || this.getAttribute('playlabel') || 'Play';
        this.dataset.title = this.getAttribute('title') || "";

        if (!this.style.backgroundImage) {
            this.style.backgroundImage = `url("https://i.ytimg.com/vi_webp/${this.videoId}/sddefault.webp")`;
        }

        this.upgradePosterImage();

      if (!playBtnEl) {
    playBtnEl = document.createElement('button');
    playBtnEl.type = 'button';
    playBtnEl.classList.add('lty-playbtn');
    
    // Estilos para centralizar o botão
    this.style.display = 'center';         // Habilita flexbox no contêiner
    this.style.justifyContent = 'center'; // Centraliza horizontalmente
    this.style.alignItems = 'center';     // Centraliza verticalmente
    this.style.position = 'center';    // Para garantir que o botão se posicione corretamente

    this.append(playBtnEl);
}

if (!playBtnEl.textContent) {
    const playBtnLabelEl = document.createElement('span');
    playBtnLabelEl.className = 'lyt-visually-hidden';
    playBtnLabelEl.textContent = this.playLabel;
    playBtnEl.append(playBtnLabelEl);
}

this.addNoscriptIframe();

if (playBtnEl.nodeName === 'A') {
    playBtnEl.removeAttribute('href');
    playBtnEl.setAttribute('tabindex', '0');
    playBtnEl.setAttribute('role', 'button');
    playBtnEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.activate();
        }
    });
}

            });
        }

        this.addEventListener('pointerover', LiteYTEmbed.warmConnections, { once: !0 });
        this.addEventListener('focusin', LiteYTEmbed.warmConnections, { once: !0 });
        this.addEventListener('click', this.activate);

        this.needsYTApi = this.hasAttribute("js-api") || navigator.vendor.includes('Apple') || navigator.userAgent.includes('Mobi');
    }

    static addPrefetch(kind, url, as) {
        const linkEl = document.createElement('link');
        linkEl.rel = kind;
        linkEl.href = url;
        if (as) {
            linkEl.as = as;
        }
        document.head.append(linkEl);
    }

    static warmConnections() {
        if (LiteYTEmbed.preconnected) return;
        LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
        LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');
        LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
        LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
        LiteYTEmbed.preconnected = !0;
    }

    fetchYTPlayerApi() {
        if (window.YT || (window.YT && window.YT.Player)) return;
        this.ytApiPromise = new Promise((res, rej) => {
            var el = document.createElement('script');
            el.src = 'https://www.youtube.com/iframe_api';
            el.async = !0;
            el.onload = _ => { YT.ready(res); };
            el.onerror = rej;
            this.append(el);
        });
    }

    async getYTPlayer() {
        if (!this.playerPromise) {
            await this.activate();
        }
        return this.playerPromise;
    }

    async addYTPlayerIframe() {
        this.fetchYTPlayerApi();
        await this.ytApiPromise;
        const videoPlaceholderEl = document.createElement('div');
        this.append(videoPlaceholderEl);
        const paramsObj = Object.fromEntries(this.getParams().entries());
        this.playerPromise = new Promise(resolve => {
            let player = new YT.Player(videoPlaceholderEl, {
                width: '100%',
                videoId: this.videoId,
                playerVars: paramsObj,
                events: {
                    'onReady': event => {
                        event.target.playVideo();
                        resolve(player);
                    }
                }
            });
        });
    }

    addNoscriptIframe() {
        const iframeEl = this.createBasicIframe();
        const noscriptEl = document.createElement('noscript');
        noscriptEl.innerHTML = iframeEl.outerHTML;
        this.append(noscriptEl);
    }

    getParams() {
        const params = new URLSearchParams(this.getAttribute('params') || []);
        params.append('autoplay', '1');
        params.append('playsinline', '1');
        return params;
    }

    async activate() {
        if (this.classList.contains('lyt-activated')) return;
        this.classList.add('lyt-activated');
        if (this.needsYTApi) {
            return this.addYTPlayerIframe(this.getParams());
        }
        const iframeEl = this.createBasicIframe();
        this.append(iframeEl);
        iframeEl.focus();
    }

    createBasicIframe() {
        const iframeEl = document.createElement('iframe');
        iframeEl.style.width = '80vw'; 
        iframeEl.style.height = '45vw';
        iframeEl.title = this.playLabel;
        iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        iframeEl.allowFullscreen = !0;
        iframeEl.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.videoId)}?${this.getParams().toString()}`;
        iframeEl.style.maxWidth = '100%';
        iframeEl.style.height = 'auto';
        return iframeEl;
    }

    upgradePosterImage() {
        setTimeout(() => {
            const webpUrl = `https://i.ytimg.com/vi_webp/${this.videoId}/sddefault.webp`;
            const img = new Image();
            img.fetchPriority = 'low';
            img.referrerpolicy = 'origin';
            img.src = webpUrl;
            img.onload = e => {
                const noAvailablePoster = e.target.naturalHeight == 90 && e.target.naturalWidth == 120;
                if (noAvailablePoster) return;
                this.style.backgroundImage = `url("${webpUrl}")`;
                this.style.backgroundSize = 'cover';
                this.style.backgroundPosition = 'center';
                this.style.height = '50vh';
                this.style.maxWidth = '80vw';
            };
        }, 100);
    }

    // Método para centralizar o botão
    static styleButtonCenter() {
        const playBtnEl = document.querySelector('.lty-playbtn');
        if (playBtnEl) {
            playBtnEl.style.position = 'absolute';
            playBtnEl.style.top = '50%';
            playBtnEl.style.left = '50%';
            playBtnEl.style.transform = 'translate(-50%, -50%)';
        }
    }
}

customElements.define('lite-youtube', LiteYTEmbed);
