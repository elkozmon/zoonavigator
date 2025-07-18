{ pkgs, lib, config, inputs, ... }:
{
  # https://devenv.sh/basics/
  env.DOCKER_TIMEOUT = "60";

  # https://devenv.sh/packages/
  packages = with pkgs; [
    stdenv
    coreutils
    colima

    # Docker
    docker
    docker-compose

    # API
    sbt

    # Tests
    act
  ];

  # https://devenv.sh/languages/
  languages = {
    scala.enable = true;

    java.jdk.package = pkgs.temurin-jre-bin-17;

    javascript = {
      enable = true;
      package = pkgs.nodejs_20;
    };

    typescript.enable = true;

    python = {
      enable = true;
      package = pkgs.python313;
      venv = {
        enable = true;
        requirements = ./docs/requirements.txt;
      };
    };
  };

  # https://devenv.sh/processes/
  # avoid mounting $HOME by mounting dummy dir instead (https://github.com/abiosoft/colima/blob/75b104a37eca590e1f72a2cd39ef43ed4093bfef/config/config.go#L134-L143)
  processes = {
    "colima".exec = "colima start --arch x86_64 --memory 4 -f -V /tmp/dummy";
  };

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  scripts = {
    # API
    "api:run".exec = "cd $DEVENV_ROOT/api && sbt play/run";
    "api:test".exec = "cd $DEVENV_ROOT/api && sbt test";
    "api:format".exec = "cd $DEVENV_ROOT/api && sbt scalafmtAll";
    "api:format:check".exec = "cd $DEVENV_ROOT/api && sbt scalafmtCheckAll";

    # Web
    "web:dev".exec = "cd $DEVENV_ROOT/web && npm run dev";
    "web:build".exec = "cd $DEVENV_ROOT/web && npm run build $@";
    "web:test".exec = "cd $DEVENV_ROOT/web && npm run test $@";
    "web:lint".exec = "cd $DEVENV_ROOT/web && npm run lint $@";

    # Docs
    "docs:build".exec = "cd $DEVENV_ROOT/docs && sphinx-build -W -b html . _build/html";
    "docs:linkcheck".exec = "cd $DEVENV_ROOT/docs && sphinx-build -b linkcheck . _build/linkcheck";
  };

  enterShell = ''
    cat <<EOF
🚀 Welcome to ZooNavigator Development Environment

Available scripts:
  📦 API
    api:run          - Start API server
    api:test         - Run API tests
    api:format       - Format API code
    api:format:check - Check API formatting

  🌐 Web
    web:dev   - Start web dev server
    web:build - Build web app
    web:test  - Run web tests
    web:lint  - Run web linting

  📚 Docs
    docs:build     - Build documentation
    docs:linkcheck - Check documentation links

  🔧 General
    devenv up   - Start all services
    devenv test - Run all tests

EOF
  '';

  # https://devenv.sh/tasks/
  tasks = {
    "web:install" = {
      exec = "cd $DEVENV_ROOT/web && npm install";
      status = "test -d web/node_modules";
      before = [ "devenv:enterShell" ];
    };
  };

  # https://devenv.sh/tests/
  enterTest = ''
    wait_for_processes

    echo "Waiting for Docker"
    if timeout $DOCKER_TIMEOUT bash -c 'until docker info >/dev/null 2>&1; do sleep 1; done'; then
      echo "Docker is ready"
    else
      echo "Timed out waiting for Docker"
      exit 1
    fi

    echo "Starting test workflow"
    act \
      -W ./.github/workflows/test.yml \
      --artifact-server-path /tmp/actas \
      --container-daemon-socket unix:///var/run/docker.sock
  '';

  # https://devenv.sh/git-hooks/
  # git-hooks.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
