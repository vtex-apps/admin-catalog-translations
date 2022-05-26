# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Use `targetProduct` key to filter `vtex-storefront` bindings. Before, it was always considering the first one as admin.

## [2.0.0] - 2022-03-15
### Added
- Bulk import and export for `Collections`
- Import all `Categories` translations in batch
- Apply `ImportEntriesModal` for import translations in:
  - `Brand`
  - `Product`
  - `Specifications`
- Export & Import all `Brands` translations in batch

## [1.2.0] - 2021-10-05
### Added
- Bulk Upload of product translations

### Fixed
- Use `defaultLocale` from tenant API as `xVtexTenant`.

## [1.1.0] - 2021-08-02

## [1.0.0] - 2021-06-09

### Added
- Supported locales to the list of languages app can translate to.

### Changed
- Navigation interface - Locale selection as a dropdown menu.

## [0.1.0] - 2021-04-23

### Added
- Export all `Categories` translations in batch
- Export `Products` for a given category in batch - Limit of 1.600 products
