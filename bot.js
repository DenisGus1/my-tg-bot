const http = require('http');

// Создаем сервер, чтобы Render не закрывал приложение
http.createServer((req, res) => {
    res.write("I am alive");
    res.end();
}).listen(process.env.PORT || 3000);

const TelegramBot = require('node-telegram-bot-api');

// Укажи свой токен здесь
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// --- 1. ПРИВЕТСТВИЕ И ГЛАВНАЯ КНОПКА ---
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привет! Я помогу тебе продать карту.", {
        reply_markup: {
            keyboard: [["Продать карту"]], // Обычная кнопка внизу
            resize_keyboard: true
        }
    });
});

// --- 2. ОБРАБОТКА НАЖАТИЯ "ПРОДАТЬ КАРТУ" ---
bot.on('message', (msg) => {
    // Проверяем, что пользователь нажал именно на кнопку (текст совпадает)
    if (msg.text === "Продать карту") {
        bot.sendMessage(msg.chat.id, "Выберите категорию карты:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "PlayStation", callback_data: 'menu_1' }],
                    [{ text: "Xbox", callback_data: 'menu_2' }],
                    [{ text: "Steam", callback_data: 'menu_3' }],
                    [{ text: "Apple", callback_data: 'menu_4' }],
                    [{ text: "Amazon", callback_data: 'menu_5' }]
                ]
            }
        });
    }
});

// --- 3. ОБРАБОТКА ВСЕХ НАЖАТИЙ НА ИНЛАЙН-КНОПКИ ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    // Обязательно отвечаем телеграму, что мы получили клик
    bot.answerCallbackQuery(query.id);

    // --- ЛОГИКА ВАРИАНТА 1 (ПЕРЕХОД К 10 ПОДВАРИАНТАМ) ---
    if (data === 'menu_1') {
        bot.editMessageText("Вы выбрали Вариант 1. Выберите подкатегорию:", {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    // Кнопки в два столбика [ {1}, {2} ]
                    [{ text: "5 €", callback_data: 'sub_1' }, { text: "70 €", callback_data: 'sub_2' }],
                    [{ text: "10 €", callback_data: 'sub_3' }, { text: "75 €", callback_data: 'sub_4' }],
                    [{ text: "20 €", callback_data: 'sub_5' }, { text: "100 €", callback_data: 'sub_6' }],
                    [{ text: "25 €", callback_data: 'sub_7' }, { text: "150 €", callback_data: 'sub_8' }],
                    [{ text: "50 €", callback_data: 'sub_9' }, { text: "200 €", callback_data: 'sub_10' }],
                    // Кнопка возврата в самое начало
                    [{ text: "⬅️ Назад к категориям", callback_data: 'go_back' }]
                ]
            }
        });
    }

    // --- КНОПКА НАЗАД ---
    if (data === 'go_back') {
        bot.editMessageText("Выберите категорию карты:", {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Вариант 1", callback_data: 'menu_1' }],
                    [{ text: "Вариант 2", callback_data: 'menu_2' }],
                    [{ text: "Вариант 3", callback_data: 'menu_3' }],
                    [{ text: "Вариант 4", callback_data: 'menu_4' }],
                    [{ text: "Вариант 5", callback_data: 'menu_5' }]
                ]
            }
        });
    }

    // --- ФИНАЛЬНЫЙ ВЫБОР ---
    // Если callback_data начинается на "sub_", значит нажали один из 10 подтипов
    if (data.startsWith('sub_')) {
        const number = data.split('_')[1]; // Достаем номер из "sub_1", "sub_2" и т.д.
        bot.sendMessage(chatId, `✅ Вы выбрали Подтип №${number}. Пришлите, пожалуйста, фото карты!`);
    }
});
