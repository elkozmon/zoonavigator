{ pkgs, lib, config, inputs, ... }:
{
  # https://devenv.sh/basics/
  # env.GREET = "devenv";

  # https://devenv.sh/packages/
  packages = with pkgs; [ 
    stdenv
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
  processes.colima.exec = "colima start --arch x86_64 --memory 4 -f -V /tmp/dummy";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  # scripts.hello.exec = ''
  #   echo hello from $GREET
  # '';

  # enterShell = ''
  #   git --version
  # '';

  # https://devenv.sh/tasks/
  tasks = {
    "web:install" = {
      exec = "cd web && npm install";
      status = "test -d web/node_modules";
      before = [ "devenv:enterShell" ];
    };
  };

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    ${pkgs.act}/bin/act \
      -W ./.github/workflows/test.yml \
      --artifact-server-path /tmp/actas \
      --container-daemon-socket unix:///var/run/docker.sock
  '';

  # https://devenv.sh/git-hooks/
  # git-hooks.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
