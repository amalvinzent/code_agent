import React, { useCallback, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import ReactMarkdown from 'react-markdown'
import './App.css'

interface Candidate {
  content: {
    parts: {
      text: string
    }[]
  }
}

interface Result {
  candidates: Candidate[]
}

function App() {
  const [code, setCode] = React.useState('')
  const onChange = useCallback((val: string) => {
    setCode(val)
  }, [])

  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = async () => {
    setLoading(true)
    setError(null)
    const guideline = `
    Please review the following code for the following aspects:
    
    1. **General Code Quality**: Is the code well-written and maintainable?
    2. **Performance Optimization**: Are there any performance bottlenecks or inefficiencies?
    3. **Security**: Are there any security vulnerabilities or potential threats?
    4. **Error Handling**: Is the error handling robust and does it cover edge cases?
    5. **Code Duplication and Reusability**: Are there repeated code blocks, and is the code modular?
    6. **Testing**: Are there sufficient tests, and is the testing approach effective?
    7. **Scalability**: Can the code scale to handle increasing loads or complexity?
    8. **Documentation and Comments**: Are the code and functions properly documented?
    9. **Readability**: Is the code easy to read, understand, and follow?
    10. **Refactoring**: Are there opportunities to improve the code structure or design?
    11. **Compliance with Coding Standards**: Does the code adhere to relevant coding standards and best practices?
    12. **Modularity and Design**: Is the code well-structured into modular components and is the design sound?
    
    Here is the code to review:
    
    ${code}
    `

    console.log(guideline)

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBoKPmjPblsB9e_KE-Ay5-f9A9n3mm1DsE',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: guideline
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markdownContent =
    result?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  return (
    <div className="container">
      <div className="left">
        <CodeMirror
          value={code}
          height="100vh"
          theme={'dark'}
          extensions={[javascript({ jsx: true })]}
          onChange={onChange}
          style={{ backgroundColor: '#57A6A1' }}
        />
        <button className="review_button" onClick={callApi}>
          Review code
        </button>
      </div>
      <div className="right">
        <ReactMarkdown children={markdownContent} />
      </div>
    </div>
  )
}
export default App
