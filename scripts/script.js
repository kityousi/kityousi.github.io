// 页面加载和动画控制
window.addEventListener("DOMContentLoaded", function () {
  const cssLink = document.getElementById("theme-css");
  let pageInitialized = false; // 添加一个标志位，防止重复初始化

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

  // ---- 修复竞态条件的核心逻辑 ----
  // 创建一个保证只执行一次的初始化函数
  function runInitialization() {
    // 如果已经初始化过，就直接退出，避免重复执行
    if (pageInitialized) return;
    // 标记为已初始化
    pageInitialized = true;
    // 执行真正的初始化函数
    initializePage();
  }

  // 为CSS加载完成事件绑定函数
  cssLink.addEventListener("load", runInitialization);

  // 同时，检查CSS是否已从缓存加载完毕 (作为备用，应对某些浏览器不触发load事件的情况)
  if (cssLink.sheet) {
    runInitialization();
  }
  // ---- 修复逻辑结束 ----

  function initializePage() {
    // 预加载关键图片
    const imagesToPreload = [];
    const musicToggleImages = document.querySelectorAll(".music-toggle img");

    musicToggleImages.forEach((img) => {
      imagesToPreload.push(img.src);
    });

    // 根据设备类型添加背景图片预加载
    if (isMobile) {
      // 注意: 确保这里的路径和CSS文件中的路径匹配
      imagesToPreload.push("images/ferris-phone.jpg");
    } else {
      // 确保这里的路径和CSS文件中的路径匹配
      imagesToPreload.push("images/ferris.jpg");
    }

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    function onImageLoad() {
      loadedCount++;
      if (loadedCount >= totalImages) {
        startAnimation();
      }
    }

    // 如果没有图片需要加载，直接开始动画
    if (totalImages === 0) {
      startAnimation();
      return;
    }
    
    // 预加载图片
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = onImageLoad;
      img.onerror = onImageLoad; // 即使加载失败也继续，避免页面卡住
      img.src = src;
    });
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
            // musicToggle.classList.add("playing"); // 'play'事件会处理这个
          })
          .catch((error) => {
            console.log("播放失败:", error);
          });
      } else {
        musicPlayer.pause();
        // musicToggle.classList.remove("playing"); // 'pause'事件会处理这个
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

  let currentIsMobile = isMobile;
  // 处理窗口大小改变
  window.addEventListener("resize", function () {
    const newIsMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    if (newIsMobile !== currentIsMobile) {
      // 如果设备类型发生改变，重新加载页面
      location.reload();
    }
  });

  // 处理页面可见性变化
  document.addEventListener("visibilitychange", function () {
    const musicPlayer = document.getElementById("music-player");
    if (!musicPlayer) return;
    
    if (document.hidden) {
      // 页面隐藏时可以考虑暂停音乐（可选）
      // musicPlayer.pause();
    } else {
      // 页面重新可见时的处理
      if (!musicPlayer.paused) {
         musicToggle.classList.add("playing");
      }
    }
  });
});
