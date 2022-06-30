/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ Pause/ seek
 * 4. CD rotate
 * 5. Next/ Back
 * 6. Random
 * 7. Next/ Repeat when ended
 * 8. Active the song (active when the web is just opened, when next/back song)
 * 9. Scroll active the song into view used scrollIntoView() method (when next/back song)
 * 10. Play the song when it is clicked
 * 11. Create localStorage and set config
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "music-app";

const player = $('.player');
const playlist = $('.playlist');
const audio = $('#audio');
const progress = $('#progress');
const cd = $('.cd');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Crying Over You',
            singer: 'JustaTee, Binz',
            path: './assets/audio/crying-over-you.mp3',
            image: './assets/img/background-cd-thumb.jpg',
        },
        {
            name: 'Hoa Hải Đường',
            singer: 'Jack',
            path: './assets/audio/hoa-hai-duong.mp3',
            image: './assets/img/hoa-hai-duong.jpeg',
        },
        {
            name: 'Khuê Mộc Lan',
            singer: 'Xuân Tùng',
            path: './assets/audio/khue-moc-lang.mp3',
            image: './assets/img/khue-moc-lang.jpeg',
        },
        {
            name: 'Rồi Tới Luôn',
            singer: 'Sơn Tùng',
            path: './assets/audio/roi-toi-luon.mp3',
            image: './assets/img/roi-toi-luon.jpeg',
        },
        {
            name: 'Sầu Hồng Gai',
            singer: 'HKT',
            path: './assets/audio/sau-hong-gai.mp3',
            image: './assets/img/sau-hong-gai.jpeg',
        },
        {
            name: 'Thiên Đàng',
            singer: 'Ricky Star',
            path: './assets/audio/thien-dang.mp3',
            image: './assets/img/thien-dang.jpeg',
        },
        {
            name: 'Thương Nhau Tới Bến',
            singer: 'MCKey',
            path: './assets/audio/thuong-nhau-toi-ben.mp3',
            image: './assets/img/thuong-nhau-toi-ben.jpeg',
        },
        {
            name: 'Y Chang Xuân Sang',
            singer: 'B Ray',
            path: './assets/audio/y-chang-xuan-sang.mp3',
            image: './assets/img/y-chang-xuan-sang.jpeg',
        }
    ],

    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.currentIndex = this.config.currentIndex || 0;
    },

    render() {
        const htmlCodes = this.songs.map(song => {
            return `
            <div class="song">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`;
        })

        playlist.innerHTML = htmlCodes.join('');

        this.songElements[this.currentIndex].classList.add('active');
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },

    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get: function () { return this.songs[this.currentIndex]; }
        })
        Object.defineProperty(this, 'songElements', {
            get: function () { return $$('.song'); }
        })
    },

    handleEvents() {
        const _this = this;
        const originalWidthOfCD = cd.offsetWidth;

        // CD rotate
        const cdThumbAnimate = cd.animate([{
            transform: 'rotate(360deg)',
        }], {
            duration: 10000,    // 10 seconds
            iterations: Infinity,
        })
        cdThumbAnimate.pause();

        // scroll top
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidthOfCD = (scrollTop > originalWidthOfCD ? 0 : originalWidthOfCD - scrollTop);

            cd.style.width = newWidthOfCD + 'px';
            cd.style.opacity = newWidthOfCD / originalWidthOfCD;
        }

        // play/ pause the song
        const playBtn = $('.btn-toggle-play');
        playBtn.onclick = function () {
            if (!_this.isPlaying) {
                audio.play();
            } else {
                audio.pause();
            }
        }

        audio.onplay = function () {
            _this.isPlaying = true;
            cdThumbAnimate.play();
            player.classList.add('playing');

            const prevActiveSong = $('.song.active');
            prevActiveSong.classList.remove('active');
            _this.songElements[_this.currentIndex].classList.add('active');
        }

        audio.onpause = function () {
            _this.isPlaying = false;
            cdThumbAnimate.pause();
            player.classList.remove('playing');
        }

        audio.ontimeupdate = function () {
            if (this.duration) {
                const maxProgress = progress.max;
                const currentProgress = Math.floor(this.currentTime / this.duration * maxProgress);
                progress.value = currentProgress;
            }
        }

        progress.onchange = function () {
            const maxProgress = progress.max;
            const newTime = this.value / maxProgress * audio.duration;
            audio.currentTime = newTime;
        }

        nextBtn.onclick = function () {
            _this.isRandom ? _this.randomSong() : _this.nextSong();
            audio.play();
            _this.scrollToActiveSong();
            _this.setConfig('currentIndex', _this.currentIndex);
        }

        prevBtn.onclick = function () {
            _this.isRandom ? _this.randomSong() : _this.backSong();
            audio.play();
            _this.scrollToActiveSong();
            _this.setConfig('currentIndex', _this.currentIndex);
        }

        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            this.classList.toggle('active', _this.isRandom);
        }

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            this.classList.toggle('active', _this.isRepeat);
        }

        // next/repeat when audio ended
        audio.onended = function () {
            _this.isRepeat ? audio.play() : nextBtn.click();
        }

        // Play the song when it is clicked
        for (let i = 0; i < this.songElements.length; i++) {
            const songElement = this.songElements[i];
            
            songElement.onclick = function (e) {
                // if the option is clicked
                if (e.target.closest('.option')) {

                }
                // if the song is clicked (not the song is playing)
                else if (this.closest('.song:not(.active)')) {
                    $('.song.active').classList.remove('active');
                    this.classList.add('active');
                    _this.currentIndex = i;
                    _this.loadCurrentSong();
                    audio.play();
                    _this.setConfig('currentIndex', _this.currentIndex);
                }
            }
        }
    },

    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length)
            this.currentIndex = 0;
        this.loadCurrentSong();
    },

    backSong() {
        this.currentIndex--;
        if (this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1;
        this.loadCurrentSong();
    },

    scrollToActiveSong() {
        setTimeout(function () {
            const blockValue = (app.currentIndex > 2 ? 'nearest' : 'end');
            app.songElements[app.currentIndex].scrollIntoView({
                behavior: 'smooth', block: blockValue,
            })
        }, 300);
    },

    randomSong() {
        let newIndex = 0;
        do
            newIndex = Math.floor(Math.random() * this.songs.length);
        while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    loadCurrentSong() {
        const heading = $('header h2');
        const cd_thumb = $('.cd-thumb');

        heading.innerHTML = this.currentSong.name;
        cd_thumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    start() {
        this.defineProperties();
        this.loadConfig();
        this.render();
        this.handleEvents();
        this.loadCurrentSong();
    },
}

app.start();