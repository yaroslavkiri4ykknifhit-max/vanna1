/**
 * Реставрация ванн в Полоцке и Новополоцке | Мастер Денис Леташков (НПД)
 * JavaScript интерактив и цели Яндекс.Метрики
 */

const YANDEX_METRIKA_ID = 0; // Вставьте сюда номер счетчика Метрики

function trackGoal(goalName) {
  try {
    if (typeof ym === 'function' && YANDEX_METRIKA_ID > 0) {
      ym(YANDEX_METRIKA_ID, 'reachGoal', goalName);
      console.log(`[YM Goal]: ${goalName}`);
    } else {
      console.log(`[Goal]: ${goalName}`);
    }
  } catch (e) {
    console.error('Goal tracking error:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Модальные окна
  // ==========================================
  const callbackModal = document.getElementById('callbackModal');
  const openCallbackBtns = document.querySelectorAll('.js-open-callback');
  const closeModalsBtns = document.querySelectorAll('.js-close-modal');

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  openCallbackBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service') || 'Консультация мастера';
      const titleEl = document.getElementById('modalServiceTitle');
      if (titleEl) titleEl.textContent = `Заказ: ${serviceName}`;
      openModal(callbackModal);
      trackGoal('open_callback_modal');
    });
  });

  closeModalsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(callbackModal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === callbackModal) closeModal(callbackModal);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(callbackModal);
    }
  });

  // ==========================================
  // 2. Экспресс-калькулятор стоимости в Hero
  // ==========================================
  const calcPriceDisplay = document.getElementById('heroCalcPrice');
  const calcRadios = document.querySelectorAll('#heroCalculator input[type="radio"]');

  function calculateHeroPrice() {
    let base = 200; // Базовая цена от 200 руб за 1.2-1.5м

    const length = document.querySelector('input[name="bathLength"]:checked');
    const condition = document.querySelector('input[name="bathCondition"]:checked');

    if (length) {
      if (length.value === '1.7') base = 230;
      else if (length.value === 'corner') base = 250;
    }

    if (condition) {
      if (condition.value === 'painted') base += 30; // снятие старого покрытия
      else if (condition.value === 'bad') base += 15; // глубокие сколы
    }

    if (calcPriceDisplay) {
      calcPriceDisplay.textContent = `от ${base} BYN`;
    }
  }

  calcRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      calculateHeroPrice();
      trackGoal('quiz_interact');
    });
  });

  // ==========================================
  // 3. FAQ Аккордеон
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-row-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-toggle-trigger');
    const drawer = item.querySelector('.faq-drawer-content');

    if (trigger && drawer) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherDrawer = other.querySelector('.faq-drawer-content');
          if (otherDrawer) otherDrawer.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          drawer.style.maxHeight = drawer.scrollHeight + 'px';
        }
      });
    }
  });

  // ==========================================
  // 6. Трекинг контактов
  // ==========================================
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_phone'));
  });

  document.querySelectorAll('a[href*="viber"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_viber'));
  });

  document.querySelectorAll('a[href*="t.me"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_telegram'));
  });

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_whatsapp'));
  });
});
