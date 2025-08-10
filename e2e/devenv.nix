{
  self,
  pkgs,
  lib,
  config,
  ...
}:

{
  env = {
    ZN_BASE_URL = lib.mkDefault "http://localhost:${toString config.env.WEB_PORT}";
    ZK_TEST_NODE = lib.mkDefault "/test-${toString self.lastModified}";
    ZK_CONNECTION_STRING = lib.mkDefault "localhost:${toString config.env.ZK_CLIENT_PORT}";
  };

  tasks = {
    "e2e:npm-install" = {
      exec = ''npm --prefix ${config.env.E2E_ROOT} install'';
      status = ''
        cd ${config.env.E2E_ROOT}
        # Check if node_modules exists and package-lock.json is newer than node_modules
        [ -d node_modules ] && [ package-lock.json -ot node_modules ] || exit 1
      '';
      before = [ "devenv:enterShell" ];
    };
    "e2e:playwright-install" = {
      exec = ''
        cd ${config.env.E2E_ROOT}
        npx playwright install --with-deps
      '';
      after = [ "e2e:npm-install" ];
      before = [ "devenv:enterShell" ];
    };
  };

  scripts = {
    "e2e:test" = {
      exec = ''npm --prefix ${config.env.E2E_ROOT} test -- $@'';
      description = "Run e2e tests";
    };
    "e2e:test:ui" = {
      exec = ''npm --prefix ${config.env.E2E_ROOT} run test:ui -- $@'';
      description = "Run e2e tests in interactive UI mode";
    };
    "e2e:test:headed" = {
      exec = ''npm --prefix ${config.env.E2E_ROOT} run test:headed -- $@'';
      description = "Run e2e tests with visible browser";
    };
    "e2e:test:debug" = {
      exec = ''npm --prefix ${config.env.E2E_ROOT} run test:debug -- $@'';
      description = "Run e2e tests with with Playwright Inspector";
    };
    "e2e:report" = {
      exec = ''npm --prefix ${config.env.E2E_ROOT} run report -- $@'';
      description = "Open Playwright test report";
    };
    "e2e:lint" = {
      exec = ''npm --prefix ${config.env.E2E_ROOT} run lint -- $@'';
      description = "Run e2e linting";
    };
  };
}
