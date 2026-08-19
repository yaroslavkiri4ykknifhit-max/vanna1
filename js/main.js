/**
 * Реставрация ванн в Полоцке и Новополоцке | Мастер Денис Леташков (НПД)
 * JavaScript интерактив, прямое отправление в Telegram Бот (без сервера) и трекинг целей
 */

// ==========================================================================
// 1. НАСТРОЙКИ TELEGRAM БОТА И ЯНДЕКС.МЕТРИКИ
// ==========================================================================
// Вставьте токен вашего бота от @BotFather и Chat ID от @userinfobot:
const TELEGRAM_BOT_TOKEN = "8916835543:AAF24vf6lErIoS7VS6768LuOK5c6MCP_HjU";
const TELEGRAM_CHAT_ID = "2117489924";

const YANDEX_METRIKA_ID = 0; // Вставьте сюда номер счетчика Метрики

/**
 * Отправка события цели в Яндекс.Метрику
 */
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

/**
 * Прямая отправка заявки в Telegram бота без сервера
 */
async function sendLeadToTelegram(leadData) {
  // Сохраняем локально в историю
  try {
    const leads = JSON.parse(localStorage.getItem('vanna_leads') || '[]');
    leads.push({ ...leadData, date: new Date().toISOString() });
    localStorage.setItem('vanna_leads', JSON.stringify(leads));
  } catch (e) {}

  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.includes("XXXXX") || !TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") {
    console.log("[Telegram Demo Mode]: Заявка сохранена локально. Для получения в TG укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в js/main.js", leadData);
    return true;
  }

  const messageText = 
    `🛁 <b>Новая заявка на реставрацию ванны!</b>\n\n` +
    `📞 <b>Телефон:</b> <code>${leadData.phone || 'Не указан'}</code>\n` +
    `👤 <b>Имя:</b> ${leadData.name || 'Не указано'}\n` +
    `📍 <b>Город/Адрес:</b> ${leadData.city || 'Не указан'}\n` +
    `📐 <b>Размер ванны:</b> ${leadData.bathSize || '1.2–1.5 м'}\n` +
    `🛠 <b>Состояние:</b> ${leadData.bathState || 'Заводская'}\n` +
    `💰 <b>Расчет цены:</b> ${leadData.estimatedPrice || 'от 200 BYN'}\n` +
    `📋 <b>Источник:</b> ${leadData.source || 'Форма на сайте'}\n` +
    `⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' })}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText,
        parse_mode: "HTML"
      })
    });
    const result = await response.json();
    return result.ok;
  } catch (err) {
    console.error("Ошибка при отправке в Telegram:", err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 2. Модальные окна
  // ==========================================================================
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
      const serviceName = btn.getAttribute('data-service') || 'Бесплатная консультация';
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

  // ==========================================================================
  // 3. Экспресс-калькулятор стоимости в первом экране (Hero)
  // ==========================================================================
  const calcPriceDisplay = document.getElementById('heroCalcPrice');
  const calcRadios = document.querySelectorAll('#heroFastCalcForm input[type="radio"]');

  function calculateHeroPrice() {
    let base = 200; // Базовая цена от 200 руб за ванну 1.2-1.5м

    const length = document.querySelector('input[name="bathLength"]:checked');
    const condition = document.querySelector('input[name="bathCondition"]:checked');

    if (length) {
      if (length.value === '1.7') base = 230;
      else if (length.value === 'corner') base = 250;
    }

    if (condition) {
      if (condition.value === 'painted') base += 30; // снятие старого покрытия
      else if (condition.value === 'bad') base += 15; // глубокие сколы / ржавчина
    }

    if (calcPriceDisplay) {
      calcPriceDisplay.textContent = `от ${base} BYN`;
    }

    return base;
  }

  calcRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      calculateHeroPrice();
      trackGoal('quiz_interact');
    });
  });

  calculateHeroPrice();

  // ==========================================================================
  // 4. Маска и форматирование телефона (+375 ...)
  // ==========================================================================
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

  // ==========================================================================
  // 5. Обработка отправки форм и отправка в Telegram Бот
  // ==========================================================================
  
  // 5.1 Форма калькулятора в Hero
  const heroForm = document.getElementById('heroFastCalcForm');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = heroForm.querySelector('input[name="phone"]');
      if (phoneInput && phoneInput.value.length < 17) {
        alert('Пожалуйста, введите полный номер телефона: +375 (XX) XXX-XX-XX');
        return;
      }

      const lengthVal = heroForm.querySelector('input[name="bathLength"]:checked')?.value;
      const condVal = heroForm.querySelector('input[name="bathCondition"]:checked')?.value;
      
      const lengthLabels = { "1.5": "1.2–1.5 м", "1.7": "1.7 м", "corner": "Угловая" };
      const condLabels = { "standard": "Заводская эмаль", "bad": "Сколы / Ржавчина", "painted": "Красилась ранее" };

      const estimatedPrice = calcPriceDisplay ? calcPriceDisplay.textContent : 'от 200 BYN';

      const leadData = {
        phone: phoneInput ? phoneInput.value : '',
        name: 'Клиент из калькулятора',
        bathSize: lengthLabels[lengthVal] || lengthVal,
        bathState: condLabels[condVal] || condVal,
        estimatedPrice: estimatedPrice,
        source: 'Экспресс-калькулятор на первом экране'
      };

      // Отправляем в Telegram
      await sendLeadToTelegram(leadData);
      trackGoal('hero_calc_submit');

      openModal(thankYouModal);
      heroForm.reset();
      calculateHeroPrice();
    });
  }

  // 5.2 Форма консультации в боковом блоке
  const sideForm = document.getElementById('sideDirectForm');
  if (sideForm) {
    sideForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = sideForm.querySelector('input[name="phone"]');
      const nameInput = sideForm.querySelector('input[name="name"]');

      if (phoneInput && phoneInput.value.length < 17) {
        alert('Пожалуйста, введите полный номер телефона: +375 (XX) XXX-XX-XX');
        return;
      }

      const leadData = {
        phone: phoneInput ? phoneInput.value : '',
        name: nameInput ? nameInput.value : 'Не указано',
        source: 'Блок бесплатной консультации'
      };

      await sendLeadToTelegram(leadData);
      trackGoal('side_direct_submit');

      openModal(thankYouModal);
      sideForm.reset();
    });
  }

  // 5.3 Форма модального окна
  const modalForm = document.getElementById('modalCallbackForm');
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = modalForm.querySelector('input[name="phone"]');
      const cityInput = modalForm.querySelector('input[name="city"]');
      const serviceInput = modalForm.querySelector('input[name="service"]');

      if (phoneInput && phoneInput.value.length < 17) {
        alert('Пожалуйста, введите полный номер телефона: +375 (XX) XXX-XX-XX');
        return;
      }

      const leadData = {
        phone: phoneInput ? phoneInput.value : '',
        city: cityInput ? cityInput.value : 'Не указан',
        source: `Модальное окно: ${serviceInput ? serviceInput.value : 'Заказ звонка'}`
      };

      await sendLeadToTelegram(leadData);
      trackGoal('modal_callback_submit');

      closeModal(callbackModal);
      openModal(thankYouModal);
      modalForm.reset();
    });
  }

  // ==========================================================================
  // 6. FAQ Аккордеон
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-entry');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-entry-header');
    const body = item.querySelector('.faq-entry-body');

    if (header && body) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherBody = other.querySelector('.faq-entry-body');
          if (otherBody) otherBody.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    }
  });

  // ==========================================================================
  // 7. Трекинг контактов
  // ==========================================================================
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
