# Admin Catalog Translation 

The catalog translation app provides a way to read and update SEO relevant information for all bindings associated to an account for the following catalog entries:

| Entry Type | Available Translation option |
| ---------|-------------|
| Category | Single entries, bulk export and bulk import |
| Product | Single entries, bulk export and bulk import |
| SKU | Single entries and bulk export |
| Brand | Single entries, bulk export and bulk import |
| Specification | Single entries, bulk export and bulk import |
| Collection | Single entries, bulk export and bulk import |


![](https://user-images.githubusercontent.com/38737958/153192217-45e37812-9a6d-42de-ba5e-f01bd0f62c82.gif)

---
## Description

`This app is aimed towards stores with a one account multiple binding architecture.`

This app uses the `catalog translation` queries on `vtex.catalog-graphql` instead of `messages app`, this is because we are targeting the SEO relevant information for Google.

Every entry type has its own page to handle translations.They automatically display the list of all languages (default and supported ones) for all `storefront` bindings configured for the store.
From this binding list, the first one is always the `X-Vtex-Tenant` or the default language. For this option the details cannot be translated. To modify these values, the changes should be made inside your store's catalog.  
For all the others, it's possible to edit the content. 

For some entries, there are options for bulk import and export (please refer back to the table above). Selecting a language different than the `X-Vtex-Tenant`, a button called `export` allows user to download the translations for that binding. Another button called `import` allow bulk upload for the entries in the selected language.

---
## Usage

Using [VTEX IO Toobelt](https://vtex.io/docs/recipes/development/vtex-io-cli-installation-and-command-reference/#command-reference) log into the VTEX account you are working on and install the latest version:

```
$ vtex install vtex.admin-catalog-translation
```


---

## Knowing issues

- It's not possible to add content for a specific field if there is no content for that same field in the `X-Vtex-Tenant` (default) binding.
- If different fields have the same value (e.g. product name and product description are equals) for the main language, translating one of them will also translate the other one. This is due to the behavior of VTEX message center.
