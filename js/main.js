/**
 * Реставрация ванн в Полоцке и Новополоцке | Мастер Денис Леташков
 * JavaScript функционал, интерактив и трекинг целей Яндекс.Метрики
 */

const YANDEX_METRIKA_ID = 0; // Вставьте сюда номер счетчика Метрики при подключении

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
  const calcModal = document.getElementById('calcModal');
  const serviceModal = document.getElementById('serviceCallbackModal');
  const thankYouModal = document.getElementById('thankYouModal');

  const openCalcBtns = document.querySelectorAll('.js-open-calc');
  const openServiceBtns = document.querySelectorAll('.js-open-callback');
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

  openCalcBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(calcModal);
      trackGoal('open_calc');
    });
  });

  openServiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service') || 'Реставрация ванны';
      const titleEl = document.getElementById('modalServiceTitle');
      const inputEl = document.getElementById('selectedServiceName');
      if (titleEl) titleEl.textContent = `Заказ услуги: ${serviceName}`;
      if (inputEl) inputEl.value = serviceName;
      openModal(serviceModal);
      trackGoal('open_service_modal');
    });
  });

  closeModalsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(calcModal);
      closeModal(serviceModal);
      closeModal(thankYouModal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === calcModal) closeModal(calcModal);
    if (e.target === serviceModal) closeModal(serviceModal);
    if (e.target === thankYouModal) closeModal(thankYouModal);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(calcModal);
      closeModal(serviceModal);
      closeModal(thankYouModal);
    }
  });

  // ==========================================
  // 2. Расчет цены в модальном калькуляторе
  // ==========================================
  const modalCalcPriceEl = document.getElementById('modalCalcPrice');
  const calcRadios = document.querySelectorAll('#calcModalForm input[type="radio"]');

  function updateModalCalc() {
    let base = 200;
    const size = document.querySelector('input[name="modalBathSize"]:checked');
    const state = document.querySelector('input[name="modalBathState"]:checked');

    if (size) {
      if (size.value === '1.7') base = 230;
      else if (size.value === 'corner') base = 250;
    }

    if (state) {
      if (state.value === 'painted') base += 30;
      else if (state.value === 'bad') base += 15;
    }

    if (modalCalcPriceEl) {
      modalCalcPriceEl.textContent = `от ${base} BYN`;
    }
  }

  calcRadios.forEach(radio => {
    radio.addEventListener('change', updateModalCalc);
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
  const handleFormSubmit = (formId, goalName) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneInput = form.querySelector('input[type="tel"]');
      if (phoneInput && phoneInput.value.length < 17) {
        alert('Пожалуйста, введите полный номер телефона: +375 (XX) XXX-XX-XX');
        return;
      }

      trackGoal(goalName);
      closeModal(calcModal);
      closeModal(serviceModal);
      openModal(thankYouModal);
      form.reset();
    });
  };

  handleFormSubmit('sideConsultationForm', 'side_consultation_submit');
  handleFormSubmit('calcModalForm', 'calc_modal_submit');
  handleFormSubmit('serviceModalForm', 'service_modal_submit');

  // ==========================================
  // 5. FAQ Аккордеон
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item-clean');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn-clean');
    const content = item.querySelector('.faq-content-clean');

    if (btn && content) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherContent = other.querySelector('.faq-content-clean');
          if (otherContent) otherContent.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // ==========================================
  // 6. Трекинг прямых контактов
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
