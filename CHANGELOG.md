Changelog
=========

## 0.4.0 - 2018-04-02

### Added
- Auto-format feature in editor
- Remember editor options (wrap, mode) for each ZNode
- Log ZooNavigator version on Docker startup

### Changed
- Editor buttons got minor polishing
- Changed editors font to DejaVu Sans Mono

### Fixed
- Switching editor tabs between changes (to data or acl) causes 'Bad version' error
- When session expires two 'Session lost' dialogs spawn at once

## 0.3.0 - 2018-01-11

### Added
- Move ZNode feature
- Duplicate ZNode feature
- Children ZNode list sorting
- Data editor text wrapping
- Address bar for manual navigation
- Auto connect feature - skip connect form and use preconfigured connection parameters
- Hotkey for submitting ZNode data changes (ctrl+s)
- JVM memory settings via environment variables (API Docker image)

### Changed
- UI changes, redesigned editor tabs
