# Admin Catalog Translation

[<i class="fa-brands fa-github"></i> Source code](https://github.com/vtex-apps/admin-catalog-translations)

> ⚠️ This app is no longer maintained by VTEX. This means support and maintenance are no longer provided.
>
> Version `2.4.2` is compatible with the user authorization enforced by `vtex.catalog-graphql@1.108.0` and later. Versions up to `2.4.1` send the app token instead of the user's token and fail with `401`/`403` on import and export against those versions.

The catalog translation app provides a way to read and update SEO relevant information for all bindings associated with an account for the following catalog entries:

| Entry Type | Available Translation option |
| ---------|-------------|
| Category | Single entries, bulk export, and bulk import |
| Product | Single entries, bulk export, and bulk import |
| SKU | Single entries and bulk export |
| Brand | Single entries, bulk export, and bulk import |
| Specification | Single entries, bulk export, and bulk import |
| Collection | Single entries, bulk export, and bulk import |


![](https://user-images.githubusercontent.com/38737958/153192217-45e37812-9a6d-42de-ba5e-f01bd0f62c82.gif)

---
## Description

`This app is aimed towards stores with a one account multiple binding architecture.`

This app uses the `catalog translation` queries on `vtex.catalog-graphql` instead of the `messages` app. This is because we are targeting SEO-relevant information for Google.

Every entry type has its own page to handle translations. They automatically display a list of all languages (default and supported) for all `storefront` bindings configured for the store.
In this binding list, the first entry is always `X-Vtex-Tenant`, or the default language. For this option, the details cannot be translated. To modify these values, make the changes in your store's catalog.  
For all the others, it's possible to edit the content. 

For some entries, there are options for bulk import and export (please refer back to the table above). When selecting a language other than `X-Vtex-Tenant`, the `export` button allows the user to download the translations for that binding. Another button called `import` allows bulk uploading of entries in the selected language.

---
## Usage

Using [VTEX IO CLI](https://vtex.io/docs/recipes/development/vtex-io-cli-installation-and-command-reference/#command-reference), log into the VTEX account you are working on and install the latest version:

```
$ vtex install vtex.admin-catalog-translation
```

---

## Permissions

The app calls `vtex.catalog-graphql` with the signed-in user's token, so the user's role must hold the corresponding Catalog (product `107`) License Manager resources. An appKey, a generic Admin role, or the legacy product `2` resources are not enough.

| Operation | Resource |
| --- | --- |
| Translate product, translate SKU | `EditProduct` |
| Translate category, field, field values, group | `EditCategory` |
| Translate brand | `EditBrand` |
| Export products | `ViewProduct` |
| Export categories | `ViewCategory` |
| Export brands | `ViewBrand` |
| Export collections | `ViewCollection` |

Product `107` is recent, so a role that predates it may hold only the legacy product `2` resources of the same names; add the product `107` ones to the role.

A user without these resources gets a `403`, and the translation request is marked as failed with the HTTP status and a short reason, visible in the request record.

---

## Knowing issues

- It's not possible to add content for a specific field if there is no content for that same field in the `X-Vtex-Tenant` (default) binding.
- If different fields have the same value (e.g., product name and product description are equal) for the main language, translating one of them will also translate the other one. This is due to the behavior of the VTEX message center.
