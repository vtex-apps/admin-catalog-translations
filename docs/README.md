# Admin Catalog Translation 

The catalog translation app provides a way to read and update `Categories` and `Products` SEO relevant information for all bindings associated to an account.
 

![](https://user-images.githubusercontent.com/38737958/103417721-972f2d00-4b6a-11eb-916e-cd3777ca8b20.gif)

---
## Description

`This app is aimed towards sites with a one account multiple binding architecture.`

This app uses the `catalog translation` queries on `vtex.catalog-graphql` instead of `messages app`, this is because we are targeting the SEO relevant information for Google.

There are two different pages for `Category` and `Product` translations. Both automatically display the list of bindings configured for the site.
From this binding list, the first one is always the `X-Vtex-Tenant` or the default language, for this option the details cannot be translated, to modify these values, the changes should be made inside your store's catalog.  
For all the others, it's possible to edit the content by category and by product. 

It's also possible to export all current translations for `Categories` and `Products`. Inside a binding different than the `X-Vtex-Tenant`, a button called `export` allows user to download the translations for that binding.

---
## Usage

Using [VTEX IO Toobelt](https://vtex.io/docs/recipes/development/vtex-io-cli-installation-and-command-reference/#command-reference) log into the VTEX account you are working on and install the latest version:

```
$ vtex install vtex.admin-catalog-translation
```


---

## Knowing issue

It's not possible to add content for a specific field if there is no content for that same field in the `X-Vtex-Tenant` (default) binding.
