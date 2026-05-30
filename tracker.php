<?php
session_start();
date_default_timezone_set('Asia/Jakarta');

// Configurations
$correct_password = "sayangku123"; // You can change this password
$filePath = __DIR__ . '/data/responses.json';
$cookie_name = "tracker_auth";
$cookie_val = md5($correct_password);

// Authentication check (Session or Cookie)
$is_logged_in = (isset($_SESSION['logged_in_tracker']) && $_SESSION['logged_in_tracker'] === true) || 
                (isset($_COOKIE[$cookie_name]) && $_COOKIE[$cookie_name] === $cookie_val);

// Logout Handler
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    unset($_SESSION['logged_in_tracker']);
    setcookie($cookie_name, '', time() - 3600, '/'); // Clear cookie
    header("Location: tracker.php");
    exit;
}

// Clear Data Handler
if (isset($_POST['action']) && $_POST['action'] === 'clear_data') {
    if ($is_logged_in) {
        if (file_exists($filePath)) {
            file_put_contents($filePath, json_encode([]));
        }
        $clear_success = true;
    }
}

// Login Handler
$error_msg = "";
if (isset($_POST['password'])) {
    if (trim($_POST['password']) === $correct_password) {
        $_SESSION['logged_in_tracker'] = true;
        // Save in cookie for 30 days
        setcookie($cookie_name, $cookie_val, time() + 86400 * 30, '/');
        header("Location: tracker.php");
        exit;
    } else {
        $error_msg = "Password salah! Coba lagi ya... 💀";
    }
}

// Helper to parse User Agent
function getReadableUserAgent($ua) {
    if (preg_match('/android/i', $ua)) return '📱 Android Phone';
    if (preg_match('/iphone/i', $ua)) return '📱 iPhone / iOS';
    if (preg_match('/ipad/i', $ua)) return '平板 iPad / iOS';
    if (preg_match('/windows/i', $ua)) return '💻 Windows PC';
    if (preg_match('/macintosh|mac os x/i', $ua)) return '💻 Mac OS';
    if (preg_match('/linux/i', $ua)) return '💻 Linux PC';
    return '❓ Perangkat Tidak Dikenal';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tracker Rahasia Respon Ayyie 🖤</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {
            align-items: flex-start;
            padding: 30px 10px;
        }
    </style>
</head>
<body>

    <div class="goth-vibe-bg"></div>

    <div class="dashboard-container">
        
        <?php if (!$is_logged_in): ?>
            <!-- LOGIN VIEW -->
            <div class="romantic-card" style="max-width: 480px; margin: 50px auto;">
                <div class="goth-border-decor top-left"></div>
                <div class="goth-border-decor top-right"></div>
                
                <h1 class="emo-title">🔐 Area Rahasia</h1>
                <p class="emo-text" style="font-size: 0.9rem;">
                    Halaman ini khusus buat kamu (Aell) untuk memantau respon dan membaca surat cinta balasan dari Ayyie secara rahasia.
                </p>

                <?php if ($error_msg !== ""): ?>
                    <div style="color: var(--primary-neon); background: rgba(255, 42, 116, 0.1); padding: 10px; border-radius: 8px; border: 1px dashed var(--primary-neon); margin-bottom: 20px; font-family: var(--font-emo); font-size: 0.85rem;">
                        <?= $error_msg ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="tracker.php" class="login-form">
                    <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Masukkan Password Tracker:</label>
                    <input type="password" name="password" class="goth-input" placeholder="Masukkan password rahasiamu..." required autofocus style="text-align: center;">
                    
                    <button type="submit" class="goth-btn" style="width: 100%; margin-top: 10px;">
                        Buka Tracker 🖤
                    </button>
                </form>
                
                <p style="font-family: var(--font-emo); font-size: 0.75rem; color: var(--text-muted); margin-top: 20px;">*password: sayangku123</p>
            </div>

        <?php else: ?>
            <!-- TRACKER VIEW -->
            <div class="dashboard-card">
                
                <div style="display: flex; flex-direction: column; md-flex-direction: row; justify-content: space-between; align-items: center; border-bottom: 2px dashed rgba(161, 44, 255, 0.3); padding-bottom: 20px; margin-bottom: 30px; gap: 15px;">
                    <div style="text-align: left;">
                        <h1 class="emo-title" style="margin-bottom: 5px;">Ayyie Response Tracker 🖤</h1>
                        <p class="emo-text" style="margin-bottom: 0; font-size: 0.9rem;">
                            Berikut adalah catatan respon dan surat balasan dari Ayyie.
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <a href="tracker.php" class="goth-btn" style="font-size: 0.85rem; padding: 8px 18px; border-color: var(--accent-neon); box-shadow: 0 0 10px var(--accent-glow);">
                            🔄 Refresh
                        </a>
                        <a href="tracker.php?action=logout" class="goth-btn" style="font-size: 0.85rem; padding: 8px 18px; border-color: var(--text-muted); box-shadow: none;">
                            🚪 Keluar
                        </a>
                    </div>
                </div>

                <?php
                // Load data
                $responses = [];
                if (file_exists($filePath)) {
                    $fileContent = file_get_contents($filePath);
                    $responses = json_decode($fileContent, true);
                    if (is_array($responses)) {
                        $responses = array_reverse($responses);
                    } else {
                        $responses = [];
                    }
                }
                
                if (isset($clear_success) && $clear_success) {
                    echo '<div style="color: var(--accent-neon); background: rgba(0, 240, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px dashed var(--accent-neon); margin-bottom: 25px; font-weight: 600; text-align: center;">
                        Semua log respon berhasil dihapus bersih! 🗑️
                    </div>';
                    $responses = [];
                }
                ?>

                <!-- Response List Grid -->
                <?php if (empty($responses)): ?>
                    <div class="dashboard-empty">
                        <span style="font-size: 3rem;">🍂</span>
                        <p style="margin-top: 15px; font-size: 1.1rem; color: #fff;">Belum ada respon masuk dari Ayyie.</p>
                        <p style="font-size: 0.85rem; margin-top: 5px; color: var(--text-muted);">
                            Kirimkan link website utama ke dia dan tunggu dengan sabar! Semoga cintamu diterima! 🤞🖤
                        </p>
                    </div>
                <?php else: ?>
                    <div class="response-grid">
                        <?php foreach ($responses as $res): ?>
                            <div class="response-card">
                                <div class="response-header">
                                    <span class="response-date">⏱️ <?= htmlspecialchars($res['time']) ?></span>
                                    <span class="response-status" style="<?= $res['status'] === 'DITERIMA! 🖤🌹' ? 'color: var(--primary-neon); background: rgba(255, 42, 116, 0.15); border: 1px solid var(--primary-neon);' : '' ?>">
                                        <?= htmlspecialchars($res['status']) ?>
                                    </span>
                                </div>
                                <div class="response-text">
                                    <?= nl2br(htmlspecialchars($res['message'])) ?>
                                </div>
                                <div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                                    <span>🌐 IP Address: <strong><?= htmlspecialchars($res['ip']) ?></strong></span>
                                    <span>💻 Perangkat: <strong><?= getReadableUserAgent($res['user_agent']) ?></strong></span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if (!empty($responses)): ?>
                    <div class="dashboard-footer" style="margin-top: 40px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 25px;">
                        <form method="POST" action="tracker.php" onsubmit="return confirm('Apakah kamu yakin ingin menghapus SEMUA catatan respon Ayyie? Tindakan ini tidak bisa dibatalkan.');">
                            <input type="hidden" name="action" value="clear_data">
                            <button type="submit" class="goth-btn" style="border-color: #5a1818; box-shadow: none; color: #cc7878; font-size: 0.8rem; padding: 6px 15px;">
                                🗑️ Hapus Semua Riwayat Respon
                            </button>
                        </form>
                    </div>
                <?php endif; ?>

            </div>
        <?php endif; ?>

    </div>

</body>
</html>
