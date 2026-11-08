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
