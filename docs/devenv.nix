{ pkgs, lib, config, ... }:

{
  env = {
    DOCS_PORT = lib.mkDefault 8000;
  };

  languages = {
    python = {
      enable = true;
      package = pkgs.python313;
      directory = config.env.DOCS_ROOT;
      venv = {
        enable = true;
        requirements = ./requirements.txt;
      };
    };
  };

  processes = {
    "docs".exec = "docs:dev";
  };

  scripts = {
    "docs:dev" = {
      exec = ''sphinx-autobuild --port "$DOCS_PORT" ${config.env.DOCS_ROOT} ${config.env.DOCS_ROOT}/_build/autobuild'';
      description = "Start docs dev server";
    };
    "docs:build" = {
      exec = ''sphinx-build -W -b html ${config.env.DOCS_ROOT} ${config.env.DOCS_ROOT}/_build/html'';
      description = "Build documentation";
    };
    "docs:linkcheck" = {
      exec = ''sphinx-build -b linkcheck ${config.env.DOCS_ROOT} ${config.env.DOCS_ROOT}/_build/linkcheck'';
      description = "Check documentation links";
    };
  };
}
