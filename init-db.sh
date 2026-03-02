#!/bin/bash
cd /home/tang/clip
rm -rf data
mkdir -p data public/uploads
export DATABASE_URL="file:/home/tang/clip/data/dev.db"
pnpm prisma migrate dev --name init
pnpm prisma generate
echo "数据库初始化完成!"
