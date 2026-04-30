/**
 * Скрипты для сайта «Ясность в любви»
 * - Анимация фона (canvas)
 * - Плавная прокрутка
 * - Обработка формы
 * - Интеграция с Telegram WebApp
 */

document.addEventListener('DOMContentLoaded', () => {
  initCanvasAnimation();
  initSmoothScroll();
  initFormHandling();
  initTelegramWebApp();
});

/* ===== Canvas Animation — мягкие частицы ===== */
function initCanvasAnimation() {
  const canvas = document.getElementById('hero-sequence-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  
  // Настройка размера
  function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
    initParticles();
  }
  
  // Создание частиц
  function initParticles() {
    particles = [];
    const count = Math.min(50, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
  }
  
  // Анимация
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Отскок от краёв
      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
      
      // Рисование
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 115, 85, ${p.opacity})`;
      ctx.fill();
    });
    
    // Соединение близких частиц
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(139, 115, 85, ${0.1 * (1 - dist / 100)})`;
          ctx.stroke();
        }
      });
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Запуск
  window.addEventListener('resize', resize);
  resize();
  animate();
  
  // Очистка при уходе со страницы
  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  };
}

/* ===== Плавная прокрутка для якорных ссылок ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Обновить URL без прокрутки
        history.pushState(null, null, link.getAttribute('href'));
      }
    });
  });
}

/* ===== Обработка формы ===== */
function initFormHandling() {
  const form = document.querySelector('.lead-form');
  const status = document.querySelector('.form-status');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Отправка...';
    status.className = 'form-status';
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
      // Здесь можно подключить реальный бэкенд или сервис
      // Например: Formspree, Getform, или свой API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Для Telegram WebApp
      if (window.Telegram?.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({
          name: data.name,
          contact: data.contact,
          source: 'qigun-retreat'
        }));
      }
      
      status.textContent = 'Спасибо! Мы свяжемся с вами.';
      status.classList.add('success');
      form.reset();
      
      // Сброс статуса через 5 секунд
      setTimeout(() => {
        status.textContent = '';
        status.className = 'form-status';
      }, 5000);
      
    } catch (error) {
      console.error('Form error:', error);
      status.textContent = 'Ошибка отправки. Попробуйте ещё раз.';
      status.classList.add('error');
    }
  });
}

/* ===== Telegram WebApp интеграция ===== */
function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = Telegram.WebApp;
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Настройка цветов под тему Telegram
    if (tg.colorScheme === 'dark') {
      document.documentElement.style.setProperty('--color-bg', '#1a1a1a');
      document.documentElement.style.setProperty('--color-text', '#f0f0f0');
      document.documentElement.style.setProperty('--color-text-light', '#aaa');
    }
    
    // Кнопка "Отправить" в интерфейсе Telegram
    tg.MainButton.setText('Оставить заявку');
    tg.MainButton.onClick(() => {
      document.querySelector('.lead-form')?.requestSubmit();
    });
    
    // Показывать MainButton только на форме
    const signupSection = document.getElementById('signup');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tg.MainButton.show();
        } else {
          tg.MainButton.hide();
        }
      });
    }, { threshold: 0.1 });
    
    if (signupSection) observer.observe(signupSection);
  }
}
