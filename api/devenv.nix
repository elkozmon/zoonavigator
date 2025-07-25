{ pkgs, lib, config, ... }:

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
      exec = ''cd ${config.env.API_ROOT} && sbt "play/run $API_PORT"'';
      description = "Start API dev server";
    };
    "api:test" = {
      exec = ''cd ${config.env.API_ROOT} && sbt test'';
      description = "Run API tests";
    };
    "api:format" = {
      exec = ''cd ${config.env.API_ROOT} && sbt scalafmtAll'';
      description = "Format API code";
    };
    "api:format:check" = {
      exec = ''cd ${config.env.API_ROOT} && sbt scalafmtCheckAll'';
      description = "Check API formatting";
    };
  };
}
