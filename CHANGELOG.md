# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.3] - 2024-03-20

## [2.1.2] - 2023-06-28

### Fixed

- Fix messages standardization to fit localization process as set in the [developers portal](https://developers.vtex.com/docs/guides/vtex-io-documentation-8-translating-the-component)

## [2.1.1] - 2022-10-18
### Fixed
- Add product meta tag description into entry header to enable this field into the bulk import for products

## [2.1.0] - 2022-06-07

### Added

- French, Japanese, Korean and Thai translations.

### Fixed

- Spanish translation.

## [2.0.2] - 2022-06-03

### Added

- Include public folder and subfolders to be able submit the app in the appstore.

## [2.0.1] - 2022-05-26

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
