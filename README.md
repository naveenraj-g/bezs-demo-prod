## Run application locally

- First install postgresql locally in your pc. video - <a href="https://youtu.be/4qH-7w5LZsA?si=8F9ODqdNBCJnYL4H" target="_blank">Windows</a>
- In .env you need to set this thing

```
APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL_MAIN="postgresql://postgres:postgresqlpassword@localhost:5432/bezs?schema=public"
```

#### Run this in cmd where your application located

```bash
# RUN
npm i --force
npm run dev
```

## VPS Configuration

#### In VPS

- login into vps, in cmd or terminal

```
ssh root@165.656.56.343 (Ip address of your VPS)
password - password
```

- Install and configur docker and postgresql in VPS

```bash
# Install Docker
apt-get install docker.io

# Create a common network in docker
docker network create bezs-net

# run postgresql in that network
docker run --name bezs-postgres --network bezs-net -e POSTGRES_PASSWORD=pass -v /root/postgres-data:/var/lib/postgresql/data -p 127:0.0.1:5432:5432 --restart unless-stopped -d postgres
```

#### In that project files

- Change you .env like this

```bash
# change base url of app to your vps given domain
APP_URL=https://drgodly.com/

# change better auth url as same as vps given domain
BETTER_AUTH_URL=https://drgodly.com/

# change database url as well instead of localhost need to give that image name that is created in docker on vps for postgresql
DATABASE_URL_MAIN="postgresql://postgres:password@bezs-postgres:5432/bezs?schema=public"
```

- refer the example .env file given in project

#### Now we need to dockerize our application to host it on VPS

- Install docker in your local machine
- First we need to dockerize our application and then push that dockerized image to github container registry

```bash
# build docker image
docker build . -t ghcr.io/naveenraj-g/bezs-prod:latest --platform linux/amd64

# Login into github container registry
docker login ghcr.io
# it will ask username and password
# password in github (settings > developer-settings > personal-access-token > Tokens(classic) > generate)

# after login push that image to ghcr
docker push ghcr.io/username/bezs-prod:latest
```

#### In VPS

- After uploaded our project in github container registry, then in vps need to login into our ghcr and pull that image

```bash
# In VPS
# Login into github container registry
docker login ghcr.io
# it will ask username and password

# pull that image
docker pull ghcr.io/naveenraj-g/bezs-prod:latest
```

- after successful pull, need to run that docker image

```bash
# Run docker image
run app in vps new command - docker run -d --name bezs-prod --network bezs-net -p 3000:3000 -v /root/bezs-uploads:/app/uploads --restart unless-stopped ghcr.io/naveenraj-g/bezs-prod:latest
```
