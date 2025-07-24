{ pkgs, lib, config, inputs, ... }:
let
  scriptCategories = [
    { icon = "📦"; title = "API"; prefix = "api:"; }
    { icon = "🌐"; title = "Web"; prefix = "web:"; }
    { icon = "📚"; title = "Docs"; prefix = "docs:"; }
  ];

  generateAvailableScripts = scripts:
    let
      maxLength = lib.foldl' (max: name: lib.max max (lib.stringLength name)) 0 (lib.attrNames scripts);

      generateCategory = { icon, title, prefix }:
        let
          categoryScripts = lib.filterAttrs (name: _: lib.hasPrefix prefix name) scripts;
          scriptEntries = lib.mapAttrsToList (name: script:
            let padding = lib.concatStrings (lib.genList (_: " ") (maxLength - lib.stringLength name + 1));
            in "    ${name}${padding}- ${script.description}"
          ) categoryScripts;
        in
        lib.optionalString (categoryScripts != {}) "  ${icon} ${title}\n${lib.concatStringsSep "\n" scriptEntries}\n";
    in
    lib.concatMapStringsSep "\n" generateCategory scriptCategories;
in
{
  env = {
    DOCKER_TIMEOUT = lib.mkDefault 60;
  };

  packages = with pkgs; [
    stdenv
    coreutils
    colima

    # Docker
    docker
    docker-compose

    # Tests
    act
  ];

  processes = {
    # avoid mounting $HOME by mounting dummy dir instead (https://github.com/abiosoft/colima/blob/75b104a37eca590e1f72a2cd39ef43ed4093bfef/config/config.go#L134-L143)
    "colima".exec = ''colima start --arch x86_64 --memory 4 -f -V /tmp/dummy'';
  };

  enterShell = ''
    echo "🚀 Welcome to ZooNavigator Development Environment"
    echo ""
    echo "Available scripts:"
    echo ""
    echo "${generateAvailableScripts config.scripts}"
  '';

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
}
