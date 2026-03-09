{
  pkgs,
  lib,
  config,
  ...
}:

{
  env = {
    WEB_PORT = lib.mkDefault 4200;
    ZK_CONNECTION_STRING = lib.mkDefault "localhost:${toString config.env.ZK_CLIENT_PORT}";
    CHROME_BIN = lib.mkDefault "${pkgs.google-chrome}/bin/google-chrome-stable";
  };

  packages = with pkgs; [
    python313
  ];

  languages = {
    javascript = {
      enable = true;
      package = pkgs.nodejs_20;
      directory = config.env.WEB_ROOT;
      npm = {
        enable = true;
        install.enable = true;
      };
    };
    typescript.enable = true;
  };

  processes = {
    "web".exec = "web:dev";
  };

  scripts = {
    "web:dev" = {
      exec = ''npm --prefix ${config.env.WEB_ROOT} run dev -- --port "$WEB_PORT" $@'';
      description = "Start web dev server";
    };
    "web:build" = {
      exec = ''npm --prefix ${config.env.WEB_ROOT} run build -- $@'';
      description = "Build web app";
    };
    "web:lint" = {
      exec = ''npm --prefix ${config.env.WEB_ROOT} run lint -- $@'';
      description = "Run web linting";
    };
    "web:test" = {
      exec = ''npm --prefix ${config.env.WEB_ROOT} run test -- $@'';
      description = "Run web tests";
    };
  };
}
