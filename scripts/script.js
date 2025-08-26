// 页面加载和动画控制
(function() {
  'use strict';
  
  let isMobile = false;
  let isInitialized = false;
  let musicPlayer = null;
  let musicToggle = null;
  
  // 检测设备类型
  function detectMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
  }
  
  // 加载CSS文件
  function loadThemeCSS() {
    return new Promise((resolve, reject) => {
      const cssLink = document.getElementById("theme-css");
      if (!cssLink) {
        reject(new Error('CSS link element not found'));
        return;
      }
      
      isMobile = detectMobileDevice();
      const cssPath = isMobile ? "styles/mobile.css" : "styles/desktop.css";
      
      // 如果已经加载了正确的CSS文件，直接resolve
      if (cssLink.href.endsWith(cssPath)) {
        resolve();
        return;
      }
      
      // 设置CSS加载完成的处理
      const onLoad = () => {
        cssLink.removeEventListener('load', onLoad);
        cssLink.removeEventListener('error', onError);
        resolve();
      };
      
      const onError = () => {
        cssLink.removeEventListener('load', onLoad);
        cssLink.removeEventListener('error', onError);
        reject(new Error('CSS loading failed'));
      };
      
      cssLink.addEventListener('load', onLoad);
      cssLink.addEventListener('error', onError);
      
      // 设置CSS文件路径
      cssLink.href = cssPath;
      
      // 如果CSS文件已经在缓存中立即加载完成，需要手动触发
      setTimeout(() => {
        if (cssLink.sheet) {
          onLoad();
        }
      }, 10);
    });
  }
  
  // 预加载图片
  function preloadImages() {
    return new Promise((resolve) => {
      const imagesToPreload = [];
      
      // 获取音乐按钮的图片
      const musicToggleImages = document.querySelectorAll(".music-toggle img");
      musicToggleImages.forEach((img) => {
        if (img.src) {
          imagesToPreload.push(img.src);
        }
      });
      
      // 根据设备类型添加背景图片
      if (isMobile) {
        imagesToPreload.push("images/ferris-phone.jpg");
      } else {
        imagesToPreload.push("images/ferris.jpg");
      }
      
      if (imagesToPreload.length === 0) {
        resolve();
        return;
      }
      
      let loadedCount = 0;
      const totalImages = imagesToPreload.length;
      
      function onImageLoad() {
        loadedCount++;
        if (loadedCount >= totalImages) {
          resolve();
        }
      }
      
      // 预加载所有图片
      imagesToPreload.forEach((src) => {
        const img = new Image();
        img.onload = onImageLoad;
        img.onerror = onImageLoad; // 即使失败也继续
        img.src = src;
      });
      
      // 设置超时，避免无限等待
      setTimeout(() => {
        if (loadedCount < totalImages) {
          console.warn(`Only ${loadedCount}/${totalImages} images loaded, continuing anyway`);
          resolve();
        }
      }, 5000);
    });
  }
  
  // 设置音频控制
  function setupAudio() {
    musicPlayer = document.getElementById("music-player");
    musicToggle = document.getElementById("music-toggle");
    
    if (!musicPlayer || !musicToggle) {
      console.warn('Music player or toggle button not found');
      return;
    }
    
    // 移除可能存在的旧事件监听器（通过克隆节点的方式）
    const newMusicToggle = musicToggle.cloneNode(true);
    musicToggle.parentNode.replaceChild(newMusicToggle, musicToggle);
    musicToggle = newMusicToggle;
    
    // 添加音乐控制事件
    musicToggle.addEventListener("click", handleMusicToggle);
    
    // 添加音乐播放状态监听
    musicPlayer.addEventListener("play", () => {
      musicToggle.classList.add("playing");
    });
    
    musicPlayer.addEventListener("pause", () => {
      musicToggle.classList.remove("playing");
    });
    
    musicPlayer.addEventListener("ended", () => {
      musicToggle.classList.remove("playing");
    });
    
    // 音频已准备好，等待用户手动播放
  }
  
  // 音乐播放/暂停控制
  function handleMusicToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!musicPlayer) return;
    
    if (musicPlayer.paused) {
      const playPromise = musicPlayer.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            musicToggle.classList.add("playing");
          })
          .catch((error) => {
            console.error("播放失败:", error);
          });
      }
    } else {
      musicPlayer.pause();
      musicToggle.classList.remove("playing");
    }
  }
  
  // 启动动画
  function startAnimation() {
    const loadingIndicator = document.getElementById("loading-indicator");
    
    // 隐藏加载指示器
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // 添加loaded类启动动画
    setTimeout(() => {
      document.body.classList.add("loaded");
    }, 100);
    
    // 初始化音频控制
    setTimeout(() => {
      setupAudio();
    }, 200);
  }
  
  // 主初始化函数
  async function initializePage() {
    if (isInitialized) return;
    isInitialized = true;
    
    try {
      // 按顺序加载资源
      await loadThemeCSS();
      await preloadImages();
      
      // 启动动画
      startAnimation();
      
    } catch (error) {
      console.error('页面初始化失败:', error);
      // 即使出错也要显示页面
      startAnimation();
    }
  }
  
  // 处理窗口大小变化
  function handleResize() {
    const newIsMobile = detectMobileDevice();
    
    // 如果设备类型发生改变，重新加载页面
    if (newIsMobile !== isMobile) {
      location.reload();
    }
  }
  
  // 处理页面可见性变化
  function handleVisibilityChange() {
    if (!musicPlayer || !musicToggle) return;
    
    if (document.hidden) {
      // 页面隐藏时的处理（可选：暂停音乐）
    } else {
      // 页面重新可见时同步播放状态
      if (!musicPlayer.paused) {
        musicToggle.classList.add("playing");
      }
    }
  }
  
  // DOM内容加载完成后开始初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    // 如果DOM已经加载完成，立即初始化
    initializePage();
  }
  
  // 添加其他事件监听器
  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
})();
