import fetch from 'node-fetch';

export default async () => {
  const url = 'https://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options,links,streampages,overrideCategories';

  return await fetch(url, { timeout: 3000 }).then(res => res.json());
};
