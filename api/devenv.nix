{ pkgs, lib, config, ... }:

let
  apiDirectory = "${config.env.DEVENV_ROOT}/api";
in
{
  env = {
    API_PORT = lib.mkDefault 9000;
  };

  packages = with pkgs; [
    sbt
  ];

  languages = {
    scala.enable = true;
    java.jdk.package = pkgs.temurin-jre-bin-17;
  };

  processes = {
    "api" = {
      exec = "api:dev";
      process-compose = {
        is_tty = true;
      };
    };
  };

  scripts = {
    "api:dev" = {
      exec = ''cd ${apiDirectory} && sbt "play/run $API_PORT"'';
      description = "Start API dev server";
    };
    "api:test" = {
      exec = ''cd ${apiDirectory} && sbt test'';
      description = "Run API tests";
    };
    "api:format" = {
      exec = ''cd ${apiDirectory} && sbt scalafmtAll'';
      description = "Format API code";
    };
    "api:format:check" = {
      exec = ''cd ${apiDirectory} && sbt scalafmtCheckAll'';
      description = "Check API formatting";
    };
  };
}
