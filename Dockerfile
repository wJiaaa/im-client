FROM nginx
RUN rm -rf /usr/share/nginx/html/*
COPY dist/ /usr/share/nginx/html/