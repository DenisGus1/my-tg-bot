const http = require('http');

// Создаем сервер, чтобы Render не закрывал приложение
http.createServer((req, res) => {
    res.write("I am alive");
    res.end();
}).listen(process.env.PORT || 3000);

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// --- 1. ДАННЫЕ МЕНЮ (КОНФИГУРАЦИЯ) ---
const mainCategories = [
    { text: "PlayStation", callback_data: 'cat_ps' },
    { text: "Xbox", callback_data: 'cat_xbox' },
    { text: "Steam", callback_data: 'cat_steam' },
    { text: "Apple", callback_data: 'cat_apple' },
    { text: "Amazon", callback_data: 'cat_amazon' }
];

const priceList = [
    [{ text: "5 €", callback_data: 'val_5' }, { text: "70 €", callback_data: 'val_70' }],
    [{ text: "10 €", callback_data: 'val_10' }, { text: "75 €", callback_data: 'val_75' }],
    [{ text: "20 €", callback_data: 'val_20' }, { text: "100 €", callback_data: 'val_100' }],
    [{ text: "25 €", callback_data: 'val_25' }, { text: "150 €", callback_data: 'val_150' }],
    [{ text: "50 €", callback_data: 'val_50' }, { text: "200 €", callback_data: 'val_200' }],
    [{ text: "⬅️ Назад к категориям", callback_data: 'back_to_cats' }]
];

// --- 2. ГЛАВНОЕ МЕНЮ (/START) ---
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Добро пожаловать в сервис обмена карт!", {
        reply_markup: {
            keyboard: [
                [{ text: '👤 Личный кабинет' }],
                [{ text: '🛒 Купить', callback_data: 'mode_buy' }, { text: '💰 Продать', callback_data: 'mode_sell' }]
            ],
            resize_keyboard: true
        }
    });
});

// --- 3. ЛОГИКА ЛИЧНОГО КАБИНЕТА ---
bot.on('message', (msg) => {
    if (msg.text === '👤 Личный кабинет') {
        const text = `<b>📂 Личный кабинет</b>\n\n🆔 ID: <code>${msg.from.id}</code>\n💰 Баланс: 0.00 €\n\nВыберите действие:`;
        bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📜 История', callback_data: 'hist' }, { text: '💳 Вывод', callback_data: 'out' }]
                ]
            }
        });
    }

    // Обработка текстовых кнопок Купить/Продать
    if (msg.text === '🛒 Купить' || msg.text === '💰 Продать') {
        const mode = msg.text === '🛒 Купить' ? 'ПОКУПКИ' : 'ПРОДАЖИ';
        showCategories(msg.chat.id, mode);
    }
});

// --- 4. ФУНКЦИИ ОТОБРАЖЕНИЯ (РЕДАКТИРОВАНИЕ) ---

function showCategories(chatId, mode, messageId = null) {
    const text = `📊 Меню <b>${mode}</b>\nВыберите категорию карты:`;
    const options = {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: mainCategories.map(cat => [cat]) }
    };

    if (messageId) {
        bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    } else {
        bot.sendMessage(chatId, text, options);
    }
}

// --- 5. ОБРАБОТКА CALLBACK (ИНЛАЙН КНОПКИ) ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    bot.answerCallbackQuery(query.id);

    // Выбор категории (PlayStation, Xbox и т.д.)
    if (data.startsWith('cat_')) {
        const catName = data.replace('cat_', '').toUpperCase();
        bot.editMessageText(`📍 Категория: <b>${catName}</b>\nВыберите номинал:`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: priceList }
        });
    }

    // Возврат назад
    if (data === 'back_to_cats') {
        showCategories(chatId, "ВЫБОРА", messageId);
    }

    // Выбор номинала
    if (data.startsWith('val_')) {
        const val = data.replace('val_', '');
        bot.sendMessage(chatId, `✅ Вы выбрали номинал <b>${val} €</b>.\n\nПожалуйста, ожидайте инструкций оператора или введите данные карты.`, { parse_mode: 'HTML' });
    }
});
