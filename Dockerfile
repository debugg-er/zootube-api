FROM node:12-alpine

WORKDIR /app

RUN apk add ffmpeg

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN wget https://raw.githubusercontent.com/eficode/wait-for/master/wait-for

RUN chmod +x ./wait-for

CMD ["npm", "start"]
