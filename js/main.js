/**
 * Реставрация ванн в Полоцке и Новополоцке | Мастер Денис Леташков
 * JavaScript функционал, интерактив и трекинг целей Яндекс.Метрики
 */

// ==========================================
// 1. НАСТРОЙКА ЯНДЕКС.МЕТРИКИ (ЗАМЕНИТЕ ID ПРИ ПОДКЛЮЧЕНИИ)
// ==========================================
const YANDEX_METRIKA_ID = 0; // Вставьте сюда номер вашего счетчика Метрики, например: 98765432

/**
 * Отправка цели в Яндекс.Метрику и Google Analytics
 * @param {string} goalName - Идентификатор цели (click_phone, click_viber, calc_submit, etc.)
 */
function trackGoal(goalName) {
  try {
    if (typeof ym === 'function' && YANDEX_METRIKA_ID > 0) {
      ym(YANDEX_METRIKA_ID, 'reachGoal', goalName);
      console.log(`[YM Goal Fired]: ${goalName}`);
    } else {
      console.log(`[Demo/Dev Goal]: ${goalName}`);
    }

    if (typeof gtag === 'function') {
      gtag('event', goalName, { event_category: 'engagement' });
    }
  } catch (e) {
    console.error('Goal tracking error:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 2. ИНТЕРАКТИВНЫЙ СЛАЙДЕР ДО / ПОСЛЕ (Touch & Mouse)
  // ==========================================
  const sliderWrapper = document.getElementById('baSliderWrapper');
  const sliderAfterWrapper = document.getElementById('baSliderAfter');
  const sliderHandle = document.getElementById('baSliderHandle');

  if (sliderWrapper && sliderAfterWrapper && sliderHandle) {
    let isDragging = false;

    const setSliderPosition = (clientX) => {
      const rect = sliderWrapper.getBoundingClientRect();
      let x = clientX - rect.left;
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      
      const percentage = (x / rect.width) * 100;
      sliderAfterWrapper.style.width = `${percentage}%`;
      sliderHandle.style.left = `${percentage}%`;
    };

    const startDrag = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setSliderPosition(clientX);
    };

    const onDrag = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setSliderPosition(clientX);
    };

    const stopDrag = () => {
      isDragging = false;
    };

    sliderHandle.addEventListener('mousedown', startDrag);
    sliderWrapper.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);

    sliderHandle.addEventListener('touchstart', startDrag, { passive: true });
    sliderWrapper.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', onDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
  }

  // ==========================================
  // 3. КАЛЬКУЛЯТОР-КВИЗ СТОИМОСТИ
  // ==========================================
  const quizForm = document.getElementById('heroQuizForm');
  const priceResultBadge = document.getElementById('calcEstimatedPrice');

  function calculatePrice() {
    let basePrice = 200; // Базовая цена для ванны 1.2-1.5м

    const sizeInput = document.querySelector('input[name="bathSize"]:checked');
    const conditionInput = document.querySelector('input[name="bathState"]:checked');

    if (sizeInput) {
      if (sizeInput.value === '1.5') basePrice = 200;
      else if (sizeInput.value === '1.7') basePrice = 230;
      else if (sizeInput.value === 'corner') basePrice = 250;
    }

    if (conditionInput) {
      if (conditionInput.value === 'painted') basePrice += 30; // снятие старого вкладыша/эмали
      else if (conditionInput.value === 'bad') basePrice += 15; // глубокая шпаклевка сколов
    }

    if (priceResultBadge) {
      priceResultBadge.textContent = `от ${basePrice} BYN`;
    }

    return basePrice;
  }

  // Слушатель изменения параметров в квизе
  const quizRadioInputs = document.querySelectorAll('.hero-quiz-card input[type="radio"]');
  quizRadioInputs.forEach(radio => {
    radio.addEventListener('change', () => {
      calculatePrice();
      trackGoal('quiz_interact');
    });
  });

  calculatePrice();

  // ==========================================
  // 4. МАСКА И ФОРМАТИРОВАНИЕ ТЕЛЕФОНА (+375 ...)
  // ==========================================
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('375')) {
        value = value.substring(3);
      } else if (value.startsWith('80')) {
        value = value.substring(2);
      }

      let formatted = '+375 ';
      if (value.length > 0) {
        formatted += '(' + value.substring(0, 2);
      }
      if (value.length >= 2) {
        formatted += ') ' + value.substring(2, 5);
      }
      if (value.length >= 5) {
        formatted += '-' + value.substring(5, 7);
      }
      if (value.length >= 7) {
        formatted += '-' + value.substring(7, 9);
      }

      if (e.target.value.length <= 4 && e.target.value !== '+375') {
        // do not wipe if deleting
      } else {
        e.target.value = formatted;
      }
    });

    input.addEventListener('focus', (e) => {
      if (!e.target.value) {
        e.target.value = '+375 ';
      }
    });
  });

  // ==========================================
  // 5. АККОРДЕОН FAQ
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerBlock = item.querySelector('.faq-answer');

    if (questionBtn && answerBlock) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Закрываем другие
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          answerBlock.style.maxHeight = answerBlock.scrollHeight + 'px';
          trackGoal('faq_expand');
        }
      });
    }
  });

  // ==========================================
  // 6. МОДАЛЬНЫЕ ОКНА И ОБРАБОТКА ФОРМ
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

  // Закрытие по клику вне окна и ESC
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

  // Обработка отправки формы квиза
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = quizForm.querySelector('input[type="tel"]').value;
      if (phone.length < 17) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
      }

      trackGoal('calc_submit');
      closeModal(callbackModal);
      openModal(thankYouModal);
      quizForm.reset();
      calculatePrice();
    });
  }

  // Обработка формы модального окна
  const modalForm = document.getElementById('modalCallbackForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = modalForm.querySelector('input[type="tel"]').value;
      if (phone.length < 17) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
      }

      trackGoal('callback_submit');
      closeModal(callbackModal);
      openModal(thankYouModal);
      modalForm.reset();
    });
  }

  // ==========================================
  // 7. ТРЕКИНГ КЛИКОВ ПО КОНТАКТАМ
  // ==========================================
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_phone'));
  });

  document.querySelectorAll('a[href*="viber://"], a[href*="viber.click"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_viber'));
  });

  document.querySelectorAll('a[href*="t.me"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_telegram'));
  });

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => trackGoal('click_whatsapp'));
  });
});
