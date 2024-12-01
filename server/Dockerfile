FROM alpine:latest

WORKDIR /app

COPY server.py server.py
COPY requirements.txt requirements.txt

RUN apk add --no-cache python3 py3-pip uwsgi-python3 && \
    addgroup --gid 12346 -S uwsgi_user && \
    adduser --disabled-password --uid 12346 --ingroup uwsgi_user uwsgi_user && \
    chown uwsgi_user:uwsgi_user /app

EXPOSE 80

USER uwsgi_user

<<<<<<< HEAD
RUN pip3 install -r requirements.txt --break-system-packages
=======
RUN pip3 install -r requirements.txt
>>>>>>> 96186f3 (add server stuff)

CMD python server.py
