{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:
let
  utils = import ./utils.nix { inherit lib; };
in
{
  env = {
    API_ROOT = "${config.env.DEVENV_ROOT}/api";
    WEB_ROOT = "${config.env.DEVENV_ROOT}/web";
    DOCS_ROOT = "${config.env.DEVENV_ROOT}/docs";
    DOCKER_TIMEOUT = lib.mkDefault 60;

    COLIMA_CPU = lib.mkDefault 4;
    COLIMA_MEM = lib.mkDefault 4;

    ZK_DATA_DIR = "${config.env.DEVENV_ROOT}/.devenv/state/zookeeper";
    ZK_CLIENT_PORT = lib.mkDefault 2181;
  };

  packages = with pkgs; [
    stdenv
    gh
    coreutils
    zookeeper

    # Docker
    colima
    docker
    docker-compose

    # Tests
    act
    firefox-bin

    # Formatting
    nixfmt-rfc-style
  ];

  processes = {
    # avoid mounting $HOME by mounting dummy dir instead (https://github.com/abiosoft/colima/blob/75b104a37eca590e1f72a2cd39ef43ed4093bfef/config/config.go#L134-L143)
    "colima".exec =
      ''colima start --arch x86_64 --cpu $COLIMA_CPU --memory $COLIMA_MEM -f -V /tmp/dummy'';
    "zookeeper".exec =
      let
        zkConfig = pkgs.writeText "zoo.cfg" ''
          dataDir=${config.env.ZK_DATA_DIR}
          clientPort=${toString config.env.ZK_CLIENT_PORT}
        '';
      in
      ''
        mkdir -p ${config.env.ZK_DATA_DIR}
        zkServer.sh start-foreground ${zkConfig}
      '';
  };

  scripts = {
    help =
      let
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
        description = "Show this help information";
        exec = ''
          echo "🚀 Welcome to ZooNavigator Development Environment"
          echo ""
          echo "Available commands:"
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
