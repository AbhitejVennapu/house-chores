# Docker basics

Part of step 2 in `PROGRESS.md`. Notes from Lesson 1.

## Why Docker

Installing Postgres directly on a Mac means one fixed version in the system. It is hard to remove cleanly and can drift from production. A container runs the program in an isolated process with its own filesystem and network. The setup is repeatable and easy to delete.

## Terms

- **Image**: a read-only package of a program and its files. Example: `postgres:16`.
- **Container**: a running instance of an image. One image can start many containers. Deleting a container does not delete the image.
- **Registry**: a server that stores images. Docker Hub is the default. `library/hello-world` is an official image there.
- **Port mapping**: `-p 5432:5432` means host port 5432 forwards to container port 5432. Without it, the Mac cannot reach a service in the container.
- **Digest**: `sha256:...` is a fingerprint of the image contents. It identifies the exact version that ran.

## Client and daemon

The `docker` command is only a client. It sends requests to the Docker daemon, a background service. On macOS, the daemon runs inside a small Linux virtual machine that Docker Desktop manages. That is why the app must be running before the command works.

## What `docker run --rm hello-world` did

1. The client contacted the daemon.
2. The daemon pulled `hello-world` from Docker Hub, since it was not on the Mac yet. The `(arm64v8)` line shows Docker picked an image built for Apple chips.
3. The daemon created a container from the image and ran its program.
4. The output was streamed back to the terminal.
5. `--rm` removed the container when the program exited.

## Installing on macOS

- Docker Desktop: `brew install --cask docker`, then open the app once (`open -a Docker`) and wait until it is running.
- `brew install docker` (without `--cask`) installs only the CLI. It has no engine.
- OrbStack is an alternative: `brew install --cask orbstack`.

## Commands so far

```bash
docker --version
docker info                    # fails with "cannot connect to the daemon" if the app is not running
docker run --rm hello-world
docker images                  # local images
docker ps -a                   # all containers, including stopped ones
```

## Next

Run a Postgres container, connect with `psql`, then add a volume so data survives deleting the container.
