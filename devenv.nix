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
    E2E_ROOT = "${config.env.DEVENV_ROOT}/e2e";

    ZK_DATA_DIR = "${config.env.DEVENV_ROOT}/.devenv/state/zookeeper";
    ZK_CLIENT_PORT = lib.mkDefault 2181;
  };

  packages = with pkgs; [
    stdenv
    gh
    coreutils
    zookeeper

    # Docker
    docker
    docker-compose

    # Formatting
    nixfmt-rfc-style
  ];

  processes = {
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
            icon = "🧪";
            title = "E2E";
            prefix = "e2e:";
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
    set -e
    wait_for_processes

    # api
    api:format:check
    api:test

    # web
    web:lint
    web:test --no-watch --no-progress

    # docs
    docs:build
    docs:linkcheck

    # e2e
    e2e:lint
    e2e:test --reporter=list
  '';

  git-hooks = {
    hooks.nixfmt-rfc-style.enable = true;
  };
}
