const rules={'no-var':'error','prefer-const':'error','no-undef':'error','no-unused-vars':['error',{argsIgnorePattern:'^_',caughtErrors:'none'}]};
export default [
  {files:['server/**/*.mjs'],languageOptions:{ecmaVersion:2023,sourceType:'module',globals:{process:'readonly',Buffer:'readonly',console:'readonly',URL:'readonly'}},rules},
  {files:['live.js'],languageOptions:{ecmaVersion:2023,sourceType:'script',globals:{window:'readonly',document:'readonly',location:'readonly',fetch:'readonly',FormData:'readonly',URLSearchParams:'readonly',Event:'readonly',setTimeout:'readonly',clearTimeout:'readonly',I18n:'readonly',Icon:'readonly',OfferCard:'readonly'}},rules}
];
