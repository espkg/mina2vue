# mina2vue
Convert native wxml, wxss eg. to .vue files

## Functions
There are four main functions needed to successfully convert one page to vue.
- `jsConverter` converts \*.js to vue-friendly js.
- `wxmlConverter` converts \*.wxml to vue template syntax
- `wxssConverter` converts \*.wxss to vue stylesheet (CSS) syntax
- `vueGenerator` combines the three things above into a vue file's content.


|   fn           |   input      |   output    |
| -------------- | ------------ | ----------- |
| jsConverter   | sourceCode(string), options({ type: 'page' }) | script distCode(string)
| wxmlConverter | sourceCode(string), options({}) | template distCode(string)
| wxssConverter | sourceCode(string), options({}) | style distCode(string)
| vueGenerator  | template(wxmlConverter distCode), style(wxssConverter distCode), scripts(jsConverter distCode)


