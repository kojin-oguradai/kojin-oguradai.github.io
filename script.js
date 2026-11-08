/**
 * 興人小倉台自治会 ホームページ
 * JavaScriptインタラクティブ機能
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lucideアイコンの初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. 文字サイズ調整機能（ローカルストレージ保存付き）
    initFontSizeController();

    // 3. モバイルナビゲーションメニュー
    initMobileMenu();

    // 4. カレンダータブ切り替え
    initCalendarTabs();

    // 4-2. 集会所の予約状況リスト（Googleカレンダーから読み込み）
    initScheduleList();

    // 5. お知らせの絞り込み
    initNewsSystem();

    // 6. お問い合わせフォーム送信（デモ動作）
    initContactForm();
});

/**
 * 文字サイズ調整機能
 */
function initFontSizeController() {
    const btnStandard = document.getElementById('btn-size-standard');
    const btnLarge = document.getElementById('btn-size-large');
    const btnXlarge = document.getElementById('btn-size-xlarge');
    const buttons = [btnStandard, btnLarge, btnXlarge];

    // 保存されたサイズ設定を読み込み
    const savedSize = localStorage.getItem('jichikai-font-size') || 'medium';
    applyFontSize(savedSize);

    btnStandard.addEventListener('click', () => {
        applyFontSize('medium');
    });

    btnLarge.addEventListener('click', () => {
        applyFontSize('large');
    });

    btnXlarge.addEventListener('click', () => {
        applyFontSize('xlarge');
    });

    function applyFontSize(size) {
        // ボディのクラス名をクリアして再設定
        document.body.classList.remove('font-size-medium', 'font-size-large', 'font-size-xlarge');
        document.body.classList.add(`font-size-${size}`);

        // ボタンのactiveクラスを更新
        buttons.forEach(btn => btn.classList.remove('active'));
        if (size === 'medium') {
            btnStandard.classList.add('active');
        } else if (size === 'large') {
            btnLarge.classList.add('active');
        } else if (size === 'xlarge') {
            btnXlarge.classList.add('active');
        }

        // 設定を保存
        localStorage.setItem('jichikai-font-size', size);
    }
}

/**
 * モバイルメニューの開閉制御
 */
function initMobileMenu() {
    const toggleBtn = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    const openIcon = document.getElementById('menu-icon-open');
    const closeIcon = document.getElementById('menu-icon-close');

    if (!toggleBtn || !nav) return;

    toggleBtn.addEventListener('click', () => {
        const isOpen = nav.classList.contains('open');
        
        if (isOpen) {
            nav.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
            openIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        } else {
            nav.classList.add('open');
            toggleBtn.setAttribute('aria-expanded', 'true');
            openIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
        }
    });

    // メニュー内のリンクをクリックしたときにメニューを閉じる（スマホ用）
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggleBtn.setAttribute('aria-expanded', 'false');
                openIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }

            // アクティブリンクの表示切替
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

/**
 * カレンダーセクションのタブ切り替え
 */
function initCalendarTabs() {
    const tabs = document.querySelectorAll('.calendar-tab-btn');
    const panels = document.querySelectorAll('.calendar-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanelId = tab.getAttribute('aria-controls');

            // すべてのタブの active クラスと aria-selected を解除
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });

            // すべてのパネルを隠す
            panels.forEach(p => p.classList.add('hidden'));

            // 選択されたタブとパネルをアクティブにする
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
            }
        });
    });
}

/**
 * 集会所の予約状況リスト
 * Google Calendar API で「集会所予約」カレンダーの予定を読み込み、一覧表示する。
 * カレンダーID・APIキー・表示期間は _config.yml の community_calendar で設定する。
 */
const DOW_CLASSES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function initScheduleList() {
    const list = document.getElementById('schedule-list');
    if (!list) return;

    const calendarId = list.dataset.calendarId;
    const apiKey = list.dataset.apiKey;
    const days = parseInt(list.dataset.days, 10) || 60;
    const showTitle = list.dataset.showTitle !== 'false';
    const calendarUrl = list.dataset.calendarUrl;

    const now = new Date();
    const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
        key: apiKey,
        timeMin: now.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',   // 繰り返し予定を1回ずつに展開する
        orderBy: 'startTime',
        maxResults: '100',
        timeZone: 'Asia/Tokyo'
    });
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => renderSchedule(list, data.items || [], { days, showTitle }))
        .catch(err => {
            console.error('予約状況の読み込みに失敗しました:', err);
            renderScheduleError(list, calendarUrl);
        })
        .finally(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
}

// Googleカレンダーの日時（終日 or 時刻あり）を日本時間の表示用部品に変換
function toJstParts(when) {
    if (when.date) {
        // 終日の予定（"2026-06-01" 形式）
        const [y, m, d] = when.date.split('-').map(Number);
        const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
        return { key: when.date, month: m, day: d, dow, time: null };
    }
    const date = new Date(when.dateTime);
    const parts = {};
    new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(date).forEach(p => { parts[p.type] = p.value; });
    const y = Number(parts.year), m = Number(parts.month), d = Number(parts.day);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return { key: `${y}-${m}-${d}`, month: m, day: d, dow, time: `${parts.hour}:${parts.minute}` };
}

function renderSchedule(list, events, options) {
    list.innerHTML = '';

    const items = events.filter(ev => ev.status !== 'cancelled' && ev.start);
    if (items.length === 0) {
        list.innerHTML = `<p class="schedule-message"><i data-lucide="check-circle"></i> 今後${options.days}日間の予約はありません（すべての日時が空いています）。</p>`;
        return;
    }

    items.forEach(ev => {
        const start = toJstParts(ev.start);
        const end = ev.end ? toJstParts(ev.end) : null;

        let timeText;
        if (!start.time) {
            timeText = '終日';
        } else if (end && end.time && end.key !== start.key) {
            timeText = `${start.time} 〜 ${end.month}月${end.day}日 ${end.time}`;
        } else {
            timeText = end && end.time ? `${start.time} 〜 ${end.time}` : start.time;
        }

        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="schedule-date-badge">
                <span class="month">${start.month}月</span>
                <span class="day">${start.day}日</span>
                <span class="day-of-week ${DOW_CLASSES[start.dow]}">(${DOW_LABELS[start.dow]})</span>
            </div>
            <div class="schedule-details">
                <span class="time"><i data-lucide="clock"></i> ${timeText}</span>
                <h4 class="event-title"></h4>
                <span class="status status-booked">予約済</span>
            </div>
        `;
        // 予定のタイトルは外部データなので textContent で安全に設定する
        item.querySelector('.event-title').textContent =
            options.showTitle && ev.summary ? ev.summary : '予約あり';
        list.appendChild(item);
    });
}

function renderScheduleError(list, calendarUrl) {
    list.innerHTML = `
        <p class="schedule-message schedule-error">
            <i data-lucide="alert-triangle"></i>
            予約状況を読み込めませんでした。お手数ですが「Googleカレンダー表示」タブ、または
            <a href="${calendarUrl}" target="_blank" rel="noopener noreferrer">Google カレンダー</a>
            でご確認ください。
        </p>
    `;
}

/**
 * お知らせの絞り込み（フィルター）
 * ※ お知らせの記事そのものは _posts フォルダの Markdown ファイルで管理しています。
 */
function initNewsSystem() {
    const filterButtons = document.querySelectorAll('.btn-filter');
    const newsGrid = document.getElementById('news-grid');

    if (!newsGrid) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // アクティブボタンの切り替え
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const cards = newsGrid.querySelectorAll('.news-card');

            cards.forEach(card => {
                const visible = filterValue === 'all' || card.classList.contains(filterValue);
                card.style.display = visible ? 'flex' : 'none';
            });
        });
    });
}

/**
 * お問い合わせフォーム（デモ動作用）
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success-msg');

    if (!form || !successMsg) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // フェードインで成功メッセージを表示
        successMsg.classList.remove('hidden');
        
        // フォームのリセット
        form.reset();

        // 3秒後にメッセージをゆっくり隠す（またはそのままでもOKですが、視覚的に残す）
        setTimeout(() => {
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    });
}
