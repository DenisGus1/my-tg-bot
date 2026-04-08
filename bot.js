const http = require('http');
const TelegramBot = require('node-telegram-bot-api'); // ТА САМАЯ СТРОЧКА

// 1. Сервер для предотвращения "сна" (Render + Cron-job)
http.createServer((req, res) => {
    res.write("I am alive");
    res.end();
}).listen(process.env.PORT || 3000);

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// --- КОНФИГУРАЦИЯ МЕНЮ ---
const categories = [
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

// --- ГЛАВНОЕ МЕНЮ ---
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Добро пожаловать! Выберите раздел:", {
        reply_markup: {
            keyboard: [
                [{ text: '👤 Личный кабинет' }],
                [{ text: '🛒 Купить' }, { text: '💰 Продать' }]
            ],
            resize_keyboard: true
        }
    });
});

// --- ЛОГИКА ТЕКСТОВЫХ КНОПОК ---
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '👤 Личный кабинет') {
        const profile = `<b>📂 Личный кабинет</b>\n\n🆔 ID: <code>${msg.from.id}</code>\n💰 Баланс: 0.00 €\n\nВыберите действие:`;
        bot.sendMessage(chatId, profile, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📜 История', callback_data: 'hist' }, { text: '💳 Вывод', callback_data: 'out' }]
                ]
            }
        });
    }

    if (msg.text === '🛒 Купить' || msg.text === '💰 Продать') {
        const mode = msg.text === '🛒 Купить' ? 'КУПИТЬ' : 'ПРОДАТЬ';
        bot.sendMessage(chatId, `Вы вошли в режим <b>${mode}</b>.\nВыберите категорию:`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: categories.map(c => [c]) }
        });
    }
});

// --- ОБРАБОТКА ИНЛАЙН КНОПОК ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    bot.answerCallbackQuery(query.id);

    // Выбор категории
    if (data.startsWith('cat_')) {
        const name = data.replace('cat_', '').toUpperCase();
        bot.editMessageText(`📍 Категория: <b>${name}</b>\nВыберите номинал:`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: priceList }
        });
    }

    // Возврат назад
    if (data === 'back_to_cats') {
        bot.editMessageText("Выберите категорию карты:", {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: categories.map(c => [c]) }
        });
    }

    // Выбор номинала
    if (data.startsWith('val_')) {
        const val = data.replace('val_', '');
        bot.sendMessage(chatId, `✅ Вы выбрали <b>${val} €</b>.\n\nСледуйте инструкциям системы...`);
    }
});
