{ lib }:
{
  generateAvailableScripts =
    scriptCategories: scripts:
    let
      maxLength = lib.foldl' (max: name: lib.max max (lib.stringLength name)) 0 (lib.attrNames scripts);

      generateCategory =
        {
          icon,
          title,
          prefix,
        }:
        let
          categoryScripts =
            if prefix == null then
              lib.filterAttrs (
                name: _: !lib.any (cat: cat.prefix != null && lib.hasPrefix cat.prefix name) scriptCategories
              ) scripts
            else
              lib.filterAttrs (name: _: lib.hasPrefix prefix name) scripts;
          scriptEntries = lib.mapAttrsToList (
            name: script:
            let
              padding = lib.concatStrings (lib.genList (_: " ") (maxLength - lib.stringLength name + 1));
            in
            "    ${name}${padding}- ${script.description}"
          ) categoryScripts;
        in
        lib.optionalString (
          categoryScripts != { }
        ) "  ${icon} ${title}\n${lib.concatStringsSep "\n" scriptEntries}\n";
    in
    lib.concatMapStringsSep "\n" generateCategory scriptCategories;
}
