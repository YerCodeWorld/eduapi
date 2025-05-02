#!/bin/bash

sudo pnpm install
sudo prisma generate --schema=./DbClient/prisma/schema.prisma
sudo pnpm build
cp -r public/* dist