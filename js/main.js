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
  const thankYouModal = document.getElementById('thankYouModal');
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
      const inputEl = document.getElementById('serviceInputHidden');
      if (titleEl) titleEl.textContent = `Заказ: ${serviceName}`;
      if (inputEl) inputEl.value = serviceName;
      openModal(callbackModal);
      trackGoal('open_callback_modal');
    });
  });

  closeModalsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(callbackModal);
      closeModal(thankYouModal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === callbackModal) closeModal(callbackModal);
    if (e.target === thankYouModal) closeModal(thankYouModal);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(callbackModal);
      closeModal(thankYouModal);
    }
  });

  // ==========================================
  // 2. Экспресс-калькулятор стоимости в Hero
  // ==========================================
  const calcPriceDisplay = document.getElementById('heroCalcPrice');
  const calcRadios = document.querySelectorAll('#heroFastCalcForm input[type="radio"]');

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
  // 3. Форматирование телефона (+375 ...)
  // ==========================================
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('375')) value = value.substring(3);
      else if (value.startsWith('80')) value = value.substring(2);

      let formatted = '+375 ';
      if (value.length > 0) formatted += '(' + value.substring(0, 2);
      if (value.length >= 2) formatted += ') ' + value.substring(2, 5);
      if (value.length >= 5) formatted += '-' + value.substring(5, 7);
      if (value.length >= 7) formatted += '-' + value.substring(7, 9);

      if (e.target.value.length > 4 || e.target.value === '+375') {
        e.target.value = formatted;
      }
    });

    input.addEventListener('focus', (e) => {
      if (!e.target.value) e.target.value = '+375 ';
    });
  });

  // ==========================================
  // 4. Отправка форм
  // ==========================================
  const bindForm = (formId, goalName) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = form.querySelector('input[type="tel"]');
      if (phone && phone.value.length < 17) {
        alert('Пожалуйста, введите полный номер телефона: +375 (XX) XXX-XX-XX');
        return;
      }

      trackGoal(goalName);
      closeModal(callbackModal);
      openModal(thankYouModal);
      form.reset();
      calculateHeroPrice();
    });
  };

  bindForm('heroFastCalcForm', 'hero_calc_submit');
  bindForm('sideDirectForm', 'side_direct_submit');
  bindForm('modalCallbackForm', 'modal_callback_submit');

  // ==========================================
  // 5. FAQ Аккордеон
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
