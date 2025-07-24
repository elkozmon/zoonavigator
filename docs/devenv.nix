{ pkgs, lib, config, ... }:

let
  docsDirectory = "${config.env.DEVENV_ROOT}/docs";
in
{
  env = {
    DOCS_PORT = lib.mkDefault 8000;
  };

  languages = {
    python = {
      enable = true;
      package = pkgs.python313;
      directory = docsDirectory;
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
      exec = ''sphinx-autobuild --port "$DOCS_PORT" ${docsDirectory} ${docsDirectory}/_build/autobuild'';
      description = "Start docs dev server";
    };
    "docs:build" = {
      exec = ''sphinx-build -W -b html ${docsDirectory} ${docsDirectory}/_build/html'';
      description = "Build documentation";
    };
    "docs:linkcheck" = {
      exec = ''sphinx-build -b linkcheck ${docsDirectory} ${docsDirectory}/_build/linkcheck'';
      description = "Check documentation links";
    };
  };
}
