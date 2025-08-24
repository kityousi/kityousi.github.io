// 页面加载和动画控制
window.addEventListener("DOMContentLoaded", function () {
  const cssLink = document.getElementById("theme-css");

  // 检测设备类型
  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;

  // 动态加载对应的CSS文件
  if (isMobile) {
    cssLink.href = "styles/mobile.css";
  } else {
    cssLink.href = "styles/desktop.css";
  }

  // 确保CSS加载完成
  cssLink.addEventListener("load", function () {
    initializePage();
  });

  // 如果CSS已经缓存，立即初始化
  if (cssLink.sheet) {
    initializePage();
  }

  function initializePage() {
    // 预加载关键图片
    const imagesToPreload = [];
    const musicToggleImages = document.querySelectorAll(".music-toggle img");

    musicToggleImages.forEach((img) => {
      imagesToPreload.push(img.src);
    });

    // 根据设备类型添加背景图片预加载
    if (isMobile) {
      imagesToPreload.push("images/ferris-phone.jpg");
    } else {
      imagesToPreload.push("images/ferris.jpeg");
    }

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    function onImageLoad() {
      loadedCount++;
      if (loadedCount >= totalImages) {
        startAnimation();
      }
    }

    // 预加载图片
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = onImageLoad;
      img.onerror = onImageLoad; // 即使加载失败也继续
      img.src = src;
    });

    // 如果没有图片需要加载，直接开始动画
    if (totalImages === 0) {
      startAnimation();
    }
  }

  function startAnimation() {
    // 小延迟确保所有样式都已应用
    setTimeout(() => {
      document.body.classList.add("loaded");
      setupAudio();
    }, 100);
  }

  function setupAudio() {
    const musicPlayer = document.getElementById("music-player");
    const musicToggle = document.getElementById("music-toggle");

    if (!musicPlayer || !musicToggle) return;

    // 尝试自动播放音乐
    setTimeout(() => {
      const playPromise = musicPlayer.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            musicToggle.classList.add("playing");
          })
          .catch((error) => {
            console.log("自动播放被浏览器阻止，需要用户交互:", error);
          });
      }
    }, 1000); // 延迟1秒再尝试播放，让动画先进行

    // 音乐控制按钮事件
    musicToggle.addEventListener("click", function () {
      if (musicPlayer.paused) {
        musicPlayer
          .play()
          .then(() => {
            musicToggle.classList.add("playing");
          })
          .catch((error) => {
            console.log("播放失败:", error);
          });
      } else {
        musicPlayer.pause();
        musicToggle.classList.remove("playing");
      }
    });

    // 音乐结束时重置按钮状态
    musicPlayer.addEventListener("ended", function () {
      musicToggle.classList.remove("playing");
    });

    // 音乐暂停时重置按钮状态
    musicPlayer.addEventListener("pause", function () {
      if (!musicPlayer.ended) {
        musicToggle.classList.remove("playing");
      }
    });

    // 音乐开始播放时设置按钮状态
    musicPlayer.addEventListener("play", function () {
      musicToggle.classList.add("playing");
    });
  }

  // 处理窗口大小改变
  window.addEventListener("resize", function () {
    const newIsMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    if (newIsMobile !== isMobile) {
      // 如果设备类型发生改变，重新加载页面
      location.reload();
    }
  });

  // 添加一些用户体验优化
  document.addEventListener("visibilitychange", function () {
    const musicPlayer = document.getElementById("music-player");
    const musicToggle = document.getElementById("music-toggle");

    if (document.hidden) {
      // 页面隐藏时暂停音乐（可选）
      // musicPlayer.pause();
    } else {
      // 页面重新可见时的处理
      if (musicPlayer && !musicPlayer.paused) {
        musicToggle.classList.add("playing");
      }
    }
  });
});
