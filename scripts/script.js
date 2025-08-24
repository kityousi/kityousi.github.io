// scripts/script.js (完整替换)

window.addEventListener("DOMContentLoaded", function () {
  // --- 1. 使用更可靠的方式加载CSS并触发回调 ---

  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";

  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;

  themeLink.href = isMobile ? "styles/mobile.css" : "styles/desktop.css";

  // 关键：监听新创建的link元素的load事件，这是最可靠的方式
  themeLink.addEventListener("load", initializePage);
  
  // 关键：处理加载失败的情况
  themeLink.addEventListener("error", () => {
    console.error("主题CSS文件加载失败！");
    // 即使CSS失败，也尝试启动动画，避免页面一片空白
    initializePage();
  });

  // 将创建的link元素添加到head中，浏览器会自动开始加载
  document.head.appendChild(themeLink);
  // 删除HTML中旧的、空的link标签（可选，但推荐）
  document.getElementById("theme-css")?.remove();


  // --- 2. 页面初始化与动画 ---

  function initializePage() {
    const imagesToPreload = [];
    const musicToggleImages = document.querySelectorAll(".music-toggle img");

    musicToggleImages.forEach((img) => {
      imagesToPreload.push(img.src);
    });

    if (isMobile) {
      imagesToPreload.push("images/ferris-phone.jpg");
    } else {
      imagesToPreload.push("images/ferris.jpg");
    }

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        startAnimation();
      }
    };

    if (totalImages === 0) {
      startAnimation();
      return;
    }
    
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = onImageLoad;
      img.onerror = onImageLoad;
      img.src = src;
    });
  }

  function startAnimation() {
    setTimeout(() => {
      document.body.classList.add("loaded");
      // 注意：将音频设置从这里移出，改为用户交互触发
    }, 100);
  }


  // --- 3. 重构音频逻辑，以用户交互为中心 ---
  
  const musicPlayer = document.getElementById("music-player");
  const musicToggle = document.getElementById("music-toggle");
  let isMusicInitialized = false; // 标志位，确保音乐只被初始化一次

  function handleMusicToggle() {
      // 用户的第一次点击，是初始化音乐的最佳时机
      if (!isMusicInitialized) {
          isMusicInitialized = true;
          // 尝试播放，这次因为是用户点击触发，所以会成功
          musicPlayer.play().then(() => {
              musicToggle.classList.add("playing");
          }).catch(error => {
              console.error("即使用户交互，播放还是失败了:", error);
          });
          return;
      }
      
      // 后续点击，执行正常的播放/暂停逻辑
      if (musicPlayer.paused) {
          musicPlayer.play();
      } else {
          musicPlayer.pause();
      }
  }

  if (musicPlayer && musicToggle) {
    musicToggle.addEventListener("click", handleMusicToggle);

    musicPlayer.addEventListener("play", () => {
      musicToggle.classList.add("playing");
    });

    musicPlayer.addEventListener("pause", () => {
      musicToggle.classList.remove("playing");
    });
  }


  // --- 4. 其他辅助逻辑 (保持不变) ---
  
  let currentIsMobile = isMobile;
  window.addEventListener("resize", function () {
    const newIsMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    if (newIsMobile !== currentIsMobile) {
      location.reload();
    }
  });
});
