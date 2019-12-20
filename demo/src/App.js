import React from 'react'
import Editor, { monaco } from '@monaco-editor/react'
import vueLanguage from './vue-lang/vue-language'
// import YG from '@espkg/mina2vue'
import './App.css'

monaco
  .init()
  .then((monaco) => {
    console.log('Log ::: Monaco ::: ', monaco)
    monaco.languages.register({ id: 'vue' })
    // 为该自定义语言基本的Token
    monaco.languages.setMonarchTokensProvider('vue', vueLanguage)
    // 为该语言注册一个语言提示器--联想
    // monaco.languages.registerCompletionItemProvider('mySpecialLanguage', {
    //   provideCompletionItems: () => {
    //     return { suggestions: vCompletion }
    //   }
    // })
  })
  .catch((error) => console.error('An error occurred during initialization of Monaco: ', error))

function App () {
  return (
    <div className='App'>

      <Editor
        language='vue'
        theme='dark'
      />
    </div>
  )
}

export default App
