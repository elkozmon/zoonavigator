{ pkgs, lib, config,... }:

{
  env = {
    WEB_PORT = lib.mkDefault 4200;
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
      exec = ''npm run --prefix ${config.env.WEB_ROOT} dev -- --port "$WEB_PORT" $@'';
      description = "Start web dev server";
    };
    "web:build" = {
      exec = ''npm run --prefix ${config.env.WEB_ROOT} build -- $@'';
      description = "Build web app";
    };
    "web:test" = {
      exec = ''npm run --prefix ${config.env.WEB_ROOT} test -- $@'';
      description = "Run web tests";
    };
    "web:lint" = {
      exec = ''npm run --prefix ${config.env.WEB_ROOT} lint -- $@'';
      description = "Run web linting";
    };
  };
}
