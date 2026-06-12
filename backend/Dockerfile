FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Clean install for production consistency
RUN npm install --production --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["npm", "start"]