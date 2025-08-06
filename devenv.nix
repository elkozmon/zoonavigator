{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:
let
  utils = import ./utils.nix { inherit lib; };

  scriptCategories = [
    {
      icon = "📦";
      title = "API";
      prefix = "api:";
    }
    {
      icon = "🌐";
      title = "Web";
      prefix = "web:";
    }
    {
      icon = "📚";
      title = "Docs";
      prefix = "docs:";
    }
    {
      icon = "🔧";
      title = "Misc";
      prefix = null;
    }
  ];
in
{
  env = {
    API_ROOT = "${config.env.DEVENV_ROOT}/api";
    WEB_ROOT = "${config.env.DEVENV_ROOT}/web";
    DOCS_ROOT = "${config.env.DEVENV_ROOT}/docs";
    DOCKER_TIMEOUT = lib.mkDefault 60;
  };

  packages = with pkgs; [
    stdenv
    coreutils
    colima

    # Docker
    docker
    docker-compose

    # Tests
    act

    # Formatting
    nixfmt-rfc-style
  ];

  processes = {
    # avoid mounting $HOME by mounting dummy dir instead (https://github.com/abiosoft/colima/blob/75b104a37eca590e1f72a2cd39ef43ed4093bfef/config/config.go#L134-L143)
    "colima".exec = ''colima start --arch x86_64 --memory 4 -f -V /tmp/dummy'';
  };

  scripts = {
    help = {
      description = "Show this help information";
      exec = ''
        echo "🚀 Welcome to ZooNavigator Development Environment"
        echo ""
        echo "Available scripts:"
        echo ""
        echo "${utils.generateAvailableScripts scriptCategories config.scripts}"
      '';
    };
  };

  enterShell = config.scripts.help.exec;

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

  git-hooks = {
    hooks.nixfmt-rfc-style.enable = true;
  };
}
