# 基于官方 Node.js 镜像
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 安装依赖，包含 Puppeteer 和其所需的 Chromium 依赖
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    fonts-dejavu \
    fonts-freefont-ttf \
    fonts-droid-fallback \
    fonts-noto-color-emoji \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 安装应用依赖
COPY package*.json ./
RUN npm install

# 复制应用代码
COPY . .

# 暴露服务端口
EXPOSE 4000

# 启动应用
CMD ["npm", "start"]
