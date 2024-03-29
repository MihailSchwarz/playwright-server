FROM node:latest

# Установить зависимости для запуска браузера в headless режиме
RUN apt-get update && apt-get install -y \
    wget \
    gnupg2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxtst6 \
    libcups2 \
    libxrandr2 \
    libgconf-2-4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libasound2 \
    libdbus-glib-1-2 \
    libdbus-1-3 \
    libnss3

# Создать директорию приложения
WORKDIR /usr/src/playwright-server

# Установить зависимости приложения
# Символ астериска (*) используется для копирования как package.json, так и package-lock.json
COPY package*.json ./

RUN npm install
RUN npm install pm2 -g
RUN npx playwright install 
RUN npx playwright install-deps
# Если вы создаете код для продакшена
# RUN npm ci --only=production

# Копировать файл конфигурации PM2 и исходный код приложения
COPY ecosystem.config.cjs .
COPY . .

# Прокинуть порт
EXPOSE 30823

# Запуск приложения через PM2 и файл конфигурации
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
